"use client";

import { api } from "./axios";
import {
    // MEMBERSHIP PLANS
    CreateMembershipPlanSchema,
    UpdateMembershipPlanSchema,
    MembershipPlanQuerySchema,
    type CreateMembershipPlanFormData,
    type UpdateMembershipPlanFormData,
    type MembershipPlanQuery,

    // DELIVERY OPTIONS
    CreateDeliveryOptionSchema,
    UpdateDeliveryOptionSchema,
    DeliveryOptionQuerySchema,
    type CreateDeliveryOptionFormData,
    type UpdateDeliveryOptionFormData,
    type DeliveryOptionQuery,

    // DELIVERY REQUESTS
    CreateDeliveryRequestSchema,
    DeliveryRequestQuerySchema,
    AdminUpdateDeliveryRequestStatusSchema,
    type CreateDeliveryRequestFormData,
    type DeliveryRequestQuery,
    type AdminUpdateDeliveryRequestStatusFormData,

    // MEMBERSHIPS (user + admin)
    CreateMembershipSchema,
    UpgradeMembershipSchema,
    UpdateMembershipStatusSchema,
    MembershipQuerySchema,
    type CreateMembershipFormData,
    type UpgradeMembershipFormData,
    type UpdateMembershipStatusFormData,
    type MembershipQuery,
} from "@/utils/schemas/schemas";

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

/* ---------------------------- DTO SHAPES ---------------------------- */
export type MembershipPlanDto = {
    _id: string;
    name: string;
    price: number;
    period: "MONTH" | "YEAR" | "CUSTOM";
    durationDays?: number;
    description: string;
    icon?: string;
    color?: string;
    popular: boolean;
    features: string[];
    limitations: string[];
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
};

export type DeliveryOptionDto = {
    _id: string;
    name: string;
    price: number;
    deliveryTime: string;
    description: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
};

export type DeliveryRequestDto = {
    _id: string;
    user:
    | string
    | { _id: string; firstName?: string; lastName?: string; email?: string; phone?: string };
    status: "PENDING" | "APPROVED" | "COMPLETED" | "REJECTED";
    deliveryOption: string | DeliveryOptionDto;
    deliveryAddress: { street: string; city: string; state: string; country: string; zipCode: string };
    specialInstruction?: string;
    createdAt: string;
    updatedAt: string;
};

type PaymentSummary = {
    amount: number;
    // keep flexible so other parts don't break
    paymentMethod: string | { _id: string; type?: "CARD" | "BANK_TRANSFER" | "MOBILE_PAYMENT" | string; last4?: string; brand?: string };
    currency?: string; // optional, harmless if backend adds it later
};

type PlanSnapshot = {
    name: string;
    period: "MONTH" | "YEAR" | "CUSTOM";
    price: number;
    durationDays?: number;
    features: string[];
    limitations: string[];
};

/* ----------------------------- MEMBERSHIP ---------------------------- */
export type MembershipDto = {
    _id: string;

    user:
    | string
    | { _id: string; firstName?: string; lastName?: string; email?: string };

    // still supports previous shape
    planId: string | { _id: string; name: string };

    // NEW (optional to avoid breaking callers)
    planSnapshot?: PlanSnapshot;

    status: "PENDING" | "ACTIVE" | "SUSPENDED" | "CANCELLED" | "EXPIRED";
    autoRenew: boolean;

    startedAt: string;
    expiresAt: string;

    // NEW (optional)
    payment?: PaymentSummary;

    // NEW (optional)
    proofOfPayment?: string; // e.g. Cloudinary URL

    createdAt: string;
    updatedAt: string;

    // NEW (optional) for mongoose docs that include it
    __v?: number;
};

