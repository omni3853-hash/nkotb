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

// NEW: Offline / guest ticket purchase
export class CreateOfflineTicketDto {
    event!: string;
    ticketTypeId!: string;
    quantity!: number;

    buyerFullName!: string;
    buyerEmail!: string;
    buyerPhone?: string;
    notes?: string;

    paymentMethodId?: string;
    paidAmount?: number;
    proofOfPayment?: string;

    static validationSchema = Joi.object({
        event: Joi.string().required(),
        ticketTypeId: Joi.string().required(),
        quantity: Joi.number().integer().min(1).required(),
        buyerFullName: Joi.string().min(2).required(),
        buyerEmail: Joi.string().email().required(),
        buyerPhone: Joi.string().allow(""),
        notes: Joi.string().allow(""),
        paymentMethodId: Joi.string().allow(""),
        paidAmount: Joi.number().positive().optional(),
        proofOfPayment: Joi.string().allow(""),
    });

    constructor(data: Partial<CreateOfflineTicketDto>) {
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
