'use client';

import React from 'react';
import StatCard from './StatCard';

interface StatsData {
    bookingsToday: number;
    pendingReservations: number;
    availableSpaces: number;
    completedToday: number;
}

interface StatsGridProps {
    data?: StatsData;
    loading?: boolean;
}

export default function StatsGrid({ data, loading = false }: StatsGridProps) {
    const stats = [
        {
            title: 'Bookings for Today',
            value: data?.bookingsToday ?? 35,
            imageSrc: '/reservation/bookings.svg',
            growth: '15% Growth',
            bgColor: '#EEF4FF',
        },
        {
            title: 'Pending Reservation',
            value: data?.pendingReservations ?? 10,
            imageSrc: '/reservation/pending.svg',
            growth2: '15% Growth',
            bgColor: '#FFF7ED',
        },
        {
            title: 'Available Space for today',
            value: data?.availableSpaces ?? 4,
            imageSrc: '/reservation/available.svg',
            decline: '15% Growth',
            bgColor: '#F0FDF4',
        },
        {
            title: 'Completed Today RSV',
            value: data?.completedToday ?? 10,
            imageSrc: '/reservation/completed.svg',
            bgColor: '#F8FAFC',
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat) => (
                <StatCard
                    key={stat.title}
                    title={stat.title}
                    value={stat.value}
                    imageSrc={stat.imageSrc}
                    backgroundImage="/reservation/reservationcard.png"
                    growth={stat.growth}
                    growth2={stat.growth2}
                    decline={stat.decline}
                    bgColor={stat.bgColor}
                    loading={loading}
                />
            ))}
        </div>
    );
}
