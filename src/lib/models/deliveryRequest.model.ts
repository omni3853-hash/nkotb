import mongoose, { Document, Schema, Model, Types } from "mongoose";
import { DeliveryRequestStatus } from "@/lib/enums/delivery.enums";
import type { IUser } from "./user.model";
import { IDeliveryOption } from "./deliveryOption.model";

export interface IDeliveryAddress {
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
}

export interface IDeliveryRequest extends Document {
    _id: Types.ObjectId;
    user: Types.ObjectId;
    status: DeliveryRequestStatus;
    deliveryOption: Types.ObjectId;
    deliveryAddress: IDeliveryAddress;
    specialInstruction?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface IDeliveryRequestPopulated
    extends Omit<IDeliveryRequest, "user" | "deliveryOption"> {
    user: IUser;
    deliveryOption: IDeliveryOption;
}

const AddressSchema = new Schema<IDeliveryAddress>(
    {
        street: { type: String, required: true, trim: true },
        city: { type: String, required: true, trim: true },
        state: { type: String, required: true, trim: true },
        country: { type: String, required: true, trim: true },
        zipCode: { type: String, required: true, trim: true },
    },
    { _id: false }
);

const DeliveryRequestSchema = new Schema<IDeliveryRequest>(
    {
        user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
        status: {
            type: String,
            enum: Object.values(DeliveryRequestStatus),
            default: DeliveryRequestStatus.PENDING,
            index: true,
        },
        deliveryOption: { type: Schema.Types.ObjectId, ref: "DeliveryOption", required: true, index: true },
        deliveryAddress: { type: AddressSchema, required: true },
        specialInstruction: { type: String, default: "" },
    },
    { timestamps: true }
);

DeliveryRequestSchema.index({ createdAt: -1 });

export const DeliveryRequest: Model<IDeliveryRequest> =
    mongoose.models.DeliveryRequest ||
    mongoose.model<IDeliveryRequest>("DeliveryRequest", DeliveryRequestSchema);
