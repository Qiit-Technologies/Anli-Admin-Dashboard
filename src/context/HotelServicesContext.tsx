'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import useSWR from 'swr';
import { fetchHotelDetailsById } from '@/app/actions/hotel';
import { useHotelServices } from '@/lib/hotel-services';

interface HotelServicesContextType {
    hotelServices: Array<{ label: string; value: string }>;
    isLoading: boolean;
}

const HotelServicesContext = createContext<HotelServicesContextType | undefined>(undefined);

export const useHotelServicesContext = (): HotelServicesContextType => {
    const context = useContext(HotelServicesContext);
    if (context === undefined) {
        throw new Error('useHotelServicesContext must be used within a HotelServicesProvider');
    }
    return context;
};

interface HotelServicesProviderProps {
    children: ReactNode;
}

export const HotelServicesProvider: React.FC<HotelServicesProviderProps> = ({ children }) => {
    const { data: hotelResponse, isLoading } = useSWR('/hotel/me', () =>
        fetchHotelDetailsById(),
    );
    
    const hotelServices = useHotelServices(hotelResponse);

    const value: HotelServicesContextType = {
        hotelServices,
        isLoading,
    };

    return (
        <HotelServicesContext.Provider value={value}>
            {children}
        </HotelServicesContext.Provider>
    );
};
