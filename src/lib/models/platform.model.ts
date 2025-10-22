import mongoose, { Schema, Model, Document } from "mongoose";

export interface IPlatform extends Document {
    siteName: string;
    siteTagline: string;
    siteDescription: string;
    supportEmail: string;
    supportPhone: string;
    minDepositAmount: number;
    bookingFeePercentage: number;
    cancellationPolicy: string;
    refundPolicy: string;
    createdAt: Date;
    updatedAt: Date;
}

// No refs; alias for consistency
export type IPlatformPopulated = IPlatform;

const PlatformSchema = new Schema<IPlatform>(
    {
        siteName: { type: String, default: "" },
        siteTagline: { type: String, default: "" },
        siteDescription: { type: String, default: "" },
        supportEmail: { type: String, default: "" },
        supportPhone: { type: String, default: "" },
        minDepositAmount: { type: Number, default: 0 },
        bookingFeePercentage: { type: Number, default: 0 },
        cancellationPolicy: { type: String, default: "" },
        refundPolicy: { type: String, default: "" },
    },
    { timestamps: true }
);

export const Platform: Model<IPlatform> =
    mongoose.models.Platform || mongoose.model<IPlatform>("Platform", PlatformSchema);
