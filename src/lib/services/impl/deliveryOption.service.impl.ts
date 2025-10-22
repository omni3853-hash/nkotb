import { DeliveryOptionService } from "../deliveryOption.service";
import { IDeliveryOption, DeliveryOption } from "@/lib/models/deliveryOption.model";
import { CreateDeliveryOptionDto, DeliveryOptionQueryDto, UpdateDeliveryOptionDto } from "@/lib/dto/deliveryOption.dto";
import { CustomError } from "@/lib/utils/customError.utils";
import { logAudit } from "@/lib/utils/auditLogger";
import NotificationServiceImpl from "@/lib/services/impl/notification.service.impl";
import { CreateNotificationDto } from "@/lib/dto/notification.dto";

export default class DeliveryOptionServiceImpl implements DeliveryOptionService {
    private notif = new NotificationServiceImpl();

    async create(adminId: string, dto: CreateDeliveryOptionDto): Promise<IDeliveryOption> {
        const opt = new DeliveryOption(dto as any);
        await opt.save();

        await logAudit({
            user: adminId,
            action: "CREATE",
            resource: "DELIVERY_OPTION",
            resourceId: opt._id.toString(),
            description: `Created delivery option ${opt.name}`,
        });

        await this.notif.create(new CreateNotificationDto({
            user: adminId,
            type: "DELIVERY_OPTION",
            title: "Delivery option created",
            message: `Option ${opt.name} was created.`,
        }));

        return opt;
    }

    async update(adminId: string, id: string, dto: UpdateDeliveryOptionDto): Promise<IDeliveryOption> {
        const opt = await DeliveryOption.findById(id);
        if (!opt) throw new CustomError(404, "Delivery option not found");
        console.log("This is the dto", dto)
        Object.assign(opt, dto);
        await opt.save();

        await logAudit({
            user: adminId,
            action: "UPDATE",
            resource: "DELIVERY_OPTION",
            resourceId: id,
            description: `Updated delivery option ${opt.name}`,
        });

        await this.notif.create(new CreateNotificationDto({
            user: adminId,
            type: "DELIVERY_OPTION",
            title: "Delivery option updated",
            message: `Option ${opt.name} was updated.`,
        }));

        return opt;
    }

    async delete(adminId: string, id: string): Promise<void> {
        const opt = await DeliveryOption.findById(id);
        if (!opt) throw new CustomError(404, "Delivery option not found");

        await DeliveryOption.findByIdAndDelete(id);

        await logAudit({
            user: adminId,
            action: "DELETE",
            resource: "DELIVERY_OPTION",
            resourceId: id,
            description: `Deleted delivery option ${opt.name}`,
        });

        await this.notif.create(new CreateNotificationDto({
            user: adminId,
            type: "DELIVERY_OPTION",
            title: "Delivery option deleted",
            message: `Option ${opt.name} was deleted.`,
        }));
    }

    async toggleActive(adminId: string, id: string, isActive: boolean): Promise<IDeliveryOption> {
        const opt = await DeliveryOption.findById(id);
        if (!opt) throw new CustomError(404, "Delivery option not found");

        opt.isActive = isActive;
        await opt.save();

        await logAudit({
            user: adminId,
            action: "UPDATE",
            resource: "DELIVERY_OPTION",
            resourceId: id,
            description: `Set active=${isActive} for ${opt.name}`,
        });

        await this.notif.create(new CreateNotificationDto({
            user: adminId,
            type: "DELIVERY_OPTION",
            title: "Delivery option visibility changed",
            message: `Option ${opt.name} is now ${isActive ? "ACTIVE" : "INACTIVE"}.`,
        }));

        return opt;
    }

    async getById(id: string): Promise<IDeliveryOption> {
        const opt = await DeliveryOption.findById(id);
        if (!opt) throw new CustomError(404, "Delivery option not found");
        return opt;
    }

    async list(query: DeliveryOptionQueryDto) {
        const { search, onlyActive = true, page = 1, limit = 10 } = query;

        const filter: any = {};
        if (onlyActive) filter.isActive = true;
        if (search) {
            const rx = new RegExp(search, "i");
            filter.$or = [{ name: rx }, { description: rx }, { deliveryTime: rx }];
        }

        const skip = (page - 1) * limit;
        const [items, total] = await Promise.all([
            DeliveryOption.find(filter).sort({ isActive: -1, price: 1 }).skip(skip).limit(limit),
            DeliveryOption.countDocuments(filter),
        ]);

        return { items, total, page, limit };
    }
}
