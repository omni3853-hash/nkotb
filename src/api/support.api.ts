import {
    CreateSupportTicketFormData,
    CreateSupportTicketSchema,
    AdminReplySupportTicketFormData,
    AdminReplySupportTicketSchema,
    AdminUpdateSupportStatusFormData,
    AdminUpdateSupportStatusSchema,
} from "@/utils/schemas/schemas";
import { api } from "./axios";

export type SupportTicket = {
    _id: string;
    user?: any | null;
    isGuest: boolean;
    contact: {
        name: string;
        email: string;
        phone?: string;
    };
    subject: string;
    message: string;
    status: string;
    priority: string;
    assignedTo?: any | null;
    replies: {
        _id: string;
        from: "CUSTOMER" | "ADMIN";
        body: string;
        createdAt: string;
        authorUser?: any | null;
    }[];
    lastRepliedAt?: string;
    lastRepliedBy?: any | null;
    createdAt: string;
    updatedAt: string;
};

type Paginated<T> = { items: T[]; total: number; page: number; limit: number };

const pickList = <T,>(res: any): Paginated<T> =>
    res?.data?.data ?? res?.data ?? res;
const pickItem = <T,>(res: any): T =>
    res?.data?.item ?? res?.data?.ticket ?? res?.data?.data ?? res?.data;

function qsOf(query: Record<string, unknown>) {
    const p = new URLSearchParams();
    Object.entries(query).forEach(([k, v]) => {
        if (v === undefined || v === null || v === "") return;
        p.set(k, String(v));
    });
    const s = p.toString();
    return s ? `?${s}` : "";
}

/* ----------------------------- SUPPORT ----------------------------- */

export const SupportApi = {
    /** POST /support */
    async create(dto: CreateSupportTicketFormData): Promise<SupportTicket> {
        const payload = CreateSupportTicketSchema.parse(dto);
        const res = await api.post(`/support`, payload);
        return pickItem<SupportTicket>(res);
    },
};

/* ------------------------------- ADMIN SUPPORT ---------------------------- */

export const AdminSupportApi = {
    /** GET /admin/support */
    async list(q: {
        status?: string;
        priority?: string;
        email?: string;
        page?: number;
        limit?: number;
    } = {}): Promise<Paginated<SupportTicket>> {
        const res = await api.get(`/admin/support${qsOf(q)}`);
        return pickList<SupportTicket>(res);
    },

    /** GET /admin/support/[id] */
    async getById(id: string): Promise<SupportTicket> {
        const res = await api.get(`/admin/support/${id}`);
        return pickItem<SupportTicket>(res);
    },

    /** PATCH /admin/support/[id] – update status */
    async updateStatus(
        id: string,
        dto: AdminUpdateSupportStatusFormData
    ): Promise<SupportTicket> {
        const payload = AdminUpdateSupportStatusSchema.parse(dto);
        const res = await api.patch(`/admin/support/${id}`, payload);
        return pickItem<SupportTicket>(res);
    },

    /** POST /admin/support/[id]/reply – send admin reply */
    async reply(
        id: string,
        dto: AdminReplySupportTicketFormData
    ): Promise<SupportTicket> {
        const payload = AdminReplySupportTicketSchema.parse(dto);
        const res = await api.post(`/admin/support/${id}/reply`, payload);
        return pickItem<SupportTicket>(res);
    },
};
