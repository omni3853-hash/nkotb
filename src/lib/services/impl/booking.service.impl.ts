import mongoose from "mongoose";
import { BookingService } from "@/lib/services/booking.service";
import { Booking, IBooking } from "@/lib/models/booking.model";
import { Celebrity } from "@/lib/models/celebrity.model";
import { User } from "@/lib/models/user.model";
import { CreateBookingDto, BookingQueryDto, AdminUpdateBookingStatusDto } from "@/lib/dto/booking.dto";
import { BookingStatus } from "@/lib/enums/booking.enums";
import { CustomError } from "@/lib/utils/customError.utils";
import { logAudit } from "@/lib/utils/auditLogger";
import NotificationServiceImpl from "@/lib/services/impl/notification.service.impl";
import { CreateNotificationDto } from "@/lib/dto/notification.dto";
import EmailServiceImpl from "@/lib/services/impl/email.service.impl";
import TransactionServiceImpl from "@/lib/services/impl/transaction.service.impl";
import { Transaction, } from "@/lib/models/transaction.model";
import { TransactionPurpose, TransactionType } from "@/lib/enums/transaction.enum";

export default class BookingServiceImpl implements BookingService {
    private notif = new NotificationServiceImpl();
    private email = new EmailServiceImpl();
    private trx = new TransactionServiceImpl();

    async create(userId: string, dto: CreateBookingDto): Promise<IBooking> {
        const session = await mongoose.startSession();
        try {
            return await session.withTransaction(async () => {
                const [user, celebrity] = await Promise.all([
                    User.findById(userId).session(session),
                    Celebrity.findById(dto.celebrity).session(session),
                ]);

                if (!user) throw new CustomError(404, "User not found");
                if (!celebrity || !celebrity.isActive) throw new CustomError(400, "Celebrity not available");

                const bt = celebrity.bookingTypes.id(dto.bookingTypeId as any);
                if (!bt) throw new CustomError(400, "Invalid booking type");

                const unitPrice = Number(bt.price);
                if (unitPrice <= 0) throw new CustomError(400, "Invalid booking price");

                const quantity = Number(dto.quantity || 1);
                if (quantity <= 0) throw new CustomError(400, "Quantity must be at least 1");

                const totalAmount = unitPrice * quantity;

                // Prepare booking id up front for referenceId/idempotency
                const bookingId = new mongoose.Types.ObjectId();

                // 1) Atomic debit via TransactionService
                await this.trx.debit(
                    user._id.toString(),
                    totalAmount,
                    TransactionPurpose.BOOKING_PAYMENT,
                    `Booking payment for ${celebrity.name} (${bt.name})`,
                    bookingId.toString(),
                    { celebrity: celebrity._id.toString(), bookingTypeId: bt._id.toString(), quantity, unitPrice },
                    session
                );

                // 2) Create booking (with assigned id)
                const booking = new Booking({
                    _id: bookingId,
                    user: user._id,
                    celebrity: celebrity._id,
                    celebrityNameSnapshot: celebrity.name,
                    celebritySlugSnapshot: celebrity.slug,
                    bookingTypeId: bt._id,
                    bookingTypeName: bt.name,
                    unitPrice,
                    quantity,
                    totalAmount,
                    notes: dto.notes || "",
                    status: BookingStatus.PENDING,
                });
                await booking.save({ session });

                // 3) Update counters
                celebrity.bookings += 1;
                await celebrity.save({ session });
                user.totalBookings += 1;
                await user.save({ session });

                // 4) Audit + Notify + Email
                await logAudit({
                    user: userId,
                    action: "CREATE",
                    resource: "BOOKING",
                    resourceId: booking._id.toString(),
                    description: `Created booking for ${celebrity.name} (${bt.name}) x${quantity}`,
                });

                await this.notif.create(
                    new CreateNotificationDto({
                        user: userId,
                        type: "BOOKING",
                        title: "Booking submitted & paid",
                        message: `₦${totalAmount.toFixed(2)} deducted for ${celebrity.name} – ${bt.name}.`,
                    })
                );

                await this.email.sendBookingSubmitted?.(
                    user.email,
                    `${user.firstName} ${user.lastName}`,
                    celebrity.name,
                    bt.name,
                    quantity,
                    totalAmount
                );

                return booking;
            }, { readConcern: { level: "snapshot" }, writeConcern: { w: "majority" } });
        } finally {
            await session.endSession();
        }
    }

