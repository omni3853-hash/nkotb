import { BookingTypeInputSchema, CelebrityQuery, CelebrityQuerySchema, CreateCelebrityFormData, CreateCelebritySchema, UpdateCelebrityFormData, UpdateCelebritySchema } from "@/utils/schemas/schemas";
import z from "zod";
import { api } from "./axios";

export type CelebrityReview = {
  _id: string;
  author: string;
  rating: number;
  comment: string;
  verified: boolean;
  date: string;
};

export type Celebrity = {
  _id: string;
  name: string;
  slug: string;
  category: string;
  tags: string[];
  image?: string | null;
  coverImage?: string | null;
  basePrice: number;
  rating: number;
  totalReviews: number;
  bookings: number;
  views: number;
  availability: string;
  trending: boolean;
  hot: boolean;
  verified: boolean;
  description: string;
  responseTime: string;
  achievements: string[];
  bookingTypes: Array<z.infer<typeof BookingTypeInputSchema>>;
  reviews: CelebrityReview[];
  isActive: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
};

type Paginated<T> = { items: T[]; total: number; page: number; limit: number };

const pickList = <T,>(res: any): Paginated<T> =>
  res?.data?.data ?? res?.data ?? res;

const pickItem = <T,>(res: any): T =>
  res?.data?.item ??
  res?.data?.data ??
  res?.data?.celebrity ??
  res?.data?.booking ??
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

export const CelebritiesApi = {
  async list(q: Partial<CelebrityQuery> = {}): Promise<Paginated<Celebrity>> {
    const params = CelebrityQuerySchema.partial().parse(q);
    const res = await api.get(`/celebrities${qsOf(params)}`);
    return pickList<Celebrity>(res);
  },

  async getById(id: string): Promise<Celebrity> {
    const res = await api.get(`/celebrities/${id}`);
    return pickItem<Celebrity>(res);
  },

  async getBySlug(slug: string): Promise<Celebrity> {
    const res = await api.get(`/celebrities/slug/${slug}`);
    return pickItem<Celebrity>(res);
  },
};

export const AdminCelebritiesApi = {
  async list(q: Partial<CelebrityQuery> = {}): Promise<Paginated<Celebrity>> {
    const params = CelebrityQuerySchema.partial().parse(q);
    const res = await api.get(`/admin/celebrities${qsOf(params)}`);
    return pickList<Celebrity>(res);
  },

  async getById(id: string): Promise<Celebrity> {
    const res = await api.get(`/admin/celebrities/${id}`);
    return pickItem<Celebrity>(res);
  },

  async create(dto: CreateCelebrityFormData): Promise<Celebrity> {
    const payload = CreateCelebritySchema.parse(dto);
    const res = await api.post(`/admin/celebrities`, payload);
    return pickItem<Celebrity>(res);
  },

  async update(id: string, dto: UpdateCelebrityFormData): Promise<Celebrity> {
    const payload = UpdateCelebritySchema.parse(dto);
    const res = await api.patch(`/admin/celebrities/${id}`, payload);
    return pickItem<Celebrity>(res);
  },

  async toggleActive(id: string, isActive: boolean): Promise<Celebrity> {
    const res = await api.patch(`/admin/celebrities/${id}`, { isActive });
    return pickItem<Celebrity>(res);
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/admin/celebrities/${id}`);
  },
};
  