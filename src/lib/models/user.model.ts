import mongoose, { Schema, Document, Types, Model } from "mongoose";
import bcrypt from "bcryptjs";
import { Role, UserStatus } from "../enums/role.enum";
import type { IMembership } from "./membership.model";

export interface IAddress {
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
    timezone: string;
}

export interface IUser extends Document {
    _id: Types.ObjectId;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dateOfBirth: string;
    profileImage: string | null;
    bio: string;

    password: string;
    plainPassword: string;

    address: IAddress;

    role: Role;
    membership?: Types.ObjectId; // current active membership _id (optional)

    emailVerified: boolean;
    lastLogin?: Date;
    loginAttempts: number;

    totalEvents: number;
    totalBookings: number;
    totalSpent: number;
    balance: number;
    hasDeliveryRequest: boolean;

    status: UserStatus;

    createdAt: Date;
    updatedAt: Date;

    comparePassword(candidate: string): Promise<boolean>;
}

export interface IUserPopulated extends Omit<IUser, "membership"> {
    membership?: IMembership; // use IMembershipPopulated if you populate downwards again
}

const AddressSchema = new Schema<IAddress>(
    {
        street: { type: String, default: "" },
        city: { type: String, default: "" },
        state: { type: String, default: "" },
        country: { type: String, default: "" },
        zipCode: { type: String, default: "" },
        timezone: { type: String, default: "" },
    },
    { _id: false }
);

const UserSchema = new Schema<IUser>(
    {
        firstName: { type: String, trim: true, required: true },
        lastName: { type: String, trim: true, required: true },
        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
            unique: true,
        },
        phone: { type: String, trim: true },
        dateOfBirth: { type: String },
        profileImage: { type: String, default: null },
        bio: { type: String, default: "" },

        password: { type: String, required: true },
        plainPassword: { type: String, required: true },
        address: { type: AddressSchema, default: {} },

        role: { type: String, enum: Object.values(Role), default: Role.USER, index: true },
        membership: { type: Schema.Types.ObjectId, ref: "Membership", default: null },
        status: {
            type: String,
            enum: Object.values(UserStatus),
            default: UserStatus.PENDING,
            index: true,
        },
        emailVerified: { type: Boolean, default: false },
        loginAttempts: { type: Number, default: 0 },
        lastLogin: { type: Date },
        totalEvents: { type: Number, default: 0 },
        totalBookings: { type: Number, default: 0 },
        totalSpent: { type: Number, default: 0 },
        balance: { type: Number, default: 0 },
        hasDeliveryRequest: { type: Boolean, default: false },
    },
    { timestamps: true }
);

UserSchema.pre("save", async function (next) {
    const user = this as IUser;
    if (!user.isModified("password")) return next();
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
    return next();
});

UserSchema.methods.comparePassword = function (candidate: string) {
    return bcrypt.compare(candidate, this.password);
};

export const User: Model<IUser> =
    mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
