"use client";

import { IUser } from "@/lib/models/user.model";
import { api } from "./axios";
import { LoginFormData, LoginSchema, RequestOtpFormData, RequestOtpSchema, RequestResetFormData, RequestResetSchema, ResetPasswordFormData, ResetPasswordSchema, SignupFormData, SignupSchema, VerifyOtpFormData, VerifyOtpSchema, VerifyPasswordFormData, VerifyPasswordSchema } from "@/utils/schemas/schemas";

type LoginResponse = {
    user: IUser;
    message: string;
    nextStep: "verify-email" | "verify-login-otp";
    requiresEmailVerification?: boolean;
    otpExpiresIn?: number;
};
type SignupResponse = { user: IUser; requiresEmailVerification: boolean };
type VerifyResponse = { token: string; user: IUser };

const dataOf = <T,>(res: any) => (res?.data as T) ?? res?.data?.message ?? res?.data;

export const AuthApi = {
    async login(dto: LoginFormData): Promise<LoginResponse> {
        const parsed = LoginSchema.parse(dto);
        const res = await api.post("/auth/login", parsed);
        return dataOf<LoginResponse>(res);
    },
    async signup(dto: SignupFormData): Promise<SignupResponse> {
        const parsed = SignupSchema.parse(dto);
        const res = await api.post("/auth/signup", parsed);
        return dataOf<SignupResponse>(res);
    },
    async verifyEmail(dto: VerifyOtpFormData): Promise<VerifyResponse> {
        const parsed = VerifyOtpSchema.parse({ ...dto, type: "verify-email" as const });
        const res = await api.post("/auth/verify-email", parsed);
        return dataOf<VerifyResponse>(res);
    },
    async sendOtp(dto: RequestOtpFormData): Promise<void> {
        const parsed = RequestOtpSchema.parse(dto);
        const res = await api.post("/auth/otp/send", parsed);
        return dataOf<void>(res);
    },
    async verifyLoginOtp(dto: VerifyOtpFormData): Promise<VerifyResponse> {
        const parsed = VerifyOtpSchema.parse({ ...dto, type: "login" as const });
        const res = await api.post("/auth/otp/verify", parsed);
        return dataOf<VerifyResponse>(res);
    },
    async requestPasswordReset(dto: RequestResetFormData): Promise<void> {
        const parsed = RequestResetSchema.parse(dto);
        const res = await api.post("/auth/password/request-reset", parsed);
        return dataOf<void>(res);
    },
    async resetPassword(dto: ResetPasswordFormData): Promise<void> {
        const parsed = ResetPasswordSchema.parse(dto);
        const res = await api.post("/auth/password/reset", parsed);
        return dataOf<void>(res);
    },
    async verifyCurrentPassword(dto: VerifyPasswordFormData): Promise<{ ok: boolean }> {
        const parsed = VerifyPasswordSchema.parse(dto);
        const res = await api.post("/auth/password/verify-current", parsed);
        return dataOf<{ ok: boolean }>(res);
    },
};