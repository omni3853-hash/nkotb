"use client";

import { api } from "./axios";
import type { IUser } from "@/lib/models/user.model";
import type { AdminUpdateUserFormData, ChangePasswordFormData, UpdateSelfFormData } from "@/utils/schemas/schemas";
import { AdminUpdateUserSchema, UpdateSelfSchema } from "@/utils/schemas/schemas";

type Paginated<T> = { items: T[]; total: number; page: number; limit: number };
const dataOf = <T,>(res: any) => (res?.data as T) ?? res?.data;

export type AdminListQuery = {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    status?: string;
    emailVerified?: string;
};

export const UsersApi = {
    async adminList(params: AdminListQuery): Promise<Paginated<IUser>> {
        const query: Record<string, any> = {};
        if (params.page) query.page = params.page;
        if (params.limit) query.limit = params.limit;
        if (params.search) query.search = params.search;
        if (params.role && params.role !== "all") query.role = params.role;
        if (params.status && params.status !== "all") query.status = params.status;
        if (params.emailVerified && params.emailVerified !== "all")
            query.emailVerified = params.emailVerified;
        const res = await api.get("/users", { params: query });
        return dataOf<Paginated<IUser>>(res);
    },

    async get(id: string): Promise<IUser> {
        const res = await api.get(`/users/${id}`);
        return dataOf<IUser>(res);
    },

    async update(id: string, dto: Partial<AdminUpdateUserFormData>): Promise<IUser> {
        const payload = AdminUpdateUserSchema.parse(dto);
        const res = await api.patch(`/users/${id}`, payload);
        return dataOf<IUser>(res);
    },

    /** No DELETE route provided; treat delete as admin soft-suspend */
    async remove(id: string): Promise<IUser> {
        const res = await api.patch(`/users/${id}`, { status: "Suspended" });
        return dataOf<IUser>(res);
    },

    // Self
    async me(): Promise<IUser> {
        const res = await api.get("/users/me");
        return dataOf<IUser>(res).user;
    },

    async updateMe(dto: UpdateSelfFormData): Promise<IUser> {
        const payload = UpdateSelfSchema.parse(dto);
        const res = await api.patch("/users/me", payload);
        return dataOf<IUser>(res);
    },

    async changeMyPassword(dto: ChangePasswordFormData): Promise<void> {
        const res = await api.patch("/users/me/password", dto);
        return dataOf<void>(res);
    },
};
