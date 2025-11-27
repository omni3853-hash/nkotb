import { SupportPriority, SupportStatus } from "@/lib/enums/support.enums";
import { z } from "zod";

/* ──────────────────────────────────────────────────────────────────────────
 * Shared Enums (match your TS enums exactly)
 * ────────────────────────────────────────────────────────────────────────── */
export const RoleZ = z.enum(["USER", "ADMIN"]);
export const UserStatusZ = z.enum(["Active", "Suspended", "Pending"]);
export const AccountTypeZ = z.enum(["CRYPTO_WALLET", "BANK_ACCOUNT", "MOBILE_PAYMENT"]);
export const MembershipStatusZ = z.enum(["ACTIVE", "EXPIRED", "SUSPENDED", "PENDING", "CANCELED"]);
export const BillingPeriodZ = z.enum(["MONTH", "YEAR", "CUSTOM"]);
export const DeliveryRequestStatusZ = z.enum(["PENDING", "APPROVED", "COMPLETED", "REJECTED"]);

/* ──────────────────────────────────────────────────────────────────────────
 * Shared Helpers
 * ────────────────────────────────────────────────────────────────────────── */
export const IsoDateString = z
    .string()
    .min(1, "Date is required")
    .refine((v) => !Number.isNaN(Date.parse(v)), "Invalid date");

export const ObjectIdString = z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid id format");

export const NonNegativeNumber = z.coerce.number().min(0, "Value cannot be negative");

export const PriceNumber = z.coerce
    .number()
    .min(0, "Price cannot be negative")
    .refine(Number.isFinite, "Price must be a number")
    .transform((n) => Math.round(n * 100) / 100);

export const PageZ = z.coerce.number().int().min(1).default(1);
export const LimitZ = z.coerce.number().int().min(1).max(100).default(10);

export const AddressZ = z.object({
    street: z.string().trim().min(1, "Street is required"),
    city: z.string().trim().min(1, "City is required"),
    state: z.string().trim().min(1, "State is required"),
    country: z.string().trim().min(1, "Country is required"),
    zipCode: z.string().trim().min(1, "Zip/Postal is required"),
});

/* ──────────────────────────────────────────────────────────────────────────
 * AUTH
 * ────────────────────────────────────────────────────────────────────────── */
export const SignupSchema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
});
export type SignupFormData = z.infer<typeof SignupSchema>;

export const LoginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
});
export type LoginFormData = z.infer<typeof LoginSchema>;

export const VerifyPasswordSchema = z.object({
    password: z.string().min(1),
});
export type VerifyPasswordFormData = z.infer<typeof VerifyPasswordSchema>;

export const RequestOtpSchema = z.object({
    email: z.string().email(),
    type: z.enum(["verify-email", "login", "reset"]),
});
export type RequestOtpFormData = z.infer<typeof RequestOtpSchema>;

export const VerifyOtpSchema = z.object({
    email: z.string().email(),
    otp: z.string().length(6),
    type: z.enum(["verify-email", "login", "reset"]),
});
export type VerifyOtpFormData = z.infer<typeof VerifyOtpSchema>;

export const ChangePasswordSchema = z.object({
    oldPassword: z.string().min(1),
    newPassword: z.string().min(6),
});
export type ChangePasswordFormData = z.infer<typeof ChangePasswordSchema>;

export const RequestResetSchema = z.object({
    email: z.string().email(),
});
export type RequestResetFormData = z.infer<typeof RequestResetSchema>;

export const ResetPasswordSchema = z.object({
    email: z.string().email(),
    otp: z.string().length(6),
    newPassword: z.string().min(6),
});
export type ResetPasswordFormData = z.infer<typeof ResetPasswordSchema>;

/* ──────────────────────────────────────────────────────────────────────────
 * DELIVERY OPTIONS
 * ────────────────────────────────────────────────────────────────────────── */
export const CreateDeliveryOptionSchema = z.object({
    name: z.string().trim().min(2).max(128),
    price: PriceNumber,
    deliveryTime: z.string().trim().min(2).max(128),
    description: z.string().optional().default(""),
});
export type CreateDeliveryOptionFormData = z.infer<typeof CreateDeliveryOptionSchema>;

