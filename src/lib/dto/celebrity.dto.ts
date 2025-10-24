import Joi from "joi";

export class CreateCelebrityDto {
    name!: string;
    category!: string;
    tags?: string[];
    image?: string | null;
    coverImage?: string | null;
    basePrice!: number;
    description?: string;
    responseTime?: string;
    achievements?: string[];
    bookingTypes?: Array<{
        name: string;
        duration: string;
        price: number;
        description?: string;
        features?: string[];
        availability?: number;
        popular?: boolean;
    }>;
    availability?: string;
    trending?: boolean;
    hot?: boolean;
    verified?: boolean;
    isActive?: boolean;

    static validationSchema = Joi.object({
        name: Joi.string().trim().required(),
        category: Joi.string().trim().required(),
        tags: Joi.array().items(Joi.string().trim()).default([]),
        image: Joi.string().uri().allow(null, "").optional(),
        coverImage: Joi.string().uri().allow(null, "").optional(),
        basePrice: Joi.number().min(0).required(),
        description: Joi.string().allow(""),
        responseTime: Joi.string().allow(""),
        achievements: Joi.array().items(Joi.string().allow("")).default([]),
        bookingTypes: Joi.array().items(
            Joi.object({
                name: Joi.string().trim().required(),
                duration: Joi.string().trim().required(),
                price: Joi.number().min(0).required(),
                description: Joi.string().allow(""),
                features: Joi.array().items(Joi.string().allow("")).default([]),
                availability: Joi.number().min(0).default(0),
                popular: Joi.boolean().default(false),
            })
        ).default([]),
        availability: Joi.string().valid("Available", "Limited", "Booked", "Unavailable").optional(),
        trending: Joi.boolean().default(false),
        hot: Joi.boolean().default(false),
        verified: Joi.boolean().default(false),
        isActive: Joi.boolean().default(true),
    });

    constructor(data: Partial<CreateCelebrityDto>) {
        Object.assign(this, data);
    }
}

export class UpdateCelebrityDto {
    name?: string;
    category?: string;
    tags?: string[];
    image?: string | null;
    coverImage?: string | null;
    basePrice?: number;
    description?: string;
    responseTime?: string;
    achievements?: string[];
    bookingTypes?: Array<{
        _id?: string;
        name?: string;
        duration?: string;
        price?: number;
        description?: string;
        features?: string[];
        availability?: number;
        popular?: boolean;
    }>;
    availability?: string;
    trending?: boolean;
    hot?: boolean;
    verified?: boolean;
    isActive?: boolean;

    static validationSchema = CreateCelebrityDto.validationSchema.fork(
        [
            "name", "category", "basePrice",
        ],
        (s) => (s as Joi.Schema).optional()
    );

    constructor(data: Partial<UpdateCelebrityDto>) {
        Object.assign(this, data);
    }
}

export class CelebrityQueryDto {
    search?: string;
    category?: string;
    onlyActive?: boolean;
    page?: number;
    limit?: number;

    static validationSchema = Joi.object({
        search: Joi.string().allow("", null),
        category: Joi.string().allow("", null),
        onlyActive: Joi.boolean().default(true),
        page: Joi.number().min(1).default(1),
        limit: Joi.number().min(1).max(100).default(10),
    });

    constructor(data: Partial<CelebrityQueryDto>) {
        Object.assign(this, data);
    }
}
