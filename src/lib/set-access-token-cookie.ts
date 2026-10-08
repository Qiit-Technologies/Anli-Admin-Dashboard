import { cookies } from 'next/headers';

/** Match backend `auth.controller.ts` maxAge (1 day). */
const ACCESS_TOKEN_MAX_AGE_SEC = 24 * 60 * 60;

export async function setAccessTokenCookie(token: string) {
    const cookieStore = await cookies();
    cookieStore.set('access_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: ACCESS_TOKEN_MAX_AGE_SEC,
    });
}
