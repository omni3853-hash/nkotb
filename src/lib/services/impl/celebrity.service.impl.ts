import { CelebrityService } from "@/lib/services/celebrity.service";
import { Celebrity, ICelebrity } from "@/lib/models/celebrity.model";
import { CelebrityQueryDto, CreateCelebrityDto, UpdateCelebrityDto } from "@/lib/dto/celebrity.dto";
import { CustomError } from "@/lib/utils/customError.utils";
import { logAudit } from "@/lib/utils/auditLogger";
import mongoose from "mongoose";
import EmailServiceImpl from "@/lib/services/impl/email.service.impl";

function computeCelebrityRatingFromReviews(reviews: { rating: number }[]) {
    if (!reviews || reviews.length === 0) {
        return { rating: 0, totalReviews: 0 };
    }
    const totalReviews = reviews.length;
    const sum = reviews.reduce((acc, r) => acc + (r.rating || 0), 0);
    const rating = Number((sum / totalReviews).toFixed(2));
    return { rating, totalReviews };
}

export default class CelebrityServiceImpl implements CelebrityService {
    private email = new EmailServiceImpl();

    async create(adminId: string, dto: CreateCelebrityDto): Promise<ICelebrity> {
        const session = await mongoose.startSession();
        try {
            return await session.withTransaction(async () => {
                const payload: any = { ...dto };

                if (payload.reviews && payload.reviews.length > 0) {
                    const { rating, totalReviews } = computeCelebrityRatingFromReviews(payload.reviews);
                    payload.rating = rating;
                    payload.totalReviews = totalReviews;
                }

                const created = await Celebrity.create([payload], { session });
                const celebrity = created[0];

                await logAudit({
                    user: adminId,
                    action: "CREATE",
                    resource: "CELEBRITY",
                    resourceId: celebrity._id.toString(),
                    description: `Created celebrity "${celebrity.name}"`,
                });

                await this.email.sendCelebrityPublished?.(
                    celebrity.name,
                    celebrity.slug,
                    celebrity.category
                );

                return celebrity;
            }, { readConcern: { level: "snapshot" }, writeConcern: { w: "majority" } });
        } finally {
            await session.endSession();
        }
    }

    async list(query: CelebrityQueryDto) {
        const { search, category, onlyActive = true, page = 1, limit = 10 } = query;

        const filter: any = {};
        if (onlyActive) filter.isActive = true;
        if (category) filter.category = category;
        if (search) {
            filter.$text = { $search: search };
        }

        const skip = (page - 1) * limit;

        const [items, total] = await Promise.all([
            Celebrity.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
            Celebrity.countDocuments(filter),
        ]);

        return { items, total, page, limit };
    }

    async getById(id: string): Promise<ICelebrity> {
        const doc = await Celebrity.findById(id);
        if (!doc) throw new CustomError(404, "Celebrity not found");
        return doc;
    }

    async getBySlug(slug: string): Promise<ICelebrity> {
        const doc = await Celebrity.findOne({ slug, isActive: true });
        if (!doc) throw new CustomError(404, "Celebrity not found");
        return doc;
    }

    async update(adminId: string, id: string, dto: UpdateCelebrityDto): Promise<ICelebrity> {
        const doc = await Celebrity.findById(id);
        if (!doc) throw new CustomError(404, "Celebrity not found");

        const { reviews, rating, totalReviews, ...rest } = dto as any;

        if (reviews) {
            // admin replaces the reviews array
            doc.reviews = reviews as any;
        }

        // recompute rating and totalReviews from current reviews
        const currentReviews = doc.reviews || [];
        const { rating: computedRating, totalReviews: computedTotal } =
            computeCelebrityRatingFromReviews(currentReviews as any);

        doc.rating = computedRating;
        doc.totalReviews = computedTotal;

        // apply all other updates
        Object.assign(doc, rest);

        await doc.save();

        await logAudit({
            user: adminId,
            action: "UPDATE",
            resource: "CELEBRITY",
            resourceId: id,
            description: `Updated celebrity "${doc.name}"`,
        });

        return doc;
    }

    async delete(adminId: string, id: string): Promise<void> {
        const doc = await Celebrity.findById(id);
        if (!doc) throw new CustomError(404, "Celebrity not found");

        await doc.deleteOne();

        await logAudit({
            user: adminId,
            action: "DELETE",
            resource: "CELEBRITY",
            resourceId: id,
            description: `Deleted celebrity "${doc.name}"`,
        });
    }

    async toggleActive(adminId: string, id: string, isActive: boolean): Promise<ICelebrity> {
        const doc = await Celebrity.findById(id);
        if (!doc) throw new CustomError(404, "Celebrity not found");

        doc.isActive = !!isActive;
        await doc.save();

        await logAudit({
            user: adminId,
            action: "UPDATE",
            resource: "CELEBRITY",
            resourceId: id,
            description: `Set celebrity "${doc.name}" active=${doc.isActive}`,
        });

        return doc;
    }
}
