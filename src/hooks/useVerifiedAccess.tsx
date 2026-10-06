'use client';
import { useEffect, useState } from 'react';
import useHotel from './useHotel';

export function useVerifiedAccess() {
    const { organization, loading, error } = useHotel();
    const [accessState, setAccessState] = useState('checking');

    useEffect(() => {
        if (!loading) {
            if (error || !organization) {
                setAccessState('error');
            } else if (!organization.isCacVerified) {
                setAccessState('cac unverified');
            } else if (!organization.isEmailVerified) {
                setAccessState('email unverified');
            } else {
                setAccessState('verified');
            }
        }
    }, [organization, loading, error]);

    return {
        organization,
        loading,
        error,
        accessState,
    };
}