/* ============================ MEMBERSHIP PLANS ============================ */
export const MembershipPlansApi = {
    async list(q: Partial<MembershipPlanQuery> = {}): Promise<Paginated<MembershipPlanDto>> {
        const params = MembershipPlanQuerySchema.partial().parse(q);
        const res = await api.get(`/admin/memberships/plans${qsOf(params)}`);
        return res.data?.data ?? res.data ?? res;
    },
    async getById(id: string): Promise<MembershipPlanDto> {
        const res = await api.get(`/admin/memberships/plans/${id}`);
        return res.data?.item ?? res.data?.data ?? res.data;
    },
    async create(dto: CreateMembershipPlanFormData): Promise<MembershipPlanDto> {
        const payload = CreateMembershipPlanSchema.parse(dto);
        const res = await api.post(`/admin/memberships/plans`, payload);
        return res.data?.item ?? res.data?.data ?? res.data;
    },
    async update(id: string, dto: UpdateMembershipPlanFormData): Promise<MembershipPlanDto> {
        const payload = UpdateMembershipPlanSchema.parse(dto);
        const res = await api.patch(`/admin/memberships/plans/${id}`, payload);
        return res.data?.item ?? res.data?.data ?? res.data;
    },
    async toggleActive(id: string, isActive: boolean): Promise<MembershipPlanDto> {
        const res = await api.patch(`/admin/memberships/plans/${id}/active`, { isActive });
        return res.data?.item ?? res.data?.data ?? res.data;
    },
    async setPopular(id: string, popular: boolean): Promise<MembershipPlanDto> {
        const res = await api.patch(`/admin/memberships/plans/${id}/popular`, { popular });
        return res.data?.item ?? res.data?.data ?? res.data;
    },
    async remove(id: string): Promise<void> {
        await api.delete(`/admin/memberships/plans/${id}`);
    },
};

/* ============================= DELIVERY OPTIONS ========================== */
export const DeliveryOptionsApi = {
    // ADMIN list
    async list(q: Partial<DeliveryOptionQuery> = {}): Promise<Paginated<DeliveryOptionDto>> {
        const params = DeliveryOptionQuerySchema.partial().parse(q);
        const res = await api.get(`/admin/delivery-options${qsOf(params)}`);
        return res.data?.data ?? res.data ?? res;
    },
    // USER list (read-only)
    async userList(q: Partial<DeliveryOptionQuery> = {}): Promise<Paginated<DeliveryOptionDto>> {
        const params = DeliveryOptionQuerySchema.partial().parse(q);
        const res = await api.get(`/delivery-options${qsOf(params)}`);
        return res.data?.data ?? res.data ?? res;
    },
    async getById(id: string): Promise<DeliveryOptionDto> {
        const res = await api.get(`/admin/delivery-options/${id}`);
        return res.data?.item ?? res.data?.data ?? res.data;
    },
    async create(dto: CreateDeliveryOptionFormData): Promise<DeliveryOptionDto> {
        const payload = CreateDeliveryOptionSchema.parse(dto);
        const res = await api.post(`/admin/delivery-options`, payload);
        return res.data?.item ?? res.data?.data ?? res.data;
    },
    async update(id: string, dto: UpdateDeliveryOptionFormData): Promise<DeliveryOptionDto> {
        const payload = UpdateDeliveryOptionSchema.parse(dto);
        const res = await api.patch(`/admin/delivery-options/${id}`, payload);
        return res.data?.item ?? res.data?.data ?? res.data;
    },
    async toggleActive(id: string, isActive: boolean): Promise<DeliveryOptionDto> {
        const res = await api.patch(`/admin/delivery-options/${id}/active`, { isActive });
        return res.data?.item ?? res.data?.data ?? res.data;
    },
    async remove(id: string): Promise<void> {
        await api.delete(`/admin/delivery-options/${id}`);
    },
};

/* ============================= DELIVERY REQUESTS ========================= */
/** Admin-facing (kept for backward compat with your existing usage) */
export const DeliveryRequestsApi = {
    async adminList(q: Partial<DeliveryRequestQuery> = {}): Promise<Paginated<DeliveryRequestDto>> {
        const params = DeliveryRequestQuerySchema.partial().parse(q);
        const res = await api.get(`/admin/delivery-requests${qsOf(params)}`);
        return res.data?.data ?? res.data ?? res;
    },
    async getById(id: string): Promise<DeliveryRequestDto> {
        const res = await api.get(`/admin/delivery-requests/${id}`);
        return res.data?.item ?? res.data?.data ?? res.data;
    },
    async updateStatus(id: string, dto: AdminUpdateDeliveryRequestStatusFormData): Promise<DeliveryRequestDto> {
        const payload = AdminUpdateDeliveryRequestStatusSchema.parse(dto);
        const res = await api.patch(`/admin/delivery-requests/${id}`, payload);
        return res.data?.item ?? res.data?.data ?? res.data;
    },
};

