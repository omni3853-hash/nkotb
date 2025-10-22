import mongoose, { Document, Schema, Model, Types } from 'mongoose';
import type { IUser } from './user.model';

export interface INotification extends Document {
    _id: Types.ObjectId;
    user: Types.ObjectId;
    type: string;
    title: string;
    message: string;
    read: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface INotificationPopulated extends Omit<INotification, 'user'> {
    user: IUser;
}

const NotificationSchema: Schema<INotification> = new Schema(
    {
        user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        type: { type: String, required: true },
        title: { type: String, required: true },
        message: { type: String, required: true },
        read: { type: Boolean, default: false },
    },
    { timestamps: true }
);

NotificationSchema.index({ user: 1, read: 1 });
NotificationSchema.index({ createdAt: -1 });

export const Notification: Model<INotification> =
    mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);
