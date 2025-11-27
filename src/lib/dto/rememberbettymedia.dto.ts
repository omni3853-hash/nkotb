import Joi from "joi";

export type MediaCategory = "image" | "video";

export class CreateRememberBettyMediaDto {
    title!: string;
    mediaUrl!: string;
    category!: MediaCategory;

    static validationSchema = Joi.object({
        title: Joi.string().trim().required(),
        mediaUrl: Joi.string().uri().required(),
        category: Joi.string().valid("image", "video").required(),
    });

    constructor(data: Partial<CreateRememberBettyMediaDto>) {
        Object.assign(this, data);
    }
}

export class UpdateRememberBettyMediaDto {
    title?: string;
    mediaUrl?: string;
    category?: MediaCategory;

    static validationSchema = CreateRememberBettyMediaDto.validationSchema.fork(
        ["title", "mediaUrl", "category"],
        (s) => s.optional()
    );

    constructor(data: Partial<UpdateRememberBettyMediaDto>) {
        Object.assign(this, data);
    }
}

export class RememberBettyMediaQueryDto {
    search?: string;
    category?: MediaCategory;
    page?: number;
    limit?: number;

    static validationSchema = Joi.object({
        search: Joi.string().allow("", null),
        category: Joi.string().valid("image", "video").allow("", null),
        page: Joi.number().min(1).default(1),
        limit: Joi.number().min(1).max(100).default(10),
    });

    constructor(data: Partial<RememberBettyMediaQueryDto>) {
        Object.assign(this, data);
    }
}
