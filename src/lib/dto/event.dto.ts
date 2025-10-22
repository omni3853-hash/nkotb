import Joi from 'joi';
export class CreateEventDto {
    title!: string; description?: string; location!: string; startsAt!: Date; imageUrl?: string;
    category!: string; status?: string; ticketsTotal!: number; ticketsLeft!: number; priceCents!: number;
    featured?: boolean; trending?: boolean;
    static validationSchema = Joi.object({
        title: Joi.string().required(),
        description: Joi.string().allow('', null),
        location: Joi.string().required(),
        startsAt: Joi.date().required(),
        imageUrl: Joi.string().uri().allow('', null),
        category: Joi.string().required(),
        status: Joi.string().valid('AVAILABLE', 'HOT', 'SOLD_OUT').optional(),
        ticketsTotal: Joi.number().integer().min(0).required(),
        ticketsLeft: Joi.number().integer().min(0).required(),
        priceCents: Joi.number().integer().min(0).required(),
        featured: Joi.boolean().default(false),
        trending: Joi.boolean().default(false),
    });
    constructor(d: CreateEventDto) { Object.assign(this, d); }
}
export class UpdateEventDto {
    title?: string; description?: string; location?: string; startsAt?: Date; imageUrl?: string; category?: string;
    status?: string; ticketsTotal?: number; ticketsLeft?: number; priceCents?: number; featured?: boolean; trending?: boolean;
    static validationSchema = CreateEventDto.validationSchema.fork(Object.keys(({} as any)), (s: any) => s.optional());
    constructor(d: UpdateEventDto) { Object.assign(this, d); }
}
