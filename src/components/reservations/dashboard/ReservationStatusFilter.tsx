'use client';

import React from 'react';
import { useReservationSearch } from '@/context/ReservationSearchContext';
import { ReservationStatus } from '@/components/reservations/types';

const STATUS_OPTIONS: (ReservationStatus | 'all')[] = [
    'all',
    'Pending',
    'Booked',
    'In Progress',
    'Completed',
    'Cancelled',
];

export default function ReservationStatusFilter() {
    const { statusFilter, setStatusFilter } = useReservationSearch();

    return (
        <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white hover:bg-gray-50 transition-colors focus:outline-none focus:ring-1 focus:ring-orion-blue"
        >
            {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                    {status === 'all' ? 'All Statuses' : status}
                </option>
            ))}
        </select>
    );
}
