import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/utils/dbConnect.utils";
import { CustomError } from "@/lib/utils/customError.utils";
import { getMediaByIdController } from "@/lib/controllers/rememberbettymedia.controller";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        await dbConnect();
        return await getMediaByIdController(req, { params });
    } catch (e) {
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