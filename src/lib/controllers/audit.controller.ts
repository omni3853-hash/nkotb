import { NextRequest, NextResponse } from 'next/server';
import { validator } from '@/lib/utils/validator.utils';
import { CreateAuditDto, AuditQueryDto } from '@/lib/dto/audit.dto';
import { AuditService } from '@/lib/services/audit.service';
import AuditServiceImpl from '@/lib/services/impl/audit.service.impl';
import { CustomError } from '@/lib/utils/customError.utils';
import { AuthRequest } from '@/lib/middleware/isLoggedIn.middleware';

const auditService: AuditService = new AuditServiceImpl();

export async function createAuditController(req: NextRequest) {
    try {
        const body = await req.json();
        const dto = new CreateAuditDto(body);
        const errors = validator(CreateAuditDto, dto);
        if (errors) return NextResponse.json({ message: 'Validation Error', errors: errors.details }, { status: 400 });

        const item = await auditService.create(dto);
        return NextResponse.json({ message: 'Audit created', audit: item }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ message: error.message || 'Internal server error' }, { status: error.statusCode || 500 });
    }
}

export async function adminListAuditsController(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const dto = new AuditQueryDto({
            userId: searchParams.get('userId') || undefined,
            action: searchParams.get('action') || undefined,
            resource: searchParams.get('resource') || undefined,
            from: searchParams.get('from') ? new Date(searchParams.get('from')!) : undefined,
            to: searchParams.get('to') ? new Date(searchParams.get('to')!) : undefined,
            page: searchParams.get('page') ? Number(searchParams.get('page')) : undefined,
            limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : undefined,
        });
        const errors = validator(AuditQueryDto, dto);
        if (errors) return NextResponse.json({ message: 'Validation Error', errors: errors.details }, { status: 400 });

        const data = await auditService.adminList(dto);
        return NextResponse.json({ message: 'Audits retrieved', ...data }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ message: error.message || 'Internal server error' }, { status: error.statusCode || 500 });
    }
}

export async function myAuditsController(req: AuthRequest) {
    try {
        const userId = req.user?.sub;
        if (!userId) throw new CustomError(401, 'Unauthorized');

        const { searchParams } = new URL(req.url);
        const dto = new AuditQueryDto({
            action: searchParams.get('action') || undefined,
            resource: searchParams.get('resource') || undefined,
            from: searchParams.get('from') ? new Date(searchParams.get('from')!) : undefined,
            to: searchParams.get('to') ? new Date(searchParams.get('to')!) : undefined,
            page: searchParams.get('page') ? Number(searchParams.get('page')) : undefined,
            limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : undefined,
        });
        const errors = validator(AuditQueryDto, dto);
        if (errors) return NextResponse.json({ message: 'Validation Error', errors: errors.details }, { status: 400 });

        const data = await auditService.userList(userId, dto);
        return NextResponse.json({ message: 'My audits retrieved', ...data }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ message: error.message || 'Internal server error' }, { status: error.statusCode || 500 });
    }
}

export async function getAuditByIdController(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const item = await auditService.getById(params.id);
        return NextResponse.json({ message: 'Audit retrieved', audit: item }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ message: error.message || 'Internal server error' }, { status: error.statusCode || 500 });
    }
}
