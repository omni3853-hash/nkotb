import Joi from 'joi';
export class CreateTicketTypeDto {
    event!: string; name!: string; priceCents!: number; quantityTotal!: number; quantityLeft!: number;
    static validationSchema = Joi.object({
        event: Joi.string().required(),
        name: Joi.string().required(),
        priceCents: Joi.number().integer().min(0).required(),
        quantityTotal: Joi.number().integer().min(0).required(),
        quantityLeft: Joi.number().integer().min(0).required(),
    });
    constructor(d: CreateTicketTypeDto) { Object.assign(this, d); }
}
export class UpdateTicketTypeDto {
    event?: string; name?: string; priceCents?: number; quantityTotal?: number; quantityLeft?: number;
    static validationSchema = Joi.object({
        event: Joi.string().optional(),
        name: Joi.string().optional(),
        priceCents: Joi.number().integer().min(0).optional(),
        quantityTotal: Joi.number().integer().min(0).optional(),
        quantityLeft: Joi.number().integer().min(0).optional(),
    });
    constructor(d: UpdateTicketTypeDto) { Object.assign(this, d); }
}
