import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/utils/dbConnect.utils";
import { isLoggedIn, AuthRequest } from "@/lib/middleware/isLoggedIn.middleware";
import { adminListSupportTicketsController } from "@/lib/controllers/support-ticket.controller";
import { CustomError } from "@/lib/utils/customError.utils";

export async function GET(req: NextRequest) {
    try {
        await dbConnect();
        const middlewareResponse = await isLoggedIn(req as AuthRequest);
        if (middlewareResponse.status !== 200) return middlewareResponse;
        return await adminListSupportTicketsController(req as AuthRequest);
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