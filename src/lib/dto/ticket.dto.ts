import Joi from "joi";
import { TicketStatus } from "@/lib/enums/event.enums";

export class CreateTicketDto {
    event!: string;             // event id
    ticketTypeId!: string;      // subdocument id in event.ticketTypes
    quantity!: number;
    notes?: string;

    static validationSchema = Joi.object({
        event: Joi.string().required(),
        ticketTypeId: Joi.string().required(),
        quantity: Joi.number().min(1).required(),
        notes: Joi.string().allow(""),
    });

    constructor(data: Partial<CreateTicketDto>) {
        Object.assign(this, data);
    }
}

export class TicketQueryDto {
    status?: TicketStatus;
    eventId?: string;
    page?: number;
    limit?: number;

    static validationSchema = Joi.object({
        status: Joi.string().valid(...Object.values(TicketStatus)).optional(),
        eventId: Joi.string().optional(),
        page: Joi.number().min(1).default(1),
        limit: Joi.number().min(1).max(100).default(10),
    });

    constructor(data: Partial<TicketQueryDto>) {
        Object.assign(this, data);
    }
}

export class AdminUpdateTicketStatusDto {
    status!: TicketStatus;
    reason?: string;

    static validationSchema = Joi.object({
        status: Joi.string().valid(...Object.values(TicketStatus)).required(),
        reason: Joi.string().allow(""),
    });

    constructor(data: Partial<AdminUpdateTicketStatusDto>) {
        Object.assign(this, data);
    }
}
