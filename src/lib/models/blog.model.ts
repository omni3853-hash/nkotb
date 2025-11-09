import mongoose, { Schema, Document, Model, Types } from "mongoose";

export type BlogStatus = "draft" | "published" | "archived";

export interface IBlogPost extends Document {
    _id: Types.ObjectId;
    title: string;
    slug: string;
    category: string;
    tags: string[];
    thumbnail?: string | null;
    coverImage?: string | null;
    excerpt: string;
    content: string;

    relatedCelebrities: Types.ObjectId[];
    relatedEvents: Types.ObjectId[];

    status: BlogStatus;
    isFeatured: boolean;
    views: number;
    isActive: boolean;

    publishedAt?: Date | null;
    createdAt: Date;
    updatedAt: Date;
}

const slugify = (input: string) =>
    input
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");

const BlogPostSchema = new Schema<IBlogPost>(
    {
        title: { type: String, required: true, trim: true },
        slug: { type: String, required: true, unique: true, index: true },
        category: { type: String, required: true, trim: true, index: true },
        tags: { type: [String], default: [] },

        thumbnail: { type: String, default: null },
        coverImage: { type: String, default: null },

        excerpt: { type: String, default: "" },
        content: { type: String, required: true },

        relatedCelebrities: [{ type: Schema.Types.ObjectId, ref: "Celebrity", index: true }],
        relatedEvents: [{ type: Schema.Types.ObjectId, ref: "Event", index: true }],

        status: {
            type: String,
            enum: ["draft", "published", "archived"],
            default: "draft",
            index: true,
        },
        isFeatured: { type: Boolean, default: false, index: true },
        views: { type: Number, default: 0 },
        isActive: { type: Boolean, default: true, index: true },

        publishedAt: { type: Date, default: null },
    },
    { timestamps: true }
);

BlogPostSchema.pre("validate", function (next) {
    const doc = this as IBlogPost;
    if (!doc.slug && doc.title) {
        doc.slug = slugify(doc.title);
    }
    if (doc.status === "published" && !doc.publishedAt) {
        doc.publishedAt = new Date();
    }
    if (doc.status !== "published") {
        doc.publishedAt = doc.publishedAt || null;
    }
    next();
});

BlogPostSchema.index({
    title: "text",
    category: "text",
    tags: "text",
    excerpt: "text",
    content: "text",
});

export const BlogPost: Model<IBlogPost> =
    mongoose.models.BlogPost || mongoose.model<IBlogPost>("BlogPost", BlogPostSchema);