    async myList(userId: string, query: BookingQueryDto) {
        const { status, celebrityId, page = 1, limit = 10 } = query;
        const filter: any = { user: userId };
        if (status) filter.status = status;
        if (celebrityId) filter.celebrity = celebrityId;

        const skip = (page - 1) * limit;
        const [items, total] = await Promise.all([
            Booking.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).populate("celebrity", "name slug image"),
            Booking.countDocuments(filter),
        ]);
        return { items, total, page, limit };
    }

    async myGetById(userId: string, id: string): Promise<IBooking> {
        const doc = await Booking.findById(id).populate("celebrity", "name slug image");
        if (!doc || String(doc.user) !== String(userId)) throw new CustomError(404, "Booking not found");
        return doc;
    }

    async adminList(query: BookingQueryDto & { userId?: string; celebrityId?: string }) {
        const { status, userId, celebrityId, page = 1, limit = 10 } = query;
        const filter: any = {};
        if (status) filter.status = status;
        if (userId) filter.user = userId;
        if (celebrityId) filter.celebrity = celebrityId;

        const skip = (page - 1) * limit;
        const [items, total] = await Promise.all([
            Booking.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate("user", "firstName lastName email")
                .populate("celebrity", "name slug"),
            Booking.countDocuments(filter),
        ]);
        return { items, total, page, limit };
    }

    async adminGetById(id: string): Promise<IBooking> {
        const doc = await Booking.findById(id)
            .populate("user", "firstName lastName email")
            .populate("celebrity", "name slug");
        if (!doc) throw new CustomError(404, "Booking not found");
        return doc;
    }

    async adminUpdateStatus(adminId: string, id: string, dto: AdminUpdateBookingStatusDto): Promise<IBooking> {
        const session = await mongoose.startSession();
        try {
            return await session.withTransaction(async () => {
                const doc = await Booking.findById(id).populate("user", "firstName lastName email").session(session);
                if (!doc) throw new CustomError(404, "Booking not found");

                const prev = doc.status;
                doc.status = dto.status;
                await doc.save({ session });

                // Refund on CANCEL/REJECT (idempotent via transaction lookup)
                if (dto.status === BookingStatus.CANCELED) {
                    const alreadyRefunded = await Transaction.exists({
                        user: doc.user,
                        type: TransactionType.CREDIT,
                        purpose: TransactionPurpose.BOOKING_REFUND,
                        referenceId: doc._id.toString(),
                    }).session(session);

                    if (!alreadyRefunded) {
                        await this.trx.credit(
                            (doc.user as any)._id.toString(),
                            doc.totalAmount,
                            TransactionPurpose.BOOKING_REFUND,
                            `Refund for booking ${doc.bookingTypeName}`,
                            doc._id.toString(),
                            { reason: dto.reason || "Booking canceled/rejected by admin" },
                            session
                        );
                    }
                }

                await logAudit({
                    user: adminId,
                    action: "UPDATE",
                    resource: "BOOKING",
                    resourceId: id,
                    description: `Booking status ${prev} -> ${dto.status}${dto.reason ? " (" + dto.reason + ")" : ""}`,
                });

                const owner = doc.user as any;
                await this.notif.create(
                    new CreateNotificationDto({
                        user: owner._id.toString(),
                        type: "BOOKING",
                        title: "Booking status updated",
                        message: `Your booking is now ${doc.status}.`,
                    })
                );

                await this.email.sendBookingStatusChanged?.(
                    owner.email,
                    `${owner.firstName} ${owner.lastName}`,
                    doc.celebrityNameSnapshot,
                    doc.bookingTypeName,
                    doc.status,
                    dto.reason
                );

                return doc;
            }, { readConcern: { level: "snapshot" }, writeConcern: { w: "majority" } });
        } finally {
            await session.endSession();
        }
    }
}
