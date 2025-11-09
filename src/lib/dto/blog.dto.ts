import Joi from "joi";

export class CreateBlogPostDto {
    title!: string;
    category!: string;
    tags?: string[];
    thumbnail?: string | null;
    coverImage?: string | null;
    excerpt?: string;
    content!: string;
    relatedCelebrities?: string[];
    relatedEvents?: string[];
    status?: "draft" | "published" | "archived";
    isFeatured?: boolean;
    isActive?: boolean;

    static validationSchema = Joi.object({
        title: Joi.string().trim().required(),
        category: Joi.string().trim().required(),
        tags: Joi.array().items(Joi.string().trim()).default([]),
        thumbnail: Joi.string().uri().allow(null, "").optional(),
        coverImage: Joi.string().uri().allow(null, "").optional(),
        excerpt: Joi.string().allow(""),
        content: Joi.string().required(),
        relatedCelebrities: Joi.array().items(Joi.string().trim()).default([]),
        relatedEvents: Joi.array().items(Joi.string().trim()).default([]),
        status: Joi.string().valid("draft", "published", "archived").default("draft"),
        isFeatured: Joi.boolean().default(false),
        isActive: Joi.boolean().default(true),
    });

    constructor(data: Partial<CreateBlogPostDto>) {
        Object.assign(this, data);
    }
}

export class UpdateBlogPostDto {
    title?: string;
    category?: string;
    tags?: string[];
    thumbnail?: string | null;
    coverImage?: string | null;
    excerpt?: string;
    content?: string;
    relatedCelebrities?: string[];
    relatedEvents?: string[];
    status?: "draft" | "published" | "archived";
    isFeatured?: boolean;
    isActive?: boolean;

    static validationSchema = CreateBlogPostDto.validationSchema.fork(
        ["title", "category", "content"],
        (s) => s.optional()
    );

    constructor(data: Partial<UpdateBlogPostDto>) {
        Object.assign(this, data);
    }
}

export class BlogPostQueryDto {
    search?: string;
    category?: string;
    tag?: string;
    celebrityId?: string;
    eventId?: string;
    status?: "draft" | "published" | "archived";
    onlyActive?: boolean;
    onlyPublished?: boolean;
    page?: number;
    limit?: number;

    static validationSchema = Joi.object({
        search: Joi.string().allow("", null),
        category: Joi.string().allow("", null),
        tag: Joi.string().allow("", null),
        celebrityId: Joi.string().allow("", null),
        eventId: Joi.string().allow("", null),
        status: Joi.string().valid("draft", "published", "archived").allow(null),
        onlyActive: Joi.boolean().default(true),
        onlyPublished: Joi.boolean().default(false),
        page: Joi.number().min(1).default(1),
        limit: Joi.number().min(1).max(100).default(10),
    });

    constructor(data: Partial<BlogPostQueryDto>) {
        Object.assign(this, data);
    }
}
