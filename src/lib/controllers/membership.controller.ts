import { NextRequest, NextResponse } from "next/server";
import { AuthRequest } from "@/lib/middleware/isLoggedIn.middleware";
import { validator } from "@/lib/utils/validator.utils";
import { CreateMembershipDto, MembershipQueryDto, UpdateMembershipStatusDto, UpgradeMembershipDto } from "@/lib/dto/membership.dto";
import { MembershipService } from "@/lib/services/membership.service";
import MembershipServiceImpl from "@/lib/services/impl/membership.service.impl";
import { CustomError } from "@/lib/utils/customError.utils";

const service: MembershipService = new MembershipServiceImpl();

/* --------------------------- USER --------------------------- */
export async function createMembershipController(req: AuthRequest) {
    try {
        const userId = req.user?.sub;
        if (!userId) throw new CustomError(401, "Unauthorized");

        const body = await req.json();
        const dto = new CreateMembershipDto(body);
        const errors = validator(CreateMembershipDto, dto);
        if (errors) return NextResponse.json({ message: "Validation Error", errors: errors.details }, { status: 400 });

        const membership = await service.create(userId, dto);
        return NextResponse.json({ message: "Membership created", membership }, { status: 201 });
    } catch (e: any) {
        return NextResponse.json({ message: e.message || "Internal server error" }, { status: e.statusCode || 500 });
    }
}

export async function upgradeMembershipController(req: AuthRequest) {
    try {
        const userId = req.user?.sub;
        if (!userId) throw new CustomError(401, "Unauthorized");

        const body = await req.json();
        const dto = new UpgradeMembershipDto(body);
        const errors = validator(UpgradeMembershipDto, dto);
        if (errors) return NextResponse.json({ message: "Validation Error", errors: errors.details }, { status: 400 });

        const membership = await service.upgrade(userId, dto);
        return NextResponse.json({ message: "Membership upgrade submitted", membership }, { status: 201 });
    } catch (e: any) {
        return NextResponse.json({ message: e.message || "Internal server error" }, { status: e.statusCode || 500 });
    }
}

export async function myMembershipsController(req: AuthRequest) {
    try {
        const userId = req.user?.sub;
        if (!userId) throw new CustomError(401, "Unauthorized");

        // enum-safe, supports all/*, optional default via env
        const dto = MembershipQueryDto.fromURL(req.url);

        const errors = validator(MembershipQueryDto, dto);
        if (errors)
            return NextResponse.json(
                { message: "Validation Error", errors: errors.details },
                { status: 400 }
            );

        const data = await service.myMemberships(userId, dto);
        return NextResponse.json(
            { message: "Memberships retrieved", ...data },
            { status: 200 }
        );
    } catch (e: any) {
        const status =
            e instanceof CustomError
                ? e.statusCode
                : e?.message?.startsWith("Invalid membership status")
                    ? 400
                    : 500;

        return NextResponse.json(
            { message: e.message || "Internal server error" },
            { status }
        );
    }
}

export async function getMyMembershipByIdController(req: AuthRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const userId = req.user?.sub;
        if (!userId) throw new CustomError(401, "Unauthorized");
        const resolvedParams = await params;
        const m = await service.getMyMembershipById(userId, resolvedParams.id);
        return NextResponse.json({ message: "Membership retrieved", membership: m }, { status: 200 });
    } catch (e: any) {
        return NextResponse.json({ message: e.message || "Internal server error" }, { status: e.statusCode || 500 });
    }
}

export async function cancelAutoRenewController(req: AuthRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const userId = req.user?.sub;
        if (!userId) throw new CustomError(401, "Unauthorized");
        const resolvedParams = await params;
        const m = await service.cancelAutoRenew(userId, resolvedParams.id);
        return NextResponse.json({ message: "Auto-renew disabled", membership: m }, { status: 200 });
    } catch (e: any) {
        return NextResponse.json({ message: e.message || "Internal server error" }, { status: e.statusCode || 500 });
    }
}

/* --------------------------- ADMIN -------------------------- */
export async function adminListMembershipsController(req: NextRequest) {
    try {
        // enum-safe, supports all/*, optional default via env
        const dto = MembershipQueryDto.fromURL(req.url);

        const errors = validator(MembershipQueryDto, dto);
        if (errors)
            return NextResponse.json(
                { message: "Validation Error", errors: errors.details },
                { status: 400 }
            );

        const data = await service.adminList(dto);
        return NextResponse.json(
            { message: "Memberships retrieved", ...data },
            { status: 200 }
        );
    } catch (e: any) {
        const status =
            e?.message?.startsWith("Invalid membership status") ? 400 : e.statusCode || 500;

        return NextResponse.json(
            { message: e.message || "Internal server error" },
            { status }
        );
    }
}

export async function adminGetMembershipByIdController(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const resolvedParams = await params;
        const m = await service.adminGetById(resolvedParams.id);
        return NextResponse.json({ message: "Membership retrieved", membership: m }, { status: 200 });
    } catch (e: any) {
        return NextResponse.json({ message: e.message || "Internal server error" }, { status: e.statusCode || 500 });
    }
}

export async function adminUpdateMembershipStatusController(req: AuthRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const adminId = req.user?.sub;
        if (!adminId) throw new CustomError(401, "Unauthorized");

        const body = await req.json();
        const dto = new UpdateMembershipStatusDto(body);
        const errors = validator(UpdateMembershipStatusDto, dto);
        if (errors) return NextResponse.json({ message: "Validation Error", errors: errors.details }, { status: 400 });

        const resolvedParams = await params;
        const m = await service.adminUpdateStatus(adminId, resolvedParams.id, dto);
        return NextResponse.json({ message: "Membership status updated", membership: m }, { status: 200 });
    } catch (e: any) {
        return NextResponse.json({ message: e.message || "Internal server error" }, { status: e.statusCode || 500 });
    }
}
