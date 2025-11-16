import Joi from "joi";

export type MediaCategory = "image" | "video";

export class CreateMediaDto {
    title!: string;
    mediaUrl!: string;
    category!: MediaCategory;

    static validationSchema = Joi.object({
        title: Joi.string().trim().required(),
        mediaUrl: Joi.string().uri().required(),
        category: Joi.string().valid("image", "video").required(),
    });

    constructor(data: Partial<CreateMediaDto>) {
        Object.assign(this, data);
    }
}

export class UpdateMediaDto {
    title?: string;
    mediaUrl?: string;
    category?: MediaCategory;

    static validationSchema = CreateMediaDto.validationSchema.fork(
        ["title", "mediaUrl", "category"],
        (s) => s.optional()
    );

    constructor(data: Partial<UpdateMediaDto>) {
        Object.assign(this, data);
    }
}

export class MediaQueryDto {
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

    constructor(data: Partial<MediaQueryDto>) {
        Object.assign(this, data);
    }
}
