import { NextRequest, NextResponse } from 'next/server';
import { isLoggedIn, AuthRequest } from '@/lib/middleware/isLoggedIn.middleware';
import { myNotificationsController, markAllNotificationsReadController } from '@/lib/controllers/notification.controller';
import { dbConnect } from '@/lib/utils/dbConnect.utils';
import { CustomError } from '@/lib/utils/customError.utils';

export async function GET(req: NextRequest) {
    try {
        await dbConnect();
        const middlewareResponse = await isLoggedIn(req);
        if (middlewareResponse.status !== 200) {
            return middlewareResponse;
        }

        return await myNotificationsController(req);
    } catch (error) {
        if (error instanceof CustomError) return NextResponse.json({ message: error.message }, { status: error.statusCode });
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    // Mark ALL as read
    try {
        await dbConnect();
        const middlewareResponse = await isLoggedIn(req);
        if (middlewareResponse.status !== 200) {
            return middlewareResponse;
        }

        return await markAllNotificationsReadController(req);
    } catch (error) {
        if (error instanceof CustomError) return NextResponse.json({ message: error.message }, { status: error.statusCode });
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
