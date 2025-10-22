import Joi from "joi";
import { DeliveryRequestStatus } from "@/lib/enums/delivery.enums";

export class CreateDeliveryRequestDto {
    deliveryOption!: string;
    deliveryAddress!: {
        street: string;
        city: string;
        state: string;
        country: string;
        zipCode: string;
    };
    specialInstruction?: string;

    constructor(data: Partial<CreateDeliveryRequestDto>) {
        Object.assign(this, data);
    }

    static validationSchema = Joi.object<CreateDeliveryRequestDto>({
        deliveryOption: Joi.string().required(),
        deliveryAddress: Joi.object({
            street: Joi.string().trim().required(),
            city: Joi.string().trim().required(),
            state: Joi.string().trim().required(),
            country: Joi.string().trim().required(),
            zipCode: Joi.string().trim().required(),
        }).required(),
        specialInstruction: Joi.string().allow("").optional(),
    });
}

export class DeliveryRequestQueryDto {
    status?: DeliveryRequestStatus;
    page?: number;
    limit?: number;

    constructor(data: Partial<DeliveryRequestQueryDto>) {
        Object.assign(this, data);
    }

    static validationSchema = Joi.object<DeliveryRequestQueryDto>({
        status: Joi.string()
            .valid(...Object.values(DeliveryRequestStatus))
            .optional(),
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).max(100).default(10),
    });
}

export class AdminUpdateDeliveryRequestStatusDto {
    status!: DeliveryRequestStatus;
    reason?: string;

    constructor(data: Partial<AdminUpdateDeliveryRequestStatusDto>) {
        Object.assign(this, data);
    }

    static validationSchema = Joi.object<AdminUpdateDeliveryRequestStatusDto>({
        status: Joi.string()
            .valid(...Object.values(DeliveryRequestStatus))
            .required(),
        reason: Joi.string().allow("").optional(),
    });
}
