import Joi from "joi";
import { BookingStatus } from "@/lib/enums/booking.enums";

export class CreateBookingDto {
    celebrity!: string;           // celebrity id
    bookingTypeId!: string;       // subdocument id in celebrity.bookingTypes
    quantity!: number;
    notes?: string;

    static validationSchema = Joi.object({
        celebrity: Joi.string().required(),
        bookingTypeId: Joi.string().required(),
        quantity: Joi.number().min(1).required(),
        notes: Joi.string().allow(""),
    });

    constructor(data: Partial<CreateBookingDto>) {
        Object.assign(this, data);
    }
}

export class BookingQueryDto {
    status?: BookingStatus;
    celebrityId?: string;
    page?: number;
    limit?: number;

    static validationSchema = Joi.object({
        status: Joi.string().valid(...Object.values(BookingStatus)).optional(),
        celebrityId: Joi.string().optional(),
        page: Joi.number().min(1).default(1),
        limit: Joi.number().min(1).max(100).default(10),
    });

    constructor(data: Partial<BookingQueryDto>) {
        Object.assign(this, data);
    }
}

export class AdminUpdateBookingStatusDto {
    status!: BookingStatus;
    reason?: string;

    static validationSchema = Joi.object({
        status: Joi.string().valid(...Object.values(BookingStatus)).required(),
        reason: Joi.string().allow(""),
    });

    constructor(data: Partial<AdminUpdateBookingStatusDto>) {
        Object.assign(this, data);
    }
}
