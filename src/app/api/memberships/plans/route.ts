import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/utils/dbConnect.utils";
import { listMembershipPlansController } from "@/lib/controllers/membershipPlan.controller";
import { isLoggedIn } from "@/lib/middleware/isLoggedIn.middleware";

export async function GET(req: NextRequest) {
    try {
        await dbConnect();
        const middlewareResponse = await isLoggedIn(req);
        if (middlewareResponse.status !== 200) {
            return middlewareResponse;
        }

        return await listMembershipPlansController(req);
    } catch {
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