export const UpdateDeliveryOptionSchema = z.object({
    name: z.string().trim().min(2).max(128).optional(),
    price: PriceNumber.optional(),
    deliveryTime: z.string().trim().min(2).max(128).optional(),
    description: z.string().optional(),
    isActive: z.coerce.boolean().optional(),
});
export type UpdateDeliveryOptionFormData = z.infer<typeof UpdateDeliveryOptionSchema>;

export const DeliveryOptionQuerySchema = z.object({
    search: z.string().optional(),
    onlyActive: z.coerce.boolean().default(true),
    page: PageZ,
    limit: LimitZ,
});
export type DeliveryOptionQuery = z.infer<typeof DeliveryOptionQuerySchema>;

/* ──────────────────────────────────────────────────────────────────────────
 * DELIVERY REQUESTS
 * ────────────────────────────────────────────────────────────────────────── */
export const CreateDeliveryRequestSchema = z.object({
    deliveryOption: z.string().min(1),
    deliveryAddress: AddressZ,
    specialInstruction: z.string().optional(),
});
export type CreateDeliveryRequestFormData = z.infer<typeof CreateDeliveryRequestSchema>;

export const DeliveryRequestQuerySchema = z.object({
    status: DeliveryRequestStatusZ.optional(),
    page: PageZ,
    limit: LimitZ,
});
export type DeliveryRequestQuery = z.infer<typeof DeliveryRequestQuerySchema>;

export const AdminUpdateDeliveryRequestStatusSchema = z.object({
    status: DeliveryRequestStatusZ,
    reason: z.string().optional(),
});
export type AdminUpdateDeliveryRequestStatusFormData = z.infer<
    typeof AdminUpdateDeliveryRequestStatusSchema
>;

/* ──────────────────────────────────────────────────────────────────────────
 * MEMBERSHIP (create/upgrade/status/query)
 * ────────────────────────────────────────────────────────────────────────── */
export const CreateMembershipSchema = z.object({
    planId: z.string().min(1),
    paymentMethodId: z.string().optional(),
    proofOfPayment: z.string().optional(),
    currencyId: z.string().optional(),
    autoRenew: z.coerce.boolean().default(false),
    amount: NonNegativeNumber.optional(),
});
export type CreateMembershipFormData = z.infer<typeof CreateMembershipSchema>;

export const UpgradeMembershipSchema = z.object({
    currentMembershipId: z.string().min(1),
    newPlanId: z.string().min(1),
    paymentMethodId: z.string().optional(),
    proofOfPayment: z.string().optional(),
    currencyId: z.string().optional(),
    amount: NonNegativeNumber.optional(),
});
export type UpgradeMembershipFormData = z.infer<typeof UpgradeMembershipSchema>;

export const UpdateMembershipStatusSchema = z.object({
    status: MembershipStatusZ,
    reason: z
        .string()
        .trim()
        .min(10, "Please provide at least 10 characters.")
        .max(500, "Reason must be 500 characters or fewer."),
});
export type UpdateMembershipStatusFormData = z.infer<typeof UpdateMembershipStatusSchema>;

export const MembershipQuerySchema = z.object({
    status: MembershipStatusZ.optional(),
    page: PageZ,
    limit: LimitZ,
});
export type MembershipQuery = z.infer<typeof MembershipQuerySchema>;

/* ──────────────────────────────────────────────────────────────────────────
 * MEMBERSHIP PLANS (create/update/query)
 * ────────────────────────────────────────────────────────────────────────── */
export const CreateMembershipPlanSchema = z.object({
    name: z.string().trim().min(1),
    price: PriceNumber,
    period: BillingPeriodZ,
    durationDays: z
        .number()
        .int()
        .min(1)
        .optional()
        .superRefine((val, ctx) => {
        }),
    description: z.string().optional().default(""),
    icon: z.string().optional(),
    color: z.string().optional(),
    popular: z.coerce.boolean().default(false),
    features: z.array(z.string()).default([]),
    limitations: z.array(z.string()).default([]),
    isActive: z.coerce.boolean().default(true),
}).superRefine((data, ctx) => {
    if (data.period === "CUSTOM" && (data.durationDays == null)) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["durationDays"],
            message: "durationDays is required when period is CUSTOM",
        });
    }
    if (data.period !== "CUSTOM" && data.durationDays != null) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["durationDays"],
            message: "durationDays is only allowed when period is CUSTOM",
        });
    }
});
export type CreateMembershipPlanFormData = z.infer<typeof CreateMembershipPlanSchema>;