/** User-facing */
export const UserDeliveryRequestsApi = {
    async listMine(q: Partial<DeliveryRequestQuery> = {}): Promise<Paginated<DeliveryRequestDto>> {
        const params = DeliveryRequestQuerySchema.partial().parse(q);
        const res = await api.get(`/delivery-requests${qsOf(params)}`);
        return res.data?.data ?? res.data ?? res;
    },
    async getMineById(id: string): Promise<DeliveryRequestDto> {
        const res = await api.get(`/delivery-requests/${id}`);
        return res.data?.item ?? res.data?.data ?? res.data;
    },
    async create(dto: CreateDeliveryRequestFormData): Promise<DeliveryRequestDto> {
        const payload = CreateDeliveryRequestSchema.parse(dto);
        const res = await api.post(`/delivery-requests`, payload);
        return res.data?.item ?? res.data?.data ?? res.data;
    },
};

/* ================================ MEMBERSHIPS ============================ */
/** Admin-facing list was previously exposed as MembershipsApi.list.
 *  Keeping that for compatibility and adding full Admin + User APIs below.
 */
export const MembershipsApi = {
    async list(q: Partial<MembershipQuery> = {}): Promise<Paginated<MembershipDto>> {
        const params = MembershipQuerySchema.partial().parse(q);
        const res = await api.get(`/admin/memberships${qsOf(params)}`);
        return res.data?.data ?? res.data ?? res;
    },
};

export const AdminMembershipsApi = {
    async list(q: Partial<MembershipQuery> = {}): Promise<Paginated<MembershipDto>> {
        const params = MembershipQuerySchema.partial().parse(q);
        const res = await api.get(`/admin/memberships${qsOf(params)}`);
        return res.data?.data ?? res.data ?? res;
    },
    async getById(id: string): Promise<MembershipDto> {
        const res = await api.get(`/admin/memberships/${id}`);
        return res.data?.item ?? res.data?.data ?? res.data;
    },
    async updateStatus(
        id: string,
        dto: UpdateMembershipStatusFormData
    ): Promise<MembershipDto> {
        const payload = UpdateMembershipStatusSchema.parse(dto);
        const res = await api.patch(`/admin/memberships/${id}/status`, payload);
        return res.data?.item ?? res.data?.data ?? res.data;
    },
};

export const UserMembershipsApi = {
    /** GET /memberships (mine) */
    async listMine(q: Partial<MembershipQuery> = {}): Promise<Paginated<MembershipDto>> {
        const params = MembershipQuerySchema.partial().parse(q);
        const res = await api.get(`/memberships${qsOf(params)}`);
        return res.data?.data ?? res.data ?? res;
    },
    /** GET /memberships (mine) */
    async listPlans(q: Partial<MembershipPlanQuery> = {}): Promise<Paginated<MembershipPlanDto>> {
        const params = MembershipPlanQuerySchema.partial().parse(q);
        const res = await api.get(`/memberships/plans${qsOf(params)}`);
        return res.data?.data ?? res.data ?? res;
    },
    /** GET /memberships/[id] (mine) */
    async getMyById(id: string): Promise<MembershipDto> {
        const res = await api.get(`/memberships/${id}`);
        return res.data?.item ?? res.data?.data ?? res.data;
    },
    /** POST /memberships */
    async create(dto: CreateMembershipFormData): Promise<MembershipDto> {
        const payload = CreateMembershipSchema.parse(dto);
        const res = await api.post(`/memberships`, payload);
        return res.data?.item ?? res.data?.data ?? res.data;
    },
    /** POST /memberships/upgrade */
    async upgrade(dto: UpgradeMembershipFormData): Promise<MembershipDto> {
        const payload = UpgradeMembershipSchema.parse(dto);
        const res = await api.post(`/memberships/upgrade`, payload);
        return res.data?.item ?? res.data?.data ?? res.data;
    },
    /** PATCH /memberships/[id]/auto-renew (cancel/flip off) */
    async cancelAutoRenew(id: string): Promise<MembershipDto> {
        const res = await api.patch(`/memberships/${id}/auto-renew`, { autoRenew: false });
        return res.data?.item ?? res.data?.data ?? res.data;
    },
};
