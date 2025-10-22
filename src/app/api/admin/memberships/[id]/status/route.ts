import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/utils/dbConnect.utils";
import { isLoggedIn } from "@/lib/middleware/isLoggedIn.middleware";
import { adminUpdateMembershipStatusController } from "@/lib/controllers/membership.controller";
import { CustomError } from "@/lib/utils/customError.utils";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        await dbConnect();
        const middlewareResponse = await isLoggedIn(req, true);
        if (middlewareResponse.status !== 200) {
            return middlewareResponse;
        }
        return await adminUpdateMembershipStatusController(req, { params });
    } catch (e) {
        if (e instanceof CustomError) return NextResponse.json({ message: e.message }, { status: e.statusCode });
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
