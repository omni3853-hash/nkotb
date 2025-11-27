import { AdminUpdateDonationStatusFormData, AdminUpdateDonationStatusSchema, CreateDonationFormData, CreateDonationSchema, DonationQuery, DonationQuerySchema } from "@/utils/schemas/schemas";
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

export type Donation = {
    _id: string;
    user?: any;
    donorName: string;
    donorEmail: string;
    donorPhone?: string;
    amount: number;
    frequency: string;
    dedicatedTo?: string;
    isAnonymous: boolean;
    payment: any;
    status: string;
    notes?: string;
    createdAt: string;
    updatedAt: string;
};

export const DonationsApi = {
    async create(dto: CreateDonationFormData): Promise<Donation> {
        const payload = CreateDonationSchema.parse(dto);
        const res = await api.post(`/donations`, payload);
        return pickItem<Donation>(res);
    },

    async list(q: Partial<DonationQuery> = {}): Promise<Paginated<Donation>> {
        const params = DonationQuerySchema.partial().parse(q);
        const res = await api.get(`/donations${qsOf(params)}`);
        return pickList<Donation>(res);
    },

    async getById(id: string): Promise<Donation> {
        const res = await api.get(`/donations/${id}`);
        return pickItem<Donation>(res);
    },
};

export const AdminDonationsApi = {
    async updateStatus(id: string, dto: AdminUpdateDonationStatusFormData): Promise<Donation> {
        const payload = AdminUpdateDonationStatusSchema.parse(dto);
        const res = await api.patch(`/admin/donations/${id}`, payload);
        return pickItem<Donation>(res);
    },
};