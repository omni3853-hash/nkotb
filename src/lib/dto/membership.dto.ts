import Joi from "joi";
import { MembershipStatus } from "@/lib/enums/membership.enums";
import { DEFAULT_MEMBERSHIP_STATUS, isMembershipStatus } from "@/lib/config/membership.config";

export class CreateMembershipDto {
    planId!: string;
    paymentMethodId?: string;
    proofOfPayment?: string;
    autoRenew?: boolean;
    amount?: number;

    static validationSchema = Joi.object({
        planId: Joi.string().required(),
        paymentMethodId: Joi.string(),
        proofOfPayment: Joi.string(),
        currencyId: Joi.string(),
        autoRenew: Joi.boolean().default(false),
        amount: Joi.number().min(0),
    });

    constructor(data: CreateMembershipDto) {
        Object.assign(this, data);
    }
}

export class UpgradeMembershipDto {
    currentMembershipId!: string;
    newPlanId!: string;
    paymentMethodId?: string;
    proofOfPayment?: string;
    amount?: number;

    static validationSchema = Joi.object({
        currentMembershipId: Joi.string().required(),
        newPlanId: Joi.string().required(),
        paymentMethodId: Joi.string(),
        proofOfPayment: Joi.string(),
        currencyId: Joi.string(),
        amount: Joi.number().min(0),
    });

    constructor(data: UpgradeMembershipDto) {
        Object.assign(this, data);
    }
}

export class UpdateMembershipStatusDto {
    status!: MembershipStatus;
    reason?: string;

    static validationSchema = Joi.object({
        status: Joi.string().valid(...Object.values(MembershipStatus)).required(),
        reason: Joi.string().max(500),
    });

    constructor(data: UpdateMembershipStatusDto) {
        Object.assign(this, data);
    }
}

export class MembershipQueryDto {
    status?: MembershipStatus;
    page?: number;
    limit?: number;

    static validationSchema = Joi.object({
        status: Joi.string().valid(...Object.values(MembershipStatus)),
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).max(100).default(10),
    });

    constructor(data: Partial<MembershipQueryDto> = {}) {
        Object.assign(this, { page: 1, limit: 10, ...data });
    }

    /**
     * Build from URL search params with normalization:
     * - no 'status'  -> optional default (from opts or global DEFAULT_MEMBERSHIP_STATUS) or show all
     * - 'all'/'*'    -> show all (status = undefined)
     * - invalid      -> throw (so client gets 400)
     */
    static fromURL(
        url: string,
        opts?: { defaultStatus?: MembershipStatus }
    ): MembershipQueryDto {
        const { searchParams } = new URL(url);

        const rawStatus = searchParams.get("status");
        const rawPage = searchParams.get("page");
        const rawLimit = searchParams.get("limit");

        const normalizedStatus = normalizeStatus(rawStatus, opts?.defaultStatus);

        return new MembershipQueryDto({
            status: normalizedStatus,
            page: rawPage ? Number(rawPage) : undefined,
            limit: rawLimit ? Number(rawLimit) : undefined,
        });
    }
}

function normalizeStatus(
    raw: string | null,
    defaultStatus?: MembershipStatus
): MembershipStatus | undefined {
    // explicit "show all" flags
    if (raw == null || raw.trim() === "" || /^(all|\*)$/i.test(raw.trim())) {
        // use default if provided, otherwise undefined = show all
        return defaultStatus ?? DEFAULT_MEMBERSHIP_STATUS ?? undefined;
    }
    // validate against enum
    if (isMembershipStatus(raw)) return raw as MembershipStatus;
    throw new Error(`Invalid membership status: ${raw}`);
}
