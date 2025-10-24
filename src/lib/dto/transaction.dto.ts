import Joi from "joi";
import { TransactionPurpose, TransactionType } from "@/lib/enums/transaction.enum";

export class TransactionQueryDto {
    purpose?: TransactionPurpose;
    type?: TransactionType;
    page?: number;
    limit?: number;

    static validationSchema = Joi.object({
        purpose: Joi.string().valid(...Object.values(TransactionPurpose)),
        type: Joi.string().valid(...Object.values(TransactionType)),
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).max(100).default(10),
    });

    constructor(data: Partial<TransactionQueryDto> = {}) {
        Object.assign(this, { page: 1, limit: 10, ...data });
    }

    static fromURL(url: string): TransactionQueryDto {
        const { searchParams } = new URL(url);
        return new TransactionQueryDto({
            purpose: (searchParams.get("purpose") as TransactionPurpose) || undefined,
            type: (searchParams.get("type") as TransactionType) || undefined,
            page: searchParams.get("page") ? Number(searchParams.get("page")) : undefined,
            limit: searchParams.get("limit") ? Number(searchParams.get("limit")) : undefined,
        });
    }
}
