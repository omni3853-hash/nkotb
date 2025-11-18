import { NextResponse } from "next/server";
import { AuthRequest } from "@/lib/middleware/isLoggedIn.middleware";
import { validator } from "@/lib/utils/validator.utils";
import { CustomError } from "@/lib/utils/customError.utils";
import SupportTicketServiceImpl from "@/lib/services/impl/support-ticket.service.impl";
import type { SupportTicketService } from "@/lib/services/support-ticket.service";
import {
    CreateSupportTicketDto,
    SupportTicketQueryDto,
    AdminReplySupportTicketDto,
    AdminUpdateSupportStatusDto,
} from "@/lib/dto/support-ticket.dto";

const service: SupportTicketService = new SupportTicketServiceImpl();

/* ---------------- PUBLIC: CREATE SUPPORT TICKET ---------------- */
export async function createPublicSupportTicketController(req: Request | AuthRequest) {
    try {
        const body = await req.json();
        const dto = new CreateSupportTicketDto(body);
        const errors = validator(CreateSupportTicketDto, dto);
        if (errors) {
            return NextResponse.json(
                { message: "Validation Error", errors: errors.details },
                { status: 400 }
            );
        }

        // If request is from authenticated route, we may have user
        const maybeAuth = req as AuthRequest;
        const userId = maybeAuth.user?.sub ?? null;

        const ticket = await service.createPublic(dto, userId);
        return NextResponse.json(
            { message: "Support request submitted", ticket },
            { status: 201 }
        );
    } catch (error: any) {
        return NextResponse.json(
            { message: error.message || "Internal server error" },
            { status: error.statusCode || 500 }
        );
    }
}

/* ---------------- ADMIN: LIST ---------------- */
export async function adminListSupportTicketsController(req: AuthRequest) {
    try {
        const adminId = req.user?.sub;
        if (!adminId) throw new CustomError(401, "Unauthorized");

        const { searchParams } = new URL(req.url);
        const dto = new SupportTicketQueryDto({
            status: (searchParams.get("status") as any) || undefined,
            priority: (searchParams.get("priority") as any) || undefined,
            email: searchParams.get("email") || undefined,
            page: searchParams.get("page") ? Number(searchParams.get("page")) : undefined,
            limit: searchParams.get("limit") ? Number(searchParams.get("limit")) : undefined,
        });

        const errors = validator(SupportTicketQueryDto, dto);
        if (errors) {
            return NextResponse.json(
                { message: "Validation Error", errors: errors.details },
                { status: 400 }
            );
        }

        const data = await service.adminList(dto);
        return NextResponse.json({ message: "Support tickets retrieved", ...data }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json(
            { message: error.message || "Internal server error" },
            { status: error.statusCode || 500 }
        );
    }
}

/* ---------------- ADMIN: GET BY ID ---------------- */
export async function adminGetSupportTicketByIdController(
    req: AuthRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const adminId = req.user?.sub;
        if (!adminId) throw new CustomError(401, "Unauthorized");

        const resolved = await params;
        const ticket = await service.adminGetById(resolved.id);
        return NextResponse.json({ message: "Support ticket retrieved", ticket }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json(
            { message: error.message || "Internal server error" },
            { status: error.statusCode || 500 }
        );
    }
}

/* ---------------- ADMIN: REPLY ---------------- */
export async function adminReplySupportTicketController(
    req: AuthRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const adminId = req.user?.sub;
        if (!adminId) throw new CustomError(401, "Unauthorized");

        const body = await req.json();
        const dto = new AdminReplySupportTicketDto(body);
        const errors = validator(AdminReplySupportTicketDto, dto);
        if (errors) {
            return NextResponse.json(
                { message: "Validation Error", errors: errors.details },
                { status: 400 }
            );
        }

        const resolved = await params;
        const ticket = await service.adminReply(adminId, resolved.id, dto);
        return NextResponse.json({ message: "Reply sent", ticket }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json(
            { message: error.message || "Internal server error" },
            { status: error.statusCode || 500 }
        );
    }
}

/* ---------------- ADMIN: UPDATE STATUS ---------------- */
export async function adminUpdateSupportTicketStatusController(
    req: AuthRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const adminId = req.user?.sub;
        if (!adminId) throw new CustomError(401, "Unauthorized");

        const body = await req.json();
        const dto = new AdminUpdateSupportStatusDto(body);
        const errors = validator(AdminUpdateSupportStatusDto, dto);
        if (errors) {
            return NextResponse.json(
                { message: "Validation Error", errors: errors.details },
                { status: 400 }
            );
        }

        const resolved = await params;
        const ticket = await service.adminUpdateStatus(adminId, resolved.id, dto);
        return NextResponse.json(
            { message: "Support ticket status updated", ticket },
            { status: 200 }
        );
    } catch (error: any) {
        return NextResponse.json(
            { message: error.message || "Internal server error" },
            { status: error.statusCode || 500 }
        );
    }
}
