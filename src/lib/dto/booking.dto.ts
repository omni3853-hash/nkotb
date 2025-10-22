import Joi from 'joi';
export class CreateBookingDto {
    eventId!: string; ticketTypeId?: string; quantity!: number;
    static validationSchema = Joi.object({
        eventId: Joi.string().required(),
        ticketTypeId: Joi.string().allow('', null),
        quantity: Joi.number().integer().min(1).required(),
    });
    constructor(d: CreateBookingDto) { Object.assign(this, d); }
}
