import { NextResponse } from "next/server";
import { AuthRequest } from "@/lib/middleware/isLoggedIn.middleware";
import { validator } from "@/lib/utils/validator.utils";
import { CustomError } from "@/lib/utils/customError.utils";
import TransactionServiceImpl from "@/lib/services/impl/transaction.service.impl";
import { TransactionQueryDto } from "@/lib/dto/transaction.dto";

const service = new TransactionServiceImpl();

/* ---------------- User: GET /transactions ---------------- */
export async function listMyTransactionsController(req: AuthRequest) {
    try {
        const userId = req.user?.sub;
        if (!userId) throw new CustomError(401, "Unauthorized");

        const dto = TransactionQueryDto.fromURL(req.url);
        const errors = validator(TransactionQueryDto, dto);
        if (errors) return NextResponse.json({ message: "Validation Error", errors: errors.details }, { status: 400 });

        const data = await service.listForUser(userId, dto);
        return NextResponse.json({ message: "Transactions retrieved", ...data }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ message: error.message || "Internal server error" }, { status: error.statusCode || 500 });
    }
}

/* ---------------- User: GET /transactions/[id] ---------------- */
export async function getMyTransactionByIdController(req: AuthRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const userId = req.user?.sub;
        if (!userId) throw new CustomError(401, "Unauthorized");
        const { id } = await params;

        const item = await service.getById(id);
        if (item.user.toString() !== userId) throw new CustomError(403, "Forbidden");
        return NextResponse.json({ message: "Transaction retrieved", item }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ message: error.message || "Internal server error" }, { status: error.statusCode || 500 });
    }
}

/* ---------------- Admin: GET /admin/transactions ---------------- */
export async function adminListTransactionsController(req: AuthRequest) {
    try {
        const adminId = req.user?.sub;
        if (!adminId) throw new CustomError(401, "Unauthorized");

        const dto = TransactionQueryDto.fromURL(req.url);
        const errors = validator(TransactionQueryDto, dto);
        if (errors) return NextResponse.json({ message: "Validation Error", errors: errors.details }, { status: 400 });

        const data = await service.listAll(dto);
        return NextResponse.json({ message: "Transactions retrieved", ...data }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ message: error.message || "Internal server error" }, { status: error.statusCode || 500 });
    }
}

/* ---------------- Admin: GET /admin/transactions/[id] ---------------- */
export async function adminGetTransactionByIdController(_req: AuthRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const item = await service.getById(id);
        return NextResponse.json({ message: "Transaction retrieved", item }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ message: error.message || "Internal server error" }, { status: error.statusCode || 500 });
    }
}
