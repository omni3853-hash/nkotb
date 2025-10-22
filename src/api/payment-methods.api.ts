"use client";

import { api } from "@/api/axios";
import type { IPaymentMethod } from "@/lib/models/payment-method.model";
import {
    CreatePaymentMethodSchema,
    UpdatePaymentMethodSchema,
    PaymentMethodQuerySchema,
    type CreatePaymentMethodFormData,
    type UpdatePaymentMethodFormData,
    type PaymentMethodQuery,
} from "@/utils/schemas/schemas";

type Paginated<T> = { items: T[]; total: number; page: number; limit: number };
const dataOf = <T,>(res: any) => (res?.data as T) ?? res?.data?.message ?? res?.data;

const qsOf = (query: Record<string, unknown> = {}) => {
    const p = new URLSearchParams();
    Object.entries(query).forEach(([k, v]) => {
        if (v === undefined || v === null || v === "") return;
        p.set(k, String(v));
    });
    const s = p.toString();
    return s ? `?${s}` : "";
};

/* =============================== ADMIN API =============================== */
/** Full admin CRUD + flags for /admin/payment-methods */
export const AdminPaymentMethodsApi = {
    /** GET /admin/payment-methods */
    async list(query: Partial<PaymentMethodQuery> = {}): Promise<Paginated<IPaymentMethod>> {
        const parsed = PaymentMethodQuerySchema.partial().parse(query);
        const res = await api.get(`/admin/payment-methods${qsOf(parsed)}`);
        return dataOf<Paginated<IPaymentMethod>>(res);
    },

    /** GET /admin/payment-methods/:id */
    async getById(id: string): Promise<IPaymentMethod> {
        const res = await api.get(`/admin/payment-methods/${id}`);
        return dataOf<IPaymentMethod>(res);
    },

    /** POST /admin/payment-methods */
    async create(dto: CreatePaymentMethodFormData): Promise<IPaymentMethod> {
        const payload = CreatePaymentMethodSchema.parse(dto);
        const res = await api.post("/admin/payment-methods", payload);
        return dataOf<IPaymentMethod>(res);
    },

    /** PUT /admin/payment-methods/:id */
    async update(id: string, dto: UpdatePaymentMethodFormData): Promise<IPaymentMethod> {
        const payload = UpdatePaymentMethodSchema.parse(dto);
        const res = await api.put(`/admin/payment-methods/${id}`, payload);
        return dataOf<IPaymentMethod>(res);
    },

    /** DELETE /admin/payment-methods/:id */
    async remove(id: string): Promise<void> {
        const res = await api.delete(`/admin/payment-methods/${id}`);
        return dataOf<void>(res);
    },

    /** PATCH /admin/payment-methods/:id/status  { status: boolean } */
    async toggleStatus(id: string, status: boolean): Promise<IPaymentMethod> {
        const res = await api.patch(`/admin/payment-methods/${id}/status`, { status });
        return dataOf<IPaymentMethod>(res);
    },

    /** PATCH /admin/payment-methods/:id/default */
    async setDefault(id: string): Promise<IPaymentMethod> {
        const res = await api.patch(`/admin/payment-methods/${id}/default`, {});
        return dataOf<IPaymentMethod>(res);
    },
};

/* Back-compat alias (matches what you already had) */
export const PaymentMethodsApi = {
    adminList: AdminPaymentMethodsApi.list,
    adminGetById: AdminPaymentMethodsApi.getById,
    create: AdminPaymentMethodsApi.create,
    update: AdminPaymentMethodsApi.update,
    remove: AdminPaymentMethodsApi.remove,
    toggleStatus: AdminPaymentMethodsApi.toggleStatus,
    setDefault: AdminPaymentMethodsApi.setDefault,
};

/* ================================ USER API =============================== */
/** Read-only, active methods visible to the user: /payment-methods */
export const UserPaymentMethodsApi = {
    /** GET /payment-methods  (active only; supports pagination/search if server exposes it) */
    async listActive(query: Partial<PaymentMethodQuery> = {}): Promise<Paginated<IPaymentMethod>> {
        const parsed = PaymentMethodQuerySchema.partial().parse(query);
        const res = await api.get(`/payment-methods${qsOf(parsed)}`);
        return dataOf<Paginated<IPaymentMethod>>(res);
    },
};
