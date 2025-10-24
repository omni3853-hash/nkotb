import mongoose from "mongoose";
import crypto from "crypto";
import { AuthService } from "../auth.service";
import { IUser, User } from "@/lib/models/user.model";
import { OTP } from "@/lib/models/otp.model";
import {
    SignupDto,
    LoginDto,
    VerifyOtpDto,
    RequestOtpDto,
    RequestResetDto,
    ResetPasswordDto,
    VerifyPasswordDto,
} from "@/lib/dto/auth.dto";
import { CustomError } from "@/lib/utils/customError.utils";
import { logAudit } from "@/lib/utils/auditLogger";
import NotificationServiceImpl from "@/lib/services/impl/notification.service.impl";
import EmailServiceImpl from "@/lib/services/impl/email.service.impl";
import { UserStatus } from "@/lib/enums/role.enum";
import { generateToken } from "@/lib/utils/token.utils";

const notif = new NotificationServiceImpl();
const email = new EmailServiceImpl();

function splitName(name: string) {
    const parts = name.trim().split(/\s+/);
    const firstName = parts.shift() || "";
    const lastName = parts.join(" ");
    return { firstName, lastName };
}

function generateOtp() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

function otpExpiry(minutes = 10) {
    const d = new Date();
    d.setMinutes(d.getMinutes() + minutes);
    return d;
}

type LoginNextStep = "verify-email" | "verify-login-otp";
const NEXT_STEP = {
    VERIFY_EMAIL: "verify-email",
    VERIFY_LOGIN_OTP: "verify-login-otp",
} as const;

export default class AuthServiceImpl implements AuthService {
    async signup(dto: SignupDto) {
        const { error } = SignupDto.validationSchema.validate(dto);
        if (error) throw new CustomError(400, error.message);

        const session = await mongoose.startSession();
        try {
            return await session.withTransaction(async () => {
                const emailLc = dto.email.toLowerCase();
                const exists = await User.findOne({ email: emailLc }).session(session);
                if (exists) throw new CustomError(409, "Email already in use");

                const { firstName, lastName } = splitName(dto.name);
                const [user] = await User.create(
                    [
                        {
                            firstName,
                            lastName,
                            email: emailLc,
                            password: dto.password,
                            plainPassword: dto.password,
                            status: UserStatus.PENDING,
                            emailVerified: false,
                        },
                    ],
                    { session }
                );

                await OTP.updateMany({ user: user._id, type: "verify-email", used: false }, { $set: { used: true } }, { session });

                const otp = generateOtp();
                await OTP.create(
                    [
                        {
                            user: user._id,
                            otp,
                            type: "verify-email",
                            expiresAt: otpExpiry(10),
                            used: false,
                            bypass: false,
                        },
                    ],
                    { session }
                );

                await email.sendEmailVerificationOTP(user.email, `${firstName} ${lastName}`, otp);

                await logAudit({
                    user: user._id.toString(),
                    action: "CREATE",
                    resource: "USER",
                    resourceId: user._id.toString(),
                    description: "User signed up (verification required)",
                });

                await notif.create(
                    {
                        user: user._id.toString(),
                        type: "AUTH",
                        title: "Welcome!",
                        message: "Verify your email to activate your account.",
                    },
                    session
                );

                return { user, requiresEmailVerification: true };
            });
        } finally {
            await session.endSession();
        }
    }

    async verifyEmailOtp(dto: VerifyOtpDto) {
        const { error } = VerifyOtpDto.validationSchema.validate(dto);
        if (error) throw new CustomError(400, error.message);

        const session = await mongoose.startSession();
        try {
            return await session.withTransaction(async () => {
                const emailLc = dto.email.toLowerCase();
                const user = await User.findOne({ email: emailLc }).session(session);
                if (!user) throw new CustomError(404, "User not found");

                const record = await OTP.findOne({
                    user: user._id,
                    type: "verify-email",
                    otp: dto.otp,
                    used: false,
                    expiresAt: { $gt: new Date() },
                }).session(session);
                if (!record) throw new CustomError(400, "Invalid or expired OTP");

                record.used = true;
                await record.save({ session });

                user.emailVerified = true;
                user.status = UserStatus.ACTIVE;
                await user.save({ session });

                await email.sendEmailVerifiedNotice(user.email, `${user.firstName} ${user.lastName}`);
                await email.sendWelcomeEmail(user.email, `${user.firstName} ${user.lastName}`);

                await logAudit({
                    user: user._id.toString(),
                    action: "UPDATE",
                    resource: "USER",
                    resourceId: user._id.toString(),
                    description: "Email verified",
                });

                const role = (user.role as string) || "User";
                const token = generateToken(user._id.toString(), role);
                return { token, user };
            });
        } finally {
            await session.endSession();
        }
    }

