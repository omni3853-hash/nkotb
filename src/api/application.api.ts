import { AdminReviewApplicationFormData, AdminReviewApplicationSchema, ApplicationQuery, ApplicationQuerySchema, CreateAssistanceApplicationFormData, CreateAssistanceApplicationSchema } from "@/utils/schemas/schemas";
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

export type AssistanceApplication = {
    _id: string;
    applicantName: string;
    applicantEmail: string;
    applicantPhone?: string;
    mailingAddress: string;
    birthDate: string;
    ssnLast4: string;
    diagnosisDate: string;
    diagnosisDescription: string;
    monthlyIncome: number;
    isEmployed: boolean;
    inActiveTreatment: boolean;
    socialWorkerName?: string;
    socialWorkerFacility?: string;
    documents: any;
    status: string;
    grantAmount?: number;
    reviewNotes?: string;
    reviewedBy?: any;
    reviewedAt?: string;
    submissionMonth: string;
    createdAt: string;
    updatedAt: string;
};

export const AssistanceApplicationsApi = {
    async create(dto: CreateAssistanceApplicationFormData): Promise<AssistanceApplication> {
        const payload = CreateAssistanceApplicationSchema.parse(dto);
        const res = await api.post(`/applications`, payload);
        return pickItem<AssistanceApplication>(res);
    },

    async list(q: Partial<ApplicationQuery> = {}): Promise<Paginated<AssistanceApplication>> {
        const params = ApplicationQuerySchema.partial().parse(q);
        const res = await api.get(`/applications${qsOf(params)}`);
        return pickList<AssistanceApplication>(res);
    },

    async getById(id: string): Promise<AssistanceApplication> {
        const res = await api.get(`/applications/${id}`);
        return pickItem<AssistanceApplication>(res);
    },
};

export const AdminAssistanceApplicationsApi = {
    async review(
        id: string,
        dto: AdminReviewApplicationFormData
    ): Promise<AssistanceApplication> {
        const payload = AdminReviewApplicationSchema.parse(dto);
        const res = await api.patch(`/admin/applications/${id}`, payload);
        return pickItem<AssistanceApplication>(res);
    },
};