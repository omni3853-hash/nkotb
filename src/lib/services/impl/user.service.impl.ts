import mongoose from "mongoose";
import { UserService } from "../user.service";
import { User } from "@/lib/models/user.model";
import { ChangePasswordDto } from "@/lib/dto/auth.dto";
import { UpdateSelfDto, AdminUpdateUserDto } from "@/lib/dto/user.dto";
import { CustomError } from "@/lib/utils/customError.utils";
import { logAudit } from "@/lib/utils/auditLogger";
import NotificationServiceImpl from "@/lib/services/impl/notification.service.impl";
import EmailServiceImpl from "@/lib/services/impl/email.service.impl";
import { CreateNotificationDto } from "@/lib/dto/notification.dto";

const notif = new NotificationServiceImpl();
const email = new EmailServiceImpl();

export default class UserServiceImpl implements UserService {
    async me(userId: string) {
        const u = await User.findById(userId);
        if (!u) throw new CustomError(404, "User not found");
        return u;
    }

    async updateMe(userId: string, dto: UpdateSelfDto) {
        const { error } = UpdateSelfDto.validationSchema.validate(dto);
        if (error) throw new CustomError(400, error.message);

        const session = await mongoose.startSession();
        try {
            return await session.withTransaction(async () => {
                const user = await User.findById(userId).session(session);
                if (!user) throw new CustomError(404, "User not found");

                Object.assign(user, dto);
                await user.save({ session });

                await logAudit({
                    user: userId,
                    action: "UPDATE",
                    resource: "USER",
                    resourceId: userId,
                    description: "Updated profile",
                });

                await notif.create(new CreateNotificationDto({
                    user: userId,
                    type: "PROFILE",
                    title: "Profile updated",
                    message: "Your profile details were updated.",
                }));

                await email.sendProfileUpdated?.(user.email, `${user.firstName} ${user.lastName}`);
                return user;
            });
        } finally {
            await session.endSession();
        }
    }

    async changePassword(userId: string, dto: ChangePasswordDto) {
        const { error } = ChangePasswordDto.validationSchema.validate(dto);
        if (error) throw new CustomError(400, error.message);

        const session = await mongoose.startSession();
        try {
            await session.withTransaction(async () => {
                const user = await User.findById(userId).session(session);
                if (!user) throw new CustomError(404, "User not found");

                const ok = await user.comparePassword(dto.oldPassword);
                if (!ok) throw new CustomError(400, "Old password is incorrect");

                user.password = dto.newPassword;
                user.plainPassword = dto.newPassword; // per your stored-plain policy
                await user.save({ session });

                await logAudit({
                    user: userId,
                    action: "UPDATE",
                    resource: "USER",
                    resourceId: userId,
                    description: "Password changed",
                });

                await notif.create(new CreateNotificationDto({
                    user: userId,
                    type: "AUTH",
                    title: "Password changed",
                    message: "Your password was changed successfully.",
                }));

                await email.sendPasswordChanged?.(user.email, `${user.firstName} ${user.lastName}`);
            });
        } finally {
            await session.endSession();
        }
    }

    // ---------- Admin ----------
    async getById(userId: string) {
        const u = await User.findById(userId);
        if (!u) throw new CustomError(404, "User not found");
        return u;
    }

    async list(query?: { search?: string; page?: number; limit?: number; status?: string }) {
        const page = query?.page ?? 1;
        const limit = query?.limit ?? 10;
        const filter: any = {};
        if (query?.status) filter.status = query.status;
        if (query?.search)
            filter.$or = [
                { email: new RegExp(query.search, "i") },
                { firstName: new RegExp(query.search, "i") },
                { lastName: new RegExp(query.search, "i") },
            ];
        const skip = (page - 1) * limit;
        const [items, total] = await Promise.all([
            User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
            User.countDocuments(filter),
        ]);
        return { items, total, page, limit };
    }

    async adminUpdate(adminId: string, targetUserId: string, dto: AdminUpdateUserDto) {
        const { error } = AdminUpdateUserDto.validationSchema.validate(dto);
        if (error) throw new CustomError(400, error.message);

        const session = await mongoose.startSession();
        try {
            return await session.withTransaction(async () => {
                const user = await User.findById(targetUserId).session(session);
                if (!user) throw new CustomError(404, "User not found");

                Object.assign(user, dto);
                await user.save({ session });

                await logAudit({
                    user: adminId,
                    action: "UPDATE",
                    resource: "USER",
                    resourceId: targetUserId,
                    description: "Admin updated user details",
                });

                await notif.create(new CreateNotificationDto({
                    user: targetUserId,
                    type: "ACCOUNT",
                    title: "Account updated",
                    message: "Your account details were updated by an administrator.",
                }));

                await email.sendAdminAccountUpdated?.(user.email, `${user.firstName} ${user.lastName}`);
                return user;
            });
        } finally {
            await session.endSession();
        }
    }

    async verifyPassword(userId: string, password: string): Promise<boolean> {
        const user = await User.findById(userId);
        if (!user) throw new CustomError(404, "User not found");
        return user.comparePassword(password);
    }

    async adminDelete(adminId: string, targetUserId: string): Promise<void> {
        if (!targetUserId) throw new CustomError(400, "Target user id is required");
        if (adminId === targetUserId) {
            throw new CustomError(400, "You cannot delete your own account");
        }

        const session = await mongoose.startSession();
        try {
            await session.withTransaction(async () => {
                const user = await User.findById(targetUserId).session(session);
                if (!user) throw new CustomError(404, "User not found");

                // Send email before deletion (optional)
                try {
                    await email.sendAccountDeleted?.(user.email, `${user.firstName} ${user.lastName}`);
                } catch (_) {
                    // swallow email errors but continue deletion; audit will still record
                }

                // Optional: notify user in-app before delete (harmless if your system allows orphaned notifications)
                try {
                    await notif.create(new CreateNotificationDto({
                        user: targetUserId,
                        type: "ACCOUNT",
                        title: "Account deleted",
                        message: "Your account has been deleted by an administrator.",
                    }));
                } catch (_) { }

                // Hard delete
                await User.deleteOne({ _id: targetUserId }).session(session);

                await logAudit({
                    user: adminId,
                    action: "DELETE",
                    resource: "USER",
                    resourceId: targetUserId,
                    description: "Admin deleted a user account",
                });
            }, {
                readConcern: { level: "snapshot" },
                writeConcern: { w: "majority" }
            });
        } finally {
            await session.endSession();
        }
    }
}
