import mongoose from "mongoose";
import { BlogPostService } from "@/lib/services/blog.service";
import { BlogPost, IBlogPost } from "@/lib/models/blog.model";
import { BlogPostQueryDto, CreateBlogPostDto, UpdateBlogPostDto } from "@/lib/dto/blog.dto";
import { CustomError } from "@/lib/utils/customError.utils";
import { logAudit } from "@/lib/utils/auditLogger";

export default class BlogPostServiceImpl implements BlogPostService {
    async create(adminId: string, dto: CreateBlogPostDto): Promise<IBlogPost> {
        const session = await mongoose.startSession();
        try {
            return await session.withTransaction(async () => {
                const created = await BlogPost.create([dto], { session });
                const post = created[0];

                await logAudit({
                    user: adminId,
                    action: "CREATE",
                    resource: "BLOG_POST",
                    resourceId: post._id.toString(),
                    description: `Created blog post "${post.title}"`,
                });

                return post;
            }, { readConcern: { level: "snapshot" }, writeConcern: { w: "majority" } });
        } finally {
            await session.endSession();
        }
    }

    async list(query: BlogPostQueryDto) {
        const {
            search,
            category,
            tag,
            celebrityId,
            eventId,
            status,
            onlyActive = true,
            onlyPublished = false,
            page = 1,
            limit = 10,
        } = query;

        const filter: any = {};
        if (onlyActive) filter.isActive = true;
        if (category) filter.category = category;
        if (status) filter.status = status;
        if (onlyPublished) filter.status = "published";
        if (tag) filter.tags = tag;
        if (celebrityId) filter.relatedCelebrities = celebrityId;
        if (eventId) filter.relatedEvents = eventId;
        if (search) filter.$text = { $search: search };

        const skip = (page - 1) * limit;

        const [items, total] = await Promise.all([
            BlogPost.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
            BlogPost.countDocuments(filter),
        ]);

        return { items, total, page, limit };
    }

    async getById(id: string): Promise<IBlogPost> {
        const doc = await BlogPost.findById(id);
        if (!doc) throw new CustomError(404, "Post not found");
        return doc;
    }

    async getBySlug(slug: string): Promise<IBlogPost> {
        const doc = await BlogPost.findOne({ slug, isActive: true });
        if (!doc) throw new CustomError(404, "Post not found");
        return doc;
    }

    async update(adminId: string, id: string, dto: UpdateBlogPostDto): Promise<IBlogPost> {
        const doc = await BlogPost.findById(id);
        if (!doc) throw new CustomError(404, "Post not found");

        Object.assign(doc, dto);
        await doc.save();

        await logAudit({
            user: adminId,
            action: "UPDATE",
            resource: "BLOG_POST",
            resourceId: id,
            description: `Updated blog post "${doc.title}"`,
        });

        return doc;
    }

    async delete(adminId: string, id: string): Promise<void> {
        const doc = await BlogPost.findById(id);
        if (!doc) throw new CustomError(404, "Post not found");

        await doc.deleteOne();

        await logAudit({
            user: adminId,
            action: "DELETE",
            resource: "BLOG_POST",
            resourceId: id,
            description: `Deleted blog post "${doc.title}"`,
        });
    }

    async toggleActive(adminId: string, id: string, isActive: boolean): Promise<IBlogPost> {
        const doc = await BlogPost.findById(id);
        if (!doc) throw new CustomError(404, "Post not found");

        doc.isActive = !!isActive;
        await doc.save();

        await logAudit({
            user: adminId,
            action: "UPDATE",
            resource: "BLOG_POST",
            resourceId: id,
            description: `Set blog post "${doc.title}" active=${doc.isActive}`,
        });

        return doc;
    }

    async incrementViews(slug: string): Promise<void> {
        await BlogPost.updateOne({ slug }, { $inc: { views: 1 } }).exec();
    }
}
