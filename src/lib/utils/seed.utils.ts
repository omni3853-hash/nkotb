import bcrypt from "bcryptjs";
import { User } from "../models/user.model";
import { PaymentMethod } from "../models/payment-method.model";
import { Platform } from "../models/platform.model";
import { DeliveryOption } from "../models/deliveryOption.model";
import { MembershipPlan } from "../models/membershipPlan.model";
import { AccountType } from "../enums/account.enum";
import { Role } from "../enums/role.enum";
import { BillingPeriod } from "../enums/membership.enums";
import { Event } from "../models/event.model";

// export default async function runSeed() {
//     console.log("[SEED] ▶️ Seeding started...");

//     const adminEmail = "nkotbbostonblueinquiries@gmail.com";
//     const adminPlainPassword = "Admin@Celeb123";

//     let admin = await User.findOne({ email: adminEmail });
//     if (!admin) {
//         admin = await new User({
//             firstName: "Super",
//             lastName: "Admin",
//             email: adminEmail,
//             phone: "",
//             dateOfBirth: "",
//             profileImage: null,
//             bio: "Platform super administrator",
//             password: adminPlainPassword, // assume model hashes
//             plainPassword: adminPlainPassword,
//             address: {
//                 street: "",
//                 city: "",
//                 state: "",
//                 country: "",
//                 zipCode: "",
//                 timezone: "Africa/Lagos",
//             },
//             role: Role.ADMIN,
//             emailVerified: true,
//             loginAttempts: 0,
//             totalEvents: 0,
//             totalBookings: 0,
//             totalSpent: 0,
//             balance: 0,
//         }).save();
//         console.log("[SEED] ✅ Admin created:", admin.email);
//     } else {
//         if (!admin.plainPassword) {
//             admin.plainPassword = adminPlainPassword;
//             const matches = await bcrypt.compare(adminPlainPassword, admin.password);
//             if (!matches) admin.password = adminPlainPassword;
//             await admin.save();
//         }
//         console.log("[SEED] ℹ️ Admin exists:", admin.email);
//     }

//     const platformExists = await Platform.findOne();
//     if (!platformExists) {
//         await Platform.create({
//             siteName: "CeleBook",
//             siteTagline: "Events. Bookings. Done.",
//             siteDescription:
//                 "CeleBook helps you discover events, book seamlessly, and get the best experience with transparent fees and simple refunds.",
//             supportEmail: "support@celebook.com",
//             supportPhone: "+1 (000) 000-0000",
//             minDepositAmount: 20,
//             bookingFeePercentage: 2.5,
//             cancellationPolicy:
//                 "Cancellations up to 24 hours before the event receive a full refund minus fees.",
//             refundPolicy:
//                 "Refunds are processed to the original payment method within 5–10 business days.",
//         });
//         console.log("[SEED] ✅ Platform settings created");
//     }

//     const pmCount = await PaymentMethod.countDocuments({ user: admin._id });
//     if (pmCount === 0) {
//         await PaymentMethod.create([
//             {
//                 user: admin._id,
//                 type: AccountType.BANK_ACCOUNT,
//                 bankName: "Chase Bank",
//                 accountName: "CeleBook LTD",
//                 accountNumber: "**** 1234",
//                 routingNumber: "021000021",
//                 swiftCode: "CHASUS33",
//                 status: true,
//                 isDefault: true,
//                 processingTime: "1-3 business days",
//                 fee: 0,
//             },
//             {
//                 user: admin._id,
//                 type: AccountType.BANK_ACCOUNT,
//                 bankName: "First Bank",
//                 accountName: "CeleBook LTD",
//                 accountNumber: "**** 4421",
//                 routingNumber: "123456789",
//                 swiftCode: "FIRNUS44",
//                 status: true,
//                 isDefault: false,
//                 processingTime: "1-3 business days",
//                 fee: 0,
//             },
//             {
//                 user: admin._id,
//                 type: AccountType.CRYPTO_WALLET,
//                 cryptocurrency: "USDT",
//                 network: "TRC20",
//                 walletAddress: "TQ9Xv...M1k3",
//                 qrCode: "",
//                 status: true,
//                 isDefault: false,
//                 processingTime: "≈ 10-30 minutes",
//                 fee: 0,
//             },
//             {
//                 user: admin._id,
//                 type: AccountType.MOBILE_PAYMENT,
//                 provider: "M-Pesa",
//                 handle: "+254700000000",
//                 email: "billing@celebook.com",
//                 status: true,
//                 isDefault: false,
//                 processingTime: "Instant",
//                 fee: 0,
//             },
//         ]);

