import mongoose, { Schema, Model, Document, Types } from "mongoose";
import { MembershipStatus, BillingPeriod } from "../enums/membership.enums";
import type { IUser } from "./user.model";
import type { IPaymentMethod } from "./payment-method.model";
import { IMembershipPlan } from "./membershipPlan.model";

export interface IMembershipPayment {
    paymentMethod?: Types.ObjectId;  // PaymentMethod _id
    proofOfPayment?: string;         // receipt url/base64 code
    amount?: number;                 // charged amount
}

export interface IMembership extends Document {
    _id: Types.ObjectId;
    user: Types.ObjectId;
    planId: string;                  // MembershipPlan _id (string)
    planSnapshot: {
        name: string;
        price: number;
        period: BillingPeriod;
        durationDays?: number;
        features: string[];
        limitations: string[];
    };
    payment?: IMembershipPayment;
    autoRenew: boolean;
    status: MembershipStatus;
    startedAt: Date;
    expiresAt: Date;
    renewedAt?: Date;
    canceledAt?: Date;
    suspendedAt?: Date;
    suspensionReason?: string;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface IMembershipPopulated
    extends Omit<IMembership, "user" | "payment" | "planId"> {
    user: IUser;
    // If you populate the string ref, you'll get the full plan doc here:
    planId: IMembershipPlan;
    payment?: Omit<IMembershipPayment, "paymentMethod"> & {
        paymentMethod?: IPaymentMethod;
    };
}

const MembershipPaymentSchema = new Schema<IMembershipPayment>(
    {
        paymentMethod: { type: Schema.Types.ObjectId, ref: "PaymentMethod" },
        proofOfPayment: String,
        amount: Number,
    },
    { _id: false }
);

const MembershipSchema = new Schema<IMembership>(
    {
        user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
        planId: { type: String, ref: "MembershipPlan", required: true },
        planSnapshot: {
            name: String,
            price: Number,
            period: { type: String, enum: Object.values(BillingPeriod) },
            durationDays: Number,
            features: [String],
            limitations: [String],
        },
        payment: { type: MembershipPaymentSchema, default: {} },
        autoRenew: { type: Boolean, default: false },
        status: { type: String, enum: Object.values(MembershipStatus), default: MembershipStatus.PENDING, index: true },
        startedAt: { type: Date, required: true },
        expiresAt: { type: Date, required: true, index: true },
        renewedAt: Date,
        canceledAt: Date,
        suspendedAt: Date,
        suspensionReason: String,
        notes: String,
    },
    { timestamps: true }
);

MembershipSchema.index({ user: 1, status: 1 });
MembershipSchema.index({ expiresAt: 1, autoRenew: 1 });

export const Membership: Model<IMembership> =
    mongoose.models.Membership || mongoose.model<IMembership>("Membership", MembershipSchema);
