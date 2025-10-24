import { NextRequest, NextResponse } from "next/server";
import { AuthRequest } from "@/lib/middleware/isLoggedIn.middleware";
import { validator } from "@/lib/utils/validator.utils";
import { CelebrityService } from "@/lib/services/celebrity.service";
import CelebrityServiceImpl from "@/lib/services/impl/celebrity.service.impl";
import { CreateCelebrityDto, UpdateCelebrityDto, CelebrityQueryDto } from "@/lib/dto/celebrity.dto";
import { CustomError } from "@/lib/utils/customError.utils";

const service: CelebrityService = new CelebrityServiceImpl();

/* ---------------- Admin Create ---------------- */
export async function createCelebrityController(req: AuthRequest) {
    try {
        const adminId = req.user?.sub;
        if (!adminId) throw new CustomError(401, "Unauthorized");

        const body = await req.json();
        const dto = new CreateCelebrityDto(body);

        const errors = validator(CreateCelebrityDto, dto);
        if (errors) {
            return NextResponse.json({ message: "Validation Error", errors: errors.details }, { status: 400 });
        }

        const celebrity = await service.create(adminId, dto);
        return NextResponse.json({ message: "Celebrity created", celebrity }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ message: error.message || "Internal server error" }, { status: error.statusCode || 500 });
    }
}

/* ---------------- List (Public/User) ---------------- */
export async function listCelebritiesController(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const dto = new CelebrityQueryDto({
            search: searchParams.get("search") || undefined,
            category: searchParams.get("category") || undefined,
            onlyActive: searchParams.get("onlyActive") !== "false",
            page: searchParams.get("page") ? Number(searchParams.get("page")) : undefined,
            limit: searchParams.get("limit") ? Number(searchParams.get("limit")) : undefined,
        });

        const errors = validator(CelebrityQueryDto, dto);
        if (errors) {
            return NextResponse.json({ message: "Validation Error", errors: errors.details }, { status: 400 });
        }

        const data = await service.list(dto);
        return NextResponse.json({ message: "Celebrities retrieved", ...data }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ message: error.message || "Internal server error" }, { status: error.statusCode || 500 });
    }
}

/* ---------------- Get by Id (Public/User) ---------------- */
export async function getCelebrityByIdController(_req: AuthRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const resolved = await params;
        const celebrity = await service.getById(resolved.id);
        return NextResponse.json({ message: "Celebrity retrieved", celebrity }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ message: error.message || "Internal server error" }, { status: error.statusCode || 500 });
    }
}

/* ---------------- Get by Slug (Public/User) ---------------- */
export async function getCelebrityBySlugController(_req: AuthRequest, { params }: { params: Promise<{ slug: string }> }) {
    try {
        const resolved = await params;
        const celebrity = await service.getBySlug(resolved.slug);
        return NextResponse.json({ message: "Celebrity retrieved", celebrity }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ message: error.message || "Internal server error" }, { status: error.statusCode || 500 });
    }
}

/* ---------------- Admin Update ---------------- */
export async function updateCelebrityController(req: AuthRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const adminId = req.user?.sub;
        if (!adminId) throw new CustomError(401, "Unauthorized");

        const body = await req.json();
        const dto = new UpdateCelebrityDto(body);
        const errors = validator(UpdateCelebrityDto, dto);
        if (errors) {
            return NextResponse.json({ message: "Validation Error", errors: errors.details }, { status: 400 });
        }

        const resolved = await params;
        const celebrity = await service.update(adminId, resolved.id, dto);
        return NextResponse.json({ message: "Celebrity updated", celebrity }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ message: error.message || "Internal server error" }, { status: error.statusCode || 500 });
    }
}

/* ---------------- Admin Delete ---------------- */
export async function deleteCelebrityController(req: AuthRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const adminId = req.user?.sub;
        if (!adminId) throw new CustomError(401, "Unauthorized");
        const resolved = await params;

        await service.delete(adminId, resolved.id);
        return NextResponse.json({ message: "Celebrity deleted" }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ message: error.message || "Internal server error" }, { status: error.statusCode || 500 });
    }
}

/* ---------------- Admin Toggle Active ---------------- */
export async function toggleCelebrityActiveController(req: AuthRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const adminId = req.user?.sub;
        if (!adminId) throw new CustomError(401, "Unauthorized");

        const { isActive } = await req.json();
        const resolved = await params;
        const celebrity = await service.toggleActive(adminId, resolved.id, Boolean(isActive));
        return NextResponse.json({ message: "Celebrity status updated", celebrity }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ message: error.message || "Internal server error" }, { status: error.statusCode || 500 });
    }
}