//         const currentDefault = await PaymentMethod.findOne({
//             user: admin._id,
//             isDefault: true,
//         });
//         if (currentDefault) {
//             await PaymentMethod.updateMany(
//                 { user: admin._id, _id: { $ne: currentDefault._id } },
//                 { $set: { isDefault: false } }
//             );
//         }
//         console.log("[SEED] ✅ Payment methods created");
//     }

//     const deliveryCount = await DeliveryOption.countDocuments();
//     if (deliveryCount === 0) {
//         await DeliveryOption.create([
//             {
//                 name: "Standard",
//                 price: 0,
//                 deliveryTime: "3–5 business days",
//                 description: "Reliable, affordable delivery for non-urgent items.",
//                 isActive: true,
//             },
//             {
//                 name: "Express",
//                 price: 10,
//                 deliveryTime: "1–2 business days",
//                 description:
//                     "Faster delivery option for time-sensitive bookings or items.",
//                 isActive: true,
//             },
//             {
//                 name: "Same-Day (City)",
//                 price: 20,
//                 deliveryTime: "Same day (order by 12:00)",
//                 description:
//                     "Available in select cities. Orders placed before noon qualify.",
//                 isActive: true,
//             },
//             {
//                 name: "VIP Hand-Delivery",
//                 price: 50,
//                 deliveryTime: "Scheduled window",
//                 description:
//                     "White-glove delivery with a scheduled time window and direct handoff.",
//                 isActive: true,
//             },
//         ]);
//         console.log("[SEED] ✅ Delivery options created");
//     }

//     const plans = await MembershipPlan.find({});
//     if (plans.length === 0) {
//         await MembershipPlan.create([
//             {
//                 name: "Basic",
//                 price: 0,
//                 period: BillingPeriod.MONTH,
//                 durationDays: 30,
//                 description: "Start exploring with essential features.",
//                 icon: "ri-seedling-line",
//                 color: "#8E9AAF",
//                 popular: false,
//                 features: ["Browse events", "Standard booking experience", "Email support"],
//                 limitations: ["No priority support", "Standard fees apply"],
//                 isActive: true,
//             },
//             {
//                 name: "Pro",
//                 price: 9.99,
//                 period: BillingPeriod.MONTH,
//                 durationDays: 30,
//                 description: "Power-up with discounts & faster service.",
//                 icon: "ri-rocket-line",
//                 color: "#6C63FF",
//                 popular: true,
//                 features: [
//                     "Booking fee discount",
//                     "Priority support",
//                     "Early access to select events",
//                 ],
//                 limitations: ["Limited VIP perks"],
//                 isActive: true,
//             },
//             {
//                 name: "Business",
//                 price: 199,
//                 period: BillingPeriod.YEAR,
//                 durationDays: 365,
//                 description: "For teams and heavy users with best pricing.",
//                 icon: "ri-briefcase-line",
//                 color: "#00B894",
//                 popular: false,
//                 features: [
//                     "Lowest booking fees",
//                     "Dedicated success manager",
//                     "Custom invoicing",
//                 ],
//                 limitations: [],
//                 isActive: true,
//             },
//         ]);
//         console.log("[SEED] ✅ Membership plans created");
//     }

//     console.log("[SEED] 🎉 Seeding completed.");
// }


const NKOTB_VEGAS_LOCATION =
    "Dolby Live at Park MGM, Las Vegas, NV, USA";

const NKOTB_COMMON_TAGS = [
    "NKOTB",
    "New Kids On The Block",
    "The Right Stuff",
    "Las Vegas Residency",
    "Dolby Live",
    "Park MGM",
    "Pop",
    "Boy Band",
];

type NkotbEventConfig = {
    date: string;      // YYYY-MM-DD
    label: string;     // human readable date
    basePrice: number; // lowest starting price
};

// const NKOTB_VEGAS_EVENTS: NkotbEventConfig[] = [
//     { date: "2026-02-14", label: "February 14, 2026", basePrice: 124 },
//     { date: "2026-02-15", label: "February 15, 2026", basePrice: 106 },
//     { date: "2026-02-18", label: "February 18, 2026", basePrice: 134 },
//     { date: "2026-02-20", label: "February 20, 2026", basePrice: 116 },
//     { date: "2026-02-21", label: "February 21, 2026", basePrice: 106 },
//     { date: "2026-02-25", label: "February 25, 2026", basePrice: 89 },
//     { date: "2026-02-27", label: "February 27, 2026", basePrice: 113 },
//     { date: "2026-02-28", label: "February 28, 2026", basePrice: 119 },
//     { date: "2026-06-19", label: "June 19, 2026", basePrice: 131 },
//     { date: "2026-06-20", label: "June 20, 2026", basePrice: 131 },
// ];

