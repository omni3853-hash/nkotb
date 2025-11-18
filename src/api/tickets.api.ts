import { AdminTicketQuery, AdminTicketQuerySchema, TicketQuery, TicketQuerySchema, CreateTicketFormData, CreateTicketSchema, AdminUpdateTicketStatusFormData, AdminUpdateTicketStatusSchema, CreateOfflineTicketFormData, CreateOfflineTicketSchema } from "@/utils/schemas/schemas";
import { api } from "./axios";

export type Ticket = {
    _id: string;
    user: any;
    event: any;
    eventTitleSnapshot: string;
    eventSlugSnapshot: string;
    ticketTypeId: any;
    ticketTypeName: string;
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
    res?.data?.ticket ??
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

export const TicketsApi = {
    /** GET /tickets (mine) */
    async listMine(q: Partial<TicketQuery> = {}): Promise<Paginated<Ticket>> {
        const params = TicketQuerySchema.partial().parse(q);
        const res = await api.get(`/tickets${qsOf(params)}`);
        return pickList<Ticket>(res);
    },

    /** GET /tickets/[id] (mine) */
    async getMyById(id: string): Promise<Ticket> {
        const res = await api.get(`/tickets/${id}`);
        return pickItem<Ticket>(res);
    },

    /** POST /tickets */
    async create(dto: CreateTicketFormData): Promise<Ticket> {
        const payload = CreateTicketSchema.parse(dto);
        const res = await api.post(`/tickets`, payload);
        return pickItem<Ticket>(res);
    },

    async createOffline(dto: CreateOfflineTicketFormData): Promise<Ticket> {
        const payload = CreateOfflineTicketSchema.parse(dto);
        const res = await api.post(`/tickets/offline`, payload);
        return pickItem<Ticket>(res);
    },
};

/* -------------------------------------------------------------------------- */
/*                               ADMIN: TICKETS                               */
/* -------------------------------------------------------------------------- */

export const AdminTicketsApi = {
    /** GET /admin/tickets */
    async list(q: Partial<AdminTicketQuery> = {}): Promise<Paginated<Ticket>> {
        const params = AdminTicketQuerySchema.partial().parse(q);
        const res = await api.get(`/admin/tickets${qsOf(params)}`);
        return pickList<Ticket>(res);
    },

    /** GET /admin/tickets/[id] */
    async getById(id: string): Promise<Ticket> {
        const res = await api.get(`/admin/tickets/${id}`);
        return pickItem<Ticket>(res);
    },

    /** PATCH /admin/tickets/[id] (status change) */
    async updateStatus(
        id: string,
        dto: AdminUpdateTicketStatusFormData
    ): Promise<Ticket> {
        const payload = AdminUpdateTicketStatusSchema.parse(dto);
        const res = await api.patch(`/admin/tickets/${id}`, payload);
        return pickItem<Ticket>(res);
    },
};
