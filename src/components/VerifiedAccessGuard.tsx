'use client';

import { useVerifiedAccess } from '@/hooks/useVerifiedAccess';
import { useRouter } from 'nextjs-toploader/app';
import { useEffect, useState } from 'react';

export function useVerifiedAccessGuard() {
    const { organization: hotel, loading, accessState } = useVerifiedAccess();
    const router = useRouter();
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        if (!loading && hotel !== undefined && accessState !== 'checking') {
            setIsReady(true);
        }
    }, [loading, hotel, accessState]);

    useEffect(() => {
        if (isReady) {
            if (accessState === 'error' || accessState === 'email unverified') {
                router.replace('/verify-email');
            } else if (accessState === 'cac unverified') {
                router.replace(`/signup/onboarding/${hotel?.id}`);
            }
        }
    }, [isReady, accessState, hotel?.id, router]);

    return {
        hotel,
        loading,
        accessState,
        isReady,
    };
}
