import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/utils/dbConnect.utils";
import { AuthRequest, isLoggedIn } from "@/lib/middleware/isLoggedIn.middleware";
import { CustomError } from "@/lib/utils/customError.utils";
import { adminReviewApplicationController, getApplicationByIdController } from "@/lib/controllers/application.controller";

export async function GET(req: AuthRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        await dbConnect();
        const middlewareResponse = await isLoggedIn(req, true);
        if (middlewareResponse.status !== 200) return middlewareResponse;
        return await getApplicationByIdController(req, { params });
    } catch (e: any) {
        if (e instanceof CustomError) {
            return NextResponse.json({ message: e.message }, { status: e.statusCode });
        }
        const msg =
            process.env.NODE_ENV === "production"
                ? "Internal Server Error"
                : (e as Error).message || "Internal Server Error";
        return NextResponse.json({ message: msg }, { status: 500 });
    }
}

export async function PATCH(req: AuthRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        await dbConnect();
        const middlewareResponse = await isLoggedIn(req, true);
        if (middlewareResponse.status !== 200) return middlewareResponse;
        return await adminReviewApplicationController(req, { params });
    } catch (e: any) {
        if (e instanceof CustomError) {
            return NextResponse.json({ message: e.message }, { status: e.statusCode });
        }
        const msg =
            process.env.NODE_ENV === "production"
                ? "Internal Server Error"
                : (e as Error).message || "Internal Server Error";
        return NextResponse.json({ message: msg }, { status: 500 });
    }
}