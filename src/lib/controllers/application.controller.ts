import { NextResponse } from "next/server";
import { AdminReviewApplicationDto, ApplicationQueryDto, CreateAssistanceApplicationDto } from "../dto/remember-betty.dto";
import { AssistanceApplicationServiceImpl } from "../services/impl/application.service.impl";
import { validator } from "../utils/validator.utils";
import { ApplicationStatus } from "../enums/remember-betty.enums";
import { CustomError } from "../utils/customError.utils";
import { AuthRequest } from "../middleware/isLoggedIn.middleware";

const applicationService = new AssistanceApplicationServiceImpl();

export async function createApplicationController(req: Request) {
    try {
        const body = await req.json();
        const dto = new CreateAssistanceApplicationDto(body);
        const errors = validator(CreateAssistanceApplicationDto, dto);
        if (errors) {
            return NextResponse.json(
                { message: "Validation Error", errors: errors.details },
                { status: 400 }
            );
        }

        const application = await applicationService.create(dto);
        return NextResponse.json(
            { message: "Application submitted successfully", application },
            { status: 201 }
        );
    } catch (error: any) {
        return NextResponse.json(
            { message: error.message || "Internal server error" },
            { status: error.statusCode || 500 }
        );
    }
}

export async function listApplicationsController(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const dto = new ApplicationQueryDto({
            status: searchParams.get("status") as ApplicationStatus,
            submissionMonth: searchParams.get("submissionMonth") || undefined,
            page: searchParams.get("page") ? Number(searchParams.get("page")) : undefined,
            limit: searchParams.get("limit") ? Number(searchParams.get("limit")) : undefined,
        });

        const errors = validator(ApplicationQueryDto, dto);
        if (errors) {
            return NextResponse.json(
                { message: "Validation Error", errors: errors.details },
                { status: 400 }
            );
        }

        const data = await applicationService.list(dto);
        return NextResponse.json(
            { message: "Applications retrieved", ...data },
            { status: 200 }
        );
    } catch (error: any) {
        return NextResponse.json(
            { message: error.message || "Internal server error" },
            { status: error.statusCode || 500 }
        );
    }
}

export async function getApplicationByIdController(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const resolved = await params;
        const application = await applicationService.getById(resolved.id);
        return NextResponse.json(
            { message: "Application retrieved", application },
            { status: 200 }
        );
    } catch (error: any) {
        return NextResponse.json(
            { message: error.message || "Internal server error" },
            { status: error.statusCode || 500 }
        );
    }
}

export async function adminReviewApplicationController(
    req: AuthRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const adminId = req.user?.sub;
        if (!adminId) throw new CustomError(401, "Unauthorized");

        const body = await req.json();
        const dto = new AdminReviewApplicationDto(body);
        const errors = validator(AdminReviewApplicationDto, dto);
        if (errors) {
            return NextResponse.json(
                { message: "Validation Error", errors: errors.details },
                { status: 400 }
            );
        }

        const resolved = await params;
        const application = await applicationService.adminReview(adminId, resolved.id, dto);
        return NextResponse.json(
            { message: "Application reviewed", application },
            { status: 200 }
        );
    } catch (error: any) {
        return NextResponse.json(
            { message: error.message || "Internal server error" },
            { status: error.statusCode || 500 }
        );
    }
}