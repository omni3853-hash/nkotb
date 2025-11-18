import mongoose, { Schema, Model, Document, Types } from "mongoose";
import { TicketStatus } from "@/lib/enums/event.enums";
import { PaymentMethod } from "./payment-method.model"; // ensure model is loaded

// NEW: guest buyer snapshot
export interface IOfflineTicketBuyer {
    fullName: string;
    email: string;
    phone?: string;
}

// NEW: offline payment snapshot
export interface IOfflineTicketPayment {
    paymentMethod?: Types.ObjectId;  // PaymentMethod _id
    amount?: number;                 // amount paid
    proofOfPayment?: string;         // receipt url / ref / note
    reference?: string;              // internal reference if needed
}

export interface ITicket extends Document {
    _id: Types.ObjectId;

    // For logged-in purchases, this is set.
    // For guest/offline purchases, this may be null.
    user?: Types.ObjectId | null;

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

    // NEW: guest + payment + QR
    isGuest: boolean;
    buyer?: IOfflineTicketBuyer;
    offlinePayment?: IOfflineTicketPayment;
    checkinCode?: string;     // unique code printed & in QR
    qrCodeDataUrl?: string;   // cached QR data URL (optional)

    createdAt: Date;
    updatedAt: Date;
}

export interface ITicketPopulated extends Omit<ITicket, "user" | "event"> {
    user: any;
    event: any;
}

// keep PaymentMethod model from being tree-shaken
const PAYMENT_METHOD_MODEL_NAME: string = PaymentMethod.modelName;

const OfflineTicketBuyerSchema = new Schema<IOfflineTicketBuyer>(
    {
        fullName: { type: String, required: true },
        email: { type: String, required: true },
        phone: { type: String },
    },
    { _id: false }
);

const OfflineTicketPaymentSchema = new Schema<IOfflineTicketPayment>(
    {
        paymentMethod: { type: Schema.Types.ObjectId, ref: "PaymentMethod" },
        amount: { type: Number },
        proofOfPayment: { type: String },
        reference: { type: String },
    },
    { _id: false }
);

const TicketSchema = new Schema<ITicket>(
    {
        // UPDATED: no longer required (so guests can have null user)
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: false,
            index: true,
            default: null,
        },

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
            index: true,
        },

        // NEW: offline guest + payment details
        isGuest: { type: Boolean, default: false, index: true },
        buyer: { type: OfflineTicketBuyerSchema, default: undefined },
        offlinePayment: { type: OfflineTicketPaymentSchema, default: undefined },

        // NEW: QR details
        checkinCode: { type: String, unique: true, sparse: true },
        qrCodeDataUrl: { type: String },
    },
    { timestamps: true }
);

TicketSchema.index({ user: 1, event: 1, createdAt: -1 });
TicketSchema.index({ checkinCode: 1 }, { unique: true, sparse: true });

export const Ticket: Model<ITicket> =
    mongoose.models.Ticket || mongoose.model<ITicket>("Ticket", TicketSchema);