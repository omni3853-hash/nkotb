import { NextRequest, NextResponse } from "next/server";
import AuthServiceImpl from "@/lib/services/impl/auth.service.impl";
import {
    SignupDto,
    LoginDto,
    VerifyOtpDto,
    RequestOtpDto,
    RequestResetDto,
    ResetPasswordDto,
    VerifyPasswordDto,
} from "@/lib/dto/auth.dto";
import { validator } from "@/lib/utils/validator.utils";
import { AuthRequest } from "../middleware/isLoggedIn.middleware";

const service = new AuthServiceImpl();

export async function signupController(req: NextRequest) {
    try {
        const body = await req.json();
        const dto = new SignupDto(body);
        const errors = validator(SignupDto, dto);
        if (errors) return NextResponse.json({ message: "Validation error", errors: errors.details }, { status: 400 });
        const res = await service.signup(dto);
        return NextResponse.json({ message: "Signup successful. Verify email to continue.", ...res }, { status: 201 });
    } catch (e: any) {
        return NextResponse.json({ message: e.message || "Internal server error" }, { status: e.statusCode || 500 });
    }
}

export async function verifyEmailOtpController(req: NextRequest) {
    try {
        const body = await req.json();
        const dto = new VerifyOtpDto(body);
        const errors = validator(VerifyOtpDto, dto);
        if (errors) return NextResponse.json({ message: "Validation error", errors: errors.details }, { status: 400 });
        const { token, user } = await service.verifyEmailOtp(dto);
        return NextResponse.json({ message: "Email verified", token, user }, { status: 200 });
    } catch (e: any) {
        return NextResponse.json({ message: e.message || "Internal server error" }, { status: e.statusCode || 500 });
    }
}

export async function loginController(req: NextRequest) {
    try {
        const body = await req.json();
        const dto = new LoginDto(body);
        const errors = validator(LoginDto, dto);
        if (errors) return NextResponse.json({ message: "Validation error", errors: errors.details }, { status: 400 });
        const res = await service.login(dto);
        return NextResponse.json({ message: "Login succesful, confirm your otp and access your account", ...res }, { status: 200 });
    } catch (e: any) {
        return NextResponse.json({ message: e.message || "Internal server error" }, { status: e.statusCode || 500 });
    }
}

export async function sendOtpController(req: NextRequest) {
    try {
        const body = await req.json();
        const dto = new RequestOtpDto(body);
        const errors = validator(RequestOtpDto, dto);
        if (errors) return NextResponse.json({ message: "Validation error", errors: errors.details }, { status: 400 });
        await service.sendOtp(dto);
        return NextResponse.json({ message: "OTP sent" }, { status: 200 });
    } catch (e: any) {
        return NextResponse.json({ message: e.message || "Internal server error" }, { status: e.statusCode || 500 });
    }
}

export async function verifyLoginOtpController(req: NextRequest) {
    try {
        const body = await req.json();
        const dto = new VerifyOtpDto(body);
        const errors = validator(VerifyOtpDto, dto);
        if (errors) return NextResponse.json({ message: "Validation error", errors: errors.details }, { status: 400 });
        const { token, user } = await service.verifyLoginOtp(dto);
        return NextResponse.json({ message: "Login OTP verified", token, user }, { status: 200 });
    } catch (e: any) {
        return NextResponse.json({ message: e.message || "Internal server error" }, { status: e.statusCode || 500 });
    }
}

export async function requestResetController(req: NextRequest) {
    try {
        const body = await req.json();
        const dto = new RequestResetDto(body);
        const errors = validator(RequestResetDto, dto);
        if (errors) return NextResponse.json({ message: "Validation error", errors: errors.details }, { status: 400 });
        await service.requestPasswordReset(dto);
        return NextResponse.json({ message: "If the email exists, a reset link was sent." }, { status: 200 });
    } catch (e: any) {
        return NextResponse.json({ message: e.message || "Internal server error" }, { status: e.statusCode || 500 });
    }
}

export async function resetPasswordController(req: NextRequest) {
    try {
        const body = await req.json();
        const dto = new ResetPasswordDto(body);
        const errors = validator(ResetPasswordDto, dto);
        if (errors) return NextResponse.json({ message: "Validation error", errors: errors.details }, { status: 400 });
        await service.resetPassword(dto);
        return NextResponse.json({ message: "Password reset successful" }, { status: 200 });
    } catch (e: any) {
        return NextResponse.json({ message: e.message || "Internal server error" }, { status: e.statusCode || 500 });
    }
}

export async function verifyCurrentPasswordController(req: AuthRequest) {
    try {
        const userId = req.user?.sub;
        const body = await req.json();
        const dto = new VerifyPasswordDto(body);
        const errors = validator(VerifyPasswordDto, dto);
        if (errors) return NextResponse.json({ message: "Validation error", errors: errors.details }, { status: 400 });
        const ok = await service.verifyPassword(userId as string, dto);
        return NextResponse.json({ valid: ok }, { status: 200 });
    } catch (e: any) {
        return NextResponse.json({ message: e.message || "Internal server error" }, { status: e.statusCode || 500 });
    }
}
