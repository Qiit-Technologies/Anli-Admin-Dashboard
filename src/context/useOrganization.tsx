'use client';
import { fetchHotelById } from '@/app/actions/hotel';
import React, { createContext, useContext } from 'react';
import useSWR from 'swr';

interface OrganizationDetail {
    id: number;
    name: string;
    isActive: boolean;
    address: string;
    businessType: 'HOTEL' | string;
    registrationNumber: string;
    country: string;
    state: string;
    createdAt: string | Date;
    taxId: string | null;
    incorporationCert: string | null;
    boardingToken: string | null;
    services: string;
    isEmailVerified: boolean;
    isCacVerified: boolean;
}

interface OrganizationContextType {
    organization: OrganizationDetail | null;
    loading: boolean;
    error: Error | null;
    refreshOrganization: () => void;
}

const ORGANIZATION_KEY = 'organization-details';

const OrganizationContext = createContext<OrganizationContextType>({
    organization: null,
    loading: false,
    error: null,
    refreshOrganization: () => { },
});

export function OrganizationProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const { data, error, isLoading, mutate } = useSWR<OrganizationDetail>(
        ORGANIZATION_KEY,
        async () => {
            const response = await fetchHotelById();
            return response.data;
        },
        {
            revalidateOnFocus: false,
            dedupingInterval: 60000,
        },
    );

    const refreshOrganization = () => {
        mutate();
    };

    return (
        <OrganizationContext.Provider
            value={{
                organization: data ?? null,
                loading: isLoading,
                error: error ?? null,
                refreshOrganization,
            }}
        >
            {children}
        </OrganizationContext.Provider>
    );
}

export function useOrganization() {
    const context = useContext(OrganizationContext);
    if (context === undefined) {
        throw new Error(
            'useOrganization must be used within an OrganizationProvider',
        );
    }
    return context;
}
