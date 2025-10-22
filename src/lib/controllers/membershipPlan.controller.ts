import { NextRequest, NextResponse } from "next/server";
import { validator } from "@/lib/utils/validator.utils";
import { CreateMembershipPlanDto, MembershipPlanQueryDto, UpdateMembershipPlanDto } from "@/lib/dto/membershipPlan.dto";
import { MembershipPlanService } from "@/lib/services/membershipPlan.service";
import MembershipPlanServiceImpl from "@/lib/services/impl/membershipPlan.service.impl";
import { CustomError } from "@/lib/utils/customError.utils";
import { AuthRequest } from "@/lib/middleware/isLoggedIn.middleware";

const service: MembershipPlanService = new MembershipPlanServiceImpl();

export async function createMembershipPlanController(req: AuthRequest) {
    try {
        const adminId = req.user?.sub;
        if (!adminId) throw new CustomError(401, "Unauthorized");

        const body = await req.json();
        const dto = new CreateMembershipPlanDto(body);
        const errors = validator(CreateMembershipPlanDto, dto);
        if (errors) return NextResponse.json({ message: "Validation Error", errors: errors.details }, { status: 400 });

        const plan = await service.create(adminId, dto);
        return NextResponse.json({ message: "Plan created", plan }, { status: 201 });
    } catch (e: any) {
        return NextResponse.json({ message: e.message || "Internal server error" }, { status: e.statusCode || 500 });
    }
}

export async function listMembershipPlansController(req: AuthRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const dto = new MembershipPlanQueryDto({
            search: searchParams.get("search") || undefined,
            onlyActive: searchParams.get("onlyActive") !== "false",
            page: searchParams.get("page") ? Number(searchParams.get("page")) : undefined,
            limit: searchParams.get("limit") ? Number(searchParams.get("limit")) : undefined,
        });
        const errors = validator(MembershipPlanQueryDto, dto);
        if (errors) return NextResponse.json({ message: "Validation Error", errors: errors.details }, { status: 400 });

        const data = await service.list(dto);
        return NextResponse.json({ message: "Plans retrieved", ...data }, { status: 200 });
    } catch (e: any) {
        return NextResponse.json({ message: e.message || "Internal server error" }, { status: e.statusCode || 500 });
    }
}

export async function getMembershipPlanByIdController(req: AuthRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const resolvedParams = await params;
        const plan = await service.getById(resolvedParams.id);
        return NextResponse.json({ message: "Plan retrieved", plan }, { status: 200 });
    } catch (e: any) {
        return NextResponse.json({ message: e.message || "Internal server error" }, { status: e.statusCode || 500 });
    }
}

export async function updateMembershipPlanController(req: AuthRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const adminId = req.user?.sub;
        if (!adminId) throw new CustomError(401, "Unauthorized");

        const body = await req.json();
        const dto = new UpdateMembershipPlanDto(body);
        const errors = validator(UpdateMembershipPlanDto, dto);
        if (errors) return NextResponse.json({ message: "Validation Error", errors: errors.details }, { status: 400 });
        const resolvedParams = await params;
        const plan = await service.update(adminId, resolvedParams.id, dto);
        return NextResponse.json({ message: "Plan updated", plan }, { status: 200 });
    } catch (e: any) {
        return NextResponse.json({ message: e.message || "Internal server error" }, { status: e.statusCode || 500 });
    }
}

export async function deleteMembershipPlanController(req: AuthRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const adminId = req.user?.sub;
        if (!adminId) throw new CustomError(401, "Unauthorized");
        const resolvedParams = await params;
        await service.delete(adminId, resolvedParams.id);
        return NextResponse.json({ message: "Plan deleted" }, { status: 200 });
    } catch (e: any) {
        return NextResponse.json({ message: e.message || "Internal server error" }, { status: e.statusCode || 500 });
    }
}

export async function toggleMembershipPlanActiveController(req: AuthRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const adminId = req.user?.sub;
        if (!adminId) throw new CustomError(401, "Unauthorized");
        const { isActive } = await req.json();
        const resolvedParams = await params;
        const plan = await service.toggleActive(adminId, resolvedParams.id, Boolean(isActive));
        return NextResponse.json({ message: "Plan status updated", plan }, { status: 200 });
    } catch (e: any) {
        return NextResponse.json({ message: e.message || "Internal server error" }, { status: e.statusCode || 500 });
    }
}

export async function setMembershipPlanPopularController(req: AuthRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const adminId = req.user?.sub;
        if (!adminId) throw new CustomError(401, "Unauthorized");
        const { popular } = await req.json();
        const resolvedParams = await params;
        const plan = await service.setPopular(adminId, resolvedParams.id, Boolean(popular));
        return NextResponse.json({ message: "Plan popular flag updated", plan }, { status: 200 });
    } catch (e: any) {
        return NextResponse.json({ message: e.message || "Internal server error" }, { status: e.statusCode || 500 });
    }
}
