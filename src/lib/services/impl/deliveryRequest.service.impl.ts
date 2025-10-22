import mongoose from "mongoose";
import { DeliveryRequestService } from "../deliveryRequest.service";
import { DeliveryRequest, IDeliveryRequest } from "@/lib/models/deliveryRequest.model";
import { DeliveryOption } from "@/lib/models/deliveryOption.model";
import { User } from "@/lib/models/user.model";
import { CreateDeliveryRequestDto, DeliveryRequestQueryDto, AdminUpdateDeliveryRequestStatusDto } from "@/lib/dto/deliveryRequest.dto";
import { DeliveryRequestStatus } from "@/lib/enums/delivery.enums";
import { CustomError } from "@/lib/utils/customError.utils";
import { logAudit } from "@/lib/utils/auditLogger";
import NotificationServiceImpl from "@/lib/services/impl/notification.service.impl";
import { CreateNotificationDto } from "@/lib/dto/notification.dto";
import EmailServiceImpl from "./email.service.impl";

export default class DeliveryRequestServiceImpl implements DeliveryRequestService {
    private notif = new NotificationServiceImpl();
    private email = new EmailServiceImpl();

    /* ---------------------- USER: CREATE ---------------------- */
    async create(userId: string, dto: CreateDeliveryRequestDto): Promise<IDeliveryRequest> {
        const session = await mongoose.startSession();
        try {
            return await session.withTransaction(async () => {
                const user = await User.findById(userId).session(session);
                if (!user) throw new CustomError(404, "User not found");

                const option = await DeliveryOption.findById(dto.deliveryOption).session(session);
                if (!option || !option.isActive) throw new CustomError(400, "Delivery option not available");

                const req = new DeliveryRequest({
                    user: user._id,
                    status: DeliveryRequestStatus.PENDING,
                    deliveryOption: option._id,
                    deliveryAddress: dto.deliveryAddress,
                    specialInstruction: dto.specialInstruction || "",
                });

                await req.save({ session });

                if (!user.hasDeliveryRequest) {
                    user.hasDeliveryRequest = true;
                    await user.save({ session });
                }

                await logAudit({
                    user: userId,
                    action: "CREATE",
                    resource: "DELIVERY_REQUEST",
                    resourceId: req._id.toString(),
                    description: `Created delivery request for option ${option.name}`,
                });

                await this.notif.create(new CreateNotificationDto({
                    user: userId,
                    type: "DELIVERY",
                    title: "Delivery request submitted",
                    message: `Your delivery request is now pending. Option: ${option.name}`,
                }));

                await this.email.sendDeliveryRequestSubmitted?.(
                    user.email,
                    `${user.firstName} ${user.lastName}`,
                    option.name,
                    dto.deliveryAddress,
                    dto.specialInstruction
                );

                return req;
            });
        } finally {
            await session.endSession();
        }
    }

    /* ---------------------- USER: LIST/GET -------------------- */
    async myList(userId: string, query: DeliveryRequestQueryDto) {
        const { status, page = 1, limit = 10 } = query;

        const filter: any = { user: userId };
        if (status) filter.status = status;

        const skip = (page - 1) * limit;
        const [items, total] = await Promise.all([
            DeliveryRequest.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate("deliveryOption", "name price deliveryTime"),
            DeliveryRequest.countDocuments(filter),
        ]);

        return { items, total, page, limit };
    }

    async myGetById(userId: string, id: string): Promise<IDeliveryRequest> {
        const doc = await DeliveryRequest.findById(id).populate("deliveryOption", "name price deliveryTime");
        if (!doc || String(doc.user) !== String(userId)) throw new CustomError(404, "Delivery request not found");
        return doc;
    }

    /* ---------------------- ADMIN: LIST/GET ------------------- */
    async adminList(query: DeliveryRequestQueryDto & { userId?: string }) {
        const { status, userId, page = 1, limit = 10 } = query;

        const filter: any = {};
        if (status) filter.status = status;
        if (userId) filter.user = userId;

        const skip = (page - 1) * limit;
        const [items, total] = await Promise.all([
            DeliveryRequest.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate("user", "firstName lastName email")
                .populate("deliveryOption", "name price deliveryTime"),
            DeliveryRequest.countDocuments(filter),
        ]);

        return { items, total, page, limit };
    }

    async adminGetById(id: string): Promise<IDeliveryRequest> {
        const doc = await DeliveryRequest.findById(id)
            .populate("user", "firstName lastName email")
            .populate("deliveryOption", "name price deliveryTime");
        if (!doc) throw new CustomError(404, "Delivery request not found");
        return doc;
    }

    /* ---------------------- ADMIN: UPDATE STATUS -------------- */
    async adminUpdateStatus(adminId: string, id: string, dto: AdminUpdateDeliveryRequestStatusDto): Promise<IDeliveryRequest> {
        const doc = await DeliveryRequest.findById(id).populate("user", "firstName lastName email");
        if (!doc) throw new CustomError(404, "Delivery request not found");

        const prev = doc.status;
        doc.status = dto.status;
        await doc.save();

        await logAudit({
            user: adminId,
            action: "UPDATE",
            resource: "DELIVERY_REQUEST",
            resourceId: id,
            description: `Status ${prev} -> ${dto.status}${dto.reason ? " (" + dto.reason + ")" : ""}`,
        });

        // user notification
        await this.notif.create(new CreateNotificationDto({
            user: (doc.user as any)._id.toString(),
            type: "DELIVERY",
            title: "Delivery request status updated",
            message: `Your delivery request is now ${doc.status}.`,
        }));

        const u = doc.user as any;
        const option = await (await doc.populate("deliveryOption", "name")).deliveryOption as any;

        await this.email.sendDeliveryRequestStatusChanged?.(
            u.email,
            `${u.firstName} ${u.lastName}`,
            option?.name || "Selected option",
            doc.status,
            dto.reason
        );

        return doc;
    }
}
