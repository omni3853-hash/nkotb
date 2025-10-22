import Joi from "joi";

export class SignupDto {
    name!: string;
    email!: string;
    password!: string;

    static validationSchema = Joi.object({
        name: Joi.string().min(2).required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required(),
    });

    constructor(data: SignupDto) {
        Object.assign(this, data);
    }
}

export class LoginDto {
    email!: string;
    password!: string;

    static validationSchema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required(),
    });

    constructor(data: LoginDto) {
        Object.assign(this, data);
    }
}

export class VerifyPasswordDto {
    password!: string;

    static validationSchema = Joi.object({
        password: Joi.string().required(),
    });

    constructor(data: VerifyPasswordDto) {
        Object.assign(this, data);
    }
}

export class RequestOtpDto {
    email!: string;
    type!: "verify-email" | "login" | "reset";

    static validationSchema = Joi.object({
        email: Joi.string().email().required(),
        type: Joi.string().valid("verify-email", "login", "reset").required(),
    });

    constructor(data: RequestOtpDto) {
        Object.assign(this, data);
    }
}

export class VerifyOtpDto {
    email!: string;
    otp!: string;
    type!: "verify-email" | "login" | "reset";

    static validationSchema = Joi.object({
        email: Joi.string().email().required(),
        otp: Joi.string().length(6).required(),
        type: Joi.string().valid("verify-email", "login", "reset").required(),
    });

    constructor(data: VerifyOtpDto) {
        Object.assign(this, data);
    }
}

export class ChangePasswordDto {
    oldPassword!: string;
    newPassword!: string;

    static validationSchema = Joi.object({
        oldPassword: Joi.string().required(),
        newPassword: Joi.string().min(6).required(),
    });

    constructor(data: ChangePasswordDto) {
        Object.assign(this, data);
    }
}

export class RequestResetDto {
    email!: string;

    static validationSchema = Joi.object({
        email: Joi.string().email().required(),
    });

    constructor(data: RequestResetDto) {
        Object.assign(this, data);
    }
}

export class ResetPasswordDto {
    email!: string;
    otp!: string;
    newPassword!: string;

    static validationSchema = Joi.object({
        email: Joi.string().email().required(),
        otp: Joi.string().length(6).required(),
        newPassword: Joi.string().min(6).required(),
    });

    constructor(data: ResetPasswordDto) {
        Object.assign(this, data);
    }
}
