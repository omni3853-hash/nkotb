import { TransactionService } from "@/lib/services/transaction.service";
import { Transaction, ITransaction } from "@/lib/models/transaction.model";
import { User } from "@/lib/models/user.model";
import { TransactionPurpose, TransactionType } from "@/lib/enums/transaction.enum";
import type { ClientSession } from "mongoose";
import { logAudit } from "@/lib/utils/auditLogger";
import { CustomError } from "@/lib/utils/customError.utils";
import { TransactionQueryDto } from "@/lib/dto/transaction.dto";

export default class TransactionServiceImpl implements TransactionService {
    async record(
        userId: string,
        type: TransactionType,
        purpose: TransactionPurpose,
        amount: number,
        description?: string,
        referenceId?: string | null,
        meta?: Record<string, any>,
        session?: ClientSession
    ): Promise<ITransaction> {
        if (amount < 0) throw new CustomError(400, "Amount must be positive");

        const user = await User.findById(userId).session(session || null);
        if (!user) throw new CustomError(404, "User not found");

        const previousBalance = user.balance;
        const newBalance = type === TransactionType.DEBIT
            ? previousBalance - amount
            : previousBalance + amount;

        const trx = new Transaction({
            user: user._id,
            type,
            purpose,
            amount,
            previousBalance,
            newBalance,
            referenceId: referenceId || null,
            description: description || "",
            meta: meta || {},
        });

        await trx.save({ session });

        await logAudit({
            user: userId,
            action: type,
            resource: "TRANSACTION",
            resourceId: trx._id.toString(),
            description: `${type} ₦${amount.toFixed(2)} for ${purpose}${referenceId ? " (" + referenceId + ")" : ""}`,
        });

        return trx;
    }

    async debit(
        userId: string,
        amount: number,
        purpose: TransactionPurpose,
        description?: string,
        referenceId?: string | null,
        meta?: Record<string, any>,
        session?: ClientSession
    ): Promise<ITransaction> {
        const res = await User.updateOne(
            { _id: userId, balance: { $gte: amount } },
            { $inc: { balance: -amount, totalSpent: amount } },
            { session }
        );
        if (res.modifiedCount === 0) throw new CustomError(400, "Insufficient balance");

        // re-read for previous/new balances for the record (reflect post-op)
        const user = await User.findById(userId).session(session || null);
        if (!user) throw new CustomError(404, "User not found");

        const newBalance = user.balance;
        const previousBalance = newBalance + amount;

        const trx = new Transaction({
            user: user._id,
            type: TransactionType.DEBIT,
            purpose,
            amount,
            previousBalance,
            newBalance,
            referenceId: referenceId || null,
            description: description || "",
            meta: meta || {},
        });
        await trx.save({ session });

        await logAudit({
            user: userId,
            action: "DEBIT",
            resource: "WALLET",
            resourceId: userId,
            description: `Debited ₦${amount.toFixed(2)} for ${purpose}${referenceId ? " (" + referenceId + ")" : ""}`,
        });

        return trx;
    }

    async credit(
        userId: string,
        amount: number,
        purpose: TransactionPurpose,
        description?: string,
        referenceId?: string | null,
        meta?: Record<string, any>,
        session?: ClientSession
    ): Promise<ITransaction> {
        await User.updateOne(
            { _id: userId },
            { $inc: { balance: amount } },
            { session }
        );

        // re-read to compute balances
        const user = await User.findById(userId).session(session || null);
        if (!user) throw new CustomError(404, "User not found");

        const newBalance = user.balance;
        const previousBalance = newBalance - amount;

        const trx = new Transaction({
            user: user._id,
            type: TransactionType.CREDIT,
            purpose,
            amount,
            previousBalance,
            newBalance,
            referenceId: referenceId || null,
            description: description || "",
            meta: meta || {},
        });
        await trx.save({ session });

        await logAudit({
            user: userId,
            action: "CREDIT",
            resource: "WALLET",
            resourceId: userId,
            description: `Credited ₦${amount.toFixed(2)} for ${purpose}${referenceId ? " (" + referenceId + ")" : ""}`,
        });

        return trx;
    }

    async listForUser(userId: string, query: TransactionQueryDto) {
        const { purpose, type, page = 1, limit = 10 } = query;
        const filter: any = { user: userId };
        if (purpose) filter.purpose = purpose;
        if (type) filter.type = type;

        const skip = (page - 1) * limit;
        const [items, total] = await Promise.all([
            Transaction.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
            Transaction.countDocuments(filter),
        ]);

        return { items, total, page, limit };
    }

    async listAll(query: TransactionQueryDto) {
        const { purpose, type, page = 1, limit = 10 } = query;
        const filter: any = {};
        if (purpose) filter.purpose = purpose;
        if (type) filter.type = type;

        const skip = (page - 1) * limit;
        const [items, total] = await Promise.all([
            Transaction.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
            Transaction.countDocuments(filter),
        ]);

        return { items, total, page, limit };
    }

    async getById(id: string): Promise<ITransaction> {
        const tx = await Transaction.findById(id);
        if (!tx) throw new CustomError(404, "Transaction not found");
        return tx;
    }
}
