import { NextRequest, NextResponse } from 'next/server';
import { isLoggedIn } from '@/lib/middleware/isLoggedIn.middleware';
import { getAuditByIdController } from '@/lib/controllers/audit.controller';
import { dbConnect } from '@/lib/utils/dbConnect.utils';
import { CustomError } from '@/lib/utils/customError.utils';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        await dbConnect();
        const middlewareResponse = await isLoggedIn(req, true);
        if (middlewareResponse.status !== 200) {
            return middlewareResponse;
        }
        const resolvedParams = await params;
        return await getAuditByIdController(req, { params: resolvedParams });
    } catch (error) {
        if (error instanceof CustomError) return NextResponse.json({ message: error.message }, { status: error.statusCode });
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
