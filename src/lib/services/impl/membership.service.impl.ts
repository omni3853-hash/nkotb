import mongoose, { ClientSession } from "mongoose";
import { MembershipService } from "../membership.service";
import { IMembership, Membership } from "@/lib/models/membership.model";
import { MembershipPlan } from "@/lib/models/membershipPlan.model";
import { CreateMembershipDto, MembershipQueryDto, UpdateMembershipStatusDto, UpgradeMembershipDto } from "@/lib/dto/membership.dto";
import { BillingPeriod, MembershipStatus } from "@/lib/enums/membership.enums";
import { CustomError } from "@/lib/utils/customError.utils";
import { logAudit } from "@/lib/utils/auditLogger";
import NotificationServiceImpl from "@/lib/services/impl/notification.service.impl";
import { CreateNotificationDto } from "@/lib/dto/notification.dto";
import EmailServiceImpl from "@/lib/services/impl/email.service.impl";
import { User } from "@/lib/models/user.model";
import { PaymentMethod } from "@/lib/models/payment-method.model";
import TransactionServiceImpl from "@/lib/services/impl/transaction.service.impl";
import { TransactionPurpose } from "@/lib/enums/transaction.enum";

function computeExpiry(start: Date, period: BillingPeriod, durationDays?: number) {
    const d = new Date(start);
    if (period === BillingPeriod.MONTH) d.setMonth(d.getMonth() + 1);
    else if (period === BillingPeriod.YEAR) d.setFullYear(d.getFullYear() + 1);
    else if (period === BillingPeriod.CUSTOM) d.setDate(d.getDate() + (durationDays || 0));
    return d;
}

class MembershipServiceImpl implements MembershipService {
    private notif = new NotificationServiceImpl();
    private email = new EmailServiceImpl();
    private trx = new TransactionServiceImpl();

    /** Centralized helper: set user.membership (with audit), inside same session */
    private async setUserMembership(
        userId: string,
        membershipId: string | null,
        session: ClientSession,
        reason: string
    ) {
        await User.updateOne(
            { _id: userId },
            { $set: { membership: membershipId ?? null } },
            { session }
        );

        await logAudit({
            user: userId,
            action: "UPDATE",
            resource: "USER",
            resourceId: userId,
            description: `Updated user.membership -> ${membershipId ?? "null"} (${reason})`,
        });
    }

    /* ---------------------- USER: CREATE MEMBERSHIP ---------------------- */
    async create(userId: string, dto: CreateMembershipDto): Promise<IMembership> {
        const session = await mongoose.startSession();
        try {
            return await session.withTransaction(async () => {
                const user = await User.findById(userId).session(session);
                if (!user) throw new CustomError(404, "User not found");

                const plan = await MembershipPlan.findById(dto.planId).session(session);
                if (!plan || !plan.isActive) throw new CustomError(400, "Plan not available");

                let pm = null;
                if (dto.paymentMethodId) {
                    pm = await PaymentMethod.findById(dto.paymentMethodId).session(session);
                    if (!pm) throw new CustomError(404, "Payment method not found");
                    if (!pm.status) throw new CustomError(400, "Payment method is inactive");
                }

                const amount = Number(dto.amount ?? plan.price);
                if (!Number.isFinite(amount) || amount <= 0) {
                    throw new CustomError(400, "Invalid membership amount");
                }

                // 0) Charge wallet atomically
                await this.trx.debit(
                    user._id.toString(),
                    amount,
                    TransactionPurpose.MEMBERSHIP_PAYMENT,
                    `Membership purchase: ${plan.name}`,
                    null,
                    { planId: plan._id.toString(), period: plan.period, durationDays: plan.durationDays },
                    session
                );

                const startedAt = new Date();
                const expiresAt = computeExpiry(startedAt, plan.period, plan.durationDays);

                const membership = new Membership({
                    user: user._id,
                    planId: plan._id,
                    planSnapshot: {
                        name: plan.name,
                        price: amount,
                        period: plan.period,
                        durationDays: plan.durationDays,
                        features: plan.features,
                        limitations: plan.limitations,
                    },
                    payment: {
                        paymentMethod: pm?._id,
                        proofOfPayment: dto.proofOfPayment,
                        amount,
                    },
                    autoRenew: !!dto.autoRenew,
                    status: MembershipStatus.PENDING, // pending verification
                    startedAt,
                    expiresAt,
                });

                await membership.save({ session });

                await this.setUserMembership(
                    user._id.toString(),
                    membership._id.toString(),
                    session,
                    "create() -> newest purchase (PENDING)"
                );

                await logAudit({
                    user: userId,
                    action: "CREATE",
                    resource: "MEMBERSHIP",
                    resourceId: membership._id.toString(),
                    description: `Created membership for plan ${plan.name}, status PENDING (₦${amount.toFixed(2)} debited)`,
                });

                await this.notif.create(new CreateNotificationDto({
                    user: user._id.toString(),
                    type: "MEMBERSHIP",
                    title: "Membership purchase submitted",
                    message: `₦${amount.toFixed(2)} deducted. Your membership for ${plan.name} is pending verification.`,
                }));

                await this.email.sendMembershipPurchaseReceived?.(
                    user.email,
                    `${user.firstName} ${user.lastName}`,
                    plan.name
                );

                return membership;
            }, { readConcern: { level: "snapshot" }, writeConcern: { w: "majority" } });
        } finally {
            await session.endSession();
        }
    }

