'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, ListFilter } from 'lucide-react';
import ReservationStatusFilter from '../dashboard/ReservationStatusFilter';
import BlockReservationModal from './BlockReservationModal';
import { getReservationSpaces } from '@/app/actions/reservation';

export default function OverviewFilters() {
    const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
    const [spaces, setSpaces] = useState<any[]>([]);

    useEffect(() => {
        getReservationSpaces().then((res) => {
            if (res.data) setSpaces(res.data);
        });
    }, []);

    return (
        <div className="flex items-center gap-3">
            <ReservationStatusFilter />
            <button
                onClick={() => setIsBlockModalOpen(true)}
                className="flex w-[138px] items-center gap-2 px-4 py-2.5 border border-[#D0D5DD] rounded-lg text-sm font-medium bg-white hover:bg-gray-50 transition-colors"
            >
                <Calendar size={18} />
                Block Date
            </button>

            <button className="flex items-center gap-2 px-4 py-2.5 border border-[#D0D5DD] rounded-lg text-sm font-medium bg-white hover:bg-gray-50 transition-colors">
                <ListFilter size={18} />
                Filters
            </button>

            <BlockReservationModal
                open={isBlockModalOpen}
                onOpenChange={setIsBlockModalOpen}
                spaces={spaces}
            />
        </div>
    );
}
