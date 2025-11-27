import { MediaCategory } from "@/lib/dto/media.dto";
import { api } from "./axios";

export interface RememberBettyMedia {
    _id: string;
    title: string;
    mediaUrl: string;
    category: MediaCategory;
    createdAt: string;
    updatedAt: string;
}

export const RememberBettyMediaApi = {
    // Fetch a list of media items
    async list(query = {}): Promise<{ items: RememberBettyMedia[]; total: number; page: number; limit: number }> {
        const response = await api.get(`/rememberbettymedia`, { params: query });
        return response.data;
    },

    // Fetch media by ID
    async getById(id: string): Promise<RememberBettyMedia> {
        const response = await api.get(`/rememberbettymedia/${id}`);
        return response.data;
    },

    // Create a new media item
    async create(data: { title: string; mediaUrl: string; category: MediaCategory }): Promise<RememberBettyMedia> {
        const response = await api.post(`/admin/rememberbettymedia`, data);
        return response.data;
    },

    // Update an existing media item
    async update(id: string, data: { title?: string; mediaUrl?: string; category?: MediaCategory }): Promise<RememberBettyMedia> {
        const response = await api.patch(`/admin/rememberbettymedia/${id}`, data);
        return response.data;
    },

    // Delete a media item
    async remove(id: string): Promise<void> {
        await api.delete(`/admin/rememberbettymedia/${id}`);
    },
};
