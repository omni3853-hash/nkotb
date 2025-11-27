import { CreateRememberBettyMediaDto, RememberBettyMediaQueryDto, UpdateRememberBettyMediaDto } from "../dto/rememberbettymedia.dto";
import { IRememberBettyMedia } from "../models/rememberbettymedia.model";

export interface RememberBettyMediaService {
    create(dto: CreateRememberBettyMediaDto): Promise<IRememberBettyMedia>;
    list(query: RememberBettyMediaQueryDto): Promise<{ items: IRememberBettyMedia[]; total: number; page: number; limit: number }>;
    getById(id: string): Promise<IRememberBettyMedia>;
    update(id: string, dto: UpdateRememberBettyMediaDto): Promise<IRememberBettyMedia>;
    delete(id: string): Promise<void>;
}

