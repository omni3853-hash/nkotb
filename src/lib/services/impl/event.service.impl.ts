import { EventService } from "@/lib/services/event.service";
import { Event, IEvent } from "@/lib/models/event.model";
import { EventQueryDto, CreateEventDto, UpdateEventDto } from "@/lib/dto/event.dto";
import { CustomError } from "@/lib/utils/customError.utils";
import { logAudit } from "@/lib/utils/auditLogger";
import mongoose from "mongoose";
import EmailServiceImpl from "@/lib/services/impl/email.service.impl";

export default class EventServiceImpl implements EventService {
    private email = new EmailServiceImpl();

    async create(adminId: string, dto: CreateEventDto): Promise<IEvent> {
        const session = await mongoose.startSession();
        try {
            return await session.withTransaction(async () => {
                const created = await Event.create([dto], { session });
                const event = created[0];

                await logAudit({
                    user: adminId,
                    action: "CREATE",
                    resource: "EVENT",
                    resourceId: event._id.toString(),
                    description: `Created event "${event.title}"`,
                });

                await this.email.sendEventPublished?.(
                    event.title,
                    event.slug,
                    event.category,
                    event.date,
                    event.location
                );

                return event;
            }, { readConcern: { level: "snapshot" }, writeConcern: { w: "majority" } });
        } finally {
            await session.endSession();
        }
    }

    async list(query: EventQueryDto) {
        const { search, category, onlyActive = true, page = 1, limit = 10 } = query;

        const filter: any = {};
        if (onlyActive) filter.isActive = true;
        if (category) filter.category = category;
        if (search) {
            filter.$text = { $search: search };
        }

        const skip = (page - 1) * limit;

        const [items, total] = await Promise.all([
            Event.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
            Event.countDocuments(filter),
        ]);

        return { items, total, page, limit };
    }

    async getById(id: string): Promise<IEvent> {
        const doc = await Event.findById(id);
        if (!doc) throw new CustomError(404, "Event not found");
        return doc;
    }

    async getBySlug(slug: string): Promise<IEvent> {
        const doc = await Event.findOne({ slug, isActive: true });
        if (!doc) throw new CustomError(404, "Event not found");
        return doc;
    }

    async update(adminId: string, id: string, dto: UpdateEventDto): Promise<IEvent> {
        const doc = await Event.findById(id);
        if (!doc) throw new CustomError(404, "Event not found");

        Object.assign(doc, dto);
        await doc.save();

        await logAudit({
            user: adminId,
            action: "UPDATE",
            resource: "EVENT",
            resourceId: id,
            description: `Updated event "${doc.title}"`,
        });

        return doc;
    }

    async delete(adminId: string, id: string): Promise<void> {
        const doc = await Event.findById(id);
        if (!doc) throw new CustomError(404, "Event not found");

        await doc.deleteOne();

        await logAudit({
            user: adminId,
            action: "DELETE",
            resource: "EVENT",
            resourceId: id,
            description: `Deleted event "${doc.title}"`,
        });
    }

    async toggleActive(adminId: string, id: string, isActive: boolean): Promise<IEvent> {
        const doc = await Event.findById(id);
        if (!doc) throw new CustomError(404, "Event not found");

        doc.isActive = !!isActive;
        await doc.save();

        await logAudit({
            user: adminId,
            action: "UPDATE",
            resource: "EVENT",
            resourceId: id,
            description: `Set event "${doc.title}" active=${doc.isActive}`,
        });

        return doc;
    }
}
