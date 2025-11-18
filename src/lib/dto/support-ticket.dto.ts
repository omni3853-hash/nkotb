import Joi from "joi";
import { SupportPriority, SupportStatus } from "@/lib/enums/support.enums";

export class CreateSupportTicketDto {
    fullName!: string;
    email!: string;
    phone?: string;
    subject!: string;
    message!: string;
    priority?: SupportPriority;

    static validationSchema = Joi.object({
        fullName: Joi.string().min(2).max(120).required(),
        email: Joi.string().email().required(),
        phone: Joi.string().allow("").max(40),
        subject: Joi.string().min(3).max(200).required(),
        message: Joi.string().min(5).max(5000).required(),
        priority: Joi.string()
            .valid(...Object.values(SupportPriority))
            .default(SupportPriority.NORMAL),
    });

    constructor(data: Partial<CreateSupportTicketDto>) {
        Object.assign(this, data);
    }
}

export class SupportTicketQueryDto {
    status?: SupportStatus;
    priority?: SupportPriority;
    email?: string;
    page?: number;
    limit?: number;

    static validationSchema = Joi.object({
        status: Joi.string()
            .valid(...Object.values(SupportStatus))
            .optional(),
        priority: Joi.string()
            .valid(...Object.values(SupportPriority))
            .optional(),
        email: Joi.string().email().optional(),
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).max(100).default(10),
    });

    constructor(data: Partial<SupportTicketQueryDto> = {}) {
        Object.assign(this, data);
    }
}

export class AdminReplySupportTicketDto {
    body!: string;

    static validationSchema = Joi.object({
        body: Joi.string().min(2).max(5000).required(),
    });

    constructor(data: Partial<AdminReplySupportTicketDto>) {
        Object.assign(this, data);
    }
}

export class AdminUpdateSupportStatusDto {
    status!: SupportStatus;

    static validationSchema = Joi.object({
        status: Joi.string()
            .valid(...Object.values(SupportStatus))
            .required(),
    });

    constructor(data: Partial<AdminUpdateSupportStatusDto>) {
        Object.assign(this, data);
    }
}
