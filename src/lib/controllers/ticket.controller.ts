import { NextResponse } from "next/server";
import { AuthRequest } from "@/lib/middleware/isLoggedIn.middleware";
import { validator } from "@/lib/utils/validator.utils";
import { CustomError } from "@/lib/utils/customError.utils";
import { TicketService } from "@/lib/services/ticket.service";
import TicketServiceImpl from "@/lib/services/impl/ticket.service.impl";
import { CreateTicketDto, TicketQueryDto, AdminUpdateTicketStatusDto, CreateOfflineTicketDto } from "@/lib/dto/ticket.dto";

const service: TicketService = new TicketServiceImpl();

/* ---------------- USER: CREATE ---------------- */
export async function createTicketController(req: AuthRequest) {
    try {
        const userId = req.user?.sub;
        if (!userId) throw new CustomError(401, "Unauthorized");

        const body = await req.json();
        const dto = new CreateTicketDto(body);
        const errors = validator(CreateTicketDto, dto);
        if (errors) {
            return NextResponse.json({ message: "Validation Error", errors: errors.details }, { status: 400 });
        }

        const ticket = await service.create(userId, dto);
        return NextResponse.json({ message: "Ticket submitted", ticket }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ message: error.message || "Internal server error" }, { status: error.statusCode || 500 });
    }
}

export async function createOfflineTicketController(req: Request) {
    try {
        const body = await req.json();
        const dto = new CreateOfflineTicketDto(body);
        const errors = validator(CreateOfflineTicketDto, dto);
        if (errors) {
            return NextResponse.json(
                { message: "Validation Error", errors: errors.details },
                { status: 400 }
            );
        }

        const ticket = await service.createOffline(dto);
        return NextResponse.json(
            { message: "Offline ticket submitted", ticket },
            { status: 201 }
        );
    } catch (error: any) {
        return NextResponse.json(
            { message: error.message || "Internal server error" },
            { status: error.statusCode || 500 }
        );
    }
}

/* ---------------- USER: LIST ---------------- */
export async function listMyTicketsController(req: AuthRequest) {
    try {
        const userId = req.user?.sub;
        if (!userId) throw new CustomError(401, "Unauthorized");

        const { searchParams } = new URL(req.url);
        const dto = new TicketQueryDto({
            status: (searchParams.get("status") as any) || undefined,
            eventId: searchParams.get("eventId") || undefined,
            page: searchParams.get("page") ? Number(searchParams.get("page")) : undefined,
            limit: searchParams.get("limit") ? Number(searchParams.get("limit")) : undefined,
        });

        const errors = validator(TicketQueryDto, dto);
        if (errors) {
            return NextResponse.json({ message: "Validation Error", errors: errors.details }, { status: 400 });
        }

        const data = await service.myList(userId, dto);
        return NextResponse.json({ message: "Tickets retrieved", ...data }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ message: error.message || "Internal server error" }, { status: error.statusCode || 500 });
    }
}

/* ---------------- USER: GET BY ID ---------------- */
export async function getMyTicketByIdController(req: AuthRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const userId = req.user?.sub;
        if (!userId) throw new CustomError(401, "Unauthorized");

        const resolved = await params;
        const ticket = await service.myGetById(userId, resolved.id);
        return NextResponse.json({ message: "Ticket retrieved", ticket }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ message: error.message || "Internal server error" }, { status: error.statusCode || 500 });
    }
}

/* ---------------- ADMIN: LIST ---------------- */
export async function adminListTicketsController(req: AuthRequest) {
    try {
        const adminId = req.user?.sub;
        if (!adminId) throw new CustomError(401, "Unauthorized");

        const { searchParams } = new URL(req.url);
        const dto = new TicketQueryDto({
            status: (searchParams.get("status") as any) || undefined,
            page: searchParams.get("page") ? Number(searchParams.get("page")) : undefined,
            limit: searchParams.get("limit") ? Number(searchParams.get("limit")) : undefined,
        });

        const errors = validator(TicketQueryDto, dto);
        if (errors) {
            return NextResponse.json({ message: "Validation Error", errors: errors.details }, { status: 400 });
        }

        const userId = searchParams.get("userId") || undefined;
        const eventId = searchParams.get("eventId") || undefined;

        const data = await service.adminList({ ...dto, userId, eventId });
        return NextResponse.json({ message: "Tickets retrieved", ...data }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ message: error.message || "Internal server error" }, { status: error.statusCode || 500 });
    }
}

/* ---------------- ADMIN: GET BY ID ---------------- */
export async function adminGetTicketByIdController(_req: AuthRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const resolved = await params;
        const ticket = await service.adminGetById(resolved.id);
        return NextResponse.json({ message: "Ticket retrieved", ticket }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ message: error.message || "Internal server error" }, { status: error.statusCode || 500 });
    }
}

/* ---------------- ADMIN: UPDATE STATUS ---------------- */
export async function adminUpdateTicketStatusController(req: AuthRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const adminId = req.user?.sub;
        if (!adminId) throw new CustomError(401, "Unauthorized");

        const body = await req.json();
        const dto = new AdminUpdateTicketStatusDto(body);
        const errors = validator(AdminUpdateTicketStatusDto, dto);
        if (errors) {
            return NextResponse.json({ message: "Validation Error", errors: errors.details }, { status: 400 });
        }

        const resolved = await params;
        const ticket = await service.adminUpdateStatus(adminId, resolved.id, dto);
        return NextResponse.json({ message: "Ticket status updated", ticket }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ message: error.message || "Internal server error" }, { status: error.statusCode || 500 });
    }
}
