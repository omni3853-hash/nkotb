import { EventQuery, EventQuerySchema, CreateEventFormData, CreateEventSchema, UpdateEventFormData, UpdateEventSchema, TicketTypeCreateSchema } from "@/utils/schemas/schemas";
import z from "zod";
import { api } from "./axios";

export type EventReview = {
    _id: string;
    author: string;
    rating: number;
    comment: string;
    verified: boolean;
    date: string;
};

export type Event = {
    _id: string;
    title: string;
    slug: string;
    category: string;
    tags: string[];
    image?: string | null;
    coverImage?: string | null;
    basePrice: number;
    rating: number;
    totalReviews: number;
    ticketsSold: number;
    views: number;
    availability: string;
    featured: boolean;
    trending: boolean;
    verified: boolean;
    description: string;
    location: string;
    date: string;
    time: string;
    attendees: number;
    ticketTypes: Array<z.infer<typeof TicketTypeCreateSchema>>;
    reviews: EventReview[];
    isActive: boolean;
    createdAt: string | Date;
    updatedAt: string | Date;
};

type Paginated<T> = { items: T[]; total: number; page: number; limit: number };

const pickList = <T,>(res: any): Paginated<T> =>
    res?.data?.data ?? res?.data ?? res;

const pickItem = <T,>(res: any): T =>
    res?.data?.item ??
    res?.data?.data ??
    res?.data?.event ??
    res?.data;

function qsOf(query: Record<string, unknown>) {
    const p = new URLSearchParams();
    Object.entries(query).forEach(([k, v]) => {
        if (v === undefined || v === null || v === "") return;
        p.set(k, String(v));
    });
    const s = p.toString();
    return s ? `?${s}` : "";
}

export const EventsApi = {
    async list(q: Partial<EventQuery> = {}): Promise<Paginated<Event>> {
        const params = EventQuerySchema.partial().parse(q);
        const res = await api.get(`/events${qsOf(params)}`);
        return pickList<Event>(res);
    },

    async getById(id: string): Promise<Event> {
        const res = await api.get(`/events/${id}`);
        return pickItem<Event>(res);
    },

    async getBySlug(slug: string): Promise<Event> {
        const res = await api.get(`/events/slug/${slug}`);
        return pickItem<Event>(res);
    },
};

export const AdminEventsApi = {
    async list(q: Partial<EventQuery> = {}): Promise<Paginated<Event>> {
        const params = EventQuerySchema.partial().parse(q);
        const res = await api.get(`/admin/events${qsOf(params)}`);
        return pickList<Event>(res);
    },

    async getById(id: string): Promise<Event> {
        const res = await api.get(`/admin/events/${id}`);
        return pickItem<Event>(res);
    },

    async create(dto: CreateEventFormData): Promise<Event> {
        const payload = CreateEventSchema.parse(dto);
        const res = await api.post(`/admin/events`, payload);
        return pickItem<Event>(res);
    },

    async update(id: string, dto: UpdateEventFormData): Promise<Event> {
        const payload = UpdateEventSchema.parse(dto);
        const res = await api.patch(`/admin/events/${id}`, payload);
        return pickItem<Event>(res);
    },

    async toggleActive(id: string, isActive: boolean): Promise<Event> {
        const res = await api.patch(`/admin/events/${id}`, { isActive });
        return pickItem<Event>(res);
    },

    async remove(id: string): Promise<void> {
        await api.delete(`/admin/events/${id}`);
    },
};