export const UpdateMembershipPlanSchema = z
    .object({
        name: z.string().trim().optional(),
        price: PriceNumber.optional(),
        period: BillingPeriodZ.optional(),
        durationDays: z.number().int().min(1).optional(),
        description: z.string().optional(),
        icon: z.string().optional(),
        color: z.string().optional(),
        popular: z.coerce.boolean().optional(),
        features: z.array(z.string()).optional(),
        limitations: z.array(z.string()).optional(),
        isActive: z.coerce.boolean().optional(),
    })
    .superRefine((data, ctx) => {
        if (data.period === "CUSTOM" && data.durationDays == null) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["durationDays"],
                message: "durationDays is required when period is CUSTOM",
            });
        }
    });
export type UpdateMembershipPlanFormData = z.infer<typeof UpdateMembershipPlanSchema>;

export const MembershipPlanQuerySchema = z.object({
    search: z.string().optional(),
    onlyActive: z.coerce.boolean().default(true),
    page: PageZ,
    limit: LimitZ,
});
export type MembershipPlanQuery = z.infer<typeof MembershipPlanQuerySchema>;

/* ──────────────────────────────────────────────────────────────────────────
 * PAYMENT METHODS (create/update/query)
 * ────────────────────────────────────────────────────────────────────────── */
export const CreatePaymentMethodSchema = z.object({
    user: z.string().optional(),
    type: AccountTypeZ,
    cryptocurrency: z.string().optional(),
    network: z.string().optional(),
    walletAddress: z.string().optional(),
    qrCode: z.string().optional(),
    bankName: z.string().optional(),
    accountName: z.string().optional(),
    accountNumber: z.string().optional(),
    routingNumber: z.string().optional(),
    swiftCode: z.string().optional(),
    provider: z.string().optional(),
    handle: z.string().optional(),
    email: z.string().email().optional(),
    status: z.coerce.boolean().default(true),
    processingTime: z.string().default("1-3 business days"),
    fee: NonNegativeNumber.default(0),
    isDefault: z.coerce.boolean().default(false),
});
export type CreatePaymentMethodFormData = z.infer<typeof CreatePaymentMethodSchema>;

export const UpdatePaymentMethodSchema = z.object({
    type: AccountTypeZ.optional(),
    cryptocurrency: z.string().optional(),
    network: z.string().optional(),
    walletAddress: z.string().optional(),
    qrCode: z.string().optional(),
    bankName: z.string().optional(),
    accountName: z.string().optional(),
    accountNumber: z.string().optional(),
    routingNumber: z.string().optional(),
    swiftCode: z.string().optional(),
    provider: z.string().optional(),
    handle: z.string().optional(),
    email: z.string().email().optional(),
    status: z.coerce.boolean().optional(),
    processingTime: z.string().optional(),
    fee: NonNegativeNumber.optional(),
    isDefault: z.coerce.boolean().optional(),
});
export type UpdatePaymentMethodFormData = z.infer<typeof UpdatePaymentMethodSchema>;

export const PaymentMethodQuerySchema = z.object({
    type: AccountTypeZ.optional(),
    status: z.coerce.boolean().optional(),
    page: PageZ,
    limit: LimitZ,
});
export type PaymentMethodQuery = z.infer<typeof PaymentMethodQuerySchema>;

/* ──────────────────────────────────────────────────────────────────────────
 * PLATFORM SETTINGS (update)
 * ────────────────────────────────────────────────────────────────────────── */
export const UpdatePlatformSchema = z.object({
    siteName: z.string().optional(),
    siteTagline: z.string().optional(),
    siteDescription: z.string().optional(),
    supportEmail: z.string().email().optional(),
    supportPhone: z.string().optional(),
    minDepositAmount: NonNegativeNumber.optional(),
    bookingFeePercentage: NonNegativeNumber.optional(),
    cancellationPolicy: z.string().optional(),
    refundPolicy: z.string().optional(),
});
export type UpdatePlatformFormData = z.infer<typeof UpdatePlatformSchema>;

/* ──────────────────────────────────────────────────────────────────────────
 * USER (self update & admin update)
 * ────────────────────────────────────────────────────────────────────────── */
