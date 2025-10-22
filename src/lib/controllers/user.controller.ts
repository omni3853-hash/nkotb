import { NextRequest, NextResponse } from "next/server";
import UserServiceImpl from "@/lib/services/impl/user.service.impl";
import { UpdateSelfDto, AdminUpdateUserDto } from "@/lib/dto/user.dto";
import { ChangePasswordDto } from "@/lib/dto/auth.dto";
import { validator } from "@/lib/utils/validator.utils";
import { AuthRequest } from "@/lib/middleware/isLoggedIn.middleware";
import { CustomError } from "../utils/customError.utils";

const service = new UserServiceImpl();

/* ---------- SELF ---------- */
export async function meController(req: AuthRequest) {
    try {
        const userId = req.user?.sub;
        if (!userId) throw new CustomError(401, "Unauthorized");

        const user = await service.me(userId);
        return NextResponse.json({ user }, { status: 200 });
    } catch (e: any) {
        return NextResponse.json(
            { message: e.message || "Internal server error" },
            { status: e.statusCode || 500 }
        );
    }
}

export async function updateMeController(req: AuthRequest) {
    try {
        const userId = req.user?.sub;
        if (!userId) throw new CustomError(401, "Unauthorized");

        const body = await req.json();
        const dto = new UpdateSelfDto(body);
        const errors = validator(UpdateSelfDto, dto);
        if (errors)
            return NextResponse.json(
                { message: "Validation error", errors: errors.details },
                { status: 400 }
            );

        const user = await service.updateMe(userId, dto);
        return NextResponse.json({ message: "Profile updated", user }, { status: 200 });
    } catch (e: any) {
        return NextResponse.json(
            { message: e.message || "Internal server error" },
            { status: e.statusCode || 500 }
        );
    }
}

export async function changePasswordController(req: AuthRequest) {
    try {
        const userId = req.user?.sub;
        if (!userId) throw new CustomError(401, "Unauthorized");

        const body = await req.json();
        const dto = new ChangePasswordDto(body);
        const errors = validator(ChangePasswordDto, dto);
        if (errors)
            return NextResponse.json(
                { message: "Validation error", errors: errors.details },
                { status: 400 }
            );

        await service.changePassword(userId, dto);
        return NextResponse.json({ message: "Password changed" }, { status: 200 });
    } catch (e: any) {
        return NextResponse.json(
            { message: e.message || "Internal server error" },
            { status: e.statusCode || 500 }
        );
    }
}

/* ---------- ADMIN (no inline middleware checks; routes will gate) ---------- */
export async function adminGetUserController(
    _req: AuthRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const resolvedParams = await params;
        const user = await service.getById(resolvedParams.id);
        return NextResponse.json({ user }, { status: 200 });
    } catch (e: any) {
        return NextResponse.json(
            { message: e.message || "Internal server error" },
            { status: e.statusCode || 500 }
        );
    }
}

export async function adminListUsersController(req: AuthRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const data = await service.list({
            search: searchParams.get("search") || undefined,
            status: searchParams.get("status") || undefined,
            page: searchParams.get("page") ? Number(searchParams.get("page")) : undefined,
            limit: searchParams.get("limit") ? Number(searchParams.get("limit")) : undefined
        });
        return NextResponse.json({ ...data }, { status: 200 });
    } catch (e: any) {
        return NextResponse.json(
            { message: e.message || "Internal server error" },
            { status: e.statusCode || 500 }
        );
    }
}

export async function adminUpdateUserController(
    req: AuthRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // We don't enforce admin checks here. If your route middleware attaches user, we'll use it for audit.
        const adminId = (req as any)?.user?.sub;

        const body = await req.json();
        const dto = new AdminUpdateUserDto(body);
        const errors = validator(AdminUpdateUserDto, dto);
        if (errors)
            return NextResponse.json(
                { message: "Validation error", errors: errors.details },
                { status: 400 }
            );

        const resolvedParams = await params;
        const user = await service.adminUpdate(adminId, resolvedParams.id, dto);
        return NextResponse.json({ message: "User updated", user }, { status: 200 });
    } catch (e: any) {
        return NextResponse.json(
            { message: e.message || "Internal server error" },
            { status: e.statusCode || 500 }
        );
    }
}

export async function adminDeleteUserController(
    req: AuthRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // No inline checks; routes middleware handles authz. We still pass through adminId for audit if present.
        const adminId = (req as any)?.user?.sub;
        const resolvedParams = await params;
        await service.adminDelete(adminId, resolvedParams.id);
        return NextResponse.json({ message: "User deleted" }, { status: 200 });
    } catch (e: any) {
        return NextResponse.json(
            { message: e.message || "Internal server error" },
            { status: e.statusCode || 500 }
        );
    }
}
