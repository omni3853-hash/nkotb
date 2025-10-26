import { PopulateOptions } from "mongoose";

export const depositPopulate: PopulateOptions[] = [
    { path: "user", select: "_id firstName lastName email" },
    {
        path: "payment.paymentMethod",
        select:
            "_id type last4 brand accountName bankName bankCode number provider providerRef", // adjust to your PaymentMethod fields
    },
    { path: "processedBy", select: "_id firstName lastName email" },
];
