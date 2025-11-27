import mongoose from "mongoose";
import { TicketService } from "@/lib/services/ticket.service";
import { Ticket, ITicket } from "@/lib/models/ticket.model";
import { Event } from "@/lib/models/event.model";
import { User } from "@/lib/models/user.model";
import { CreateTicketDto, TicketQueryDto, AdminUpdateTicketStatusDto, CreateOfflineTicketDto } from "@/lib/dto/ticket.dto";
import { TicketStatus } from "@/lib/enums/event.enums";
import { CustomError } from "@/lib/utils/customError.utils";
import { logAudit } from "@/lib/utils/auditLogger";
import NotificationServiceImpl from "@/lib/services/impl/notification.service.impl";
import { CreateNotificationDto } from "@/lib/dto/notification.dto";
import EmailServiceImpl from "@/lib/services/impl/email.service.impl";
import TransactionServiceImpl from "@/lib/services/impl/transaction.service.impl";
import { TransactionPurpose } from "@/lib/enums/transaction.enum";

export default class TicketServiceImpl implements TicketService {
    private notif = new NotificationServiceImpl();
    private email = new EmailServiceImpl();
    private trx = new TransactionServiceImpl();

    async create(userId: string, dto: CreateTicketDto): Promise<ITicket> {
        const session = await mongoose.startSession();
        try {
            return await session.withTransaction(async () => {
                const [user, event] = await Promise.all([
                    User.findById(userId).session(session),
                    Event.findById(dto.event).session(session),
                ]);

                if (!user) throw new CustomError(404, "User not found");
                if (!event || !event.isActive) throw new CustomError(400, "Event not available");

                const tt = event.ticketTypes.id(dto.ticketTypeId as any);
                if (!tt) throw new CustomError(400, "Invalid ticket type");

                const unitPrice = Number(tt.price);
                if (unitPrice <= 0) throw new CustomError(400, "Invalid ticket price");

                const quantity = Number(dto.quantity);
                if (quantity <= 0) throw new CustomError(400, "Quantity must be at least 1");

                // inventory check
                const remaining = Math.max(0, Number(tt.total) - Number(tt.sold || 0));
                if (remaining < quantity) throw new CustomError(400, "Insufficient tickets available");

                const totalAmount = unitPrice * quantity;

                // 1) Atomic debit via TransactionService
                await this.trx.debit(
                    user._id.toString(),
                    totalAmount,
                    TransactionPurpose.TICKET_PURCHASE,
                    `Ticket purchase for ${event.title} (${tt.name})`,
                    null,
                    { event: event._id.toString(), ticketTypeId: tt._id.toString(), quantity, unitPrice },
                    session
                );

                // 2) Create ticket purchase
                const ticket = new Ticket({
                    user: user._id,
                    event: event._id,

                    eventTitleSnapshot: event.title,
                    eventSlugSnapshot: event.slug,

                    ticketTypeId: tt._id,
                    ticketTypeName: tt.name,
                    unitPrice,
                    quantity,
                    totalAmount,
                    notes: dto.notes || "",
                    status: TicketStatus.PENDING,
                });

                await ticket.save({ session });

                // 3) Update counters & inventory
                tt.sold = Number(tt.sold || 0) + quantity;
                event.ticketsSold = Number(event.ticketsSold || 0) + quantity;
                await event.save({ session });

                user.totalBookings += 1;
                await user.save({ session });

                // 4) Audit + Notify + Email
                await logAudit({
                    user: userId,
                    action: "CREATE",
                    resource: "TICKET",
                    resourceId: ticket._id.toString(),
                    description: `Purchased ticket(s) for ${event.title} (${tt.name}) x${quantity}`,
                });

                await this.notif.create(
                    new CreateNotificationDto({
                        user: userId,
                        type: "TICKET",
                        title: "Ticket purchase submitted & paid",
                        message: `₦${totalAmount.toFixed(2)} deducted for ${event.title} – ${tt.name}.`,
                    })
                );

                await this.email.sendTicketPurchased?.(
                    user.email,
                    `${user.firstName} ${user.lastName}`,
                    event.title,
                    tt.name,
                    quantity,
                    totalAmount
                );

                return ticket;
            }, { readConcern: { level: "snapshot" }, writeConcern: { w: "majority" } });
        } finally {
            await session.endSession();
        }
    }

