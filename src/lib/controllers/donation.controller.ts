import { NextResponse } from "next/server";
import { AdminUpdateDonationStatusDto, CreateDonationDto, DonationQueryDto } from "../dto/remember-betty.dto";
import { validator } from "../utils/validator.utils";
import { DonationServiceImpl } from "../services/impl/donation.service.impl";
import { DonationStatus } from "../enums/remember-betty.enums";
import { AuthRequest } from "../middleware/isLoggedIn.middleware";
import { CustomError } from "../utils/customError.utils";

const donationService = new DonationServiceImpl();

export async function createDonationController(req: Request) {
    try {
        const body = await req.json();
        const dto = new CreateDonationDto(body);
        const errors = validator(CreateDonationDto, dto);
        if (errors) {
            return NextResponse.json(
                { message: "Validation Error", errors: errors.details },
                { status: 400 }
            );
        }

        const donation = await donationService.create(dto);
        return NextResponse.json(
            { message: "Donation submitted successfully", donation },
            { status: 201 }
        );
    } catch (error: any) {
        return NextResponse.json(
            { message: error.message || "Internal server error" },
            { status: error.statusCode || 500 }
        );
    }
}

export async function listDonationsController(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const dto = new DonationQueryDto({
            status: searchParams.get("status") as DonationStatus,
            donorEmail: searchParams.get("donorEmail") || undefined,
            page: searchParams.get("page") ? Number(searchParams.get("page")) : undefined,
            limit: searchParams.get("limit") ? Number(searchParams.get("limit")) : undefined,
        });

        const errors = validator(DonationQueryDto, dto);
        if (errors) {
            return NextResponse.json(
                { message: "Validation Error", errors: errors.details },
                { status: 400 }
            );
        }

        const data = await donationService.list(dto);
        return NextResponse.json({ message: "Donations retrieved", ...data }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json(
            { message: error.message || "Internal server error" },
            { status: error.statusCode || 500 }
        );
    }
}

export async function getDonationByIdController(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const resolved = await params;
        const donation = await donationService.getById(resolved.id);
        return NextResponse.json(
            { message: "Donation retrieved", donation },
            { status: 200 }
        );
    } catch (error: any) {
        return NextResponse.json(
            { message: error.message || "Internal server error" },
            { status: error.statusCode || 500 }
        );
    }
}

export async function adminUpdateDonationStatusController(
    req: AuthRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const adminId = req.user?.sub;
        if (!adminId) throw new CustomError(401, "Unauthorized");

        const body = await req.json();
        const dto = new AdminUpdateDonationStatusDto(body);
        const errors = validator(AdminUpdateDonationStatusDto, dto);
        if (errors) {
            return NextResponse.json(
                { message: "Validation Error", errors: errors.details },
                { status: 400 }
            );
        }

        const resolved = await params;
        const donation = await donationService.adminUpdateStatus(adminId, resolved.id, dto);
        return NextResponse.json(
            { message: "Donation status updated", donation },
            { status: 200 }
        );
    } catch (error: any) {
        return NextResponse.json(
            { message: error.message || "Internal server error" },
            { status: error.statusCode || 500 }
        );
    }
}