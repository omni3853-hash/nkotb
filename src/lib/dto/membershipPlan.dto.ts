import Joi from "joi";
import { BillingPeriod } from "@/lib/enums/membership.enums";

export class CreateMembershipPlanDto {
    name!: string;
    price!: number;
    period!: BillingPeriod;
    durationDays?: number;
    description?: string;
    icon?: string;
    color?: string;
    popular?: boolean;
    features?: string[];
    limitations?: string[];
    isActive?: boolean;

    static validationSchema = Joi.object({
        name: Joi.string().trim().required(),
        price: Joi.number().min(0).required(),
        period: Joi.string().valid(...Object.values(BillingPeriod)).required(),
        durationDays: Joi.number().integer().min(1).when("period", {
            is: BillingPeriod.CUSTOM,
            then: Joi.required(),
            otherwise: Joi.forbidden().allow(null),
        }),
        description: Joi.string().allow(""),
        icon: Joi.string(),
        color: Joi.string(),
        popular: Joi.boolean().default(false),
        features: Joi.array().items(Joi.string()).default([]),
        limitations: Joi.array().items(Joi.string()).default([]),
        isActive: Joi.boolean().default(true),
    });

    constructor(data: CreateMembershipPlanDto) {
        Object.assign(this, data);
    }
}

export class UpdateMembershipPlanDto {
    name?: string;
    price?: number;
    period?: BillingPeriod;
    durationDays?: number;
    description?: string;
    icon?: string;
    color?: string;
    popular?: boolean;
    features?: string[];
    limitations?: string[];
    isActive?: boolean;

    static validationSchema = Joi.object({
        name: Joi.string().trim(),
        price: Joi.number().min(0),
        period: Joi.string().valid(...Object.values(BillingPeriod)),
        durationDays: Joi.number().integer().min(1)
            .when("period", { is: BillingPeriod.CUSTOM, then: Joi.required(), otherwise: Joi.optional() }),
        description: Joi.string().allow(""),
        icon: Joi.string(),
        color: Joi.string(),
        popular: Joi.boolean(),
        features: Joi.array().items(Joi.string()),
        limitations: Joi.array().items(Joi.string()),
        isActive: Joi.boolean(),
    });

    constructor(data: UpdateMembershipPlanDto) {
        Object.assign(this, data);
    }
}

export class MembershipPlanQueryDto {
    search?: string;
    onlyActive?: boolean;
    page?: number;
    limit?: number;

    static validationSchema = Joi.object({
        search: Joi.string(),
        onlyActive: Joi.boolean().default(true),
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).max(100).default(10),
    });

    constructor(data: Partial<MembershipPlanQueryDto>) {
        Object.assign(this, { onlyActive: true, page: 1, limit: 10, ...data });
    }
}
