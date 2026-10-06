'use client';

import { MenuPackageStats } from '@/components/banquest/menu/types';
import { cn } from '@/lib/utils';
import {
    CalendarDays,
    ClipboardList,
    ConciergeBell,
    UtensilsCrossed,
} from 'lucide-react';
import Link from 'next/link';

const cards = [
    {
        key: 'totalPackages' as const,
        title: 'Total Package',
        subtitle: 'All menu package',
        icon: UtensilsCrossed,
        iconBg: 'bg-hexbrand',
        titleColor: 'text-orange-800',
        href: '/banquet/menu-details',
    },
    {
        key: 'activePackages' as const,
        title: 'Active package',
        subtitle: 'Currently available',
        icon: ConciergeBell,
        iconBg: 'bg-orion-blue',
        titleColor: 'text-gray-900',
        href: '/banquet/menu-details?status=active',
    },
    {
        key: 'totalMealItems' as const,
        title: 'Total Menu Item',
        subtitle: 'Across all package',
        icon: ClipboardList,
        iconBg: 'bg-hexbrand',
        titleColor: 'text-orange-900',
        href: '/banquet/menu-details',
    },
    {
        key: 'categories' as const,
        title: 'Menu Categories',
        subtitle: 'Menu Categories',
        icon: CalendarDays,
        iconBg: 'bg-rose-500',
        titleColor: 'text-gray-900',
        href: '/banquet/menu-details',
    },
];

export default function MenuStatsCards({
    stats,
    loading,
}: {
    stats: MenuPackageStats;
    loading?: boolean;
}) {
    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {cards.map(
                ({
                    key,
                    title,
                    subtitle,
                    icon: Icon,
                    iconBg,
                    titleColor,
                    href,
                }) => (
                    <Link
                        key={key}
                        href={href}
                        aria-label={`View ${title}`}
                        className="flex items-start gap-4 rounded-xl border border-gray-200 bg-white p-5 transition-colors hover:border-orion-blue/40 hover:bg-gray-50/80"
                    >
                        <div
                            className={cn(
                                'flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white',
                                iconBg,
                            )}
                        >
                            <Icon className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                            <p
                                className={cn(
                                    'text-sm font-medium',
                                    titleColor,
                                )}
                            >
                                {title}
                            </p>
                            <p className="mt-1 text-2xl font-bold text-gray-900">
                                {loading ? '—' : stats[key]}
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                                {subtitle}
                            </p>
                        </div>
                    </Link>
                ),
            )}
        </div>
    );
}
