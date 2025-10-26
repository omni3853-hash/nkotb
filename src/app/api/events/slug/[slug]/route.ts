import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/utils/dbConnect.utils";
import { AuthRequest, isLoggedIn } from "@/lib/middleware/isLoggedIn.middleware";
import { getEventBySlugController } from "@/lib/controllers/event.controller";
import { CustomError } from "@/lib/utils/customError.utils";

export async function GET(req: AuthRequest, { params }: { params: Promise<{ slug: string }> }) {
    try {
        await dbConnect();
        return await getEventBySlugController(req, { params });
    } catch (e) {
        if (e instanceof CustomError) {
      return NextResponse.json({ message: e.message }, { status: e.statusCode });
    }
    // expose a better error in non-prod
    const msg =
      process.env.NODE_ENV === "production"
        ? "Internal Server Error"
        : (e as Error).message || "Internal Server Error";
    return NextResponse.json({ message: msg }, { status: 500 });
    }
}
