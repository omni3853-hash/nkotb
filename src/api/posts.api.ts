"use client";

import {
    BlogPostQuerySchema,
    CreateBlogPostFormData,
    CreateBlogPostSchema,
    UpdateBlogPostFormData,
    UpdateBlogPostSchema,  
} from "@/utils/schemas/schemas";
import { api } from "./axios";

export type BlogPost = {
    _id: string;
    title: string;
    slug: string;
    category: string;
    tags: string[];
    thumbnail?: string | null;
    coverImage?: string | null;
    excerpt: string;
    content: string;
    relatedCelebrities: string[];
    relatedEvents: string[];
    status: "draft" | "published" | "archived";
    isFeatured: boolean;
    views: number;
    isActive: boolean;
    publishedAt?: string | Date | null;
    createdAt: string | Date;
    updatedAt: string | Date;
};

export type BlogPostQuery = {
    search?: string;
    category?: string;
    tag?: string;
    celebrityId?: string;
    eventId?: string;
    status?: "draft" | "published" | "archived";
    onlyActive?: boolean;
    onlyPublished?: boolean;
    page?: number;
    limit?: number;
};

type Paginated<T> = { items: T[]; total: number; page: number; limit: number };

const pickList = <T,>(res: any): Paginated<T> =>
    res?.data?.data ?? res?.data ?? res;

const pickItem = <T,>(res: any): T =>
    res?.data?.item ??
    res?.data?.data ??
    res?.data?.post ??
    res?.data;

function qsOf(query: Record<string, unknown>) {
    const p = new URLSearchParams();
    Object.entries(query).forEach(([k, v]) => {
        if (v === undefined || v === null || v === "") return;
        p.set(k, String(v));
    });
    const s = p.toString();
    return s ? `?${s}` : "";
}

export const BlogPostsApi = {
    async list(q: Partial<BlogPostQuery> = {}): Promise<Paginated<BlogPost>> {
        const params = BlogPostQuerySchema.partial().parse(q);
        // Ensure limit doesn't exceed 100
        const safeParams = {
            ...params,
            limit: Math.min(params.limit || 10, 100)
        };
        const res = await api.get(`/posts${qsOf(safeParams)}`);
        return pickList<BlogPost>(res);
    },

    async getById(id: string): Promise<BlogPost> {
        const res = await api.get(`/posts/${id}`);
        return pickItem<BlogPost>(res);
    },

    async getBySlug(slug: string): Promise<BlogPost> {
        const res = await api.get(`/posts/slug/${slug}`);
        return pickItem<BlogPost>(res);
    },
};

export const AdminBlogPostsApi = {
    async list(q: Partial<BlogPostQuery> = {}): Promise<Paginated<BlogPost>> {
        const params = BlogPostQuerySchema.partial().parse(q);
        // Ensure limit doesn't exceed 100
        const safeParams = {
            ...params,
            limit: Math.min(params.limit || 10, 100)
        };
        const res = await api.get(`/admin/posts${qsOf(safeParams)}`);
        return pickList<BlogPost>(res);
    },

    async getById(id: string): Promise<BlogPost> {
        const res = await api.get(`/admin/posts/${id}`);
        return pickItem<BlogPost>(res);
    },

    async create(dto: CreateBlogPostFormData): Promise<BlogPost> {
        const payload = CreateBlogPostSchema.parse(dto);
        const res = await api.post(`/admin/posts`, payload);
        return pickItem<BlogPost>(res);
    },

    async update(id: string, dto: UpdateBlogPostFormData): Promise<BlogPost> {
        const payload = UpdateBlogPostSchema.parse(dto);
        const res = await api.patch(`/admin/posts/${id}`, payload);
        return pickItem<BlogPost>(res);
    },

    async remove(id: string): Promise<void> {
        await api.delete(`/admin/posts/${id}`);
    },
};