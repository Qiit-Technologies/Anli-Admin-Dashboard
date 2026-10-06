import { jwtDecode } from 'jwt-decode';
import { NextRequest, NextResponse } from 'next/server';
import {
    ROLE_PATHS,
    hasMultipleRolePaths,
    getDefaultPathForModules,
    getRealModuleRoutes,
} from './lib/role-paths';

const PROTECTED_ROUTES = [
    '/dashboard',
    '/admin',
    '/house-keeping',
    '/stock',
    '/front-of-house',
    '/kitchen',
    '/back-of-house',
    '/dashboard?frontoffice=dashboard',
    '/bar',
    '/front-office',
    '/manager',
    '/employee',
    '/banquet',
    '/account',
    '/membership',
    '/reservations',
];

const ROLE_ACCESS_MAP = ROLE_PATHS;

type CustomJwtPayload = {
    role: string;
    email: string;
    exp: number;
    iat: number;
    sub: any;
    modules?: Array<{ id: number; name: string }>;
};

export function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname;
    const accessToken = request.cookies.get('access_token')?.value;

    const ACCESS_DENIED_PAGE = '/access-denied';

    const needsProtection = PROTECTED_ROUTES.some(
        (route) => path === route || path.startsWith(`${route}/`),
    );

    if (!needsProtection) {
        return NextResponse.next();
    }

    try {
        if (!accessToken) {
            return NextResponse.redirect(new URL('/signin', request.url));
        }

        const isTokenExpired = checkTokenExpiration(accessToken);
        if (isTokenExpired) {
            const redirectResponse = NextResponse.redirect(
                new URL('/logout', request.url),
            );
            redirectResponse.cookies.delete('access_token');
            if (typeof window !== 'undefined') {
                localStorage.removeItem('user');
                localStorage.removeItem('hotelId');
                localStorage.removeItem('authToken');
            }
            return redirectResponse;
        }

        const decodedToken: CustomJwtPayload = jwtDecode(accessToken);
        const userRole = decodedToken?.role;
        const userModules = decodedToken?.modules || [];

        const normalizedRole = userRole?.toLowerCase?.() ?? '';
        const isManager = normalizedRole === 'manager';
        const realModuleRoutes = getRealModuleRoutes(userModules);
        const defaultModulePath = getDefaultPathForModules(userModules as any);

        let hasAccess = false;

        if (path.startsWith('/manager')) {
            if (
                isManager ||
                realModuleRoutes.length > 1 ||
                hasMultipleRolePaths(normalizedRole)
            ) {
                hasAccess = true;
            }
        } else if (realModuleRoutes.length === 1) {
            hasAccess =
                path === defaultModulePath ||
                path.startsWith(`${defaultModulePath}/`);
        } else if (realModuleRoutes.length > 1) {
            hasAccess =
                path === '/manager' ||
                path.startsWith('/manager/') ||
                realModuleRoutes.some(
                    (route) =>
                        path === route || path.startsWith(`${route}/`),
                );
        } else {
            hasAccess = checkRoleAccess(normalizedRole, path);
        }

        if (!hasAccess) {
            return NextResponse.redirect(
                new URL(ACCESS_DENIED_PAGE, request.url),
            );
        }

        const response = NextResponse.next();
        response.headers.set('user-role', userRole || 'unknown');
        response.headers.set(
            'has-multiple-modules',
            userModules.length > 1 ? 'true' : 'false',
        );
        response.headers.set(
            'has-multiple-role-paths',
            hasMultipleRolePaths(userRole) ? 'true' : 'false',
        );

        return response;
    } catch (error: any) {
        console.error('Middleware error:', error);
        const response = NextResponse.redirect(new URL('/logout', request.url));
        response.cookies.delete('access_token');
        if (typeof window !== 'undefined') {
            localStorage.removeItem('user');
            localStorage.removeItem('hotelId');
            localStorage.removeItem('authToken');
        }
        return response;
    }
}

function checkRoleAccess(role: string, path: string): boolean {
    if (!role || !ROLE_ACCESS_MAP[role]) {
        return false;
    }

    const allowedPaths = ROLE_ACCESS_MAP[role];

    if (allowedPaths.includes('*')) {
        return true;
    }

    const hasAccess = allowedPaths.some((allowedPath) =>
        path.startsWith(allowedPath),
    );
    return hasAccess;
}

function checkTokenExpiration(token: string): boolean {
    try {
        const decoded = jwtDecode(token);
        if (!decoded || !decoded.exp) return true;

        const isExpired = Date.now() >= decoded.exp * 1000;
        return isExpired;
    } catch (error: any) {
        console.error('Token decode error:', error);
        return true;
    }
}

export const config = {
    matcher: [
        '/dashboard/:path*',
        '/admin/:path*',
        '/house-keeping/:path*',
        '/stock/:path*',
        '/front-of-house/:path*',
        '/kitchen/:path*',
        '/back-of-house/:path*',
        '/bar/:path*',
        '/front-office/:path*',
        '/manager/:path*',
        '/employee/:path*',
        '/banquet/:path*',
        '/account/:path*',
        '/membership/:path*',
        '/reservations/:path*',
    ],
};

export function getTokenFromCookie(name: string): string | null {
    const cookieMatch = document.cookie.match(
        `(^|;)\\s*${name}\\s*=\\s*([^;]+)`,
    );
    return cookieMatch ? cookieMatch[2] : null;
}
