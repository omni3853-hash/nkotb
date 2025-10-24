import type { IBooking } from "@/lib/models/booking.model";
import { CreateBookingDto, BookingQueryDto, AdminUpdateBookingStatusDto } from "@/lib/dto/booking.dto";

export interface BookingService {
    // USER
    create(userId: string, dto: CreateBookingDto): Promise<IBooking>;
    myList(userId: string, query: BookingQueryDto): Promise<{ items: IBooking[]; total: number; page: number; limit: number }>;
    myGetById(userId: string, id: string): Promise<IBooking>;

    // ADMIN
    adminList(query: BookingQueryDto & { userId?: string; celebrityId?: string }): Promise<{ items: IBooking[]; total: number; page: number; limit: number }>;
    adminGetById(id: string): Promise<IBooking>;
    adminUpdateStatus(adminId: string, id: string, dto: AdminUpdateBookingStatusDto): Promise<IBooking>;
}
