import { NextResponse } from "next/server";
import PlatformServiceImpl from "@/lib/services/impl/platform.service.impl";
import { UpdatePlatformDto } from "@/lib/dto/platform.dto";
import { validator } from "@/lib/utils/validator.utils";
import { CustomError } from "@/lib/utils/customError.utils";
import { AuthRequest } from "@/lib/middleware/isLoggedIn.middleware";

const service = new PlatformServiceImpl();

/* ---------------- Get (no auth required here because routes layer handles it if needed) ---------------- */
export async function getPlatformController(_req?: AuthRequest) {
    try {
        const data = await service.get();
        return NextResponse.json(
            { message: "Platform retrieved", platform: data },
            { status: 200 }
        );
    } catch (error: any) {
        return NextResponse.json(
            { message: error.message || "Internal server error" },
            { status: error.statusCode || 500 }
        );
    }
}

/* ---------------- Update (admin check handled by routes; still guard missing user) ---------------- */
export async function updatePlatformController(req: AuthRequest) {
    try {
        const adminId = req.user?.sub;
        if (!adminId) throw new CustomError(401, "Unauthorized");

        const body = await req.json();
        const dto = new UpdatePlatformDto(body);

        const errors = validator(UpdatePlatformDto, dto);
        if (errors) {
            return NextResponse.json(
                { message: "Validation Error", errors: errors.details },
                { status: 400 }
            );
        }

        const platform = await service.update(adminId, dto);
        return NextResponse.json(
            { message: "Platform updated", platform },
            { status: 200 }
        );
    } catch (error: any) {
        return NextResponse.json(
            { message: error.message || "Internal server error" },
            { status: error.statusCode || 500 }
        );
    }
}
