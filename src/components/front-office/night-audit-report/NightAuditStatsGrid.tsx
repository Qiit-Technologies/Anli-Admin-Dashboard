'use client';

import React from 'react';
import NightAuditStatCard from './NightAuditStatCard';

export interface NightAuditStats {
    totalRoomsInProperty: number;
    roomsSold: number;
    roomsAvailableToday: number;
    complimentaryHouseUse: number;
    earlyCheckouts: number;
    noShows: number;
    complimentaryHouseUse2: number;
    occupancy: string;
}

interface NightAuditStatsGridProps {
    data?: Partial<NightAuditStats>;
    loading?: boolean;
}

export default function NightAuditStatsGrid({
    data,
    loading = false,
}: NightAuditStatsGridProps) {
    const statsRow1 = [
        {
            title: 'Total Rooms in Property',
            value: data?.totalRoomsInProperty ?? 0,
            backgroundImage: '/reservation/reservationcard.png',
            bgColor: '#FEFAFA',
        },
        {
            title: 'Rooms Sold',
            value: data?.roomsSold ?? 0,
            backgroundImage: '/reservation/reservationcard.png',
            bgColor: '#F6FCFF',
        },
        {
            title: 'Rooms Available Today',
            value: data?.roomsAvailableToday ?? 0,
            backgroundImage: '/reservation/reservationcard.png',
            bgColor: '#F6FCFF',
        },
        {
            title: 'Complimentary/House Use',
            value: data?.complimentaryHouseUse ?? 0,
            backgroundImage: '/reservation/reservationcard.png',
            bgColor: '#F3F7FF',
        },
    ];

    const statsRow2 = [
        {
            title: 'Early Checkouts',
            value: data?.earlyCheckouts ?? 0,
            backgroundImage: '/reservation/reservationcard.png',
            bgColor: '#FEFAFA',
        },
        {
            title: 'No-Shows',
            value: data?.noShows ?? 0,
            backgroundImage: '/reservation/reservationcard.png',
            bgColor: '#F6FCFF',
        },
        {
            title: 'Future Arriving Guests',
            value: data?.complimentaryHouseUse2 ?? 0,
            backgroundImage: '/reservation/reservationcard.png',
            bgColor: '#F6FCFF',
        },
        {
            title: 'Occupancy',
            value: data?.occupancy ?? '0%',
            backgroundImage: '/reservation/reservationcard.png',
            bgColor: '#F3F7FF',
        },
    ];

    return (
        <div className="space-y-4">
            {/* First row - 4 cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {statsRow1.map((stat) => (
                    <NightAuditStatCard
                        key={stat.title}
                        title={stat.title}
                        value={stat.value}
                        backgroundImage={stat.backgroundImage}
                        bgColor={stat.bgColor}
                        loading={loading}
                    />
                ))}
            </div>

            {/* Second row - 4 cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {statsRow2.map((stat) => (
                    <NightAuditStatCard
                        key={stat.title}
                        title={stat.title}
                        value={stat.value}
                        backgroundImage={stat.backgroundImage}
                        bgColor={stat.bgColor}
                        loading={loading}
                    />
                ))}
            </div>
        </div>
    );
}
