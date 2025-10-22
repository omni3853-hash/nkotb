import Joi from "joi";

export class CreateDeliveryOptionDto {
    name!: string;
    price!: number;
    deliveryTime!: string;
    description?: string;

    constructor(data: Partial<CreateDeliveryOptionDto>) {
        Object.assign(this, data);
    }

    static validationSchema = Joi.object<CreateDeliveryOptionDto>({
        name: Joi.string().trim().min(2).max(128).required(),
        price: Joi.number().min(0).required(),
        deliveryTime: Joi.string().trim().min(2).max(128).required(),
        description: Joi.string().allow("").default(""),
    });
}

export class UpdateDeliveryOptionDto {
    name?: string;
    price?: number;
    deliveryTime?: string;
    description?: string;
    isActive?: boolean;

    constructor(data: Partial<UpdateDeliveryOptionDto>) {
        Object.assign(this, data);
    }

    static validationSchema = Joi.object<UpdateDeliveryOptionDto>({
        name: Joi.string().trim().min(2).max(128).optional(),
        price: Joi.number().min(0).optional(),
        deliveryTime: Joi.string().trim().min(2).max(128).optional(),
        description: Joi.string().allow("").optional(),
        isActive: Joi.boolean().optional(),
    });
}

export class DeliveryOptionQueryDto {
    search?: string;
    onlyActive?: boolean;
    page?: number;
    limit?: number;

    constructor(data: Partial<DeliveryOptionQueryDto>) {
        Object.assign(this, data);
    }

    static validationSchema = Joi.object<DeliveryOptionQueryDto>({
        search: Joi.string().optional(),
        onlyActive: Joi.boolean().default(true),
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).max(100).default(10),
    });
}
