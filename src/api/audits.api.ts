"use client";

import { api } from "./axios";
import type { IAudit } from "@/lib/models/audit.model";
import type { AuditQueryDto } from "@/lib/dto/audit.dto";

type Paginated<T> = {
    items: T[];
    total: number;
    page: number;
    limit: number;
};

const dataOf = <T,>(res: any) => (res?.data as T) ?? res?.data?.message ?? res?.data;

export const AuditsApi = {
    /**
     * Admin list of audits
     * GET /admin/audits
     * Query strictly follows AuditQueryDto: { userId?, action?, resource?, from?, to?, page?, limit? }
     */
    async adminList(params: Partial<AuditQueryDto>): Promise<Paginated<IAudit>> {
        // Only pass fields the backend knows about (no extra FE-only stuff)
        const query: Record<string, any> = {};
        if (params.userId) query.userId = params.userId;
        if (params.action) query.action = params.action;
        if (params.resource) query.resource = params.resource;
        if (params.from) query.from = params.from;
        if (params.to) query.to = params.to;
        if (params.page) query.page = params.page;
        if (params.limit) query.limit = params.limit;

        const res = await api.get("/admin/audits", { params: query });
        return dataOf<Paginated<IAudit>>(res);
    },

    /**
     * Get a single audit by id
     * GET /admin/audits/[id]
     */
    async getById(id: string): Promise<IAudit> {
        const res = await api.get(`/admin/audits/${id}`);
        return dataOf<IAudit>(res);
    },
};
