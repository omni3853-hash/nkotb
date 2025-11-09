import type { IBlogPost } from "@/lib/models/blog.model";
import { BlogPostQueryDto, CreateBlogPostDto, UpdateBlogPostDto } from "@/lib/dto/blog.dto";

export interface BlogPostService {
    create(adminId: string, dto: CreateBlogPostDto): Promise<IBlogPost>;
    list(query: BlogPostQueryDto): Promise<{ items: IBlogPost[]; total: number; page: number; limit: number }>;
    getById(id: string): Promise<IBlogPost>;
    getBySlug(slug: string): Promise<IBlogPost>;
    update(adminId: string, id: string, dto: UpdateBlogPostDto): Promise<IBlogPost>;
    delete(adminId: string, id: string): Promise<void>;
    toggleActive(adminId: string, id: string, isActive: boolean): Promise<IBlogPost>;
    incrementViews(slug: string): Promise<void>;
}
