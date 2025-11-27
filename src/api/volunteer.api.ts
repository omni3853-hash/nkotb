import { AdminUpdateVolunteerStatusFormData, AdminUpdateVolunteerStatusSchema, CreateVolunteerFormData, CreateVolunteerSchema, VolunteerQuery, VolunteerQuerySchema } from "@/utils/schemas/schemas";
import { api } from "./axios";

type Paginated<T> = { items: T[]; total: number; page: number; limit: number };

const pickList = <T,>(res: any): Paginated<T> => res?.data?.data ?? res?.data ?? res;
const pickItem = <T,>(res: any): T =>
    res?.data?.item ?? res?.data?.data ?? res?.data?.donation ?? res?.data?.application ?? res?.data;

function qsOf(query: Record<string, unknown>) {
    const p = new URLSearchParams();
    Object.entries(query).forEach(([k, v]) => {
        if (v === undefined || v === null || v === "") return;
        p.set(k, String(v));
    });
    const s = p.toString();
    return s ? `?${s}` : "";
}

export type Volunteer = {
    _id: string;
    user?: any;
    fullName: string;
    email: string;
    phone?: string;
    interests: string[];
    availability?: string;
    status: string;
    notes?: string;
    createdAt: string;
    updatedAt: string;
};

export const VolunteersApi = {
    async create(dto: CreateVolunteerFormData): Promise<Volunteer> {
        const payload = CreateVolunteerSchema.parse(dto);
        const res = await api.post(`/volunteers`, payload);
        return pickItem<Volunteer>(res);
    },
};

export const AdminVolunteersApi = {
    async list(q: Partial<VolunteerQuery> = {}): Promise<Paginated<Volunteer>> {
        const params = VolunteerQuerySchema.partial().parse(q);
        const res = await api.get(`/volunteers${qsOf(params)}`);
        return pickList<Volunteer>(res);
    },

    async getById(id: string): Promise<Volunteer> {
        const res = await api.get(`/admin/volunteers/${id}`);
        return pickItem<Volunteer>(res);
    },

    async updateStatus(id: string, dto: AdminUpdateVolunteerStatusFormData): Promise<Volunteer> {
        const payload = AdminUpdateVolunteerStatusSchema.parse(dto);
        const res = await api.patch(`/admin/volunteers/${id}`, payload);
        return pickItem<Volunteer>(res);
    },
};