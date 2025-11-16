import mongoose, { Schema, Document, Model, Types } from "mongoose";
import { MediaCategory } from "../dto/media.dto";

export interface IMedia extends Document {
    _id: Types.ObjectId;
    title: string;
    mediaUrl: string;
    category: MediaCategory;
    createdAt: Date;
    updatedAt: Date;
}

const MediaSchema = new Schema<IMedia>(
    {
        title: { type: String, required: true, trim: true },
        mediaUrl: { type: String, required: true, trim: true },
        category: { type: String, enum: ["image", "video"], required: true },
    },
    { timestamps: true }
);

export const Media: Model<IMedia> = mongoose.models.Media || mongoose.model<IMedia>("Media", MediaSchema);
