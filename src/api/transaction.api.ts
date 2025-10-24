"use client";

import { api } from "./axios";
import {
    // existing imports...
    CreateDepositSchema,
    AdminCreateDepositSchema,
    UpdateDepositStatusSchema,
    DepositQuerySchema,
    TransactionQuerySchema,
    type CreateDepositFormData,
    type AdminCreateDepositFormData,
    type UpdateDepositStatusFormData,
    type DepositQuery,
    type TransactionQuery,
} from "@/utils/schemas/schemas";

/* ------------------------ Shared Payment snapshot types ------------------ */
type PaymentSummary = {
    amount: number;
    paymentMethod:
    | string
    | {
        _id: string;
        type?: "CARD" | "BANK_TRANSFER" | "MOBILE_PAYMENT" | string;
        last4?: string;
        brand?: string;
    };
    currency?: string;
};

/* ================================= DEPOSITS ============================== */
export type DepositDto = {
    _id: string;
    user: string | { _id: string; firstName?: string; lastName?: string; email?: string };
    amount: number;
    payment?: PaymentSummary;
    status: "PENDING" | "COMPLETED" | "FAILED";
    creditedAt?: string;
    processedBy?: string | { _id: string; firstName?: string; lastName?: string; email?: string };
    processedAt?: string;
    notes?: string;
    createdAt: string;
    updatedAt: string;
    __v?: number;
};

type Paginated<T> = { items: T[]; total: number; page: number; limit: number };

function qsOf(query: Record<string, unknown>) {
    const p = new URLSearchParams();
    Object.entries(query).forEach(([k, v]) => {
        if (v === undefined || v === null || v === "") return;
        p.set(k, String(v));
    });
    const s = p.toString();
    return s ? `?${s}` : "";
}

export const UserDepositsApi = {
    async create(dto: CreateDepositFormData): Promise<DepositDto> {
        const payload = CreateDepositSchema.parse(dto);
        const res = await api.post(`/deposits`, payload);
        return res.data?.deposit ?? res.data?.item ?? res.data?.data ?? res.data;
    },
    async listMine(q: Partial<DepositQuery> = {}): Promise<Paginated<DepositDto>> {
        const params = DepositQuerySchema.partial().parse(q);
        const res = await api.get(`/deposits${qsOf(params)}`);
        return res.data?.data ?? res.data ?? res;
    },
    async getMyById(id: string): Promise<DepositDto> {
        const res = await api.get(`/deposits/${id}`);
        return res.data?.item ?? res.data?.data ?? res.data;
    },
};

export const AdminDepositsApi = {
    async create(dto: AdminCreateDepositFormData): Promise<DepositDto> {
        const payload = AdminCreateDepositSchema.parse(dto);
        const res = await api.post(`/admin/deposits`, payload);
        return res.data?.deposit ?? res.data?.item ?? res.data?.data ?? res.data;
    },
    async list(q: Partial<DepositQuery> = {}): Promise<Paginated<DepositDto>> {
        const params = DepositQuerySchema.partial().parse(q);
        const res = await api.get(`/admin/deposits${qsOf(params)}`);
        return res.data?.data ?? res.data ?? res;
    },
    async getById(id: string): Promise<DepositDto> {
        const res = await api.get(`/admin/deposits/${id}`);
        return res.data?.item ?? res.data?.data ?? res.data;
    },
    async updateStatus(id: string, dto: UpdateDepositStatusFormData): Promise<DepositDto> {
        const payload = UpdateDepositStatusSchema.parse(dto);
        const res = await api.patch(`/admin/deposits/${id}/status`, payload);
        return res.data?.deposit ?? res.data?.item ?? res.data?.data ?? res.data;
    },
    async remove(id: string): Promise<void> {
        await api.delete(`/admin/deposits/${id}`);
    },
};

/* =============================== TRANSACTIONS ============================ */
export type TransactionDto = {
    _id: string;
    user: string | { _id: string; firstName?: string; lastName?: string; email?: string };
    type: "DEBIT" | "CREDIT";
    purpose: "BOOKING_PAYMENT" | "BOOKING_REFUND" | "TICKET_PURCHASE" | "TICKET_REFUND" | "TOPUP" | "ADJUSTMENT";
    amount: number;
    balanceBefore?: number;
    balanceAfter?: number;
    relatedModel?: string;
    relatedId?: string;
    paymentMethod?: string | { _id: string };
    note?: string;
    metadata?: Record<string, any>;
    createdAt: string;
    updatedAt: string;
};

export const UserTransactionsApi = {
    async listMine(q: Partial<TransactionQuery> = {}): Promise<Paginated<TransactionDto>> {
        const params = TransactionQuerySchema.partial().parse(q);
        const res = await api.get(`/transactions${qsOf(params)}`);
        return res.data?.data ?? res.data ?? res;
    },
    async getById(id: string): Promise<TransactionDto> {
        const res = await api.get(`/transactions/${id}`);
        return res.data?.item ?? res.data?.data ?? res.data;
    },
};

export const AdminTransactionsApi = {
    async list(q: Partial<TransactionQuery> = {}): Promise<Paginated<TransactionDto>> {
        const params = TransactionQuerySchema.partial().parse(q);
        const res = await api.get(`/admin/transactions${qsOf(params)}`);
        return res.data?.data ?? res.data ?? res;
    },
    async getById(id: string): Promise<TransactionDto> {
        const res = await api.get(`/admin/transactions/${id}`);
        return res.data?.item ?? res.data?.data ?? res.data;
    },
};