export const UpdateSelfSchema = z.object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    phone: z.string().optional(),
    dateOfBirth: z.string().optional(),
    profileImage: z.string().nullable().optional(),
    bio: z.string().optional(),
    address: z
        .object({
            street: z.string().optional(),
            city: z.string().optional(),
            state: z.string().optional(),
            country: z.string().optional(),
            zipCode: z.string().optional(),
            timezone: z.string().optional(),
        })
        .optional(),
});
export type UpdateSelfFormData = z.infer<typeof UpdateSelfSchema>;

export const AdminUpdateUserSchema = z.object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    dateOfBirth: z.string().optional(),
    profileImage: z.string().nullable().optional(),
    bio: z.string().optional(),
    role: RoleZ.optional(),
    address: z
        .object({
            street: z.string().optional(),
            city: z.string().optional(),
            state: z.string().optional(),
            country: z.string().optional(),
            zipCode: z.string().optional(),
            timezone: z.string().optional(),
        })
        .optional(),
    status: UserStatusZ.optional(),
    emailVerified: z.coerce.boolean().optional(),
    balance: NonNegativeNumber.optional(),
    membership: z.string().optional(),
});
export type AdminUpdateUserFormData = z.infer<typeof AdminUpdateUserSchema>;

export const NotificationQuerySchema = z.object({
    search: z.string().optional(),
    type: z.string().optional(),
    read: z.coerce.boolean().optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    userId: z.string().optional(),
});

export type NotificationQuery = z.infer<typeof NotificationQuerySchema>;

export const CreateNotificationSchema = z.object({
    user: z.string().min(1),
    type: z.string().trim().min(1),
    title: z.string().trim().min(1).max(160),
    message: z.string().trim().min(1).max(5000),
});

export type CreateNotificationFormData = z.infer<typeof CreateNotificationSchema>;

export const UpdateNotificationSchema = z.object({
    type: z.string().trim().min(1).optional(),
    title: z.string().trim().min(1).max(160).optional(),
    message: z.string().trim().min(1).max(5000).optional(),
    read: z.coerce.boolean().optional(),
});

export type UpdateNotificationFormData = z.infer<typeof UpdateNotificationSchema>;

export const CreateBookingSchema = z.object({
    celebrity: z.string().trim().min(1),
    bookingTypeId: z.string().trim().min(1),
    quantity: z.number().int().min(1),
    notes: z.string().optional(),
});
export type CreateBookingFormData = z.infer<typeof CreateBookingSchema>;

export const BookingQuerySchema = z.object({
    status: z.string().optional(),
    celebrityId: z.string().optional(),
    page: z.number().min(1).default(1).optional(),
    limit: z.number().min(1).max(100).default(10).optional(),
});
export type BookingQuery = z.infer<typeof BookingQuerySchema>;

export const AdminBookingQuerySchema = BookingQuerySchema.extend({
    userId: z.string().optional(),
});
export type AdminBookingQuery = z.infer<typeof AdminBookingQuerySchema>;

export const AdminUpdateBookingStatusSchema = z.object({
    status: z.string().trim().min(1),
    reason: z.string().optional(),
});
export type AdminUpdateBookingStatusFormData = z.infer<
    typeof AdminUpdateBookingStatusSchema
>;

// ---- Celebrity sub-schemas (map to your model; slug auto on server) ----
export const BookingTypeInputSchema = z.object({
    _id: z.string().optional(),
    name: z.string().trim().min(1),
    duration: z.string().trim().min(1),
    price: z.number().min(0),
    description: z.string().optional().default(""),
    features: z.array(z.string()).optional().default([]),
    availability: z.number().optional().default(0),
    popular: z.boolean().optional().default(false),
});

export const ReviewCreateSchema = z.object({
    author: z.string().trim().min(1),
    rating: z.coerce.number().min(1).max(5),
    comment: z.string().optional().default(""),
    verified: z.boolean().optional().default(false),
    date: z.string().optional().default(""),
});

export const ReviewUpdateSchema = z.object({
    _id: z.string().optional(),
    author: z.string().trim().min(1).optional(),
    rating: z.coerce.number().min(1).max(5).optional(),
    comment: z.string().optional(),
    verified: z.boolean().optional(),
    date: z.string().optional(),
});

