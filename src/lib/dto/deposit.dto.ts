import Joi from "joi";
import { DepositStatus } from "@/lib/enums/deposit.enums";

export class CreateDepositDto {
    amount!: number;
    paymentMethodId?: string;
    proofOfPayment?: string;
    notes?: string;

    static validationSchema = Joi.object({
        amount: Joi.number().positive().required(),
        paymentMethodId: Joi.string(),
        proofOfPayment: Joi.string(),
        notes: Joi.string().max(1000),
        currencyId: Joi.string(), // harmless if you later add currency
    });

    constructor(data: CreateDepositDto) {
        Object.assign(this, data);
    }
}

export class AdminCreateDepositDto {
    userId!: string;
    amount!: number;
    paymentMethodId?: string;
    proofOfPayment?: string;
    status?: DepositStatus; // default PENDING
    notes?: string;

    static validationSchema = Joi.object({
        userId: Joi.string().required(),
        amount: Joi.number().positive().required(),
        paymentMethodId: Joi.string(),
        proofOfPayment: Joi.string(),
        status: Joi.string().valid(...Object.values(DepositStatus)).default(DepositStatus.PENDING),
        notes: Joi.string().max(1000),
        currencyId: Joi.string(),
    });

    constructor(data: AdminCreateDepositDto) {
        Object.assign(this, data);
    }
}

export class UpdateDepositStatusDto {
    status!: DepositStatus; // COMPLETED or FAILED
    reason?: string;

    static validationSchema = Joi.object({
        status: Joi.string().valid(DepositStatus.COMPLETED, DepositStatus.FAILED).required(),
        reason: Joi.string().max(500),
    });

    constructor(data: UpdateDepositStatusDto) {
        Object.assign(this, data);
    }
}

export class DepositQueryDto {
    status?: DepositStatus;
    page?: number;
    limit?: number;

    static validationSchema = Joi.object({
        status: Joi.string().valid(...Object.values(DepositStatus)),
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).max(100).default(10),
    });

    constructor(data: Partial<DepositQueryDto> = {}) {
        Object.assign(this, { page: 1, limit: 10, ...data });
    }

    static fromURL(
        url: string,
        opts?: { defaultStatus?: DepositStatus }
    ): DepositQueryDto {
        const { searchParams } = new URL(url);
        const rawStatus = searchParams.get("status");
        const rawPage = searchParams.get("page");
        const rawLimit = searchParams.get("limit");

        const normalizedStatus = normalizeDepositStatus(rawStatus, opts?.defaultStatus);

        return new DepositQueryDto({
            status: normalizedStatus,
            page: rawPage ? Number(rawPage) : undefined,
            limit: rawLimit ? Number(rawLimit) : undefined,
        });
    }
}

function normalizeDepositStatus(
    raw: string | null,
    defaultStatus?: DepositStatus
): DepositStatus | undefined {
    if (raw == null || raw.trim() === "" || /^(all|\*)$/i.test(raw.trim())) {
        return defaultStatus ?? undefined;
    }
    if (Object.values(DepositStatus).includes(raw as DepositStatus)) {
        return raw as DepositStatus;
    }
    throw new Error(`Invalid deposit status: ${raw}`);
}
