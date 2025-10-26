// src/lib/services/impl/deposit.service.impl.ts
import mongoose from "mongoose";
import { Deposit, IDeposit, IDepositPopulated } from "@/lib/models/deposit.model";
import { User } from "@/lib/models/user.model";
import { DepositStatus } from "@/lib/enums/deposit.enums";
import { CreateDepositDto, AdminCreateDepositDto, DepositQueryDto, UpdateDepositStatusDto } from "@/lib/dto/deposit.dto";
import { CustomError } from "@/lib/utils/customError.utils";
import { logAudit } from "@/lib/utils/auditLogger";
import { TransactionPurpose } from "@/lib/enums/transaction.enum";
import TransactionServiceImpl from "@/lib/services/impl/transaction.service.impl";
import EmailServiceImpl from "@/lib/services/impl/email.service.impl";
import { depositPopulate } from "@/lib/services/helpers/deposit.populate";
import { getPopulatedDepositById } from "../helpers/deposit.get-populated";

export default class DepositServiceImpl {
    private tx = new TransactionServiceImpl();
    private email = new EmailServiceImpl();

    /* ----------------------------- USER CREATE ----------------------------- */
    async create(userId: string, dto: CreateDepositDto): Promise<IDepositPopulated> {
        const session = await mongoose.startSession();
        try {
            const result = await session.withTransaction(async () => {
                const user = await User.findById(userId).session(session);
                if (!user) throw new CustomError(404, "User not found");

                const created = await Deposit.create(
                    [
                        {
                            user: user._id,
                            amount: dto.amount,
                            payment: {
                                paymentMethod: dto.paymentMethodId ? new mongoose.Types.ObjectId(dto.paymentMethodId) : undefined,
                                proofOfPayment: dto.proofOfPayment,
                                amount: dto.amount,
                            },
                            status: DepositStatus.PENDING,
                            notes: dto.notes,
                        },
                    ],
                    { session }
                );

                const deposit = created[0];

                await logAudit({
                    user: userId,
                    action: "CREATE",
                    resource: "DEPOSIT",
                    resourceId: deposit._id.toString(),
                    description: `User submitted deposit of ${dto.amount}`,
                });

                await this.email.sendDepositReceived?.(
                    user.email,
                    user.firstName || user.email,
                    dto.amount,
                    deposit._id.toString()
                );

                // populate before returning
                await deposit.populate(depositPopulate);
                const populated = await getPopulatedDepositById(deposit._id, session);
                if (!populated) throw new CustomError(500, "Failed to load populated deposit");
                return populated;
            }, { readConcern: { level: "snapshot" }, writeConcern: { w: "majority" } });

            return result!;
        } finally {
            await session.endSession();
        }
    }

    async listMine(userId: string, query: DepositQueryDto) {
        const { status, page = 1, limit = 10 } = query;
        const filter: any = { user: userId };
        if (status) filter.status = status;

        const skip = (page - 1) * limit;

        const [items, total] = await Promise.all([
            Deposit.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate(depositPopulate)
                .lean<IDepositPopulated[]>(),
            Deposit.countDocuments(filter),
        ]);

        return { items, total, page, limit };
    }

    async getMineById(userId: string, id: string): Promise<IDepositPopulated> {
        const dep = await Deposit.findOne({ _id: id, user: userId }).populate(depositPopulate).lean<IDepositPopulated>();
        if (!dep) throw new CustomError(404, "Deposit not found");
        return dep;
    }

    /* ----------------------------- ADMIN CREATE ---------------------------- */
    async adminCreate(adminId: string, dto: AdminCreateDepositDto): Promise<IDepositPopulated> {
        const session = await mongoose.startSession();
        try {
            const result = await session.withTransaction(async () => {
                const user = await User.findById(dto.userId).session(session);
                if (!user) throw new CustomError(404, "User not found");

                const created = await Deposit.create(
                    [
                        {
                            user: user._id,
                            amount: dto.amount,
                            payment: {
                                paymentMethod: dto.paymentMethodId ? new mongoose.Types.ObjectId(dto.paymentMethodId) : undefined,
                                proofOfPayment: dto.proofOfPayment,
                                amount: dto.amount,
                            },
                            status: dto.status ?? DepositStatus.PENDING,
                            notes: dto.notes,
                            processedBy: new mongoose.Types.ObjectId(adminId),
                            processedAt: new Date(),
                        },
                    ],
                    { session }
                );

                const deposit = created[0];

                await logAudit({
                    user: adminId,
                    action: "CREATE",
                    resource: "DEPOSIT",
                    resourceId: deposit._id.toString(),
                    description: `Admin created deposit of ${dto.amount} for user ${user.email} (status=${deposit.status})`,
                });

                if (deposit.status === DepositStatus.COMPLETED && !deposit.creditedAt) {
                    await this.tx.credit(
                        user._id.toString(),
                        deposit.amount,
                        TransactionPurpose.TOPUP,
                        "Admin-created deposit",
                        deposit._id.toString(),
                        {
                            paymentMethodId: dto.paymentMethodId || null,
                            createdBy: adminId,
                        },
                        session
                    );

                    deposit.creditedAt = new Date();
                    await deposit.save({ session });

                    await this.email.sendDepositApproved?.(
                        user.email,
                        user.firstName || user.email,
                        deposit.amount,
                        deposit._id.toString()
                    );
                } else if (deposit.status === DepositStatus.PENDING) {
                    await this.email.sendDepositQueuedForReview?.(
                        user.email,
                        user.firstName || user.email,
                        deposit.amount,
                        deposit._id.toString()
                    );
                } else if (deposit.status === DepositStatus.FAILED) {
                    await this.email.sendDepositFailed?.(
                        user.email,
                        user.firstName || user.email,
                        deposit.amount,
                        deposit._id.toString(),
                        dto.notes || "Deposit was marked as failed."
                    );
                }

                await deposit.populate(depositPopulate);
                const populated = await getPopulatedDepositById(deposit._id, session);
                if (!populated) throw new CustomError(500, "Failed to load populated deposit");
                return populated;
            }, { readConcern: { level: "snapshot" }, writeConcern: { w: "majority" } });

            return result!;
        } finally {
            await session.endSession();
        }
    }

