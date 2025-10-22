import Joi from 'joi';

export class CreateAuditDto {
    user: string;
    action: string;
    resource: string;
    resourceId?: string;
    description: string;

    static validationSchema = Joi.object({
        user: Joi.string().required(),
        action: Joi.string().trim().required(),
        resource: Joi.string().trim().required(),
        resourceId: Joi.string().optional(),
        description: Joi.string().trim().required(),
    });

    constructor(data: CreateAuditDto) {
        this.user = data.user;
        this.action = data.action;
        this.resource = data.resource;
        this.resourceId = data.resourceId;
        this.description = data.description;
    }
}

export class AuditQueryDto {
    userId?: string;
    action?: string;
    resource?: string;
    from?: Date;
    to?: Date;
    page?: number;
    limit?: number;

    static validationSchema = Joi.object({
        userId: Joi.string(),
        action: Joi.string(),
        resource: Joi.string(),
        from: Joi.date(),
        to: Joi.date(),
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).max(100).default(10),
    });

    constructor(data: Partial<AuditQueryDto>) {
        this.userId = data.userId;
        this.action = data.action;
        this.resource = data.resource;
        this.from = data.from ? new Date(data.from) : undefined;
        this.to = data.to ? new Date(data.to) : undefined;
        this.page = data.page ?? 1;
        this.limit = data.limit ?? 10;
    }
}
