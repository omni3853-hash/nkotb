import mongoose, { Document, Schema, Model, Types } from "mongoose";

export interface IDeliveryOption extends Document {
    _id: Types.ObjectId;
    name: string;
    price: number;
    deliveryTime: string;
    description: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export type IDeliveryOptionPopulated = IDeliveryOption;

const DeliveryOptionSchema = new Schema<IDeliveryOption>(
    {
        name: { type: String, required: true, trim: true, index: true },
        price: { type: Number, required: true, min: 0 },
        deliveryTime: { type: String, required: true, trim: true },
        description: { type: String, default: "" },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

DeliveryOptionSchema.index({ isActive: 1, price: 1 });

export const DeliveryOption: Model<IDeliveryOption> =
    mongoose.models.DeliveryOption ||
    mongoose.model<IDeliveryOption>("DeliveryOption", DeliveryOptionSchema);
