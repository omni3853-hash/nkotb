import Joi from "joi";

export class CreateEventDto {
    title!: string;
    category!: string;
    tags?: string[];
    image?: string | null;
    coverImage?: string | null;
    basePrice!: number;
    description?: string;
    location?: string;
    date?: string;
    time?: string;
    attendees?: number;
    ticketTypes?: Array<{
        name: string;
        price: number;
        description?: string;
        features?: string[];
        total: number;
        popular?: boolean;
    }>;
    reviews?: Array<{
        author: string;
        rating: number;
        comment?: string;
        verified?: boolean;
        date?: string;
    }>;
    availability?: string;
    featured?: boolean;
    trending?: boolean;
    verified?: boolean;
    isActive?: boolean;

    static validationSchema = Joi.object({
        title: Joi.string().trim().required(),
        category: Joi.string().trim().required(),
        tags: Joi.array().items(Joi.string().trim()).default([]),
        image: Joi.string().uri().allow(null, "").optional(),
        coverImage: Joi.string().uri().allow(null, "").optional(),
        basePrice: Joi.number().min(0).required(),
        description: Joi.string().allow(""),
        location: Joi.string().allow(""),
        date: Joi.string().allow(""),
        time: Joi.string().allow(""),
        attendees: Joi.number().min(0).default(0),
        ticketTypes: Joi.array().items(
            Joi.object({
                name: Joi.string().trim().required(),
                price: Joi.number().min(0).required(),
                description: Joi.string().allow(""),
                features: Joi.array().items(Joi.string().allow("")).default([]),
                total: Joi.number().min(0).required(),
                popular: Joi.boolean().default(false),
            })
        ).default([]),
        reviews: Joi.array().items(
            Joi.object({
                author: Joi.string().trim().required(),
                rating: Joi.number().min(1).max(5).required(),
                comment: Joi.string().allow(""),
                verified: Joi.boolean().default(false),
                date: Joi.string().allow(""),
            })
        ).default([]),
        availability: Joi.string().valid(
            "Available", "Selling Fast", "Almost Full", "Hot", "Sold Out"
        ).optional(),
        featured: Joi.boolean().default(false),
        trending: Joi.boolean().default(false),
        verified: Joi.boolean().default(false),
        isActive: Joi.boolean().default(true),
    });

    constructor(data: Partial<CreateEventDto>) {
        Object.assign(this, data);
    }
}

export class UpdateEventDto {
    title?: string;
    category?: string;
    tags?: string[];
    image?: string | null;
    coverImage?: string | null;
    basePrice?: number;
    description?: string;
    location?: string;
    date?: string;
    time?: string;
    attendees?: number;
    ticketTypes?: Array<{
        _id?: string;
        name?: string;
        price?: number;
        description?: string;
        features?: string[];
        total?: number;
        sold?: number;
        popular?: boolean;
    }>;
    reviews?: Array<{
        _id?: string;
        author?: string;
        rating?: number;
        comment?: string;
        verified?: boolean;
        date?: string;
    }>;
    availability?: string;
    featured?: boolean;
    trending?: boolean;
    verified?: boolean;
    isActive?: boolean;

    static validationSchema = CreateEventDto.validationSchema.fork(
        ["title", "category", "basePrice"],
        (s) => (s as Joi.Schema).optional()
    );

    constructor(data: Partial<UpdateEventDto>) {
        Object.assign(this, data);
    }
}

export class EventQueryDto {
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

    constructor(data: Partial<EventQueryDto>) {
        Object.assign(this, data);
    }
}