const NKOTB_VEGAS_EVENTS: NkotbEventConfig[] = [
  // 2025 – November block
  { date: "2025-11-01", label: "November 1, 2025", basePrice: 105 },
  { date: "2025-11-02", label: "November 2, 2025", basePrice: 99 },
  { date: "2025-11-05", label: "November 5, 2025", basePrice: 99 },
  { date: "2025-11-07", label: "November 7, 2025", basePrice: 115 },
  { date: "2025-11-08", label: "November 8, 2025", basePrice: 115 },
  { date: "2025-11-12", label: "November 12, 2025", basePrice: 102 },
  { date: "2025-11-14", label: "November 14, 2025", basePrice: 120 },
  { date: "2025-11-15", label: "November 15, 2025", basePrice: 120 },

  // 2026 – June & July block (completed)
  { date: "2026-06-24", label: "June 24, 2026", basePrice: 130 },
  { date: "2026-06-26", label: "June 26, 2026", basePrice: 130 },
  { date: "2026-06-27", label: "June 27, 2026", basePrice: 131 },
  { date: "2026-07-01", label: "July 1, 2026", basePrice: 130 },
  { date: "2026-07-03", label: "July 3, 2026", basePrice: 131 },
  { date: "2026-07-04", label: "July 4, 2026", basePrice: 130 },

  // 2026 – October extension block (through Oct 17, 2026)
  { date: "2026-10-02", label: "October 2, 2026", basePrice: 131 },
  { date: "2026-10-03", label: "October 3, 2026", basePrice: 130 },
  { date: "2026-10-07", label: "October 7, 2026", basePrice: 130 },
  { date: "2026-10-09", label: "October 9, 2026", basePrice: 130 },
  { date: "2026-10-10", label: "October 10, 2026", basePrice: 131 },
  { date: "2026-10-14", label: "October 14, 2026", basePrice: 130 },
  { date: "2026-10-16", label: "October 16, 2026", basePrice: 131 },
  { date: "2026-10-17", label: "October 17, 2026", basePrice: 131 },
];

