import { NextResponse } from "next/server";
import { AuthRequest } from "@/lib/middleware/isLoggedIn.middleware";
import { validator } from "@/lib/utils/validator.utils";
import { CustomError } from "@/lib/utils/customError.utils";
import DepositServiceImpl from "@/lib/services/impl/deposit.service.impl";
import { CreateDepositDto, DepositQueryDto, AdminCreateDepositDto, UpdateDepositStatusDto } from "@/lib/dto/deposit.dto";

const service = new DepositServiceImpl();

/* ---------------- User: POST /deposits ---------------- */
export async function createDepositController(req: AuthRequest) {
    try {
        const userId = req.user?.sub;
        if (!userId) throw new CustomError(401, "Unauthorized");

        const body = await req.json();
        const dto = new CreateDepositDto(body);
        const errors = validator(CreateDepositDto, dto);
        if (errors) {
            return NextResponse.json({ message: "Validation Error", errors: errors.details }, { status: 400 });
        }

        const deposit = await service.create(userId, dto);
        return NextResponse.json({ message: "Deposit created", deposit }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ message: error.message || "Internal server error" }, { status: error.statusCode || 500 });
    }
}

/* ---------------- User: GET /deposits ---------------- */
export async function listMyDepositsController(req: AuthRequest) {
    try {
        const userId = req.user?.sub;
        if (!userId) throw new CustomError(401, "Unauthorized");

        const dto = DepositQueryDto.fromURL(req.url);
        const errors = validator(DepositQueryDto, dto);
        if (errors) {
            return NextResponse.json({ message: "Validation Error", errors: errors.details }, { status: 400 });
        }

        const data = await service.listMine(userId, dto);
        return NextResponse.json({ message: "Deposits retrieved", ...data }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ message: error.message || "Internal server error" }, { status: error.statusCode || 500 });
    }
}

/* -------- User: GET /deposits/[id] (mine) -------- */
export async function getMyDepositByIdController(req: AuthRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const userId = req.user?.sub;
        if (!userId) throw new CustomError(401, "Unauthorized");
        const { id } = await params;

        const item = await service.getMineById(userId, id);
        return NextResponse.json({ message: "Deposit retrieved", item }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ message: error.message || "Internal server error" }, { status: error.statusCode || 500 });
    }
}

/* ---------------- Admin: POST /admin/deposits ---------------- */
export async function adminCreateDepositController(req: AuthRequest) {
    try {
        const adminId = req.user?.sub;
        if (!adminId) throw new CustomError(401, "Unauthorized");

        const body = await req.json();
        const dto = new AdminCreateDepositDto(body);

        const errors = validator(AdminCreateDepositDto, dto);
        if (errors) {
            return NextResponse.json({ message: "Validation Error", errors: errors.details }, { status: 400 });
        }

        const deposit = await service.adminCreate(adminId, dto);
        return NextResponse.json({ message: "Deposit created", deposit }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ message: error.message || "Internal server error" }, { status: error.statusCode || 500 });
    }
}

/* ---------------- Admin: GET /admin/deposits ---------------- */
export async function adminListDepositsController(req: AuthRequest) {
    try {
        const adminId = req.user?.sub;
        if (!adminId) throw new CustomError(401, "Unauthorized");

        const dto = DepositQueryDto.fromURL(req.url);
        const errors = validator(DepositQueryDto, dto);
        if (errors) {
            return NextResponse.json({ message: "Validation Error", errors: errors.details }, { status: 400 });
        }

        const data = await service.adminList(dto);
        return NextResponse.json({ message: "Deposits retrieved", ...data }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ message: error.message || "Internal server error" }, { status: error.statusCode || 500 });
    }
}

/* ---------------- Admin: GET /admin/deposits/[id] ---------------- */
export async function adminGetDepositByIdController(_req: AuthRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const item = await service.adminGetById(id);
        return NextResponse.json({ message: "Deposit retrieved", item }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ message: error.message || "Internal server error" }, { status: error.statusCode || 500 });
    }
}

/* -------- Admin: PATCH /admin/deposits/[id]/status -------- */
export async function adminUpdateDepositStatusController(req: AuthRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const adminId = req.user?.sub;
        if (!adminId) throw new CustomError(401, "Unauthorized");

        const { id } = await params;
        const body = await req.json();
        const dto = new UpdateDepositStatusDto(body);

        const errors = validator(UpdateDepositStatusDto, dto);
        if (errors) {
            return NextResponse.json({ message: "Validation Error", errors: errors.details }, { status: 400 });
        }

        const deposit = await service.adminUpdateStatus(adminId, id, dto);
        return NextResponse.json({ message: "Deposit status updated", deposit }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ message: error.message || "Internal server error" }, { status: error.statusCode || 500 });
    }
}

/* ---------------- Admin: DELETE /admin/deposits/[id] ---------------- */
export async function adminDeleteDepositController(req: AuthRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const adminId = req.user?.sub;
        if (!adminId) throw new CustomError(401, "Unauthorized");

        const { id } = await params;
        await service.adminDelete(adminId, id);
        return NextResponse.json({ message: "Deposit deleted" }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ message: error.message || "Internal server error" }, { status: error.statusCode || 500 });
    }
}
