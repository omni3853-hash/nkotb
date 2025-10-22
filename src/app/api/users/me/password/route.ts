import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/utils/dbConnect.utils";
import { changePasswordController } from "@/lib/controllers/user.controller";
import { CustomError } from "@/lib/utils/customError.utils";
import { isLoggedIn } from "@/lib/middleware/isLoggedIn.middleware";

export async function PATCH(req: NextRequest) {
    try {
        await dbConnect();
        const middlewareResponse = await isLoggedIn(req);
        if (middlewareResponse.status !== 200) {
            return middlewareResponse;
        }

        return await changePasswordController(req);
    } catch (e) {
        if (e instanceof CustomError) return NextResponse.json({ message: e.message }, { status: e.statusCode });
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
