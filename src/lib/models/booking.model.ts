import mongoose, { Schema, Model, Document, Types } from "mongoose";
import { BookingStatus } from "@/lib/enums/booking.enums";

export interface IBooking extends Document {
    _id: Types.ObjectId;
    user: Types.ObjectId;
    celebrity: Types.ObjectId;
    celebrityNameSnapshot: string;
    celebritySlugSnapshot: string;

    bookingTypeId: Types.ObjectId;  
    bookingTypeName: string;
    unitPrice: number;
    quantity: number;
    totalAmount: number;

    notes?: string;
    status: BookingStatus;

    createdAt: Date;
    updatedAt: Date;
}

export interface IBookingPopulated extends Omit<IBooking, "user" | "celebrity"> {
    user: any;
    celebrity: any;
}

const BookingSchema = new Schema<IBooking>(
    {
        user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
        celebrity: { type: Schema.Types.ObjectId, ref: "Celebrity", required: true, index: true },
        celebrityNameSnapshot: { type: String, required: true },
        celebritySlugSnapshot: { type: String, required: true },

        bookingTypeId: { type: Schema.Types.ObjectId, required: true },
        bookingTypeName: { type: String, required: true },
        unitPrice: { type: Number, required: true, min: 0 },
        quantity: { type: Number, required: true, min: 1 },
        totalAmount: { type: Number, required: true, min: 0 },

        notes: { type: String, default: "" },
        status: { type: String, enum: Object.values(BookingStatus), default: BookingStatus.PENDING, index: true },
    },
    { timestamps: true }
);

BookingSchema.index({ user: 1, celebrity: 1, createdAt: -1 });

export const Booking: Model<IBooking> =
    mongoose.models.Booking || mongoose.model<IBooking>("Booking", BookingSchema);