export const CreateCelebritySchema = z.object({
    name: z.string().trim().min(1),
    category: z.string().trim().min(1),
    basePrice: z.number().min(0),
    description: z.string().optional().default(""),
    responseTime: z.string().optional().default(""),
    availability: z.string().optional(),
    tags: z.array(z.string()).optional().default([]),
    image: z.string().nullable().optional(),
    coverImage: z.string().nullable().optional(),
    achievements: z.array(z.string()).optional().default([]),
    bookingTypes: z.array(BookingTypeInputSchema).optional().default([]),
    reviews: z.array(ReviewCreateSchema).optional().default([]),
    trending: z.boolean().optional().default(false),
    hot: z.boolean().optional().default(false),
    verified: z.boolean().optional().default(false),
    isActive: z.boolean().optional().default(true),
});
export type CreateCelebrityFormData = z.infer<typeof CreateCelebritySchema>;

export const UpdateCelebritySchema = CreateCelebritySchema.partial().extend({
    reviews: z.array(ReviewUpdateSchema).optional(),
});
export type UpdateCelebrityFormData = z.infer<typeof UpdateCelebritySchema>;

export const CelebrityQuerySchema = z.object({
    search: z.string().optional(),
    category: z.string().optional(),
    isActive: z.coerce.boolean().optional(),
    trending: z.coerce.boolean().optional(),
    hot: z.coerce.boolean().optional(),
    verified: z.coerce.boolean().optional(),
    page: z.number().min(1).default(1).optional(),
    limit: z.number().min(1).max(100).default(10).optional(),
});
export type CelebrityQuery = z.infer<typeof CelebrityQuerySchema>;

/* ----------------------------- Shared Pagination ---------------------------- */
export const PaginationQuerySchema = z.object({
    page: z.number().int().min(1).default(1),
    limit: z.number().int().min(1).max(100).default(10),
});

/* --------------------------------- Events ---------------------------------- */

const UrlNullableEmpty = z.union([z.string().url(), z.literal(""), z.null()]);

export const EventAvailabilityEnum = z.enum([
    "Available",
    "Selling Fast",
    "Almost Full",
    "Hot",
    "Sold Out",
]);

export const TicketTypeCreateSchema = z.object({
    name: z.string().trim().min(1),
    price: z.coerce.number().min(0),
    description: z.string().optional().default(""),
    features: z.array(z.string()).default([]),
    total: z.coerce.number().int().min(0),
    popular: z.boolean().optional().default(false),
});

export const TicketTypeUpdateSchema = z.object({
    _id: z.string().optional(),
    name: z.string().trim().min(1).optional(),
    price: z.coerce.number().min(0).optional(),
    description: z.string().optional(),
    features: z.array(z.string()).optional(),
    total: z.coerce.number().int().min(0).optional(),
    sold: z.coerce.number().int().min(0).optional(),
    popular: z.boolean().optional(),
});

export const CreateEventSchema = z.object({
    title: z.string().trim().min(1),
    category: z.string().trim().min(1),
    tags: z.array(z.string().trim()).default([]),
    image: UrlNullableEmpty.optional(),
    coverImage: UrlNullableEmpty.optional(),
    basePrice: z.coerce.number().min(0),
    description: z.string().optional().default(""),
    location: z.string().optional().default(""),
    date: z.string().optional().default(""),
    time: z.string().optional().default(""),
    attendees: z.coerce.number().int().min(0).optional().default(0),
    ticketTypes: z.array(TicketTypeCreateSchema).default([]),
    reviews: z.array(ReviewCreateSchema).optional().default([]),
    availability: EventAvailabilityEnum.optional(),
    featured: z.boolean().optional().default(false),
    trending: z.boolean().optional().default(false),
    verified: z.boolean().optional().default(false),
    isActive: z.boolean().optional().default(true),
});

export type CreateEventFormData = z.infer<typeof CreateEventSchema>;

