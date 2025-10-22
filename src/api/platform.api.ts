"use client";

import { api } from "./axios";
import type { IPlatform } from "@/lib/models/platform.model";
import { UpdatePlatformSchema, type UpdatePlatformFormData } from "@/utils/schemas/schemas";

const dataOf = <T,>(res: any) => (res?.data as T) ?? res?.data?.message ?? res?.data;

export const PlatformApi = {
    async get(): Promise<IPlatform> {
        const res = await api.get("/platform");
        return dataOf<IPlatform>(res).platform;
    },

    async update(dto: UpdatePlatformFormData): Promise<IPlatform> {
        const payload = UpdatePlatformSchema.parse(dto);
        const res = await api.patch("/platform", payload);
        return dataOf<IPlatform>(res);
    },
};
