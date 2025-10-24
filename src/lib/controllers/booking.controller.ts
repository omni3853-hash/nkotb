import { NextResponse } from "next/server";
import { AuthRequest } from "@/lib/middleware/isLoggedIn.middleware";
import { validator } from "@/lib/utils/validator.utils";
import { CustomError } from "@/lib/utils/customError.utils";
import { BookingService } from "@/lib/services/booking.service";
import BookingServiceImpl from "@/lib/services/impl/booking.service.impl";
import { CreateBookingDto, BookingQueryDto, AdminUpdateBookingStatusDto } from "@/lib/dto/booking.dto";

const service: BookingService = new BookingServiceImpl();

/* ---------------- USER: CREATE ---------------- */
export async function createBookingController(req: AuthRequest) {
    try {
        const userId = req.user?.sub;
        if (!userId) throw new CustomError(401, "Unauthorized");

        const body = await req.json();
        const dto = new CreateBookingDto(body);
        const errors = validator(CreateBookingDto, dto);
        if (errors) {
            return NextResponse.json({ message: "Validation Error", errors: errors.details }, { status: 400 });
        }

        const booking = await service.create(userId, dto);
        return NextResponse.json({ message: "Booking submitted", booking }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ message: error.message || "Internal server error" }, { status: error.statusCode || 500 });
    }
}

/* ---------------- USER: LIST ---------------- */
export async function listMyBookingsController(req: AuthRequest) {
    try {
        const userId = req.user?.sub;
        if (!userId) throw new CustomError(401, "Unauthorized");

        const { searchParams } = new URL(req.url);
        const dto = new BookingQueryDto({
            status: (searchParams.get("status") as any) || undefined,
            celebrityId: searchParams.get("celebrityId") || undefined,
            page: searchParams.get("page") ? Number(searchParams.get("page")) : undefined,
            limit: searchParams.get("limit") ? Number(searchParams.get("limit")) : undefined,
        });

        const errors = validator(BookingQueryDto, dto);
        if (errors) {
            return NextResponse.json({ message: "Validation Error", errors: errors.details }, { status: 400 });
        }

        const data = await service.myList(userId, dto);
        return NextResponse.json({ message: "Bookings retrieved", ...data }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ message: error.message || "Internal server error" }, { status: error.statusCode || 500 });
    }
}

/* ---------------- USER: GET BY ID ---------------- */
export async function getMyBookingByIdController(req: AuthRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const userId = req.user?.sub;
        if (!userId) throw new CustomError(401, "Unauthorized");

        const resolved = await params;
        const booking = await service.myGetById(userId, resolved.id);
        return NextResponse.json({ message: "Booking retrieved", booking }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ message: error.message || "Internal server error" }, { status: error.statusCode || 500 });
    }
}

/* ---------------- ADMIN: LIST ---------------- */
export async function adminListBookingsController(req: AuthRequest) {
    try {
        const adminId = req.user?.sub;
        if (!adminId) throw new CustomError(401, "Unauthorized");

        const { searchParams } = new URL(req.url);
        const dto = new BookingQueryDto({
            status: (searchParams.get("status") as any) || undefined,
            page: searchParams.get("page") ? Number(searchParams.get("page")) : undefined,
            limit: searchParams.get("limit") ? Number(searchParams.get("limit")) : undefined,
        });

        const errors = validator(BookingQueryDto, dto);
        if (errors) {
            return NextResponse.json({ message: "Validation Error", errors: errors.details }, { status: 400 });
        }

        const userId = searchParams.get("userId") || undefined;
        const celebrityId = searchParams.get("celebrityId") || undefined;

        const data = await service.adminList({ ...dto, userId, celebrityId });
        return NextResponse.json({ message: "Bookings retrieved", ...data }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ message: error.message || "Internal server error" }, { status: error.statusCode || 500 });
    }
}

/* ---------------- ADMIN: GET BY ID ---------------- */
export async function adminGetBookingByIdController(_req: AuthRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const resolved = await params;
        const booking = await service.adminGetById(resolved.id);
        return NextResponse.json({ message: "Booking retrieved", booking }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ message: error.message || "Internal server error" }, { status: error.statusCode || 500 });
    }
}

/* ---------------- ADMIN: UPDATE STATUS ---------------- */
export async function adminUpdateBookingStatusController(req: AuthRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const adminId = req.user?.sub;
        if (!adminId) throw new CustomError(401, "Unauthorized");

        const body = await req.json();
        const dto = new AdminUpdateBookingStatusDto(body);
        const errors = validator(AdminUpdateBookingStatusDto, dto);
        if (errors) {
            return NextResponse.json({ message: "Validation Error", errors: errors.details }, { status: 400 });
        }

        const resolved = await params;
        const booking = await service.adminUpdateStatus(adminId, resolved.id, dto);
        return NextResponse.json({ message: "Booking status updated", booking }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ message: error.message || "Internal server error" }, { status: error.statusCode || 500 });
    }
}