export const UpdateEventSchema = z.object({
    title: z.string().trim().min(1).optional(),
    category: z.string().trim().min(1).optional(),
    tags: z.array(z.string().trim()).optional(),
    image: UrlNullableEmpty.optional(),
    coverImage: UrlNullableEmpty.optional(),
    basePrice: z.coerce.number().min(0).optional(),
    description: z.string().optional(),
    location: z.string().optional(),
    date: z.string().optional(),
    time: z.string().optional(),
    attendees: z.coerce.number().int().min(0).optional(),
    ticketTypes: z.array(TicketTypeUpdateSchema).optional(),
    reviews: z.array(ReviewUpdateSchema).optional(),
    availability: EventAvailabilityEnum.optional(),
    featured: z.boolean().optional(),
    trending: z.boolean().optional(),
    verified: z.boolean().optional(),
    isActive: z.boolean().optional(),
});

export type UpdateEventFormData = z.infer<typeof UpdateEventSchema>;

export const EventQuerySchema = z.object({
    search: z.string().optional().or(z.literal("").optional()),
    category: z.string().optional().or(z.literal("").optional()),
    onlyActive: z.boolean().optional().default(true),
    page: z.number().int().min(1).optional().default(1),
    limit: z.number().int().min(1).max(100).optional().default(10),
});
export type EventQuery = z.infer<typeof EventQuerySchema>;

/* --------------------------------- Tickets --------------------------------- */

export const TicketStatusEnum = z.enum(["PENDING", "CONFIRMED", "COMPLETED", "CANCELED"]);

export const CreateTicketSchema = z.object({
    event: z.string().min(1),
    ticketTypeId: z.string().min(1),
    quantity: z.number().int().min(1),
    notes: z.string().optional().default(""),
});
export type CreateTicketFormData = z.infer<typeof CreateTicketSchema>;

export const CreateOfflineTicketSchema = z.object({
    event: z.string().min(1, "Event is required"),
    ticketTypeId: z.string().min(1, "Ticket type is required"),
    quantity: z.number().int().min(1, "Minimum quantity is 1"),

    // Guest buyer details (no account required)
    buyerFullName: z.string().min(2, "Full name is required"),
    buyerEmail: z.string().email("Valid email is required"),
    buyerPhone: z.string().optional(),

    // Optional notes to organiser
    notes: z.string().optional().default(""),

    // Offline payment snapshot (PaymentMethod + proof)
    paymentMethodId: z.string().optional(),
    paidAmount: z.number().positive().optional(),
    proofOfPayment: z.string().optional(), // receipt url / reference / txt
});

export type CreateOfflineTicketFormData = z.infer<typeof CreateOfflineTicketSchema>;

export const TicketQuerySchema = z.object({
    status: TicketStatusEnum.optional(),
    eventId: z.string().optional(),
    page: z.number().int().min(1).optional().default(1),
    limit: z.number().int().min(1).max(100).optional().default(10),
});
export type TicketQuery = z.infer<typeof TicketQuerySchema>;

export const AdminTicketQuerySchema = TicketQuerySchema.extend({
    userId: z.string().optional(),
});
export type AdminTicketQuery = z.infer<typeof AdminTicketQuerySchema>;

export const AdminUpdateTicketStatusSchema = z.object({
    status: TicketStatusEnum,
    reason: z.string().optional().default(""),
});
export type AdminUpdateTicketStatusFormData = z.infer<typeof AdminUpdateTicketStatusSchema>;

/* =============================== DEPOSITS ================================ */
export const CreateDepositSchema = z.object({
    amount: z.number().positive(),
    paymentMethodId: z.string().optional(),
    proofOfPayment: z.string().optional(),
    notes: z
        .string()
        .trim()
        .min(1, "Please add a short note (e.g., reference, payer name, memo).")
        .max(1000, "Notes must be at most 1000 characters"),
});
export type CreateDepositFormData = z.infer<typeof CreateDepositSchema>;

export const AdminCreateDepositSchema = z.object({
    userId: z.string(),
    amount: z.number().positive(),
    paymentMethodId: z.string().optional(),
    proofOfPayment: z.string().optional(),
    status: z.enum(["PENDING", "COMPLETED", "FAILED"]).optional(),
    notes: z.string().trim().min(1, "Notes are required").max(1000, "Max 1000 characters"),
});
export type AdminCreateDepositFormData = z.infer<typeof AdminCreateDepositSchema>;

export const UpdateDepositStatusSchema = z.object({
    status: z.enum(["COMPLETED", "FAILED"]),
    reason: z.string().trim().min(1, "Reason is required").max(500, "Max 500 characters"),
});
export type UpdateDepositStatusFormData = z.infer<typeof UpdateDepositStatusSchema>;

