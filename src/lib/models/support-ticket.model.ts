import mongoose, { Schema, Model, Document, Types } from "mongoose";
import { SupportStatus, SupportPriority } from "@/lib/enums/support.enums";

export interface ISupportContact {
    name: string;
    email: string;
    phone?: string;
}

export type SupportMessageAuthorType = "CUSTOMER" | "ADMIN";

export interface ISupportReply {
    _id: Types.ObjectId;
    from: SupportMessageAuthorType;
    body: string;
    createdAt: Date;
    authorUser?: Types.ObjectId | null; // admin/user if known
}

export interface ISupportTicket extends Document {
    _id: Types.ObjectId;

    user?: Types.ObjectId | null;   // logged-in user if any
    isGuest: boolean;               // true if anonymous / offline

    contact: ISupportContact;

    subject: string;
    message: string;                // initial message

    status: SupportStatus;
    priority: SupportPriority;

    assignedTo?: Types.ObjectId | null;

    replies: ISupportReply[];

    lastRepliedAt?: Date;
    lastRepliedBy?: Types.ObjectId | null;

    createdAt: Date;
    updatedAt: Date;
}

const SupportContactSchema = new Schema<ISupportContact>(
    {
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, lowercase: true, trim: true },
        phone: { type: String, trim: true },
    },
    { _id: false }
);

const SupportReplySchema = new Schema<ISupportReply>(
    {
        from: {
            type: String,
            enum: ["CUSTOMER", "ADMIN"],
            required: true,
        },
        body: { type: String, required: true },
        authorUser: { type: Schema.Types.ObjectId, ref: "User", default: null },
        createdAt: { type: Date, default: Date.now },
    },
    { _id: true }
);

const SupportTicketSchema = new Schema<ISupportTicket>(
    {
        user: { type: Schema.Types.ObjectId, ref: "User", default: null, index: true },
        isGuest: { type: Boolean, default: true, index: true },

        contact: { type: SupportContactSchema, required: true },

        subject: { type: String, required: true, trim: true },
        message: { type: String, required: true },

        status: {
            type: String,
            enum: Object.values(SupportStatus),
            default: SupportStatus.OPEN,
            index: true,
        },
        priority: {
            type: String,
            enum: Object.values(SupportPriority),
            default: SupportPriority.NORMAL,
            index: true,
        },

        assignedTo: { type: Schema.Types.ObjectId, ref: "User", default: null },

        replies: { type: [SupportReplySchema], default: [] },

        lastRepliedAt: { type: Date },
        lastRepliedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
    },
    { timestamps: true }
);

SupportTicketSchema.index({ "contact.email": 1, createdAt: -1 });
SupportTicketSchema.index({ status: 1, priority: 1, createdAt: -1 });

export const SupportTicket: Model<ISupportTicket> =
    mongoose.models.SupportTicket ||
    mongoose.model<ISupportTicket>("SupportTicket", SupportTicketSchema);
