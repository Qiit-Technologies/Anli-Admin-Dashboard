'use client';

import { AmenityStats } from '@/components/banquest/amenities/types';
import { cn } from '@/lib/utils';
import {
    ArrowUp,
    CheckCircle2,
    Clock,
    Package,
    ShoppingCart,
} from 'lucide-react';
import Link from 'next/link';

const cards = [
    {
        key: 'totalAmenities' as const,
        trendKey: 'totalTrend' as const,
        title: 'Total Amenities',
        subtitle: 'All registered amenities',
        icon: Package,
        iconBg: 'bg-hexbrand',
        href: '/banquet/amenities',
    },
    {
        key: 'amenitiesAvailable' as const,
        trendKey: 'availableTrend' as const,
        title: 'Amenities Available',
        subtitle: 'Currently Available',
        icon: CheckCircle2,
        iconBg: 'bg-emerald-600',
        href: '/banquet/amenities?status=active',
    },
    {
        key: 'currentlyRented' as const,
        trendKey: 'rentedTrend' as const,
        title: 'Currently Rented',
        subtitle: 'Currently Out on Rent',
        icon: ShoppingCart,
        iconBg: 'bg-orion-blue',
        href: '/banquet/rented-item?status=rented',
    },
    {
        key: 'returnedThisMonth' as const,
        trendKey: 'returnedTrend' as const,
        title: 'Returned (this Month)',
        subtitle: 'Successfully Returned',
        icon: Clock,
        iconBg: 'bg-gray-900',
        href: '/banquet/rented-item?status=returned',
    },
];

export default function AmenityStatsCards({
    stats,
    loading,
}: {
    stats: AmenityStats;
    loading?: boolean;
}) {
    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {cards.map(
                ({
                    key,
                    trendKey,
                    title,
                    subtitle,
                    icon: Icon,
                    iconBg,
                    href,
                }) => (
                    <Link
                        key={key}
                        href={href}
                        aria-label={`View ${title}`}
                        className="relative flex items-start gap-4 rounded-xl border border-gray-200 bg-white p-5 transition-colors hover:border-orion-blue/40 hover:bg-gray-50/80"
                    >
                        <div
                            className={cn(
                                'flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white',
                                iconBg,
                            )}
                        >
                            <Icon className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-700">
                                {title}
                            </p>
                            <p className="mt-1 text-2xl font-bold text-gray-900">
                                {loading ? '—' : stats[key]}
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                                {subtitle}
                            </p>
                        </div>
                        {!loading && stats[trendKey] > 0 && (
                            <span className="absolute right-4 top-4 inline-flex items-center gap-0.5 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                                <ArrowUp className="h-3 w-3" />
                                {stats[trendKey]}%
                            </span>
                        )}
                    </Link>
                ),
            )}
        </div>
    );
}
