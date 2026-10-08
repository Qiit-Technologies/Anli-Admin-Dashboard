'use client';

import { BookingListStats } from '@/components/banquest/utils/booking-display';
import { cn } from '@/lib/utils';
import { Building2, CalendarCheck, CalendarDays, FileText } from 'lucide-react';
import Link from 'next/link';

const cards = [
    {
        key: 'total' as const,
        title: 'Total Booking',
        subtitle: 'All time booking',
        icon: FileText,
        iconColor: 'text-white',
        bgColor: 'bg-[#FFF7F2]',
        iconBg: 'bg-[#FF6F00] text-[#8A3F04]',
        textColor: 'text-[#8A3F04]',
        href: '/banquet/bookings',
    },
    {
        key: 'upcoming' as const,
        title: 'Upcoming Event',
        subtitle: 'Approved & Coming',
        icon: CalendarDays,
        iconColor: 'text-white',
        bgColor: 'bg-[#F8E1E1]',
        iconBg: 'bg-[#BE8A8A] text-black',
        textColor: 'text-black',
        href: '/banquet/bookings?eventStatus=upcoming',
    },
    {
        key: 'today' as const,
        title: "Today's Event",
        subtitle: 'Happening Now',
        icon: Building2,
        iconColor: 'text-white',
        bgColor: 'bg-[#EAF4FF]',
        iconBg: 'bg-[#007BFF] text-black',
        textColor: 'text-black',
        href: '/banquet/bookings?eventStatus=ongoing',
    },
    {
        key: 'completed' as const,
        title: 'Completed Event',
        subtitle: 'Successfully Completed',
        icon: CalendarCheck,
        iconColor: 'text-white',
        bgColor: 'bg-[#F8F6EE]',
        iconBg: 'bg-[#EEC934] text-amber-600',
        textColor: 'text-black',
        href: '/banquet/bookings?eventStatus=completed',
    },
];

export default function BookingStatsCards({
    stats,
    loading,
}: Readonly<{
    stats: BookingListStats;
    loading?: boolean;
}>) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
            {cards.map(
                ({
                    key,
                    title,
                    subtitle,
                    icon: Icon,
                    iconBg,
                    bgColor,
                    textColor,
                    iconColor,
                    href,
                }) => (
                    <Link
                        key={key}
                        href={href}
                        aria-label={`View ${title}`}
                        className={cn(
                            'rounded-[8px] border p-4 flex items-center gap-3 transition-opacity hover:opacity-90',
                            bgColor,
                        )}
                    >
                        <div
                            className={cn(
                                'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
                                iconBg,
                            )}
                        >
                            <Icon className={cn('h-5 w-5', iconColor)} />
                        </div>
                        <div className="min-w-0">
                            <p
                                className={cn(
                                    'text-sm text-muted-foreground',
                                    textColor,
                                )}
                            >
                                {title}
                            </p>
                            <p
                                className={cn(
                                    'text-2xl font-bold mt-0.5',
                                    textColor,
                                )}
                            >
                                {loading ? '—' : stats[key]}
                            </p>
                            <p className={cn('text-xs mt-1', textColor)}>
                                {subtitle}
                            </p>
                        </div>
                    </Link>
                ),
            )}
        </div>
    );
}
