import mongoose, { Schema, Model, Document, Types } from "mongoose";
import { VolunteerStatus } from "../enums/remember-betty.enums";

export interface IVolunteer extends Document {
    _id: Types.ObjectId;
    user?: Types.ObjectId | null;
    fullName: string;
    email: string;
    phone?: string;
    interests: string[];
    availability?: string;
    status: VolunteerStatus;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

const VolunteerSchema = new Schema<IVolunteer>(
    {
        user: { type: Schema.Types.ObjectId, ref: "User", default: null },
        fullName: { type: String, required: true },
        email: { type: String, required: true },
        phone: { type: String },
        interests: [{ type: String }],
        availability: { type: String },
        status: {
            type: String,
            enum: Object.values(VolunteerStatus),
            default: VolunteerStatus.PENDING,
        },
        notes: { type: String },
    },
    { timestamps: true }
);

VolunteerSchema.index({ email: 1 });
VolunteerSchema.index({ status: 1, createdAt: -1 });

export const Volunteer: Model<IVolunteer> =
    mongoose.models.Volunteer || mongoose.model<IVolunteer>("Volunteer", VolunteerSchema);