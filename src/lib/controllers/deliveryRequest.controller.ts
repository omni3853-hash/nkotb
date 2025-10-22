import { NextResponse } from "next/server";
import { AuthRequest } from "@/lib/middleware/isLoggedIn.middleware";
import { validator } from "@/lib/utils/validator.utils";
import {
    CreateDeliveryRequestDto,
    DeliveryRequestQueryDto,
    AdminUpdateDeliveryRequestStatusDto,
} from "@/lib/dto/deliveryRequest.dto";
import { DeliveryRequestService } from "@/lib/services/deliveryRequest.service";
import DeliveryRequestServiceImpl from "@/lib/services/impl/deliveryRequest.service.impl";
import { CustomError } from "@/lib/utils/customError.utils";

const service: DeliveryRequestService = new DeliveryRequestServiceImpl();

/* ---------------- User ---------------- */
export async function createDeliveryRequestController(req: AuthRequest) {
    try {
        const userId = req.user?.sub;
        if (!userId) throw new CustomError(401, "Unauthorized");

        const body = await req.json();
        const dto = new CreateDeliveryRequestDto(body);

        const errors = validator(CreateDeliveryRequestDto, dto);
        if (errors) {
            return NextResponse.json(
                { message: "Validation Error", errors: errors.details },
                { status: 400 }
            );
        }

        const deliveryRequest = await service.create(userId, dto);
        return NextResponse.json(
            { message: "Delivery request created", deliveryRequest },
            { status: 201 }
        );
    } catch (error: any) {
        return NextResponse.json(
            { message: error.message || "Internal server error" },
            { status: error.statusCode || 500 }
        );
    }
}

export async function myDeliveryRequestsController(req: AuthRequest) {
    try {
        const userId = req.user?.sub;
        if (!userId) throw new CustomError(401, "Unauthorized");

        const { searchParams } = new URL(req.url);
        const dto = new DeliveryRequestQueryDto({
            status: (searchParams.get("status") as any) || undefined,
            page: searchParams.get("page") ? Number(searchParams.get("page")) : undefined,
            limit: searchParams.get("limit") ? Number(searchParams.get("limit")) : undefined,
        });

        const errors = validator(DeliveryRequestQueryDto, dto);
        if (errors) {
            return NextResponse.json(
                { message: "Validation Error", errors: errors.details },
                { status: 400 }
            );
        }

        const data = await service.myList(userId, dto);
        return NextResponse.json(
            { message: "Delivery requests retrieved", ...data },
            { status: 200 }
        );
    } catch (error: any) {
        return NextResponse.json(
            { message: error.message || "Internal server error" },
            { status: error.statusCode || 500 }
        );
    }
}

export async function myGetDeliveryRequestByIdController(
    req: AuthRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const userId = req.user?.sub;
        if (!userId) throw new CustomError(401, "Unauthorized");

        const resolvedParams = await params;

        const deliveryRequest = await service.myGetById(userId, resolvedParams.id);
        return NextResponse.json(
            { message: "Delivery request retrieved", deliveryRequest },
            { status: 200 }
        );
    } catch (error: any) {
        return NextResponse.json(
            { message: error.message || "Internal server error" },
            { status: error.statusCode || 500 }
        );
    }
}

/* ---------------- Admin ---------------- */
export async function adminListDeliveryRequestsController(req: AuthRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const dto = new DeliveryRequestQueryDto({
            status: (searchParams.get("status") as any) || undefined,
            page: searchParams.get("page") ? Number(searchParams.get("page")) : undefined,
            limit: searchParams.get("limit") ? Number(searchParams.get("limit")) : undefined,
        });
        const userId = searchParams.get("userId") || undefined;

        const errors = validator(DeliveryRequestQueryDto, dto);
        if (errors) {
            return NextResponse.json(
                { message: "Validation Error", errors: errors.details },
                { status: 400 }
            );
        }

        const data = await service.adminList({ ...dto, userId });
        return NextResponse.json(
            { message: "Delivery requests retrieved", ...data },
            { status: 200 }
        );
    } catch (error: any) {
        return NextResponse.json(
            { message: error.message || "Internal server error" },
            { status: error.statusCode || 500 }
        );
    }
}

export async function adminGetDeliveryRequestByIdController(
    _req: AuthRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const resolvedParams = await params;

        const deliveryRequest = await service.adminGetById(resolvedParams.id);
        return NextResponse.json(
            { message: "Delivery request retrieved", deliveryRequest },
            { status: 200 }
        );
    } catch (error: any) {
        return NextResponse.json(
            { message: error.message || "Internal server error" },
            { status: error.statusCode || 500 }
        );
    }
}

export async function adminUpdateDeliveryRequestStatusController(
    req: AuthRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const adminId = req.user?.sub;
        if (!adminId) throw new CustomError(401, "Unauthorized");

        const body = await req.json();
        const dto = new AdminUpdateDeliveryRequestStatusDto(body);

        const errors = validator(AdminUpdateDeliveryRequestStatusDto, dto);
        if (errors) {
            return NextResponse.json(
                { message: "Validation Error", errors: errors.details },
                { status: 400 }
            );
        }

        const resolvedParams = await params;

        const deliveryRequest = await service.adminUpdateStatus(adminId, resolvedParams.id, dto);
        return NextResponse.json(
            { message: "Delivery request status updated", deliveryRequest },
            { status: 200 }
        );
    } catch (error: any) {
        return NextResponse.json(
            { message: error.message || "Internal server error" },
            { status: error.statusCode || 500 }
        );
    }
}