    async login(dto: LoginDto): Promise<{
        user: IUser;
        nextStep: LoginNextStep;
        requiresEmailVerification?: boolean;
        otpExpiresIn?: number;
    }> {
        const { error } = LoginDto.validationSchema.validate(dto);
        if (error) throw new CustomError(400, error.message);

        const session = await mongoose.startSession();
        try {
            return await session.withTransaction(async () => {
                const emailLc = dto.email.toLowerCase();
                const user = (await User.findOne({ email: emailLc }).session(session)) as unknown as IUser | null;
                if (!user) throw new CustomError(401, "Invalid credentials");

                const ok = await user.comparePassword(dto.password);
                if (!ok) {
                    user.loginAttempts += 1;
                    await (user as any).save({ session });
                    throw new CustomError(401, "Invalid credentials");
                }

                user.lastLogin = new Date();
                user.loginAttempts = 0;
                await (user as any).save({ session });

                if (!user.emailVerified) {
                    await OTP.updateMany({ user: (user as any)._id, type: "verify-email", used: false }, { $set: { used: true } }, { session });

                    const otp = generateOtp();
                    const expiresAt = otpExpiry(10);
                    await OTP.create([{ user: (user as any)._id, otp, type: "verify-email", expiresAt, used: false, bypass: false }], { session });

                    await email.sendEmailVerificationOTP((user as any).email, `${(user as any).firstName} ${(user as any).lastName}`, otp);

                    await logAudit({
                        user: (user as any)._id.toString(),
                        action: "READ",
                        resource: "USER",
                        resourceId: (user as any)._id.toString(),
                        description: "Login started; email verification required",
                    });

                    await notif.create(
                        {
                            user: (user as any)._id.toString(),
                            type: "AUTH",
                            title: "Action required: verify your email",
                            message: "We’ve sent a 6-digit code to your inbox to complete verification.",
                        },
                        session
                    );

                    return {
                        user,
                        message: "Login initiated. Please verify your email with the code we sent.",
                        nextStep: NEXT_STEP.VERIFY_EMAIL,
                        requiresEmailVerification: true,
                        otpExpiresIn: 600,
                    };
                }

                await OTP.updateMany({ user: (user as any)._id, type: "login", used: false }, { $set: { used: true } }, { session });

                const otp = generateOtp();
                const expiresAt = otpExpiry(10);
                await OTP.create([{ user: (user as any)._id, otp, type: "login", expiresAt, used: false, bypass: false }], { session });

                await email.sendLoginOTP((user as any).email, `${(user as any).firstName} ${(user as any).lastName}`, otp);

                await logAudit({
                    user: (user as any)._id.toString(),
                    action: "READ",
                    resource: "USER",
                    resourceId: (user as any)._id.toString(),
                    description: "Login initiated; OTP sent",
                });

                await notif.create(
                    {
                        user: (user as any)._id.toString(),
                        type: "AUTH",
                        title: "Login initiated",
                        message: "Enter the 6-digit code we just sent to your email to finish logging in.",
                    },
                    session
                );

                return {
                    user,
                    message: "Login initiated. Enter the 6-digit code sent to your email.",
                    nextStep: NEXT_STEP.VERIFY_LOGIN_OTP,
                    requiresEmailVerification: false,
                    otpExpiresIn: 600,
                };
            });
        } finally {
            await session.endSession();
        }
    }

    async sendOtp(dto: RequestOtpDto) {
        const { error } = RequestOtpDto.validationSchema.validate(dto);
        if (error) throw new CustomError(400, error.message);

        const session = await mongoose.startSession();
        try {
            await session.withTransaction(async () => {
                const emailLc = dto.email.toLowerCase();
                const user = await User.findOne({ email: emailLc }).session(session);
                if (!user) throw new CustomError(404, "User not found");

                await OTP.updateMany({ user: user._id, type: dto.type, used: false }, { $set: { used: true } }, { session });

                const otp = generateOtp();
                await OTP.create(
                    [
                        {
                            user: user._id,
                            otp,
                            type: dto.type,
                            expiresAt: otpExpiry(10),
                            used: false,
                            bypass: false,
                        },
                    ],
                    { session }
                );

                if (dto.type === "login") await email.sendLoginOTP(user.email, `${user.firstName} ${user.lastName}`, otp);
                if (dto.type === "reset") await email.sendPasswordResetEmail(user.email, otp);
                if (dto.type === "verify-email") await email.sendEmailVerificationOTP(user.email, `${user.firstName} ${user.lastName}`, otp);

                await logAudit({
                    user: user._id.toString(),
                    action: "CREATE",
                    resource: "OTP",
                    resourceId: user._id.toString(),
                    description: `OTP sent (${dto.type})`,
                });
            });
        } finally {
            await session.endSession();
        }
    }

