import { NextResponse } from "next/server";
import { AuthRequest } from "@/lib/middleware/isLoggedIn.middleware";
import { validator } from "@/lib/utils/validator.utils";
import { EventService } from "@/lib/services/event.service";
import EventServiceImpl from "@/lib/services/impl/event.service.impl";
import { CreateEventDto, UpdateEventDto, EventQueryDto } from "@/lib/dto/event.dto";
import { CustomError } from "@/lib/utils/customError.utils";

const service: EventService = new EventServiceImpl();

/* ---------------- Admin Create ---------------- */
export async function createEventController(req: AuthRequest) {
    try {
        const adminId = req.user?.sub;
        if (!adminId) throw new CustomError(401, "Unauthorized");

        const body = await req.json();
        const dto = new CreateEventDto(body);

        const errors = validator(CreateEventDto, dto);
        if (errors) {
            return NextResponse.json({ message: "Validation Error", errors: errors.details }, { status: 400 });
        }

        const event = await service.create(adminId, dto);
        return NextResponse.json({ message: "Event created", event }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ message: error.message || "Internal server error" }, { status: error.statusCode || 500 });
    }
}

/* ---------------- List (Public/User) ---------------- */
export async function listEventsController(req: AuthRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const dto = new EventQueryDto({
            search: searchParams.get("search") || undefined,
            category: searchParams.get("category") || undefined,
            onlyActive: searchParams.get("onlyActive") !== "false",
            page: searchParams.get("page") ? Number(searchParams.get("page")) : undefined,
            limit: searchParams.get("limit") ? Number(searchParams.get("limit")) : undefined,
        });

        const errors = validator(EventQueryDto, dto);
        if (errors) {
            return NextResponse.json({ message: "Validation Error", errors: errors.details }, { status: 400 });
        }

        const data = await service.list(dto);
        return NextResponse.json({ message: "Events retrieved", ...data }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ message: error.message || "Internal server error" }, { status: error.statusCode || 500 });
    }
}

/* ---------------- Get by Id (Public/User) ---------------- */
export async function getEventByIdController(_req: AuthRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const resolved = await params;
        const event = await service.getById(resolved.id);
        return NextResponse.json({ message: "Event retrieved", event }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ message: error.message || "Internal server error" }, { status: error.statusCode || 500 });
    }
}

/* ---------------- Get by Slug (Public/User) ---------------- */
export async function getEventBySlugController(_req: AuthRequest, { params }: { params: Promise<{ slug: string }> }) {
    try {
        const resolved = await params;
        const event = await service.getBySlug(resolved.slug);
        return NextResponse.json({ message: "Event retrieved", event }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ message: error.message || "Internal server error" }, { status: error.statusCode || 500 });
    }
}

/* ---------------- Admin Update ---------------- */
export async function updateEventController(req: AuthRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const adminId = req.user?.sub;
        if (!adminId) throw new CustomError(401, "Unauthorized");

        const body = await req.json();
        const dto = new UpdateEventDto(body);
        const errors = validator(UpdateEventDto, dto);
        if (errors) {
            return NextResponse.json({ message: "Validation Error", errors: errors.details }, { status: 400 });
        }

        const resolved = await params;
        const event = await service.update(adminId, resolved.id, dto);
        return NextResponse.json({ message: "Event updated", event }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ message: error.message || "Internal server error" }, { status: error.statusCode || 500 });
    }
}

/* ---------------- Admin Delete ---------------- */
export async function deleteEventController(req: AuthRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const adminId = req.user?.sub;
        if (!adminId) throw new CustomError(401, "Unauthorized");
        const resolved = await params;

        await service.delete(adminId, resolved.id);
        return NextResponse.json({ message: "Event deleted" }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ message: error.message || "Internal server error" }, { status: error.statusCode || 500 });
    }
}

/* ---------------- Admin Toggle Active ---------------- */
export async function toggleEventActiveController(req: AuthRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const adminId = req.user?.sub;
        if (!adminId) throw new CustomError(401, "Unauthorized");

        const { isActive } = await req.json();
        const resolved = await params;
        const event = await service.toggleActive(adminId, resolved.id, Boolean(isActive));
        return NextResponse.json({ message: "Event status updated", event }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ message: error.message || "Internal server error" }, { status: error.statusCode || 500 });
    }
}
