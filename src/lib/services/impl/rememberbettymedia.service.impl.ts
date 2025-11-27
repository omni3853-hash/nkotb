import { CreateRememberBettyMediaDto, RememberBettyMediaQueryDto, UpdateRememberBettyMediaDto } from "@/lib/dto/rememberbettymedia.dto";
import { IRememberBettyMedia, RememberBettyMedia } from "@/lib/models/rememberbettymedia.model";
import { RememberBettyMediaService } from "../rememberbettymedia.service";


export default class RememberBettyMediaServiceImpl implements RememberBettyMediaService {
    async create(dto: CreateRememberBettyMediaDto): Promise<IRememberBettyMedia> {
        const created = await RememberBettyMedia.create([dto]);
        return created[0];
    }

    async list(query: RememberBettyMediaQueryDto) {
        const { search, category, page = 1, limit = 10 } = query;
        const filter: any = {};
        if (category) filter.category = category;
        if (search) filter.title = { $regex: search, $options: "i" };

        const skip = (page - 1) * limit;
        const [items, total] = await Promise.all([
            RememberBettyMedia.find(filter).skip(skip).limit(limit),
            RememberBettyMedia.countDocuments(filter),
        ]);

        return { items, total, page, limit };
    }

    async getById(id: string): Promise<IRememberBettyMedia> {
        const doc = await RememberBettyMedia.findById(id);
        if (!doc) throw new Error("Media not found");
        return doc;
    }

    async update(id: string, dto: UpdateRememberBettyMediaDto): Promise<IRememberBettyMedia> {
        const doc = await RememberBettyMedia.findById(id);
        if (!doc) throw new Error("Media not found");
        Object.assign(doc, dto);
        await doc.save();
        return doc;
    }

    async delete(id: string): Promise<void> {
        const doc = await RememberBettyMedia.findById(id);
        if (!doc) throw new Error("Media not found");
        await doc.deleteOne();
    }
}
