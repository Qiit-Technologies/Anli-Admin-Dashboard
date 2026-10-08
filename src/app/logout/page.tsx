'use client';

import { useUser } from '@/context/useUser';
import { useRouter } from 'nextjs-toploader/app';
import { useEffect } from 'react';
import { useSWRConfig } from 'swr';
import { signout } from '../actions/auth';
import { updateStaffLogoutTime } from '../actions/staff';

import useStaffAuth from '@/store/useStaffAuth';

export default function LogoutPage() {
    const router = useRouter();
    const { user, setUser, setLoading } = useUser();
    const { cache, mutate } = useSWRConfig();

    useEffect(() => {
        const userId = user?.id;
        (async () => {
            // Clear React user state first
            setLoading(true);
            setUser(undefined);

            // Clear Staff Auth store
            if (useStaffAuth?.getState) {
                useStaffAuth.getState().clearAuthorizedStaff();
            }

            // Preserve hotelId for staff login page (store in a separate key)
            const hotelId = localStorage.getItem('hotelId');
            if (hotelId) {
                localStorage.setItem('staffLoginHotelId', hotelId);
            }

            // clears all swr cache
            try {
                const keys = Array.from(cache.keys());
                keys.forEach((key) =>
                    mutate(key, undefined, { revalidate: false }),
                );
            } catch (error: any) {
                console.error('Error clearing SWR cache:', error);
            }

            await signout();
            const keysToPreserve = [
                'staffLoginHotelId',
                'hotelId',
                'printerConfig',
                'printerName',
                'printerMethod',
                'printerIp',
                'printerPort',
            ] as const;
            const preservedEntries = new Map<string, string>();
            keysToPreserve.forEach((key) => {
                const value = localStorage.getItem(key);
                if (value !== null) {
                    preservedEntries.set(key, value);
                }
            });

            // Explicitly clear tokens even before general wipe for maximum safety
            localStorage.removeItem('access_token');
            localStorage.removeItem('authToken');

            localStorage.clear();
            sessionStorage.clear();

            preservedEntries.forEach((value, key) => {
                localStorage.setItem(key, value);
            });

            // Aggressively clear access_token and any other token cookies for all possible domains
            // to prevent "Cookie Bleeding" where a stale staff cookie overwrites an admin session.
            const tokensToClear = [
                'access_token',
                'authToken',
                'token',
                'access_tokrn',
            ];
            const domains = [
                '',
                window.location.hostname,
                `.${window.location.hostname}`,
                '.weareanli.com',
                '.anli.solutions',
                'localhost',
            ];

            tokensToClear.forEach((tokenName) => {
                domains.forEach((domain) => {
                    const domainPart = domain ? `; Domain=${domain}` : '';
                    document.cookie = `${tokenName}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT${domainPart};`;
                });
            });

            // Iterate over all existing cookies and clear any that contain 'access_token' or 'authToken'
            try {
                const cookies = document.cookie.split(';');
                for (let i = 0; i < cookies.length; i++) {
                    const cookieName = cookies[i].split('=')[0].trim();
                    if (
                        cookieName.toLowerCase().includes('access_token') ||
                        cookieName.toLowerCase().includes('authtoken') ||
                        cookieName.toLowerCase().includes('access_tokrn')
                    ) {
                        domains.forEach((domain) => {
                            const domainPart = domain
                                ? `; Domain=${domain}`
                                : '';
                            document.cookie = `${cookieName}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT${domainPart};`;
                        });
                    }
                }
            } catch (error: any) {
                console.error('Error during cookie cleanup:', error);
            }

            await updateStaffLogoutTime(userId ?? 0);

            // Using window.location.href instead of router.push to ensure
            // absolutely ALL React state, SWR cache and other memory-based
            // store are wiped clean on logout before redirecting to signin.
            window.location.href = '/signin';
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Run only once on mount

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <h1 className="text-2xl font-bold">Logging out...</h1>
        </div>
    );
}
