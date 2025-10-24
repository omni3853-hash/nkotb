import type { ITransaction } from "@/lib/models/transaction.model";
import type { ClientSession } from "mongoose";
import { TransactionPurpose, TransactionType } from "../enums/transaction.enum";
import { TransactionQueryDto } from "../dto/transaction.dto";

export interface TransactionService {
    record(
        userId: string,
        type: TransactionType,
        purpose: TransactionPurpose,
        amount: number,
        description?: string,
        referenceId?: string | null,
        meta?: Record<string, any>,
        session?: ClientSession
    ): Promise<ITransaction>;

    /** Atomic debit with guard; throws on insufficient funds */
    debit(
        userId: string,
        amount: number,
        purpose: TransactionPurpose,
        description?: string,
        referenceId?: string | null,
        meta?: Record<string, any>,
        session?: ClientSession
    ): Promise<ITransaction>;

    /** Atomic credit */
    credit(
        userId: string,
        amount: number,
        purpose: TransactionPurpose,
        description?: string,
        referenceId?: string | null,
        meta?: Record<string, any>,
        session?: ClientSession
    ): Promise<ITransaction>;

    listForUser(userId: string, query: TransactionQueryDto): Promise<{ items: ITransaction[]; total: number; page: number; limit: number }>;
    listAll(query: TransactionQueryDto): Promise<{ items: ITransaction[]; total: number; page: number; limit: number }>;
    getById(id: string): Promise<ITransaction>;
}