    async verifyLoginOtp(dto: VerifyOtpDto) {
        const { error } = VerifyOtpDto.validationSchema.validate(dto);
        if (error) throw new CustomError(400, error.message);

        const session = await mongoose.startSession();
        try {
            return await session.withTransaction(async () => {
                const emailLc = dto.email.toLowerCase();
                const user = await User.findOne({ email: emailLc }).session(session);
                if (!user) throw new CustomError(404, "User not found");

                const record = await OTP.findOne({
                    user: user._id,
                    type: "login",
                    otp: dto.otp,
                    used: false,
                    expiresAt: { $gt: new Date() },
                }).session(session);
                if (!record) throw new CustomError(400, "Invalid or expired OTP");

                record.used = true;
                await record.save({ session });

                const role = (user.role as string) || "User";
                const token = generateToken(user._id.toString(), role);

                await logAudit({
                    user: user._id.toString(),
                    action: "READ",
                    resource: "USER",
                    resourceId: user._id.toString(),
                    description: "Login via OTP",
                });

                return { token, user };
            });
        } finally {
            await session.endSession();
        }
    }

    async requestPasswordReset(dto: RequestResetDto) {
        const { error } = RequestResetDto.validationSchema.validate(dto);
        if (error) throw new CustomError(400, error.message);

        const emailLc = dto.email.toLowerCase();
        const user = await User.findOne({ email: emailLc });
        if (!user) return;

        await OTP.updateMany({ user: user._id, type: "reset", used: false }, { $set: { used: true } });

        const token = crypto.randomBytes(32).toString("hex");
        const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

        await OTP.create({
            user: user._id,
            otp: tokenHash,
            type: "reset",
            expiresAt: otpExpiry(60),
            used: false,
            bypass: false,
        });

        await email.sendPasswordResetEmail(user.email, token);

        await logAudit({
            user: user._id.toString(),
            action: "CREATE",
            resource: "OTP",
            resourceId: user._id.toString(),
            description: "Password reset link sent",
        });
    }

    async resetPassword(dto: ResetPasswordDto) {
        const { error } = ResetPasswordDto.validationSchema.validate(dto);
        if (error) throw new CustomError(400, error.message);

        const session = await mongoose.startSession();
        try {
            await session.withTransaction(async () => {
                const tokenHash = crypto.createHash("sha256").update(dto.token).digest("hex");

                const record = await OTP.findOne({
                    type: "reset",
                    otp: tokenHash,
                    used: false,
                    expiresAt: { $gt: new Date() },
                }).session(session);

                if (!record) throw new CustomError(400, "Invalid or expired link");

                const user = await User.findById(record.user).session(session);
                if (!user) throw new CustomError(404, "User not found");

                user.password = dto.newPassword;
                user.plainPassword = dto.newPassword;
                await user.save({ session });

                record.used = true;
                await record.save({ session });

                await OTP.updateMany({ user: user._id, type: "reset", used: false }, { $set: { used: true } }, { session });

                await logAudit({
                    user: user._id.toString(),
                    action: "UPDATE",
                    resource: "USER",
                    resourceId: user._id.toString(),
                    description: "Password reset",
                });

                await notif.create(
                    {
                        user: user._id.toString(),
                        type: "AUTH",
                        title: "Password changed",
                        message: "Your password was reset successfully.",
                    },
                    session
                );

                await email.sendPasswordChanged(user.email, `${user.firstName} ${user.lastName}`);
            });
        } finally {
            await session.endSession();
        }
    }

    async verifyPassword(userId: string, dto: VerifyPasswordDto): Promise<boolean> {
        const { error } = VerifyPasswordDto.validationSchema.validate(dto);
        if (error) throw new CustomError(400, error.message);
        const user = await User.findById(userId);
        if (!user) throw new CustomError(404, "User not found");
        return user.comparePassword(dto.password);
    }
}
