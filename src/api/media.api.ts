import { MediaCategory } from "@/lib/dto/media.dto";
import { api } from "./axios";

export interface Media {
    _id: string;
    title: string;
    mediaUrl: string;
    category: MediaCategory;
    createdAt: string;
    updatedAt: string;
}

export const MediaApi = {
    // Fetch a list of media items
    async list(query = {}): Promise<{ items: Media[]; total: number; page: number; limit: number }> {
        const response = await api.get(`/media`, { params: query });
        return response.data;
    },

    // Fetch media by ID
    async getById(id: string): Promise<Media> {
        const response = await api.get(`/media/${id}`);
        return response.data;
    },

    // Create a new media item
    async create(data: { title: string; mediaUrl: string; category: MediaCategory }): Promise<Media> {
        const response = await api.post(`/media`, data);
        return response.data;
    },

    // Update an existing media item
    async update(id: string, data: { title?: string; mediaUrl?: string; category?: MediaCategory }): Promise<Media> {
        const response = await api.patch(`/media/${id}`, data);
        return response.data;
    },

    // Delete a media item
    async remove(id: string): Promise<void> {
        await api.delete(`/media/${id}`);
    },
};
