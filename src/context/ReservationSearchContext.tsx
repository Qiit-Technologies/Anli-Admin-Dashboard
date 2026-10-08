'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ReservationSearchContextType {
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    statusFilter: string;
    setStatusFilter: (status: string) => void;
    startDate: Date | undefined;
    setStartDate: (date: Date | undefined) => void;
    endDate: Date | undefined;
    setEndDate: (date: Date | undefined) => void;
}

const ReservationSearchContext = createContext<
    ReservationSearchContextType | undefined
>(undefined);

export const ReservationSearchProvider = ({
    children,
}: {
    children: ReactNode;
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [startDate, setStartDate] = useState<Date | undefined>(new Date());
    const [endDate, setEndDate] = useState<Date | undefined>(
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    );

    return (
        <ReservationSearchContext.Provider
            value={{
                searchTerm,
                setSearchTerm,
                statusFilter,
                setStatusFilter,
                startDate,
                setStartDate,
                endDate,
                setEndDate,
            }}
        >
            {children}
        </ReservationSearchContext.Provider>
    );
};

export const useReservationSearch = () => {
    const context = useContext(ReservationSearchContext);
    if (context === undefined) {
        throw new Error(
            'useReservationSearch must be used within a ReservationSearchProvider',
        );
    }
    return context;
};
