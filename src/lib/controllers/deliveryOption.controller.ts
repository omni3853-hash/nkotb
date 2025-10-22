import { NextResponse } from "next/server";
import { AuthRequest } from "@/lib/middleware/isLoggedIn.middleware";
import { validator } from "@/lib/utils/validator.utils";
import {
    CreateDeliveryOptionDto,
    DeliveryOptionQueryDto,
    UpdateDeliveryOptionDto,
} from "@/lib/dto/deliveryOption.dto";
import { DeliveryOptionService } from "@/lib/services/deliveryOption.service";
import DeliveryOptionServiceImpl from "@/lib/services/impl/deliveryOption.service.impl";
import { CustomError } from "@/lib/utils/customError.utils";

const service: DeliveryOptionService = new DeliveryOptionServiceImpl();

/* ---------------- Admin Create ---------------- */
export async function createDeliveryOptionController(req: AuthRequest) {
    try {
        const adminId = req.user?.sub;
        if (!adminId) throw new CustomError(401, "Unauthorized");

        const body = await req.json();
        const dto = new CreateDeliveryOptionDto(body);

        const errors = validator(CreateDeliveryOptionDto, dto);
        if (errors) {
            return NextResponse.json(
                { message: "Validation Error", errors: errors.details },
                { status: 400 }
            );
        }

        const deliveryOption = await service.create(adminId, dto);
        return NextResponse.json(
            { message: "Delivery option created", deliveryOption },
            { status: 201 }
        );
    } catch (error: any) {
        return NextResponse.json(
            { message: error.message || "Internal server error" },
            { status: error.statusCode || 500 }
        );
    }
}

/* ---------------- List (Public/User) ---------------- */
export async function listDeliveryOptionsController(req: AuthRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const dto = new DeliveryOptionQueryDto({
            search: searchParams.get("search") || undefined,
            onlyActive: searchParams.get("onlyActive") !== "false",
            page: searchParams.get("page") ? Number(searchParams.get("page")) : undefined,
            limit: searchParams.get("limit") ? Number(searchParams.get("limit")) : undefined,
        });

        const errors = validator(DeliveryOptionQueryDto, dto);
        if (errors) {
            return NextResponse.json(
                { message: "Validation Error", errors: errors.details },
                { status: 400 }
            );
        }

        const data = await service.list(dto);
        return NextResponse.json(
            { message: "Delivery options retrieved", ...data },
            { status: 200 }
        );
    } catch (error: any) {
        return NextResponse.json(
            { message: error.message || "Internal server error" },
            { status: error.statusCode || 500 }
        );
    }
}

/* ---------------- Get by Id (Public/User) ---------------- */
export async function getDeliveryOptionByIdController(
    _req: AuthRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const resolvedParams = await params;

        const deliveryOption = await service.getById(resolvedParams.id);
        return NextResponse.json(
            { message: "Delivery option retrieved", deliveryOption },
            { status: 200 }
        );
    } catch (error: any) {
        return NextResponse.json(
            { message: error.message || "Internal server error" },
            { status: error.statusCode || 500 }
        );
    }
}

/* ---------------- Admin Update ---------------- */
export async function updateDeliveryOptionController(
    req: AuthRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const adminId = req.user?.sub;
        if (!adminId) throw new CustomError(401, "Unauthorized");

        const body = await req.json();
        const dto = new UpdateDeliveryOptionDto(body);
        const errors = validator(UpdateDeliveryOptionDto, dto);
        if (errors) {
            return NextResponse.json(
                { message: "Validation Error", errors: errors.details },
                { status: 400 }
            );
        }

        const resolvedParams = await params;
        const deliveryOption = await service.update(adminId, resolvedParams.id, dto);
        return NextResponse.json(
            { message: "Delivery option updated", deliveryOption },
            { status: 200 }
        );
    } catch (error: any) {
        return NextResponse.json(
            { message: error.message || "Internal server error" },
            { status: error.statusCode || 500 }
        );
    }
}

/* ---------------- Admin Delete ---------------- */
export async function deleteDeliveryOptionController(
    req: AuthRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const adminId = req.user?.sub;
        if (!adminId) throw new CustomError(401, "Unauthorized");

        const resolvedParams = await params;

        await service.delete(adminId, resolvedParams.id);
        return NextResponse.json({ message: "Delivery option deleted" }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json(
            { message: error.message || "Internal server error" },
            { status: error.statusCode || 500 }
        );
    }
}

/* ---------------- Admin Toggle Active ---------------- */
export async function toggleDeliveryOptionActiveController(
    req: AuthRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const adminId = req.user?.sub;
        if (!adminId) throw new CustomError(401, "Unauthorized");

        const { isActive } = await req.json();

        const resolvedParams = await params;

        const deliveryOption = await service.toggleActive(adminId, resolvedParams.id, Boolean(isActive));
        return NextResponse.json(
            { message: "Delivery option status updated", deliveryOption },
            { status: 200 }
        );
    } catch (error: any) {
        return NextResponse.json(
            { message: error.message || "Internal server error" },
            { status: error.statusCode || 500 }
        );
    }
}
