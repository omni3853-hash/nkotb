import mongoose, { Schema, Model, Document, Types } from "mongoose";
import { CelebrityAvailability } from "@/lib/enums/celebrity.enums";

export interface IBookingType {
    _id: Types.ObjectId;
    name: string;
    duration: string; // e.g., "30 minutes"
    price: number;    // integer cents or whole amount as number (match your app)
    description: string;
    features: string[];
    availability: number; // slots
    popular: boolean;
}

export interface IReview {
    _id: Types.ObjectId;
    author: string;
    rating: number;
    comment: string;
    verified: boolean;
    date: string;
}

export interface ICelebrity extends Document {
    _id: Types.ObjectId;
    name: string;
    slug: string;
    category: string;
    tags: string[];
    image?: string | null;
    coverImage?: string | null;
    basePrice: number;
    rating: number;
    totalReviews: number;
    bookings: number;
    views: number;
    availability: CelebrityAvailability;
    trending: boolean;
    hot: boolean;
    verified: boolean;
    description: string;
    responseTime: string;
    achievements: string[];
    bookingTypes: Types.DocumentArray<IBookingType>;
    reviews: Types.DocumentArray<IReview>;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface ICelebrityPopulated extends ICelebrity { }

const BookingTypeSchema = new Schema<IBookingType>(
    {
        name: { type: String, required: true, trim: true },
        duration: { type: String, required: true, trim: true },
        price: { type: Number, required: true, min: 0 },
        description: { type: String, default: "" },
        features: { type: [String], default: [] },
        availability: { type: Number, default: 0 },
        popular: { type: Boolean, default: false },
    },
    { _id: true, timestamps: false }
);

const ReviewSchema = new Schema<IReview>(
    {
        author: { type: String, required: true },
        rating: { type: Number, min: 1, max: 5, required: true },
        comment: { type: String, default: "" },
        verified: { type: Boolean, default: false },
        date: { type: String, default: "" },
    },
    { _id: true, timestamps: false }
);

function slugify(input: string) {
    return input
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
}

const CelebritySchema = new Schema<ICelebrity>(
    {
        name: { type: String, required: true, trim: true },
        slug: { type: String, required: true, unique: true, index: true },
        category: { type: String, required: true, trim: true, index: true },
        tags: { type: [String], default: [] },
        image: { type: String, default: null },
        coverImage: { type: String, default: null },
        basePrice: { type: Number, required: true, min: 0 },
        rating: { type: Number, default: 0 },
        totalReviews: { type: Number, default: 0 },
        bookings: { type: Number, default: 0 },
        views: { type: Number, default: 0 },
        availability: {
            type: String,
            enum: Object.values(CelebrityAvailability),
            default: CelebrityAvailability.AVAILABLE,
            index: true,
        },
        trending: { type: Boolean, default: false },
        hot: { type: Boolean, default: false },
        verified: { type: Boolean, default: false },
        description: { type: String, default: "" },
        responseTime: { type: String, default: "" },
        achievements: { type: [String], default: [] },
        bookingTypes: { type: [BookingTypeSchema], default: [] },
        reviews: { type: [ReviewSchema], default: [] },
        isActive: { type: Boolean, default: true, index: true },
    },
    { timestamps: true }
);

CelebritySchema.pre("validate", function (next) {
    const doc = this as ICelebrity;
    if (!doc.slug && doc.name) {
        doc.slug = slugify(doc.name);
    }
    next();
});

CelebritySchema.index({ name: "text", category: "text", tags: "text", description: "text" });

export const Celebrity: Model<ICelebrity> =
    mongoose.models.Celebrity || mongoose.model<ICelebrity>("Celebrity", CelebritySchema);
