import mongoose, { Schema, Model, Document } from "mongoose";
import { BillingPeriod } from "../enums/membership.enums";

export interface IMembershipPlan extends Document {
  _id: string;
  name: string;
  price: number;
  period: BillingPeriod;
  durationDays?: number;
  description: string;
  icon?: string;
  color?: string;
  popular: boolean;
  features: string[];
  limitations: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type IMembershipPlanPopulated = IMembershipPlan;

const MembershipPlanSchema = new Schema<IMembershipPlan>(
  {
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    period: { type: String, enum: Object.values(BillingPeriod), default: BillingPeriod.MONTH },
    durationDays: { type: Number, min: 1 },
    description: { type: String, default: "" },
    icon: String,
    color: String,
    popular: { type: Boolean, default: false },
    features: { type: [String], default: [] },
    limitations: { type: [String], default: [] },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

MembershipPlanSchema.index({ isActive: 1, popular: 1 });
MembershipPlanSchema.index({ name: "text", description: "text", features: "text" });

export const MembershipPlan: Model<IMembershipPlan> =
  mongoose.models.MembershipPlan || mongoose.model<IMembershipPlan>("MembershipPlan", MembershipPlanSchema);
