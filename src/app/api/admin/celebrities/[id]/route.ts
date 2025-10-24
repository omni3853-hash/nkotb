import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/utils/dbConnect.utils";
import { AuthRequest, isLoggedIn } from "@/lib/middleware/isLoggedIn.middleware";
import { getCelebrityByIdController, updateCelebrityController, deleteCelebrityController, toggleCelebrityActiveController } from "@/lib/controllers/celebrity.controller";
import { CustomError } from "@/lib/utils/customError.utils";

export async function GET(req: AuthRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        await dbConnect();
        const middlewareResponse = await isLoggedIn(req, true);
        if (middlewareResponse.status !== 200) return middlewareResponse;
        return await getCelebrityByIdController(req, { params });
    } catch (e) {
        if (e instanceof CustomError) return NextResponse.json({ message: e.message }, { status: e.statusCode });
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}

export async function PATCH(req: AuthRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        await dbConnect();
        const middlewareResponse = await isLoggedIn(req, true);
        if (middlewareResponse.status !== 200) return middlewareResponse;

        // Toggle isActive fast-path (matches your commented style)
        const clone = req.clone();
        const body = await clone.json().catch(() => ({}));
        if (Object.prototype.hasOwnProperty.call(body || {}, "isActive")) {
            return await toggleCelebrityActiveController(req, { params });
        }

        return await updateCelebrityController(req, { params });
    } catch (e) {
        if (e instanceof CustomError) return NextResponse.json({ message: e.message }, { status: e.statusCode });
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(req: AuthRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        await dbConnect();
        const middlewareResponse = await isLoggedIn(req, true);
        if (middlewareResponse.status !== 200) return middlewareResponse;
        return await deleteCelebrityController(req, { params });
    } catch (e) {
        if (e instanceof CustomError) return NextResponse.json({ message: e.message }, { status: e.statusCode });
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
