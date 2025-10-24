import type { IEvent } from "@/lib/models/event.model";
import { EventQueryDto, CreateEventDto, UpdateEventDto } from "@/lib/dto/event.dto";

export interface EventService {
    create(adminId: string, dto: CreateEventDto): Promise<IEvent>;
    list(query: EventQueryDto): Promise<{ items: IEvent[]; total: number; page: number; limit: number }>;
    getById(id: string): Promise<IEvent>;
    getBySlug(slug: string): Promise<IEvent>;
    update(adminId: string, id: string, dto: UpdateEventDto): Promise<IEvent>;
    delete(adminId: string, id: string): Promise<void>;
    toggleActive(adminId: string, id: string, isActive: boolean): Promise<IEvent>;
}
