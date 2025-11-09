import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/utils/dbConnect.utils";
import { listBlogPostsController } from "@/lib/controllers/blog.controller";
import { CustomError } from "@/lib/utils/customError.utils";

export async function GET(req: NextRequest) {
    try {
        await dbConnect();
        return await listBlogPostsController(req);
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
