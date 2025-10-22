// src/lib/dto/paymentMethod.dto.ts
import Joi from "joi";
import { AccountType } from "@/lib/enums/account.enum";
import { DEFAULT_PAYMENT_METHOD_TYPE, isAccountType } from "../config/payment.config";

export const accountTypeValues = Object.values(AccountType) as string[];

export class CreatePaymentMethodDto {
    type!: AccountType;

    cryptocurrency?: string;
    network?: string;
    walletAddress?: string;
    qrCode?: string;

    bankName?: string;
    accountName?: string;
    accountNumber?: string;
    routingNumber?: string;
    swiftCode?: string;

    provider?: string;
    handle?: string;
    email?: string;

    status?: boolean;
    processingTime?: string;
    fee?: number;
    isDefault?: boolean;

    static validationSchema = Joi.object({
        type: Joi.string().valid(...accountTypeValues).required(),

        cryptocurrency: Joi.string(),
        network: Joi.string(),
        walletAddress: Joi.string(),
        qrCode: Joi.string(),

        bankName: Joi.string(),
        accountName: Joi.string(),
        accountNumber: Joi.string(),
        routingNumber: Joi.string(),
        swiftCode: Joi.string(),

        provider: Joi.string(),
        handle: Joi.string(),
        email: Joi.string().email(),

        status: Joi.boolean().default(true),
        processingTime: Joi.string().default("1-3 business days"),
        fee: Joi.number().min(0).default(0),
        isDefault: Joi.boolean().default(false),
    });

    constructor(data: Partial<CreatePaymentMethodDto> = {}) {
        Object.assign(this, data);
    }
}

export class UpdatePaymentMethodDto {
    type?: AccountType;

    cryptocurrency?: string;
    network?: string;
    walletAddress?: string;
    qrCode?: string;

    bankName?: string;
    accountName?: string;
    accountNumber?: string;
    routingNumber?: string;
    swiftCode?: string;

    provider?: string;
    handle?: string;
    email?: string;

    status?: boolean;
    processingTime?: string;
    fee?: number;
    isDefault?: boolean;

    static validationSchema = Joi.object({
        type: Joi.string().valid(...accountTypeValues),

        cryptocurrency: Joi.string(),
        network: Joi.string(),
        walletAddress: Joi.string(),
        qrCode: Joi.string(),

        bankName: Joi.string(),
        accountName: Joi.string(),
        accountNumber: Joi.string(),
        routingNumber: Joi.string(),
        swiftCode: Joi.string(),

        provider: Joi.string(),
        handle: Joi.string(),
        email: Joi.string().email(),

        status: Joi.boolean(),
        processingTime: Joi.string(),
        fee: Joi.number().min(0),
        isDefault: Joi.boolean(),
    });

    constructor(data: Partial<UpdatePaymentMethodDto> = {}) {
        Object.assign(this, data);
    }
}

export class PaymentMethodQueryDto {
    type?: AccountType; // optional by design
    status?: boolean;
    page?: number;
    limit?: number;

    static validationSchema = Joi.object({
        type: Joi.string().valid(...accountTypeValues), // remains strict; we preprocess 'all' -> undefined
        status: Joi.boolean(),
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).max(100).default(10),
    });

    constructor(data: Partial<PaymentMethodQueryDto> = {}) {
        this.type = data.type;
        this.status = data.status;
        this.page = data.page ?? 1;
        this.limit = data.limit ?? 10;
    }

    /**
     * Build from URL search params with normalization:
     * - no 'type'  -> optional default (from opts or global DEFAULT_PAYMENT_METHOD_TYPE) or show all
     * - 'all'/'*'  -> show all (type = undefined)
     * - invalid     -> throw (so client gets 400)
     */
    static fromURL(
        url: string,
        opts?: { defaultType?: AccountType }
    ): PaymentMethodQueryDto {
        const { searchParams } = new URL(url);

        const rawType = searchParams.get("type");
        const rawStatus = searchParams.get("status");
        const rawPage = searchParams.get("page");
        const rawLimit = searchParams.get("limit");

        const normalizedType = normalizeType(rawType, opts?.defaultType);

        return new PaymentMethodQueryDto({
            type: normalizedType,
            status: rawStatus != null ? rawStatus === "true" : undefined,
            page: rawPage ? Number(rawPage) : undefined,
            limit: rawLimit ? Number(rawLimit) : undefined,
        });
    }
}

function normalizeType(
    raw: string | null,
    defaultType?: AccountType
): AccountType | undefined {
    // explicit "show all" flags
    if (raw == null || raw.trim() === "" || /^(all|\*)$/i.test(raw.trim())) {
        // use default if provided, otherwise undefined = show all
        return defaultType ?? DEFAULT_PAYMENT_METHOD_TYPE ?? undefined;
    }
    // validate against enum
    if (isAccountType(raw)) return raw as AccountType;

    // anything else is invalid
    throw new Error(`Invalid payment method type: ${raw}`);
}
