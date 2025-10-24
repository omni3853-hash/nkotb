import mongoose, { Schema, Model, Document, Types } from "mongoose";
import type { IUser } from "./user.model";
import type { IPaymentMethod } from "./payment-method.model";
import { DepositStatus } from "../enums/deposit.enums";

export interface IDepositPayment {
    paymentMethod?: Types.ObjectId;  // PaymentMethod _id
    proofOfPayment?: string;         // receipt url/base64 code
    amount?: number;                 // user-input amount snapshot
}

export interface IDeposit extends Document {
    _id: Types.ObjectId;
    user: Types.ObjectId;
    amount: number;
    payment?: IDepositPayment;
    status: DepositStatus;           // PENDING | COMPLETED | FAILED
    creditedAt?: Date;               // when user balance was credited
    processedBy?: Types.ObjectId;    // admin who processed
    processedAt?: Date;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface IDepositPopulated extends Omit<IDeposit, "user" | "payment" | "processedBy"> {
    user: IUser;
    payment?: Omit<IDepositPayment, "paymentMethod"> & { paymentMethod?: IPaymentMethod };
    processedBy?: IUser;
}

const DepositPaymentSchema = new Schema<IDepositPayment>(
    {
        paymentMethod: { type: Schema.Types.ObjectId, ref: "PaymentMethod" },
        proofOfPayment: String,
        amount: Number,
    },
    { _id: false }
);

const DepositSchema = new Schema<IDeposit>(
    {
        user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
        amount: { type: Number, required: true, min: 0 },
        payment: { type: DepositPaymentSchema, default: {} },
        status: { type: String, enum: Object.values(DepositStatus), default: DepositStatus.PENDING, index: true },
        creditedAt: Date,
        processedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
        processedAt: Date,
        notes: String,
    },
    { timestamps: true }
);

DepositSchema.index({ user: 1, status: 1, createdAt: -1 });

export const Deposit: Model<IDeposit> =
    mongoose.models.Deposit || mongoose.model<IDeposit>("Deposit", DepositSchema);
