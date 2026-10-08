'use client';

import { getMe } from '@/app/actions/users';
import { useUser } from '@/context/useUser';
import { useCallback, useEffect } from 'react';
import useSWR from 'swr';

const USER_PROFILE_KEY = 'user-profile';
const AUTH_PAGES = new Set(['/signin', '/signup', '/staff-login', '/logout']);

export function useUserProfile() {
    const { setUser, setLoading } = useUser();
    const isBrowser = typeof window !== 'undefined';
    const pathname = isBrowser ? window.location.pathname : '';
    const isAuthPage = isBrowser && AUTH_PAGES.has(pathname);
    const hasAuthToken =
        isBrowser && Boolean(localStorage.getItem('authToken'));

    const { data, error, isLoading, mutate } = useSWR(
        hasAuthToken && !isAuthPage ? USER_PROFILE_KEY : null,
        async () => {
            const result = await getMe();

            if ('error' in result) {
                console.log('Error fetching user details:', result.error);
                throw new Error(result.error);
            }

            if ('data' in result && result.data) {
                console.log('me', result.data);
                return {
                    id: result.data.id,
                    fullName: result.data.fullName,
                    email: result.data.email,
                    profileImage: result.data.profileImage,
                    orgName: result.data.orgName,
                    roles: result.data.roles,
                    permissions: result.data.permissions,
                    modules: result.data.modules,
                    hotel: result.data.hotel,
                };
            }

            return null;
        },
        {
            revalidateOnFocus: false,
            dedupingInterval: 60000,
        },
    );

    useEffect(() => {
        setLoading(isLoading);

        if (data) {
            setUser(data);
        } else if (error && hasAuthToken) {
            try {
                const stored = localStorage.getItem('user');
                if (stored) {
                    setUser(JSON.parse(stored));
                }
            } catch {
                // Corrupted value — ignore, will be set again on next login
            }
        } else if (!isLoading) {
            setUser(undefined);
        }
    }, [data, isLoading, error, hasAuthToken, setUser, setLoading]);

    const refreshProfile = useCallback(() => {
        mutate();
    }, [mutate]);

    return { refreshProfile, error };
}