    /* ---------------------- USER: UPGRADE MEMBERSHIP --------------------- */
    async upgrade(userId: string, dto: UpgradeMembershipDto): Promise<IMembership> {
        const session = await mongoose.startSession();
        try {
            return await session.withTransaction(async () => {
                const user = await User.findById(userId).session(session);
                if (!user) throw new CustomError(404, "User not found");

                const current = await Membership.findById(dto.currentMembershipId).session(session);
                if (!current || String(current.user) !== String(userId)) throw new CustomError(404, "Membership not found");
                if (current.status !== MembershipStatus.ACTIVE && current.status !== MembershipStatus.PENDING)
                    throw new CustomError(400, "Only active/pending memberships can be upgraded");

                const newPlan = await MembershipPlan.findById(dto.newPlanId).session(session);
                if (!newPlan || !newPlan.isActive) throw new CustomError(400, "New plan unavailable");

                let pm = null;
                if (dto.paymentMethodId) {
                    pm = await PaymentMethod.findById(dto.paymentMethodId).session(session);
                    if (!pm) throw new CustomError(404, "Payment method not found");
                    if (!pm.status) throw new CustomError(400, "Payment method is inactive");
                }

                const amount = Number(dto.amount ?? newPlan.price);
                if (!Number.isFinite(amount) || amount <= 0) {
                    throw new CustomError(400, "Invalid upgrade amount");
                }

                // 0) Charge wallet atomically for upgrade
                await this.trx.debit(
                    user._id.toString(),
                    amount,
                    TransactionPurpose.MEMBERSHIP_UPGRADE,
                    `Membership upgrade -> ${newPlan.name}`,
                    null,
                    { from: current.planSnapshot.name, to: newPlan.name, newPlanId: newPlan._id.toString() },
                    session
                );

                // Close current and open a new PENDING one
                current.status = MembershipStatus.CANCELED;
                current.canceledAt = new Date();
                await current.save({ session });

                const now = new Date();
                const expiresAt = computeExpiry(now, newPlan.period, newPlan.durationDays);

                const upgraded = new Membership({
                    user: user._id,
                    planId: newPlan._id,
                    planSnapshot: {
                        name: newPlan.name,
                        price: amount,
                        period: newPlan.period,
                        durationDays: newPlan.durationDays,
                        features: newPlan.features,
                        limitations: newPlan.limitations,
                    },
                    payment: {
                        paymentMethod: pm?._id,
                        proofOfPayment: dto.proofOfPayment,
                        amount,
                    },
                    autoRenew: current.autoRenew,
                    status: MembershipStatus.PENDING,
                    startedAt: now,
                    expiresAt,
                });
                await upgraded.save({ session });

                await this.setUserMembership(
                    user._id.toString(),
                    upgraded._id.toString(),
                    session,
                    "upgrade() -> pending upgraded membership"
                );

                await logAudit({
                    user: userId,
                    action: "UPDATE",
                    resource: "MEMBERSHIP",
                    resourceId: upgraded._id.toString(),
                    description: `Upgraded membership to ${newPlan.name}, pending verification (₦${amount.toFixed(2)} debited)`,
                });

                await this.notif.create(new CreateNotificationDto({
                    user: user._id.toString(),
                    type: "MEMBERSHIP",
                    title: "Membership upgrade submitted",
                    message: `₦${amount.toFixed(2)} deducted. Your upgrade to ${newPlan.name} is pending verification.`,
                }));

                await this.email.sendMembershipUpgraded?.(
                    user.email,
                    `${user.firstName} ${user.lastName}`,
                    current.planSnapshot.name,
                    newPlan.name
                );

                return upgraded;
            }, { readConcern: { level: "snapshot" }, writeConcern: { w: "majority" } });
        } finally {
            await session.endSession();
        }
    }

    /* ---------------------------- USER: LIST/GET ------------------------- */
    async myMemberships(userId: string, query: MembershipQueryDto) {
        const { status, page = 1, limit = 10 } = query;
        const filter: any = { user: userId };
        if (status) filter.status = status;

        const skip = (page - 1) * limit;
        const [items, total] = await Promise.all([
            Membership.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
            Membership.countDocuments(filter),
        ]);
        return { items, total, page, limit };
    }