    async createOffline(dto: CreateOfflineTicketDto): Promise<ITicket> {
        const session = await mongoose.startSession();
        try {
            return await session.withTransaction(
                async () => {
                    const event = await Event.findById(dto.event).session(session);
                    if (!event || !event.isActive) {
                        throw new CustomError(400, "Event not available");
                    }

                    const tt = event.ticketTypes.id(dto.ticketTypeId as any);
                    if (!tt) throw new CustomError(400, "Invalid ticket type");

                    const unitPrice = Number(tt.price);
                    if (unitPrice <= 0) throw new CustomError(400, "Invalid ticket price");

                    const quantity = Number(dto.quantity);
                    if (quantity <= 0) throw new CustomError(400, "Quantity must be at least 1");

                    const remaining = Math.max(0, Number(tt.total) - Number(tt.sold || 0));
                    if (remaining < quantity) throw new CustomError(400, "Insufficient tickets available");

                    const totalAmount = unitPrice * quantity;

                    // Generate a human-friendly check-in code
                    const checkinCode = `TKT-${Date.now()}-${Math.random()
                        .toString(36)
                        .slice(2, 8)
                        .toUpperCase()}`;

                    // Create offline ticket document (no user)
                    const ticket = new Ticket({
                        user: null, // guest
                        event: event._id,

                        eventTitleSnapshot: event.title,
                        eventSlugSnapshot: event.slug,

                        ticketTypeId: tt._id,
                        ticketTypeName: tt.name,
                        unitPrice,
                        quantity,
                        totalAmount,
                        notes: dto.notes || "",
                        status: TicketStatus.PENDING, // offline payments usually verified by admin

                        isGuest: true,
                        buyer: {
                            fullName: dto.buyerFullName,
                            email: dto.buyerEmail,
                            phone: dto.buyerPhone,
                        },
                        offlinePayment: {
                            paymentMethod: dto.paymentMethodId
                                ? new mongoose.Types.ObjectId(dto.paymentMethodId)
                                : undefined,
                            amount: dto.paidAmount ?? totalAmount,
                            proofOfPayment: dto.proofOfPayment,
                            reference: undefined,
                        },
                        checkinCode,
                    });

                    await ticket.save({ session });

                    // Inventory updates as with normal tickets
                    tt.sold = Number(tt.sold || 0) + quantity;
                    event.ticketsSold = Number(event.ticketsSold || 0) + quantity;
                    await event.save({ session });

                    // Send email + QR to guest
                    await this.email.sendOfflineTicketWithQr?.({
                        email: dto.buyerEmail,
                        fullName: dto.buyerFullName,
                        eventTitle: event.title,
                        eventSlug: event.slug,
                        ticketTypeName: tt.name,
                        quantity,
                        totalAmount,
                        currency: (event as any).currency || undefined,
                        checkinCode,
                        ticketId: ticket._id.toString(),
                        eventDate: (event as any).date ?? undefined,
                        eventLocation: (event as any).location ?? undefined,
                    });

                    return ticket;
                },
                { readConcern: { level: "snapshot" }, writeConcern: { w: "majority" } }
            );
        } finally {
            await session.endSession();
        }
    }

    async myList(userId: string, query: TicketQueryDto) {
        const { status, eventId, page = 1, limit = 10 } = query;
        const filter: any = { user: userId };
        if (status) filter.status = status;
        if (eventId) filter.event = eventId;
        const skip = (page - 1) * limit;

        const [items, total] = await Promise.all([
            Ticket.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit)
                .populate("event", "title slug image"),
            Ticket.countDocuments(filter),
        ]);

        return { items, total, page, limit };
    }

    async myGetById(userId: string, id: string): Promise<ITicket> {
        const doc = await Ticket.findById(id).populate("event", "title slug image");
        if (!doc || String(doc.user) !== String(userId)) throw new CustomError(404, "Ticket not found");
        return doc;
    }

    async adminList(query: TicketQueryDto & { userId?: string; eventId?: string }) {
        const { status, userId, eventId, page = 1, limit = 10 } = query;
        const filter: any = {};
        if (status) filter.status = status;
        if (userId) filter.user = userId;
        if (eventId) filter.event = eventId;

        const skip = (page - 1) * limit;
        const [items, total] = await Promise.all([
            Ticket.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit)
                .populate("user", "firstName lastName email")
                .populate("event", "title slug"),
            Ticket.countDocuments(filter),
        ]);

        return { items, total, page, limit };
    }

    async adminGetById(id: string): Promise<ITicket> {
        const doc = await Ticket.findById(id)
            .populate("user", "firstName lastName email")
            .populate("event", "title slug");
        if (!doc) throw new CustomError(404, "Ticket not found");
        return doc;
    }

    async adminUpdateStatus(
        adminId: string,
        id: string,
        dto: AdminUpdateTicketStatusDto
    ): Promise<ITicket> {
        const doc = await Ticket.findById(id)
            .populate("user", "firstName lastName email")
            .populate("event", "title slug");

        if (!doc) throw new CustomError(404, "Ticket not found");

        const prevStatus = doc.status;
        doc.status = dto.status;
        await doc.save();

        // Audit log
        await logAudit({
            user: adminId,
            action: "UPDATE",
            resource: "TICKET",
            resourceId: id,
            description: `Ticket status ${prevStatus} -> ${dto.status}${dto.reason ? " (" + dto.reason + ")" : ""
                }`,
        });

        const hasRegisteredUser = !!doc.user;
        const isGuestTicket = !!doc.isGuest;
        const buyer = (doc as any).buyer as
            | {
                fullName?: string;
                email?: string;
                phone?: string;
            }
            | undefined;

        /**
         * CASE 1: Registered user – send in-app notification + email
         */
        if (hasRegisteredUser) {
            const owner = doc.user as any;

            // Defensive: only send if owner has _id
            if (owner && owner._id) {
                await this.notif.create(
                    new CreateNotificationDto({
                        user: owner._id.toString(),
                        type: "TICKET",
                        title: "Ticket status updated",
                        message: `Your ticket is now ${doc.status}.`,
                    })
                );
            }

            // Defensive: only send email if email exists
            if (owner && owner.email) {
                await this.email.sendTicketStatusChanged?.(
                    owner.email,
                    `${owner.firstName ?? ""} ${owner.lastName ?? ""}`.trim(),
                    doc.eventTitleSnapshot,
                    doc.ticketTypeName,
                    doc.status,
                    dto.reason
                );
            }

            return doc;
        }

        /**
         * CASE 2: Guest / offline buyer – no user in DB
         * - Do NOT create in-app notification (no userId)
         * - But send email if we have buyer email
         */
        if (isGuestTicket && buyer && buyer.email) {
            const displayName =
                buyer.fullName && buyer.fullName.trim().length > 0
                    ? buyer.fullName
                    : "Guest";

            await this.email.sendTicketStatusChanged?.(
                buyer.email,
                displayName,
                doc.eventTitleSnapshot,
                doc.ticketTypeName,
                doc.status,
                dto.reason
            );

            return doc;
        }

        /**
         * CASE 3: No user & no buyer email – just return doc
         * We already logged audit; nothing else to notify.
         */ 
        return doc;
    }
}
