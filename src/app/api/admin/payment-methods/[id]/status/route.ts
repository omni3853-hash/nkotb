import { NextRequest, NextResponse } from 'next/server';
import { isLoggedIn } from '@/lib/middleware/isLoggedIn.middleware';
import { togglePaymentMethodStatusController } from '@/lib/controllers/paymentMethod.controller';
import { dbConnect } from '@/lib/utils/dbConnect.utils';
import { CustomError } from '@/lib/utils/customError.utils';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        await dbConnect();
        const middlewareResponse = await isLoggedIn(req, true);
        if (middlewareResponse.status !== 200) {
            return middlewareResponse;
        }
        return await togglePaymentMethodStatusController(req as any, { params });
    } catch (error) {
        if (error instanceof CustomError) return NextResponse.json({ message: error.message }, { status: error.statusCode });
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
