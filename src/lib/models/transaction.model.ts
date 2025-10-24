import mongoose, { Schema, Model, Document, Types } from "mongoose";
import { TransactionPurpose, TransactionType } from "../enums/transaction.enum";

export interface ITransaction extends Document {
    _id: Types.ObjectId;
    user: Types.ObjectId;
    type: TransactionType;
    purpose: TransactionPurpose;
    amount: number; // positive number
    previousBalance: number;
    newBalance: number;
    referenceId?: string | null; // e.g., booking id
    description?: string;
    meta?: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}

export interface ITransactionPopulated extends Omit<ITransaction, "user"> {
    user: any;
}

const TransactionSchema = new Schema<ITransaction>(
    {
        user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
        type: { type: String, enum: Object.values(TransactionType), required: true, index: true },
        purpose: { type: String, enum: Object.values(TransactionPurpose), required: true, index: true },
        amount: { type: Number, required: true, min: 0 },
        previousBalance: { type: Number, required: true, min: 0 },
        newBalance: { type: Number, required: true, min: 0 },
        referenceId: { type: String, default: null, index: true },
        description: { type: String, default: "" },
        meta: { type: Schema.Types.Mixed, default: {} },
    },
    { timestamps: true }
);

TransactionSchema.index({ createdAt: -1 });

export const Transaction: Model<ITransaction> =
    mongoose.models.Transaction || mongoose.model<ITransaction>("Transaction", TransactionSchema);