    async getMyMembershipById(userId: string, id: string): Promise<IMembership> {
        const m = await Membership.findById(id);
        if (!m || String(m.user) !== String(userId)) throw new CustomError(404, "Membership not found");
        return m;
    }

    async cancelAutoRenew(userId: string, id: string): Promise<IMembership> {
        const m = await Membership.findById(id);
        if (!m || String(m.user) !== String(userId)) throw new CustomError(404, "Membership not found");
        m.autoRenew = false;
        await m.save();

        await logAudit({ user: userId, action: "UPDATE", resource: "MEMBERSHIP", resourceId: id, description: "Disabled auto-renew" });
        await this.notif.create(new CreateNotificationDto({ user: userId, type: "MEMBERSHIP", title: "Auto-renew disabled", message: `Auto-renew has been turned off for ${m.planSnapshot.name}.` }));

        return m;
    }

    /* ---------------------------- ADMIN: LIST/GET ------------------------ */
    async adminList(query: MembershipQueryDto) {
        const { status, page = 1, limit = 10 } = query;
        const filter: any = {};
        if (status) filter.status = status;

        const skip = (page - 1) * limit;
        const [items, total] = await Promise.all([
            Membership.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit)
                .populate("user", "firstName lastName email")
                .populate("payment.paymentMethod", "type"),
            Membership.countDocuments(filter),
        ]);

        return { items, total, page, limit };
    }

    async adminGetById(id: string): Promise<IMembership> {
        const m = await Membership.findById(id)
            .populate("user", "firstName lastName email")
            .populate("payment.paymentMethod", "type");
        if (!m) throw new CustomError(404, "Membership not found");
        return m;
    }

    /* ------------------------- ADMIN: UPDATE STATUS ---------------------- */
    async adminUpdateStatus(adminId: string, id: string, dto: UpdateMembershipStatusDto): Promise<IMembership> {
        const session = await mongoose.startSession();
        try {
            return await session.withTransaction(async () => {
                const m = await Membership.findById(id).populate("user", "firstName lastName email").session(session);
                if (!m) throw new CustomError(404, "Membership not found");

                const oldStatus = m.status;
                m.status = dto.status;

                const now = new Date();
                if (dto.status === MembershipStatus.ACTIVE && oldStatus !== MembershipStatus.ACTIVE) {
                    m.startedAt = now;
                    const { period, durationDays } = m.planSnapshot;
                    m.expiresAt = computeExpiry(now, period, durationDays);
                }
                if (dto.status === MembershipStatus.CANCELED) m.canceledAt = now;
                if (dto.status === MembershipStatus.SUSPENDED) {
                    m.suspendedAt = now;
                    m.suspensionReason = dto.reason;
                }

                await m.save({ session });

                const userId = (m.user as any)._id.toString();

                if (m.status === MembershipStatus.ACTIVE) {
                    await this.setUserMembership(userId, m._id.toString(), session, "adminUpdateStatus() -> activated");
                } else if (
                    m.status === MembershipStatus.CANCELED ||
                    m.status === MembershipStatus.SUSPENDED ||
                    m.status === MembershipStatus.EXPIRED
                ) {
                    const userDoc = await User.findById(userId).session(session);
                    if (userDoc?.membership && String(userDoc.membership) === String(m._id)) {
                        const fallback = await Membership.findOne({ user: userId, status: MembershipStatus.ACTIVE })
                            .sort({ startedAt: -1 })
                            .session(session);
                        await this.setUserMembership(
                            userId,
                            fallback ? fallback._id.toString() : null,
                            session,
                            `adminUpdateStatus() -> ${m.status} (fallback ${fallback ? "found" : "none"})`
                        );
                    }
                }

                await logAudit({
                    user: adminId,
                    action: "UPDATE",
                    resource: "MEMBERSHIP",
                    resourceId: id,
                    description: `Status ${oldStatus} -> ${dto.status}${dto.reason ? " (" + dto.reason + ")" : ""}`,
                });

                await this.notif.create(new CreateNotificationDto({
                    user: userId,
                    type: "MEMBERSHIP",
                    title: "Membership status updated",
                    message: `Your membership for ${m.planSnapshot.name} is now ${m.status}.`,
                }));

                const u = m.user as any;
                await this.email.sendMembershipStatusChanged?.(u.email, `${u.firstName} ${u.lastName}`, m.planSnapshot.name, oldStatus, m.status);

                return m;
            }, { readConcern: { level: "snapshot" }, writeConcern: { w: "majority" } });
        } finally {
            await session.endSession();
        }
    }
}

export default MembershipServiceImpl;
