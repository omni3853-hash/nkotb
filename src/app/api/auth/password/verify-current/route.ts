import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/utils/dbConnect.utils";
import { verifyCurrentPasswordController } from "@/lib/controllers/auth.controller";
import { CustomError } from "@/lib/utils/customError.utils";
import { isLoggedIn } from "@/lib/middleware/isLoggedIn.middleware";

export async function POST(req: NextRequest) {
    try {
        await dbConnect();
        const middlewareResponse = await isLoggedIn(req);
        if (middlewareResponse.status !== 200) {
            return middlewareResponse;
        }
        return await verifyCurrentPasswordController(req);
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
