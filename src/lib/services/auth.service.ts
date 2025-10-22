import { IUser } from "@/lib/models/user.model";
import { LoginDto, SignupDto, VerifyOtpDto, RequestOtpDto, RequestResetDto, ResetPasswordDto, VerifyPasswordDto } from "@/lib/dto/auth.dto";

export interface AuthService {
    signup(dto: SignupDto): Promise<{ user: IUser; requiresEmailVerification: boolean }>;
    verifyEmailOtp(dto: VerifyOtpDto): Promise<{ token: string; user: IUser }>;
    login(dto: LoginDto): Promise<{
        user: IUser;
        nextStep: "verify-email" | "verify-login-otp";
        requiresEmailVerification?: boolean;
        otpExpiresIn?: number;
    }>;
    sendOtp(dto: RequestOtpDto): Promise<void>;
    verifyLoginOtp(dto: VerifyOtpDto): Promise<{ token: string; user: IUser }>;

    requestPasswordReset(dto: RequestResetDto): Promise<void>;
    resetPassword(dto: ResetPasswordDto): Promise<void>;
    verifyPassword(userId: string, dto: VerifyPasswordDto): Promise<boolean>;
}
