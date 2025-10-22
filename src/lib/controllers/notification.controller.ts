import { NextResponse } from 'next/server';
import { validator } from '@/lib/utils/validator.utils';
import { CreateNotificationDto, UpdateNotificationDto, NotificationQueryDto } from '@/lib/dto/notification.dto';
import { NotificationService } from '@/lib/services/notification.service';
import NotificationServiceImpl from '@/lib/services/impl/notification.service.impl';
import { CustomError } from '@/lib/utils/customError.utils';
import { AuthRequest } from '@/lib/middleware/isLoggedIn.middleware';

const notificationService: NotificationService = new NotificationServiceImpl();

/* ---------------- Admin ---------------- */
export async function createNotificationController(req: AuthRequest) {
    try {
        const body = await req.json();
        const dto = new CreateNotificationDto(body);
        const errors = validator(CreateNotificationDto, dto);
        if (errors) return NextResponse.json({ message: 'Validation Error', errors: errors.details }, { status: 400 });

        const notification = await notificationService.create(dto);
        return NextResponse.json({ message: 'Notification created', notification }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ message: error.message || 'Internal server error' }, { status: error.statusCode || 500 });
    }
}

export async function adminListNotificationsController(req: AuthRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const dto = new NotificationQueryDto({
            type: searchParams.get('type') || undefined,
            read: searchParams.get('read') ? searchParams.get('read') === 'true' : undefined,
            page: searchParams.get('page') ? Number(searchParams.get('page')) : undefined,
            limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : undefined,
        });
        const errors = validator(NotificationQueryDto, dto);
        if (errors) return NextResponse.json({ message: 'Validation Error', errors: errors.details }, { status: 400 });

        const data = await notificationService.adminList(dto);
        return NextResponse.json({ message: 'Notifications retrieved', ...data }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ message: error.message || 'Internal server error' }, { status: error.statusCode || 500 });
    }
}

export async function updateNotificationController(req: AuthRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const body = await req.json();
        const dto = new UpdateNotificationDto(body);
        const errors = validator(UpdateNotificationDto, dto);
        if (errors) return NextResponse.json({ message: 'Validation Error', errors: errors.details }, { status: 400 });
        const resolvedParams = await params;
        const notification = await notificationService.update(resolvedParams.id, dto);
        return NextResponse.json({ message: 'Notification updated', notification }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ message: error.message || 'Internal server error' }, { status: error.statusCode || 500 });
    }
}

export async function deleteNotificationController(req: AuthRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const resolvedParams = await params;
        await notificationService.delete(resolvedParams.id);
        return NextResponse.json({ message: 'Notification deleted' }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ message: error.message || 'Internal server error' }, { status: error.statusCode || 500 });
    }
}

export async function getNotificationByIdController(req: AuthRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const resolvedParams = await params;
        const notification = await notificationService.getById(resolvedParams.id);
        return NextResponse.json({ message: 'Notification retrieved', notification }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ message: error.message || 'Internal server error' }, { status: error.statusCode || 500 });
    }
}

/* ---------------- User ---------------- */
export async function myNotificationsController(req: AuthRequest) {
    try {
        const userId = req.user?.sub;
        if (!userId) throw new CustomError(401, 'Unauthorized');

        const { searchParams } = new URL(req.url);
        const dto = new NotificationQueryDto({
            type: searchParams.get('type') || undefined,
            read: searchParams.get('read') ? searchParams.get('read') === 'true' : undefined,
            page: searchParams.get('page') ? Number(searchParams.get('page')) : undefined,
            limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : undefined,
        });

        const errors = validator(NotificationQueryDto, dto);
        if (errors) return NextResponse.json({ message: 'Validation Error', errors: errors.details }, { status: 400 });

        const data = await notificationService.myList(userId, dto);
        return NextResponse.json({ message: 'Notifications retrieved', ...data }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ message: error.message || 'Internal server error' }, { status: error.statusCode || 500 });
    }
}

export async function markNotificationReadController(req: AuthRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const userId = req.user?.sub;
        if (!userId) throw new CustomError(401, 'Unauthorized');
        const resolvedParams = await params;
        const notification = await notificationService.markRead(resolvedParams.id, userId);
        return NextResponse.json({ message: 'Notification marked as read', notification }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ message: error.message || 'Internal server error' }, { status: error.statusCode || 500 });
    }
}

export async function markAllNotificationsReadController(req: AuthRequest) {
    try {
        const userId = req.user?.sub;
        if (!userId) throw new CustomError(401, 'Unauthorized');

        const count = await notificationService.markAllRead(userId);
        return NextResponse.json({ message: 'All notifications marked as read', count }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ message: error.message || 'Internal server error' }, { status: error.statusCode || 500 });
    }
}
