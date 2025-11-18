import { NextRequest, NextResponse } from "next/server";
import { validator } from "@/lib/utils/validator.utils";
import {
    CreatePaymentMethodDto,
    PaymentMethodQueryDto,
    UpdatePaymentMethodDto,
} from "@/lib/dto/paymentMethod.dto";
import { PaymentMethodService } from "@/lib/services/paymentMethod.service";
import PaymentMethodServiceImpl from "@/lib/services/impl/paymentMethod.service.impl";
import { CustomError } from "@/lib/utils/customError.utils";
import { AuthRequest } from "@/lib/middleware/isLoggedIn.middleware";
import { DEFAULT_PAYMENT_METHOD_TYPE } from "@/lib/config/payment.config";

const service: PaymentMethodService = new PaymentMethodServiceImpl();

/* ---------------- Admin ---------------- */
export async function createPaymentMethodController(req: AuthRequest) {
    try {
        const adminId = req.user?.sub;
        if (!adminId) throw new CustomError(401, "Unauthorized");

        const body = await req.json();
        const dto = new CreatePaymentMethodDto({ ...body });
        const errors = validator(CreatePaymentMethodDto, dto);
        if (errors)
            return NextResponse.json(
                { message: "Validation Error", errors: errors.details },
                { status: 400 }
            );

        const pm = await service.create(adminId, dto);
        return NextResponse.json(
            { message: "Payment method created", paymentMethod: pm },
            { status: 201 }
        );
    } catch (error: any) {
        return NextResponse.json(
            { message: error.message || "Internal server error" },
            { status: error.statusCode || 500 }
        );
    }
}

export async function adminListPaymentMethodsController(req: AuthRequest) {
    try {
        // Build DTO from URL with optional default type support
        const dto = PaymentMethodQueryDto.fromURL(req.url, {
            defaultType: DEFAULT_PAYMENT_METHOD_TYPE,
        });

        const errors = validator(PaymentMethodQueryDto, dto);
        if (errors)
            return NextResponse.json(
                { message: "Validation Error", errors: errors.details },
                { status: 400 }
            );

        const data = await service.adminList(dto);
        return NextResponse.json(
            { message: "Payment methods retrieved", ...data },
            { status: 200 }
        );
    } catch (error: any) {
        // Handle invalid 'type' explicitly (thrown by normalizeType)
        const status =
            error instanceof CustomError ? error.statusCode : error.message?.startsWith("Invalid payment method type")
                ? 400
                : 500;
        return NextResponse.json(
            { message: error.message || "Internal server error" },
            { status }
        );
    }
}

export async function adminGetPaymentMethodByIdController(
    req: AuthRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const pm = await service.adminGetById(id);
        return NextResponse.json(
            { message: "Payment method retrieved", paymentMethod: pm },
            { status: 200 }
        );
    } catch (error: any) {
        return NextResponse.json(
            { message: error.message || "Internal server error" },
            { status: error.statusCode || 500 }
        );
    }
}

export async function updatePaymentMethodController(
    req: AuthRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const adminId = req.user?.sub;
        if (!adminId) throw new CustomError(401, "Unauthorized");

        const body = await req.json();
        const dto = new UpdatePaymentMethodDto(body);
        const errors = validator(UpdatePaymentMethodDto, dto);
        if (errors)
            return NextResponse.json(
                { message: "Validation Error", errors: errors.details },
                { status: 400 }
            );

        const { id } = await params;
        const pm = await service.update(adminId, id, dto);
        return NextResponse.json(
            { message: "Payment method updated", paymentMethod: pm },
            { status: 200 }
        );
    } catch (error: any) {
        return NextResponse.json(
            { message: error.message || "Internal server error" },
            { status: error.statusCode || 500 }
        );
    }
}

export async function deletePaymentMethodController(
    req: AuthRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const adminId = req.user?.sub;
        if (!adminId) throw new CustomError(401, "Unauthorized");
        const { id } = await params;
        await service.delete(adminId, id);
        return NextResponse.json({ message: "Payment method deleted" }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json(
            { message: error.message || "Internal server error" },
            { status: error.statusCode || 500 }
        );
    }
}

export async function togglePaymentMethodStatusController(
    req: AuthRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const adminId = req.user?.sub;
        if (!adminId) throw new CustomError(401, "Unauthorized");

        const { status } = await req.json();
        const { id } = await params;
        const pm = await service.toggleStatus(adminId, id, Boolean(status));
        return NextResponse.json(
            { message: "Payment method status updated", paymentMethod: pm },
            { status: 200 }
        );
    } catch (error: any) {
        return NextResponse.json(
            { message: error.message || "Internal server error" },
            { status: error.statusCode || 500 }
        );
    }
}

export async function setDefaultPaymentMethodController(
    req: AuthRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const adminId = req.user?.sub;
        if (!adminId) throw new CustomError(401, "Unauthorized");
        const { id } = await params;
        const pm = await service.setDefault(adminId, id);
        return NextResponse.json(
            { message: "Default payment method set", paymentMethod: pm },
            { status: 200 }
        );
    } catch (error: any) {
        return NextResponse.json(
            { message: error.message || "Internal server error" },
            { status: error.statusCode || 500 }
        );
    }
}

/* ---------------- User ---------------- */
export async function listActivePaymentMethodsController(req: NextRequest) {
    try {
        // For user list, also honor 'type', default type, and allow 'all'
        const dto = PaymentMethodQueryDto.fromURL(req.url, {
            defaultType: DEFAULT_PAYMENT_METHOD_TYPE,
        });
        // Force status=true for this endpoint
        dto.status = true;

        const errors = validator(PaymentMethodQueryDto, dto);
        if (errors)
            return NextResponse.json(
                { message: "Validation Error", errors: errors.details },
                { status: 400 }
            );

        const data = await service.userListActive(dto);
        return NextResponse.json(
            { message: "Payment methods retrieved", ...data },
            { status: 200 }
        );
    } catch (error: any) {
        const status =
            error.message?.startsWith("Invalid payment method type") ? 400 : error.statusCode || 500;
        return NextResponse.json(
            { message: error.message || "Internal server error" },
            { status }
        );
    }
}
