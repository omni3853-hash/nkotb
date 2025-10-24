import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/utils/dbConnect.utils";
import { AuthRequest, isLoggedIn } from "@/lib/middleware/isLoggedIn.middleware";
import { getCelebrityBySlugController } from "@/lib/controllers/celebrity.controller";
import { CustomError } from "@/lib/utils/customError.utils";

export async function GET(req: AuthRequest, { params }: { params: Promise<{ slug: string }> }) {
    try {
        await dbConnect();
        return await getCelebrityBySlugController(req, { params });
    } catch (e) {
        if (e instanceof CustomError) return NextResponse.json({ message: e.message }, { status: e.statusCode });
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
