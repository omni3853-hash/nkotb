import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/utils/dbConnect.utils";
import { verifyEmailOtpController } from "@/lib/controllers/auth.controller";
import { CustomError } from "@/lib/utils/customError.utils";

export async function POST(req: NextRequest) {
    try {
        await dbConnect();
        return await verifyEmailOtpController(req);
    } catch (e) {
        if (e instanceof CustomError) return NextResponse.json({ message: e.message }, { status: e.statusCode });
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
