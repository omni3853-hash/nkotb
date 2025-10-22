import mongoose, { Schema, Document, Types } from "mongoose";
import { OtpType } from "@/lib/enums/otp.enum";

export interface IOTP extends Document {
    _id: Types.ObjectId;
    user: Types.ObjectId;
    otp: string;
    type: OtpType;
    expiresAt: Date;
    used: boolean;
    bypass: boolean;
}

const OTPSchema = new Schema<IOTP>(
    {
        user: { type: Schema.Types.ObjectId, ref: "User", required: true },
        otp: { type: String, required: true },
        type: { type: String, required: true, enum: ["verify-email", "login", "reset"] },
        expiresAt: { type: Date, required: true },
        used: { type: Boolean, default: false },
        bypass: { type: Boolean, default: false },
    },
    { timestamps: true }
);

OTPSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

OTPSchema.index({ user: 1, type: 1, otp: 1, used: 1, expiresAt: 1 });

export const OTP =
    mongoose.models.OTP || mongoose.model<IOTP>("OTP", OTPSchema);
