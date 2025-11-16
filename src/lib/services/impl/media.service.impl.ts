import { CreateMediaDto, MediaQueryDto, UpdateMediaDto } from "@/lib/dto/media.dto";
import { MediaService } from "../media.service";
import { IMedia, Media } from "@/lib/models/media.model";

export default class MediaServiceImpl implements MediaService {
    async create(dto: CreateMediaDto): Promise<IMedia> {
        const created = await Media.create([dto]);
        return created[0];
    }

    async list(query: MediaQueryDto) {
        const { search, category, page = 1, limit = 10 } = query;
        const filter: any = {};
        if (category) filter.category = category;
        if (search) filter.title = { $regex: search, $options: "i" };

        const skip = (page - 1) * limit;
        const [items, total] = await Promise.all([
            Media.find(filter).skip(skip).limit(limit),
            Media.countDocuments(filter),
        ]);

        return { items, total, page, limit };
    }

    async getById(id: string): Promise<IMedia> {
        const doc = await Media.findById(id);
        if (!doc) throw new Error("Media not found");
        return doc;
    }

    async update(id: string, dto: UpdateMediaDto): Promise<IMedia> {
        const doc = await Media.findById(id);
        if (!doc) throw new Error("Media not found");
        Object.assign(doc, dto);
        await doc.save();
        return doc;
    }

    async delete(id: string): Promise<void> {
        const doc = await Media.findById(id);
        if (!doc) throw new Error("Media not found");
        await doc.deleteOne();
    }
}
