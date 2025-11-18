import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/utils/dbConnect.utils";
import { createOfflineTicketController } from "@/lib/controllers/ticket.controller";
import { CustomError } from "@/lib/utils/customError.utils";

export async function POST(req: NextRequest) {
    try {
        await dbConnect();
        return await createOfflineTicketController(req);
    } catch (e: any) {
        if (e instanceof CustomError) {
            return NextResponse.json(
                { message: e.message },
                { status: e.statusCode }
            );
        }
        const msg =
            process.env.NODE_ENV === "production"
                ? "Internal Server Error"
                : (e as Error).message || "Internal Server Error";
        return NextResponse.json({ message: msg }, { status: 500 });
    }
}