import { AdminBookingQuery, AdminBookingQuerySchema, AdminUpdateBookingStatusFormData, AdminUpdateBookingStatusSchema, BookingQuery, BookingQuerySchema, CreateBookingFormData, CreateBookingSchema } from "@/utils/schemas/schemas";
import { api } from "./axios";

export type Booking = {
    _id: string;
    user: any;
    celebrity: any;
    celebrityNameSnapshot: string;
    celebritySlugSnapshot: string;
    bookingTypeId: any;
    bookingTypeName: string;
    unitPrice: number;
    quantity: number;
    totalAmount: number;
    notes?: string;
    status: string;
    createdAt: string;
    updatedAt: string;
};

type Paginated<T> = { items: T[]; total: number; page: number; limit: number };

const pickList = <T,>(res: any): Paginated<T> =>
    res?.data?.data ?? res?.data ?? res;

const pickItem = <T,>(res: any): T =>
    res?.data?.item ??
    res?.data?.data ??
    res?.data?.celebrity ??
    res?.data?.booking ??
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

export const BookingsApi = {
    /** GET /bookings (mine) */
    async listMine(q: Partial<BookingQuery> = {}): Promise<Paginated<Booking>> {
        const params = BookingQuerySchema.partial().parse(q);
        const res = await api.get(`/bookings${qsOf(params)}`);
        return pickList<Booking>(res);
    },

    /** GET /bookings/[id] (mine) */
    async getMyById(id: string): Promise<Booking> {
        const res = await api.get(`/bookings/${id}`);
        return pickItem<Booking>(res);
    },

    /** POST /bookings */
    async create(dto: CreateBookingFormData): Promise<Booking> {
        const payload = CreateBookingSchema.parse(dto);
        const res = await api.post(`/bookings`, payload);
        return pickItem<Booking>(res);
    },
};

/* -------------------------------------------------------------------------- */
/*                               ADMIN: BOOKINGS                              */
/* -------------------------------------------------------------------------- */

export const AdminBookingsApi = {
    /** GET /admin/bookings */
    async list(q: Partial<AdminBookingQuery> = {}): Promise<Paginated<Booking>> {
        const params = AdminBookingQuerySchema.partial().parse(q);
        const res = await api.get(`/admin/bookings${qsOf(params)}`);
        return pickList<Booking>(res);
    },

    /** GET /admin/bookings/[id] */
    async getById(id: string): Promise<Booking> {
        const res = await api.get(`/admin/bookings/${id}`);
        return pickItem<Booking>(res);
    },

    /** PATCH /admin/bookings/[id] (status change) */
    async updateStatus(
        id: string,
        dto: AdminUpdateBookingStatusFormData
    ): Promise<Booking> {
        const payload = AdminUpdateBookingStatusSchema.parse(dto);
        const res = await api.patch(`/admin/bookings/${id}`, payload);
        return pickItem<Booking>(res);
    },
};