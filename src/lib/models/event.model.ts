import mongoose, { Schema, Model, Document, Types } from "mongoose";
import { EventAvailability } from "@/lib/enums/event.enums";

export interface ITicketType {
    _id: Types.ObjectId;
    name: string;
    price: number;            // whole amount as number (match your app)
    description: string;
    features: string[];
    total: number;            // total inventory
    sold: number;             // sold so far
    popular: boolean;
}

export interface IEventReview {
    _id: Types.ObjectId;
    author: string;
    rating: number;
    comment: string;
    verified: boolean;
    date: string;
}

export interface IEvent extends Document {
    _id: Types.ObjectId;
    title: string;
    slug: string;
    category: string;
    tags: string[];
    image?: string | null;
    coverImage?: string | null;
    basePrice: number;         // base/lowest price
    rating: number;
    totalReviews: number;
    ticketsSold: number;       // aggregate of all ticketTypes.sold
    views: number;
    availability: EventAvailability;
    featured: boolean;
    trending: boolean;
    verified: boolean;
    description: string;
    location: string;
    date: string;              // ISO or friendly string
    time: string;              // HH:mm or friendly string
    attendees: number;         // expected attendees
    ticketTypes: Types.DocumentArray<ITicketType>;
    reviews: Types.DocumentArray<IEventReview>;
    isActive: boolean;

    createdAt: Date;
    updatedAt: Date;
}

export interface IEventPopulated extends IEvent { }

const TicketTypeSchema = new Schema<ITicketType>(
    {
        name: { type: String, required: true, trim: true },
        price: { type: Number, required: true, min: 0 },
        description: { type: String, default: "" },
        features: { type: [String], default: [] },
        total: { type: Number, required: true, min: 0 },
        sold: { type: Number, default: 0, min: 0 },
        popular: { type: Boolean, default: false },
    },
    { _id: true, timestamps: false }
);

const EventReviewSchema = new Schema<IEventReview>(
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

const EventSchema = new Schema<IEvent>(
    {
        title: { type: String, required: true, trim: true },
        slug: { type: String, required: true, unique: true, index: true },
        category: { type: String, required: true, trim: true, index: true },
        tags: { type: [String], default: [] },
        image: { type: String, default: null },
        coverImage: { type: String, default: null },
        basePrice: { type: Number, required: true, min: 0 },
        rating: { type: Number, default: 0 },
        totalReviews: { type: Number, default: 0 },
        ticketsSold: { type: Number, default: 0 },
        views: { type: Number, default: 0 },
        availability: {
            type: String,
            enum: Object.values(EventAvailability),
            default: EventAvailability.AVAILABLE,
            index: true,
        },
        featured: { type: Boolean, default: false },
        trending: { type: Boolean, default: false },
        verified: { type: Boolean, default: false },
        description: { type: String, default: "" },
        location: { type: String, default: "" },
        date: { type: String, default: "" },
        time: { type: String, default: "" },
        attendees: { type: Number, default: 0 },
        ticketTypes: { type: [TicketTypeSchema], default: [] },
        reviews: { type: [EventReviewSchema], default: [] },
        isActive: { type: Boolean, default: true, index: true },
    },
    { timestamps: true }
);

EventSchema.pre("validate", function (next) {
    const doc = this as IEvent;
    if (!doc.slug && doc.title) {
        doc.slug = slugify(doc.title);
    }
    next();
});

EventSchema.index({
    title: "text",
    category: "text",
    tags: "text",
    description: "text",
    location: "text",
});

export const Event: Model<IEvent> =
    mongoose.models.Event || mongoose.model<IEvent>("Event", EventSchema);
