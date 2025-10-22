import { NextRequest, NextResponse } from 'next/server';
import { listActivePaymentMethodsController } from '@/lib/controllers/paymentMethod.controller';
import { dbConnect } from '@/lib/utils/dbConnect.utils';
import { isLoggedIn } from '@/lib/middleware/isLoggedIn.middleware';

export async function GET(req: NextRequest) {
    try {
        await dbConnect();
        const middlewareResponse = await isLoggedIn(req);
        if (middlewareResponse.status !== 200) {
            return middlewareResponse;
        }
        return await listActivePaymentMethodsController(req);
    } catch {
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
