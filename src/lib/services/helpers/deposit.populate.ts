import { PopulateOptions } from "mongoose";

export const depositPopulate: PopulateOptions[] = [
    {
        path: "user",
        select: "_id firstName lastName email",
    },
    {
        path: "payment.paymentMethod",
        // You can adjust these fields to match your PaymentMethod schema
        select:
            "_id type cryptocurrency network walletAddress bankName accountName accountNumber provider email status processingTime fee isDefault",
    },
    {
        path: "processedBy",
        select: "_id firstName lastName email",
    },
];
