import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/utils/dbConnect.utils";
import { CustomError } from "@/lib/utils/customError.utils";
import { createDonationController, listDonationsController } from "@/lib/controllers/donation.controller";

export async function POST(req: NextRequest) {
    try {
        await dbConnect();
        return await createDonationController(req);
    } catch (e: any) {
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

export async function GET(req: NextRequest) {
    try {
        await dbConnect();
        return await listDonationsController(req);
    } catch (e: any) {
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