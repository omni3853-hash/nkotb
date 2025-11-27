import mongoose, { Schema, Document, Model, Types } from "mongoose";
import { MediaCategory } from "../dto/media.dto";

export interface IRememberBettyMedia extends Document {
    _id: Types.ObjectId;
    title: string;
    mediaUrl: string;
    category: MediaCategory;
    createdAt: Date;
    updatedAt: Date;
}

const RememberBettyMediaSchema = new Schema<IRememberBettyMedia>(
    {
        title: { type: String, required: true, trim: true },
        mediaUrl: { type: String, required: true, trim: true },
        category: { type: String, enum: ["image", "video"], required: true },
    },
    { timestamps: true }
);

export const RememberBettyMedia: Model<IRememberBettyMedia> = mongoose.models.RememberBettyMedia || mongoose.model<IRememberBettyMedia>("RememberBettyMedia", RememberBettyMediaSchema);
