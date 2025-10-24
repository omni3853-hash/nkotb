import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/utils/dbConnect.utils";
import { isLoggedIn } from "@/lib/middleware/isLoggedIn.middleware";
import { createCelebrityController, listCelebritiesController } from "@/lib/controllers/celebrity.controller";
import { CustomError } from "@/lib/utils/customError.utils";

export async function GET(req: NextRequest) {
    try {
        await dbConnect();
        return await listCelebritiesController(req as any);
    } catch (e) {
        if (e instanceof CustomError) return NextResponse.json({ message: e.message }, { status: e.statusCode });
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        await dbConnect();
        const middlewareResponse = await isLoggedIn(req, true);
        if (middlewareResponse.status !== 200) return middlewareResponse;
        return await createCelebrityController(req as any);
    } catch (e) {
        if (e instanceof CustomError) return NextResponse.json({ message: e.message }, { status: e.statusCode });
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
