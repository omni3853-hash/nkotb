import { NextRequest, NextResponse } from 'next/server';
import { isLoggedIn } from '@/lib/middleware/isLoggedIn.middleware';
import { createPaymentMethodController, adminListPaymentMethodsController } from '@/lib/controllers/paymentMethod.controller';
import { dbConnect } from '@/lib/utils/dbConnect.utils';
import { CustomError } from '@/lib/utils/customError.utils';

export async function GET(req: NextRequest) {
    try {
        await dbConnect();
        const middlewareResponse = await isLoggedIn(req, true);
        if (middlewareResponse.status !== 200) {
            return middlewareResponse;
        }
        return await adminListPaymentMethodsController(req);
    } catch (error) {
        if (error instanceof CustomError) return NextResponse.json({ message: error.message }, { status: error.statusCode });
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        await dbConnect();
        const middlewareResponse = await isLoggedIn(req, true);
        if (middlewareResponse.status !== 200) {
            return middlewareResponse;
        }
        return await createPaymentMethodController(req);
    } catch (error) {
        if (error instanceof CustomError) return NextResponse.json({ message: error.message }, { status: error.statusCode });
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
