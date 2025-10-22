// lib/dto/user.dto
import Joi from "joi";
import { Role, UserStatus } from "../enums/role.enum";

const OptionalString = Joi.string().allow("", null); // accepts "", null, or a normal string

export class UpdateSelfDto {
    firstName?: string;
    lastName?: string;
    phone?: string;
    dateOfBirth?: string;
    profileImage?: string | null;
    bio?: string;
    address?: {
        street?: string;
        city?: string;
        state?: string;
        country?: string;
        zipCode?: string;
        timezone?: string;
    };

    static validationSchema = Joi.object({
        firstName: OptionalString.optional(),
        lastName: OptionalString.optional(),
        phone: OptionalString.optional(),
        dateOfBirth: OptionalString.optional(),           // ← no more "is not allowed to be empty"
        profileImage: OptionalString.optional(),
        bio: OptionalString.optional(),
        address: Joi.object({
            street: OptionalString.optional(),
            city: OptionalString.optional(),
            state: OptionalString.optional(),
            country: OptionalString.optional(),
            zipCode: OptionalString.optional(),
            timezone: OptionalString.optional(),
        }).optional(),
    });

    constructor(data: UpdateSelfDto) {
        Object.assign(this, data);
    }
}

export class AdminUpdateUserDto {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    dateOfBirth?: string;
    profileImage?: string | null;
    bio?: string;
    role?: Role;
    address?: {
        street?: string;
        city?: string;
        state?: string;
        country?: string;
        zipCode?: string;
        timezone?: string;
    };
    status?: UserStatus;
    emailVerified?: boolean;
    balance?: number;
    membership?: string;

    static validationSchema = Joi.object({
        firstName: OptionalString.optional(),
        lastName: OptionalString.optional(),
        email: OptionalString.email().optional(),
        phone: OptionalString.optional(),
        dateOfBirth: OptionalString.optional(),           // ← important
        profileImage: OptionalString.optional(),
        bio: OptionalString.optional(),
        role: OptionalString.valid(...Object.values(Role)).optional(),
        address: Joi.object({
            street: OptionalString.optional(),
            city: OptionalString.optional(),
            state: OptionalString.optional(),
            country: OptionalString.optional(),
            zipCode: OptionalString.optional(),
            timezone: OptionalString.optional(),
        }).optional(),
        status: OptionalString.valid(...Object.values(UserStatus)).optional(),
        emailVerified: Joi.boolean().optional(),
        balance: Joi.number().min(0).optional(),
        membership: OptionalString.optional(),
    });

    constructor(data: AdminUpdateUserDto) {
        Object.assign(this, data);
    }
}