function buildNkotbTicketTypes(basePrice: number) {
    const QTY_PER_TYPE = 10;

    return [
        {
            name: "300 Level – Row 20 (Back)",
            price: basePrice,
            description:
                "Upper level reserved seat with a standard rear view of the stage.",
            features: [
                "Upper level 300 section",
                "Row 20 seating",
                "Mobile entry ticket",
            ],
            total: QTY_PER_TYPE,
            popular: false,
        },
        {
            name: "300 Level – Row 15",
            price: basePrice + 10,
            description:
                "Upper level reserved seat, slightly closer with improved angle.",
            features: [
                "Upper level 300 section",
                "Row 15 seating",
                "Standard view of main stage",
            ],
            total: QTY_PER_TYPE,
            popular: false,
        },
        {
            name: "300 Level – Row 10 (Front)",
            price: basePrice + 20,
            description:
                "Front rows of upper level, better view over the crowd.",
            features: [
                "Upper level 300 section - front rows",
                "Row 10 seating",
                "Clear elevated view of stage",
            ],
            total: QTY_PER_TYPE,
            popular: true,
        },
        {
            name: "200 Level – Row 15 (Side View)",
            price: basePrice + 30,
            description:
                "Lower bowl side view with good sound and sightlines.",
            features: [
                "Lower bowl 200 section",
                "Row 15 seating",
                "Side view of stage",
            ],
            total: QTY_PER_TYPE,
            popular: false,
        },
        {
            name: "200 Level – Row 10",
            price: basePrice + 40,
            description:
                "Lower bowl reserved seat with balanced view and comfort.",
            features: [
                "Lower bowl 200 section",
                "Row 10 seating",
                "Reserved seat with clear view",
            ],
            total: QTY_PER_TYPE,
            popular: true,
        },
        {
            name: "200 Level – Row 5 (Front Bowl)",
            price: basePrice + 50,
            description:
                "Front of lower bowl, closer to main floor energy.",
            features: [
                "Lower bowl 200 section - front rows",
                "Row 5 seating",
                "Enhanced audio and visual experience",
            ],
            total: QTY_PER_TYPE,
            popular: true,
        },
        {
            name: "100 Level – Row 15",
            price: basePrice + 60,
            description:
                "Lower 100 level seating with a strong main stage view.",
            features: [
                "100 level lower bowl",
                "Row 15 seating",
                "Strong view of main stage",
            ],
            total: QTY_PER_TYPE,
            popular: false,
        },
        {
            name: "100 Level – Row 10",
            price: basePrice + 70,
            description:
                "Closer 100 level reserved seat, great balance of price and proximity.",
            features: [
                "100 level lower bowl",
                "Row 10 seating",
                "Great balance of price and view",
            ],
            total: QTY_PER_TYPE,
            popular: true,
        },
        {
            name: "100 Level – Row 5 (Front)",
            price: basePrice + 80,
            description:
                "Front rows of 100 level, very close to the action.",
            features: [
                "100 level front rows",
                "Row 5 seating",
                "Immersive view of performance",
            ],
            total: QTY_PER_TYPE,
            popular: true,
        },
        {
            name: "Floor – Row 10 (Standard Floor)",
            price: basePrice + 90,
            description:
                "Standard floor seating in the main bowl, close to the stage.",
            features: [
                "Floor seating",
                "Row 10 on floor",
                "High-energy crowd experience",
            ],
            total: QTY_PER_TYPE,
            popular: true,
        },
        // VIP tiers (5 types)
        {
            name: "Floor – Row 3 (Premium Center)",
            price: basePrice + 120,
            description:
                "Premium floor seat near center stage with elevated experience.",
            features: [
                "Premium floor seating",
                "Row 3 near center",
                "Early entry lane (subject to venue policies)",
            ],
            total: QTY_PER_TYPE,
            popular: true,
        },
        {
            name: "Floor – Row 1 (Front Row Center)",
            price: basePrice + 150,
            description:
                "Front row floor seat with the closest standard seating view.",
            features: [
                "Front row floor center",
                "Ultra-close view of NKOTB",
                "Collectible digital ticket",
            ],
            total: QTY_PER_TYPE,
            popular: true,
        },
        {
            name: "Banquette VIP – Row A",
            price: basePrice + 180,
            description:
                "Banquette VIP seating with lounge-style comfort and premium view.",
            features: [
                "Banquette VIP seating",
                "Lounge-style table service (where available)",
                "Access to designated VIP bar or server",
            ],
            total: QTY_PER_TYPE,
            popular: true,
        },
        {
            name: "Barstool VIP – Stage Bar",
            price: basePrice + 190,
            description:
                "Stage bar barstool VIP seating with excellent sightlines.",
            features: [
                "Barstool at stage bar",
                "High-top view of stage",
                "Access to VIP bar area (venue rules apply)",
            ],
            total: QTY_PER_TYPE,
            popular: true,
        },
        {
            name: "VIP Meet & Greet + Photo",
            price: basePrice + 210,
            description:
                "VIP upgrade including group photo opportunity and exclusive merch-style perks.",
            features: [
                "Group photo-style meet & greet",
                "Exclusive VIP credential/laminate",
                "Early merch shopping where available",
            ],
            total: QTY_PER_TYPE,
            popular: true,
        },
    ];
}

export default async function seedNkotbEvents() {
    const description =
        'New Kids On The Block bring their "The Right Stuff" Las Vegas residency to Dolby Live at Park MGM for an intimate, high-energy night of classic hits, deep cuts and fan-favorite moments inside a 5,200-seat theatre.';

    for (const config of NKOTB_VEGAS_EVENTS) {
        const title = `New Kids On The Block: The Right Stuff – Las Vegas Residency (${config.label})`;

        const existing = await Event.findOne({
            title,
            date: config.date,
            location: NKOTB_VEGAS_LOCATION,
        });

        if (existing) {
            console.log(
                `[SEED] ℹ️ NKOTB event already exists for ${config.label}, skipping`
            );
            continue;
        }

        await Event.create({
            title,
            category: "music",
            tags: NKOTB_COMMON_TAGS,
            basePrice: config.basePrice,
            description,
            location: NKOTB_VEGAS_LOCATION,
            date: config.date,
            time: "20:00", // 8:00 PM local showtime
            attendees: 0,
            ticketTypes: buildNkotbTicketTypes(config.basePrice),
            featured: true,
            trending: true,
            verified: true,
            isActive: true,
            // availability is omitted so your Event model default applies
        });

        console.log(
            `[SEED] ✅ Created NKOTB Las Vegas event for ${config.label}`
        );
    }
}