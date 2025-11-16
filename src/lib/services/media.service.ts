import { Media, IMedia } from "@/lib/models/media.model";
import { MediaQueryDto, CreateMediaDto, UpdateMediaDto } from "@/lib/dto/media.dto";

export interface MediaService {
    create(dto: CreateMediaDto): Promise<IMedia>;
    list(query: MediaQueryDto): Promise<{ items: IMedia[]; total: number; page: number; limit: number }>;
    getById(id: string): Promise<IMedia>;
    update(id: string, dto: UpdateMediaDto): Promise<IMedia>;
    delete(id: string): Promise<void>;
}

