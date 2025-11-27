import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/utils/dbConnect.utils";
import { CustomError } from "@/lib/utils/customError.utils";
import { getApplicationByIdController } from "@/lib/controllers/application.controller";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        await dbConnect();
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