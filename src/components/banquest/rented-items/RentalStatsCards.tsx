'use client';

import { RentalStats } from '@/components/banquest/rented-items/types';
import { cn } from '@/lib/utils';
import {
    AlertCircle,
    ArrowDown,
    ArrowUp,
    Clock,
    Package,
    ShoppingCart,
} from 'lucide-react';
import Link from 'next/link';

const cards = [
    {
        key: 'totalRented' as const,
        trendKey: 'totalTrend' as const,
        title: 'Total Rented',
        subtitle: 'All rented Item',
        icon: Package,
        iconBg: 'bg-hexbrand',
        href: '/banquet/rented-item',
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
        iconBg: 'bg-emerald-600',
        href: '/banquet/rented-item?status=returned',
    },
    {
        key: 'overdue' as const,
        trendKey: 'overdueTrend' as const,
        title: 'Over due',
        subtitle: 'Item Past returned date',
        icon: AlertCircle,
        iconBg: 'bg-red-600',
        negativeTrend: true,
        href: '/banquet/rented-item?status=over-due',
    },
];

export default function RentalStatsCards({
    stats,
    loading,
}: {
    stats: RentalStats;
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
                    negativeTrend,
                    href,
                }) => {
                    const trend = stats[trendKey];
                    const isPositive = trend >= 0;
                    return (
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
                            {!loading && trend !== 0 && (
                                <span
                                    className={cn(
                                        'absolute right-4 top-4 inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-medium',
                                        negativeTrend && !isPositive
                                            ? 'bg-red-50 text-red-700'
                                            : 'bg-emerald-50 text-emerald-700',
                                    )}
                                >
                                    {isPositive ? (
                                        <ArrowUp className="h-3 w-3" />
                                    ) : (
                                        <ArrowDown className="h-3 w-3" />
                                    )}
                                    {Math.abs(trend)}%
                                </span>
                            )}
                        </Link>
                    );
                },
            )}
        </div>
    );
}