export const DepositQuerySchema = z.object({
    status: z.enum(["PENDING", "COMPLETED", "FAILED"]).optional(),
    page: z.number().int().min(1).optional(),
    limit: z.number().int().min(1).max(100).optional(),
});
export type DepositQuery = z.infer<typeof DepositQuerySchema>;

/* ============================= TRANSACTIONS ============================== */
export const TransactionQuerySchema = z.object({
    purpose: z.enum(["BOOKING_PAYMENT", "BOOKING_REFUND", "TICKET_PURCHASE", "TICKET_REFUND", "TOPUP", "ADJUSTMENT"]).optional(),
    type: z.enum(["DEBIT", "CREDIT"]).optional(),
    page: z.number().int().min(1).optional(),
    limit: z.number().int().min(1).max(100).optional(),
});
export type TransactionQuery = z.infer<typeof TransactionQuerySchema>;

export const BlogPostStatusEnum = z.enum([
    "draft",
    "published",
    "archived",
]);

export const BlogPostQuerySchema = z.object({
    search: z.string().optional(),
    category: z.string().optional(),
    tag: z.string().optional(),
    celebrityId: z.string().optional(),
    eventId: z.string().optional(),
    status: z.enum(["draft", "published", "archived"]).optional(),
    onlyActive: z.boolean().optional(),
    onlyPublished: z.boolean().optional(),
    page: z.number().optional(),
    limit: z.number().optional(),
});

export const CreateBlogPostSchema = z.object({
    title: z.string().min(1),
    category: z.string().min(1),
    tags: z.array(z.string()).default([]),
    thumbnail: z.string().url().or(z.literal("")).nullable().optional(),
    coverImage: z.string().url().or(z.literal("")).nullable().optional(),
    excerpt: z.string().optional(),
    content: z.string().min(1),
    relatedCelebrities: z.array(z.string()).default([]),
    relatedEvents: z.array(z.string()).default([]),
    status: z.enum(["draft", "published", "archived"]).optional(),
    isFeatured: z.boolean().optional(),
    isActive: z.boolean().optional(),
});

export const UpdateBlogPostSchema = CreateBlogPostSchema.partial();

export type CreateBlogPostFormData = z.infer<typeof CreateBlogPostSchema>;
export type UpdateBlogPostFormData = z.infer<typeof UpdateBlogPostSchema>;


export const CreateSupportTicketSchema = z.object({
    fullName: z.string().min(2, "Full name is required"),
    email: z.string().email("Valid email is required"),
    phone: z
        .string()
        .optional(),
    subject: z.string().min(3, "Subject is required"),
    message: z.string().min(5, "Message is too short"),
    priority: z.nativeEnum(SupportPriority).optional(),
});

export type CreateSupportTicketFormData = z.infer<typeof CreateSupportTicketSchema>;

// ADMIN reply
export const AdminReplySupportTicketSchema = z.object({
    body: z.string().min(2, "Reply cannot be empty"),
});
export type AdminReplySupportTicketFormData = z.infer<
    typeof AdminReplySupportTicketSchema
>;

// ADMIN status update
export const AdminUpdateSupportStatusSchema = z.object({
    status: z.nativeEnum(SupportStatus),
});
export type AdminUpdateSupportStatusFormData = z.infer<
    typeof AdminUpdateSupportStatusSchema
>;

// ============================================================================
// ENUMS
// ============================================================================

export const DonationStatusEnum = z.enum(["PENDING", "COMPLETED", "FAILED", "REFUNDED"]);
export const DonationFrequencyEnum = z.enum(["ONE_TIME", "MONTHLY", "QUARTERLY", "YEARLY"]);
export const ApplicationStatusEnum = z.enum([
    "SUBMITTED",
    "UNDER_REVIEW",
    "APPROVED",
    "REJECTED",
    "GRANT_ISSUED",
]);
export const VolunteerStatusEnum = z.enum(["PENDING", "ACTIVE", "INACTIVE"]);

// ============================================================================
// DONATION SCHEMAS
// ============================================================================

