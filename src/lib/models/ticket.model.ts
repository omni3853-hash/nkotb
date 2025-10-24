import mongoose, { Schema, Model, Document, Types } from "mongoose";
import { TicketStatus } from "@/lib/enums/event.enums";

export interface ITicket extends Document {
    _id: Types.ObjectId;
    user: Types.ObjectId;
    event: Types.ObjectId;

    eventTitleSnapshot: string;
    eventSlugSnapshot: string;

    ticketTypeId: Types.ObjectId;
    ticketTypeName: string;
    unitPrice: number;
    quantity: number;
    totalAmount: number;

    notes?: string;
    status: TicketStatus;

    createdAt: Date;
    updatedAt: Date;
}

export interface ITicketPopulated extends Omit<ITicket, "user" | "event"> {
    user: any;
    event: any;
}

const TicketSchema = new Schema<ITicket>(
    {
        user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
        event: { type: Schema.Types.ObjectId, ref: "Event", required: true, index: true },

        eventTitleSnapshot: { type: String, required: true },
        eventSlugSnapshot: { type: String, required: true },

        ticketTypeId: { type: Schema.Types.ObjectId, required: true },
        ticketTypeName: { type: String, required: true },
        unitPrice: { type: Number, required: true, min: 0 },
        quantity: { type: Number, required: true, min: 1 },
        totalAmount: { type: Number, required: true, min: 0 },

        notes: { type: String, default: "" },
        status: {
            type: String,
            enum: Object.values(TicketStatus),
            default: TicketStatus.PENDING,
            index: true
        },
    },
    { timestamps: true }
);

TicketSchema.index({ user: 1, event: 1, createdAt: -1 });

export const Ticket: Model<ITicket> =
    mongoose.models.Ticket || mongoose.model<ITicket>("Ticket", TicketSchema);
