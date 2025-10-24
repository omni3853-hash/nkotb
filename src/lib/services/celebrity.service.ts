import type { ICelebrity } from "@/lib/models/celebrity.model";
import { CelebrityQueryDto, CreateCelebrityDto, UpdateCelebrityDto } from "@/lib/dto/celebrity.dto";

export interface CelebrityService {
    create(adminId: string, dto: CreateCelebrityDto): Promise<ICelebrity>;
    list(query: CelebrityQueryDto): Promise<{ items: ICelebrity[]; total: number; page: number; limit: number }>;
    getById(id: string): Promise<ICelebrity>;
    getBySlug(slug: string): Promise<ICelebrity>;
    update(adminId: string, id: string, dto: UpdateCelebrityDto): Promise<ICelebrity>;
    delete(adminId: string, id: string): Promise<void>;
    toggleActive(adminId: string, id: string, isActive: boolean): Promise<ICelebrity>;
}