export const CreateDonationSchema = z.object({
    donorName: z.string().min(2, "Name is required"),
    donorEmail: z.string().email("Valid email is required"),
    donorPhone: z.string().optional(),
    amount: z.number().positive("Amount must be greater than 0"),
    frequency: DonationFrequencyEnum.default("ONE_TIME"),
    dedicatedTo: z.string().optional(),
    isAnonymous: z.boolean().default(false),
    paymentMethodId: z.string().optional(),
    proofOfPayment: z.string().optional(),
    notes: z.string().optional(),
});

export type CreateDonationFormData = z.infer<typeof CreateDonationSchema>;

export const DonationQuerySchema = z.object({
    status: DonationStatusEnum.optional(),
    donorEmail: z.string().email().optional(),
    page: z.number().int().min(1).optional().default(1),
    limit: z.number().int().min(1).max(100).optional().default(10),
});

export type DonationQuery = z.infer<typeof DonationQuerySchema>;

export const AdminUpdateDonationStatusSchema = z.object({
    status: DonationStatusEnum,
    notes: z.string().optional(),
});

export type AdminUpdateDonationStatusFormData = z.infer<typeof AdminUpdateDonationStatusSchema>;

// ============================================================================
// ASSISTANCE APPLICATION SCHEMAS
// ============================================================================

export const CreateAssistanceApplicationSchema = z.object({
    applicantName: z.string().min(2, "Name is required"),
    applicantEmail: z.string().email("Valid email is required"),
    applicantPhone: z.string().optional(),
    mailingAddress: z.string().min(10, "Complete address is required"),
    birthDate: z.string().refine((val) => !isNaN(Date.parse(val)), "Valid date required"),
    ssnLast4: z.string().length(4, "Last 4 digits of SSN required").regex(/^\d{4}$/, "Must be 4 digits"),
    diagnosisDate: z.string().refine((val) => !isNaN(Date.parse(val)), "Valid date required"),
    diagnosisDescription: z.string().min(10, "Diagnosis description is required"),
    monthlyIncome: z.number().min(0, "Income must be 0 or greater"),
    isEmployed: z.boolean().default(false),
    inActiveTreatment: z.boolean().default(false),
    socialWorkerName: z.string().optional(),
    socialWorkerFacility: z.string().optional(),
    applicationPdfUrl: z.string().url("Valid PDF URL required"),
    diagnosisLetterUrl: z.string().url("Valid diagnosis letter URL required"),
    personalStatementUrl: z.string().url().optional(),
});

export type CreateAssistanceApplicationFormData = z.infer<typeof CreateAssistanceApplicationSchema>;

export const ApplicationQuerySchema = z.object({
    status: ApplicationStatusEnum.optional(),
    submissionMonth: z.string().regex(/^\d{4}-\d{2}$/).optional(),
    page: z.number().int().min(1).optional().default(1),
    limit: z.number().int().min(1).max(100).optional().default(10),
});

export type ApplicationQuery = z.infer<typeof ApplicationQuerySchema>;

export const AdminReviewApplicationSchema = z.object({
    status: ApplicationStatusEnum,
    grantAmount: z.number().min(500).max(1000).optional(),
    reviewNotes: z.string().optional(),
});

export type AdminReviewApplicationFormData = z.infer<typeof AdminReviewApplicationSchema>;

// ============================================================================
// VOLUNTEER SCHEMAS
// ============================================================================

export const CreateVolunteerSchema = z.object({
    fullName: z.string().min(2, "Name is required"),
    email: z.string().email("Valid email is required"),
    phone: z.string().optional(),
    interests: z.array(z.string()).min(1, "At least one interest is required"),
    availability: z.string().optional(),
    notes: z.string().optional(),
});

export type CreateVolunteerFormData = z.infer<typeof CreateVolunteerSchema>;

export const VolunteerQuerySchema = z.object({
    status: VolunteerStatusEnum.optional(),
    page: z.number().int().min(1).optional().default(1),
    limit: z.number().int().min(1).max(100).optional().default(10),
});

export type VolunteerQuery = z.infer<typeof VolunteerQuerySchema>;

export const AdminUpdateVolunteerStatusSchema = z.object({
    status: VolunteerStatusEnum,
    notes: z.string().optional(),
});

export type AdminUpdateVolunteerStatusFormData = z.infer<typeof AdminUpdateVolunteerStatusSchema>;