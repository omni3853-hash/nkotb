import mongoose, { Schema, Model, Document, Types } from "mongoose";
import { DonationFrequency, DonationStatus } from "../enums/remember-betty.enums";

export interface IDonationPayment {
    paymentMethod?: Types.ObjectId;
    amount: number;
    proofOfPayment?: string;
    reference?: string;
}

export interface IDonation extends Document {
    _id: Types.ObjectId;
    user?: Types.ObjectId | null;
    donorName: string;
    donorEmail: string;
    donorPhone?: string;
    amount: number;
    frequency: DonationFrequency;
    dedicatedTo?: string;
    isAnonymous: boolean;
    payment: IDonationPayment;
    status: DonationStatus;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

const DonationPaymentSchema = new Schema<IDonationPayment>(
    {
        paymentMethod: { type: Schema.Types.ObjectId, ref: "PaymentMethod" },
        amount: { type: Number, required: true, min: 0 },
        proofOfPayment: { type: String },
        reference: { type: String },
    },
    { _id: false }
);

const DonationSchema = new Schema<IDonation>(
    {
        user: { type: Schema.Types.ObjectId, ref: "User", default: null },
        donorName: { type: String, required: true },
        donorEmail: { type: String, required: true },
        donorPhone: { type: String },
        amount: { type: Number, required: true, min: 1 },
        frequency: {
            type: String,
            enum: Object.values(DonationFrequency),
            default: DonationFrequency.ONE_TIME,
        },
        dedicatedTo: { type: String },
        isAnonymous: { type: Boolean, default: false },
        payment: { type: DonationPaymentSchema, required: true },
        status: {
            type: String,
            enum: Object.values(DonationStatus),
            default: DonationStatus.PENDING,
        },
        notes: { type: String },
    },
    { timestamps: true }
);

DonationSchema.index({ donorEmail: 1, createdAt: -1 });
DonationSchema.index({ status: 1, createdAt: -1 });

export const Donation: Model<IDonation> =
    mongoose.models.Donation || mongoose.model<IDonation>("Donation", DonationSchema);