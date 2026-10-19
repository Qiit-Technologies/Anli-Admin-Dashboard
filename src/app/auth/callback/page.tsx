'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { setAuthCookie } from '@/app/actions/auth';

/**
 * Cross-domain login handoff receiver.
 *
 * The hotel app (weareanli.com/signin → "Sign in as admin") redirects here
 * with the super-admin JWT as `?token=<jwt>` because cookies cannot be set
 * across domains. This page consumes the token immediately, persists it the
 * same way `/login` does (localStorage + `access_token` cookie via the
 * `setAuthCookie` server action), then scrubs it from the URL.
 */
export default function AuthCallbackPage() {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const finish = async () => {
            const params = new URLSearchParams(window.location.search);
            const token = params.get('token');

            if (!token) {
                router.replace('/login');
                return;
            }

            try {
                // localStorage — picked up by the axios interceptor client-side
                localStorage.setItem('access_token', token);
                // Cookie — picked up by the middleware and by axios server-side
                await setAuthCookie(token);
            } catch {
                // Fallback: set the cookie client-side (same pattern as /login)
                document.cookie = `access_token=${token}; path=/; secure; samesite=lax; max-age=${
                    60 * 60 * 2
                }`;
            }

            router.replace('/dashboard');
        };

        finish().catch(() => {
            setError('Something went wrong while signing you in.');
        });
    }, [router]);

    return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6">
            {error ? (
                <div className="w-full max-w-md space-y-3 text-center">
                    <p className="text-sm font-medium text-red-600 dark:text-red-400">
                        {error}
                    </p>
                    <button
                        type="button"
                        onClick={() => router.replace('/login')}
                        className="text-sm text-primary underline"
                    >
                        Back to sign in
                    </button>
                </div>
            ) : (
                <div className="w-full max-w-md space-y-3">
                    <p className="text-center text-sm text-muted-foreground">
                        Signing you in…
                    </p>
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </div>
            )}
        </div>
    );
}
