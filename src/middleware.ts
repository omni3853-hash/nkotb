import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Middleware function to handle protected routes
export function middleware(req: NextRequest) {
    const accessToken = req.cookies.get('accessTokenCelebrityManagement')?.value;
    const protectedRoutes = ["/admin-dashboard", "/user-dashboard"];

    const isProtectedRoute = protectedRoutes.some((route) =>
        req.nextUrl.pathname.startsWith(route)
    );

    if (isProtectedRoute && !accessToken) {
        return NextResponse.redirect(new URL('/auth', req.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/admin-dashboard:path*", "/user-dashboard:path*"],
};