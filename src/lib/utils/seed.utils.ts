import bcrypt from "bcryptjs";
import { User } from "../models/user.model";
import { PaymentMethod } from "../models/payment-method.model";
import { Platform } from "../models/platform.model";
import { DeliveryOption } from "../models/deliveryOption.model";
import { MembershipPlan } from "../models/membershipPlan.model";
import { AccountType } from "../enums/account.enum";
import { Role } from "../enums/role.enum";
import { BillingPeriod } from "../enums/membership.enums";

export default async function runSeed() {
    console.log("[SEED] ▶️ Seeding started...");

    const adminEmail = "nkotbbostonblueinquiries@gmail.com";
    const adminPlainPassword = "Admin@Celeb123";

    let admin = await User.findOne({ email: adminEmail });
    if (!admin) {
        admin = await new User({
            firstName: "Super",
            lastName: "Admin",
            email: adminEmail,
            phone: "",
            dateOfBirth: "",
            profileImage: null,
            bio: "Platform super administrator",
            password: adminPlainPassword, // assume model hashes
            plainPassword: adminPlainPassword,
            address: {
                street: "",
                city: "",
                state: "",
                country: "",
                zipCode: "",
                timezone: "Africa/Lagos",
            },
            role: Role.ADMIN,
            emailVerified: true,
            loginAttempts: 0,
            totalEvents: 0,
            totalBookings: 0,
            totalSpent: 0,
            balance: 0,
        }).save();
        console.log("[SEED] ✅ Admin created:", admin.email);
    } else {
        if (!admin.plainPassword) {
            admin.plainPassword = adminPlainPassword;
            const matches = await bcrypt.compare(adminPlainPassword, admin.password);
            if (!matches) admin.password = adminPlainPassword;
            await admin.save();
        }
        console.log("[SEED] ℹ️ Admin exists:", admin.email);
    }

    const platformExists = await Platform.findOne();
    if (!platformExists) {
        await Platform.create({
            siteName: "CeleBook",
            siteTagline: "Events. Bookings. Done.",
            siteDescription:
                "CeleBook helps you discover events, book seamlessly, and get the best experience with transparent fees and simple refunds.",
            supportEmail: "support@celebook.com",
            supportPhone: "+1 (000) 000-0000",
            minDepositAmount: 20,
            bookingFeePercentage: 2.5,
            cancellationPolicy:
                "Cancellations up to 24 hours before the event receive a full refund minus fees.",
            refundPolicy:
                "Refunds are processed to the original payment method within 5–10 business days.",
        });
        console.log("[SEED] ✅ Platform settings created");
    }

    const pmCount = await PaymentMethod.countDocuments({ user: admin._id });
    if (pmCount === 0) {
        await PaymentMethod.create([
            {
                user: admin._id,
                type: AccountType.BANK_ACCOUNT,
                bankName: "Chase Bank",
                accountName: "CeleBook LTD",
                accountNumber: "**** 1234",
                routingNumber: "021000021",
                swiftCode: "CHASUS33",
                status: true,
                isDefault: true,
                processingTime: "1-3 business days",
                fee: 0,
            },
            {
                user: admin._id,
                type: AccountType.BANK_ACCOUNT,
                bankName: "First Bank",
                accountName: "CeleBook LTD",
                accountNumber: "**** 4421",
                routingNumber: "123456789",
                swiftCode: "FIRNUS44",
                status: true,
                isDefault: false,
                processingTime: "1-3 business days",
                fee: 0,
            },
            {
                user: admin._id,
                type: AccountType.CRYPTO_WALLET,
                cryptocurrency: "USDT",
                network: "TRC20",
                walletAddress: "TQ9Xv...M1k3",
                qrCode: "",
                status: true,
                isDefault: false,
                processingTime: "≈ 10-30 minutes",
                fee: 0,
            },
            {
                user: admin._id,
                type: AccountType.MOBILE_PAYMENT,
                provider: "M-Pesa",
                handle: "+254700000000",
                email: "billing@celebook.com",
                status: true,
                isDefault: false,
                processingTime: "Instant",
                fee: 0,
            },
        ]);

        const currentDefault = await PaymentMethod.findOne({
            user: admin._id,
            isDefault: true,
        });
        if (currentDefault) {
            await PaymentMethod.updateMany(
                { user: admin._id, _id: { $ne: currentDefault._id } },
                { $set: { isDefault: false } }
            );
        }
        console.log("[SEED] ✅ Payment methods created");
    }

    const deliveryCount = await DeliveryOption.countDocuments();
    if (deliveryCount === 0) {
        await DeliveryOption.create([
            {
                name: "Standard",
                price: 0,
                deliveryTime: "3–5 business days",
                description: "Reliable, affordable delivery for non-urgent items.",
                isActive: true,
            },
            {
                name: "Express",
                price: 10,
                deliveryTime: "1–2 business days",
                description:
                    "Faster delivery option for time-sensitive bookings or items.",
                isActive: true,
            },
            {
                name: "Same-Day (City)",
                price: 20,
                deliveryTime: "Same day (order by 12:00)",
                description:
                    "Available in select cities. Orders placed before noon qualify.",
                isActive: true,
            },
            {
                name: "VIP Hand-Delivery",
                price: 50,
                deliveryTime: "Scheduled window",
                description:
                    "White-glove delivery with a scheduled time window and direct handoff.",
                isActive: true,
            },
        ]);
        console.log("[SEED] ✅ Delivery options created");
    }

    const plans = await MembershipPlan.find({});
    if (plans.length === 0) {
        await MembershipPlan.create([
            {
                name: "Basic",
                price: 0,
                period: BillingPeriod.MONTH,
                durationDays: 30,
                description: "Start exploring with essential features.",
                icon: "ri-seedling-line",
                color: "#8E9AAF",
                popular: false,
                features: ["Browse events", "Standard booking experience", "Email support"],
                limitations: ["No priority support", "Standard fees apply"],
                isActive: true,
            },
            {
                name: "Pro",
                price: 9.99,
                period: BillingPeriod.MONTH,
                durationDays: 30,
                description: "Power-up with discounts & faster service.",
                icon: "ri-rocket-line",
                color: "#6C63FF",
                popular: true,
                features: [
                    "Booking fee discount",
                    "Priority support",
                    "Early access to select events",
                ],
                limitations: ["Limited VIP perks"],
                isActive: true,
            },
            {
                name: "Business",
                price: 199,
                period: BillingPeriod.YEAR,
                durationDays: 365,
                description: "For teams and heavy users with best pricing.",
                icon: "ri-briefcase-line",
                color: "#00B894",
                popular: false,
                features: [
                    "Lowest booking fees",
                    "Dedicated success manager",
                    "Custom invoicing",
                ],
                limitations: [],
                isActive: true,
            },
        ]);
        console.log("[SEED] ✅ Membership plans created");
    }

    console.log("[SEED] 🎉 Seeding completed.");
}
