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

// Single source of truth for the basePath (mirrors next.config.ts).
// The proxy strips it before route checks and prefixes it explicitly on
// redirect targets (the hotel app owns the bare paths on weareanli.com).
const BASE_PATH = '/superadmin';

/**
 * Next.js 16 renamed the middleware file convention to proxy.ts with an
 * exported `proxy` function. The old middleware.ts convention is deprecated
 * and no longer executes reliably (production served protected routes
 * without auth), so this file uses the new convention.
 */
export function proxy(request: NextRequest) {
    // basePath ('/superadmin') is part of request.nextUrl.pathname in
    // middleware — strip it so all route checks below keep working on the
    // logical paths, and prefix it explicitly on redirect targets (the
    // hotel app owns the bare paths on weareanli.com).
    const rawPath = request.nextUrl.pathname;
    const path =
        rawPath === BASE_PATH
            ? '/'
            : rawPath.startsWith(`${BASE_PATH}/`)
              ? rawPath.slice(BASE_PATH.length)
              : rawPath;
    const accessToken = request.cookies.get('access_token')?.value;

    const ACCESS_DENIED_PAGE = `${BASE_PATH}/access-denied`;

    const needsProtection = PROTECTED_ROUTES.some(
        (route) => path === route || path.startsWith(`${route}/`),
    );

    if (!needsProtection) {
        return NextResponse.next();
    }

    try {
        if (!accessToken) {
            return NextResponse.redirect(
                new URL(`${BASE_PATH}/signin`, request.url),
            );
        }

        const isTokenExpired = checkTokenExpiration(accessToken);
        if (isTokenExpired) {
            const redirectResponse = NextResponse.redirect(
                new URL(`${BASE_PATH}/logout`, request.url),
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
        const response = NextResponse.redirect(
            new URL(`${BASE_PATH}/logout`, request.url),
        );
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
    if (!role) {
        return false;
    }
    // Normalize: 'super-admin' (JWT) -> 'super admin' (ROLE_PATHS key)
    const normalizedRole = role.toLowerCase().replace(/[-_]/g, ' ');
    const allowedPaths =
        ROLE_ACCESS_MAP[role] || ROLE_ACCESS_MAP[normalizedRole];
    if (!allowedPaths) {
        return false;
    }

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
    // Both prefixed and unprefixed forms are listed: whether the matcher
    // evaluates the pathname with or without the basePath is
    // version-sensitive, and missing it silently disables auth protection.
    // The strip logic in proxy() normalizes either form before checking.
    // NOTE: matcher entries must be static string literals — Next.js parses
    // this config at compile time, so no template interpolation here.
    matcher: [
        '/superadmin/dashboard/:path*',
        '/superadmin/admin/:path*',
        '/superadmin/house-keeping/:path*',
        '/superadmin/stock/:path*',
        '/superadmin/front-of-house/:path*',
        '/superadmin/kitchen/:path*',
        '/superadmin/back-of-house/:path*',
        '/superadmin/bar/:path*',
        '/superadmin/front-office/:path*',
        '/superadmin/manager/:path*',
        '/superadmin/employee/:path*',
        '/superadmin/banquet/:path*',
        '/superadmin/account/:path*',
        '/superadmin/membership/:path*',
        '/superadmin/reservations/:path*',
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
