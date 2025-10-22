// schemas.ts
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
    deliveryOption: z.string().min(1), // ObjectId as string; server validates strictly
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
            // handled below via refinement based on period
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
    // user is typically taken from auth context; keep optional here
    user: z.string().optional(), // or ObjectIdString.optional()
    type: AccountTypeZ,

    // crypto
    cryptocurrency: z.string().optional(),
    network: z.string().optional(),
    walletAddress: z.string().optional(),
    qrCode: z.string().optional(),

    // bank
    bankName: z.string().optional(),
    accountName: z.string().optional(),
    accountNumber: z.string().optional(),
    routingNumber: z.string().optional(),
    swiftCode: z.string().optional(),

    // mobile
    provider: z.string().optional(),
    handle: z.string().optional(),
    email: z.string().email().optional(),

    // common
    status: z.coerce.boolean().default(true),
    processingTime: z.string().default("1-3 business days"),
    fee: NonNegativeNumber.default(0),
    isDefault: z.coerce.boolean().default(false),
});
export type CreatePaymentMethodFormData = z.infer<typeof CreatePaymentMethodSchema>;

export const UpdatePaymentMethodSchema = z.object({
    type: AccountTypeZ.optional(),

    // crypto
    cryptocurrency: z.string().optional(),
    network: z.string().optional(),
    walletAddress: z.string().optional(),
    qrCode: z.string().optional(),

    // bank
    bankName: z.string().optional(),
    accountName: z.string().optional(),
    accountNumber: z.string().optional(),
    routingNumber: z.string().optional(),
    swiftCode: z.string().optional(),

    // mobile
    provider: z.string().optional(),
    handle: z.string().optional(),
    email: z.string().email().optional(),

    // common
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
    siteDescription: z.string().optional(), // allow("")
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
    dateOfBirth: z.string().optional(), // keep as string to match DTO
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
