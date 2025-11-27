import { NextResponse } from "next/server";
import { AdminUpdateVolunteerStatusDto, CreateVolunteerDto, VolunteerQueryDto } from "../dto/remember-betty.dto";
import { VolunteerServiceImpl } from "../services/impl/volunteer.service.impl";
import { validator } from "../utils/validator.utils";
import { VolunteerStatus } from "../enums/remember-betty.enums";
import { AuthRequest } from "../middleware/isLoggedIn.middleware";
import { CustomError } from "../utils/customError.utils";

const volunteerService = new VolunteerServiceImpl();

export async function createVolunteerController(req: Request) {
    try {
        const body = await req.json();
        const dto = new CreateVolunteerDto(body);
        const errors = validator(CreateVolunteerDto, dto);
        if (errors) {
            return NextResponse.json(
                { message: "Validation Error", errors: errors.details },
                { status: 400 }
            );
        }

        const volunteer = await volunteerService.create(dto);
        return NextResponse.json(
            { message: "Volunteer signup submitted", volunteer },
            { status: 201 }
        );
    } catch (error: any) {
        return NextResponse.json(
            { message: error.message || "Internal server error" },
            { status: error.statusCode || 500 }
        );
    }
}

export async function listVolunteersController(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const dto = new VolunteerQueryDto({
            status: searchParams.get("status") as VolunteerStatus,
            page: searchParams.get("page") ? Number(searchParams.get("page")) : undefined,
            limit: searchParams.get("limit") ? Number(searchParams.get("limit")) : undefined,
        });

        const errors = validator(VolunteerQueryDto, dto);
        if (errors) {
            return NextResponse.json(
                { message: "Validation Error", errors: errors.details },
                { status: 400 }
            );
        }

        const data = await volunteerService.list(dto);
        return NextResponse.json({ message: "Volunteers retrieved", ...data }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json(
            { message: error.message || "Internal server error" },
            { status: error.statusCode || 500 }
        );
    }
}

export async function getVolunteerByIdController(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const resolved = await params;
        const volunteer = await volunteerService.getById(resolved.id);
        return NextResponse.json({ message: "Volunteer retrieved", volunteer }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json(
            { message: error.message || "Internal server error" },
            { status: error.statusCode || 500 }
        );
    }
}

export async function adminUpdateVolunteerStatusController(
    req: AuthRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const adminId = req.user?.sub;
        if (!adminId) throw new CustomError(401, "Unauthorized");

        const body = await req.json();
        const dto = new AdminUpdateVolunteerStatusDto(body);
        const errors = validator(AdminUpdateVolunteerStatusDto, dto);
        if (errors) {
            return NextResponse.json(
                { message: "Validation Error", errors: errors.details },
                { status: 400 }
            );
        }

        const resolved = await params;
        const volunteer = await volunteerService.adminUpdateStatus(adminId, resolved.id, dto);
        return NextResponse.json(
            { message: "Volunteer status updated", volunteer },
            { status: 200 }
        );
    } catch (error: any) {
        return NextResponse.json(
            { message: error.message || "Internal server error" },
            { status: error.statusCode || 500 }
        );
    }
}