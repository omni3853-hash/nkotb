"use client";

import { api } from "./axios";
import {
    CreateNotificationSchema,
    UpdateNotificationSchema,
    NotificationQuerySchema,
    type CreateNotificationFormData,
    type UpdateNotificationFormData,
    type NotificationQuery,
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

/* ========================================================================
 * DTO shape (client-side)
 * ===================================================================== */
export type NotificationDto = {
    _id: string;
    user: string | { _id: string; firstName?: string; lastName?: string; email?: string };
    type: string;
    title: string;
    message: string;
    read: boolean;
    createdAt: string;
    updatedAt: string;
};

/* ========================================================================
 * ADMIN API — /admin/notifications
 * ===================================================================== */
export const AdminNotificationsApi = {
    /** GET /admin/notifications */
    async list(query: Partial<NotificationQuery> = {}): Promise<Paginated<NotificationDto>> {
        const parsed = NotificationQuerySchema.partial().parse(query);
        const res = await api.get(`/admin/notifications${qsOf(parsed)}`);
        return dataOf<Paginated<NotificationDto>>(res);
    },

    /** GET /admin/notifications/:id */
    async getById(id: string): Promise<NotificationDto> {
        const res = await api.get(`/admin/notifications/${id}`);
        return dataOf<NotificationDto>(res);
    },

    /** POST /admin/notifications */
    async create(dto: CreateNotificationFormData): Promise<NotificationDto> {
        const payload = CreateNotificationSchema.parse(dto);
        const res = await api.post(`/admin/notifications`, payload);
        return dataOf<NotificationDto>(res);
    },

    /** PUT /admin/notifications/:id */
    async update(id: string, dto: UpdateNotificationFormData): Promise<NotificationDto> {
        const payload = UpdateNotificationSchema.parse(dto);
        const res = await api.put(`/admin/notifications/${id}`, payload);
        return dataOf<NotificationDto>(res);
    },

    /** DELETE /admin/notifications/:id */
    async remove(id: string): Promise<void> {
        const res = await api.delete(`/admin/notifications/${id}`);
        return dataOf<void>(res);
    },
};

/* Back-compat alias if you prefer a single export name */
export const NotificationsApi = {
    adminList: AdminNotificationsApi.list,
    adminGetById: AdminNotificationsApi.getById,
    create: AdminNotificationsApi.create,
    update: AdminNotificationsApi.update,
    remove: AdminNotificationsApi.remove,
};

/* ========================================================================
 * USER API — /notifications
 * ===================================================================== */
export const UserNotificationsApi = {
    /** GET /notifications  (current user’s notifications; supports pagination/filter if server provides) */
    async myList(query: Partial<NotificationQuery> = {}): Promise<Paginated<NotificationDto>> {
        const parsed = NotificationQuerySchema.partial().parse(query);
        const res = await api.get(`/notifications${qsOf(parsed)}`);
        return dataOf<Paginated<NotificationDto>>(res);
    },

    /** PATCH /notifications  (mark ALL as read) */
    async markAllRead(): Promise<number> {
        const res = await api.patch(`/notifications`);
        // convention: server returns the number updated, or { count }
        const val = dataOf<any>(res);
        // normalize: return a number either way
        if (typeof val === "number") return val;
        if (typeof val?.count === "number") return val.count;
        return 0;
    },

    /** PATCH /notifications/:id  (mark ONE as read) */
    async markRead(id: string): Promise<NotificationDto> {
        const res = await api.patch(`/notifications/${id}`);
        return dataOf<NotificationDto>(res);
    },
};
