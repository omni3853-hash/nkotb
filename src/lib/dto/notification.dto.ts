import Joi from 'joi';

export class CreateNotificationDto {
    user: string;
    type: string;
    title: string;
    message: string;

    static validationSchema = Joi.object({
        user: Joi.string().required(),
        type: Joi.string().trim().required(),
        title: Joi.string().trim().required(),
        message: Joi.string().trim().required(),
    });

    constructor(data: CreateNotificationDto) {
        this.user = data.user;
        this.type = data.type;
        this.title = data.title;
        this.message = data.message;
    }
}

export class UpdateNotificationDto {
    type?: string;
    title?: string;
    message?: string;
    read?: boolean;

    static validationSchema = Joi.object({
        type: Joi.string(),
        title: Joi.string(),
        message: Joi.string(),
        read: Joi.boolean(),
    });

    constructor(data: UpdateNotificationDto) {
        this.type = data.type;
        this.title = data.title;
        this.message = data.message;
        this.read = data.read;
    }
}

export class NotificationQueryDto {
    // filters + pagination
    type?: string;
    read?: boolean;
    page?: number;
    limit?: number;

    static validationSchema = Joi.object({
        type: Joi.string(),
        read: Joi.boolean(),
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).max(100).default(10),
    });

    constructor(data: Partial<NotificationQueryDto>) {
        this.type = data.type;
        this.read = data.read;
        this.page = data.page ?? 1;
        this.limit = data.limit ?? 10;
    }
}