    async adminList(query: DepositQueryDto) {
        const { status, page = 1, limit = 10 } = query;
        const filter: any = {};
        if (status) filter.status = status;

        const skip = (page - 1) * limit;

        const [items, total] = await Promise.all([
            Deposit.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate(depositPopulate)
                .lean<IDepositPopulated[]>(),
            Deposit.countDocuments(filter),
        ]);

        return { items, total, page, limit };
    }

    async adminGetById(id: string): Promise<IDepositPopulated> {
        const dep = await Deposit.findById(id).populate(depositPopulate).lean<IDepositPopulated>();
        if (!dep) throw new CustomError(404, "Deposit not found");
        return dep;
    }

    /* --------------------------- ADMIN UPDATE STATUS ----------------------- */
    async adminUpdateStatus(adminId: string, id: string, dto: UpdateDepositStatusDto): Promise<IDepositPopulated> {
        const session = await mongoose.startSession();
        try {
            const result = await session.withTransaction(async () => {
                const deposit = await Deposit.findById(id).session(session);
                if (!deposit) throw new CustomError(404, "Deposit not found");

                // If already completed & credited, idempotent: just return populated doc
                if (deposit.status === DepositStatus.COMPLETED && dto.status === DepositStatus.COMPLETED) {
                    await deposit.populate(depositPopulate);
                    const populated = await getPopulatedDepositById(deposit._id, session);
                    if (!populated) throw new CustomError(500, "Failed to load populated deposit");
                    return populated;
                }

                const user = await User.findById(deposit.user).session(session);
                if (!user) throw new CustomError(404, "User not found");

                deposit.status = dto.status;
                deposit.processedBy = new mongoose.Types.ObjectId(adminId);
                deposit.processedAt = new Date();
                if (dto.reason) deposit.notes = [deposit.notes, dto.reason].filter(Boolean).join(" | ");

                if (dto.status === DepositStatus.COMPLETED) {
                    if (!deposit.creditedAt) {
                        await this.tx.credit(
                            user._id.toString(),
                            deposit.amount,
                            TransactionPurpose.TOPUP,
                            "Deposit approved",
                            deposit._id.toString(),
                            {
                                paymentMethodId: deposit.payment?.paymentMethod?.toString() || null,
                                approvedBy: adminId,
                            },
                            session
                        );
                        deposit.creditedAt = new Date();
                    }

                    await this.email.sendDepositApproved?.(
                        user.email,
                        user.firstName || user.email,
                        deposit.amount,
                        deposit._id.toString()
                    );
                } else if (dto.status === DepositStatus.FAILED) {
                    await this.email.sendDepositFailed?.(
                        user.email,
                        user.firstName || user.email,
                        deposit.amount,
                        deposit._id.toString(),
                        dto.reason || "Deposit failed."
                    );
                }

                await deposit.save({ session });

                await logAudit({
                    user: adminId,
                    action: "UPDATE",
                    resource: "DEPOSIT",
                    resourceId: deposit._id.toString(),
                    description: `Updated deposit status to ${deposit.status}`,
                });

                await deposit.populate(depositPopulate);
                const populated = await getPopulatedDepositById(deposit._id, session);
                if (!populated) throw new CustomError(500, "Failed to load populated deposit");
                return populated;
            }, { readConcern: { level: "snapshot" }, writeConcern: { w: "majority" } });

            return result!;
        } finally {
            await session.endSession();
        }
    }

    async adminDelete(adminId: string, id: string): Promise<void> {
        const dep = await Deposit.findById(id);
        if (!dep) throw new CustomError(404, "Deposit not found");
        await dep.deleteOne();

        await logAudit({
            user: adminId,
            action: "DELETE",
            resource: "DEPOSIT",
            resourceId: id,
            description: `Deleted deposit ${id}`,
        });
    }
}
