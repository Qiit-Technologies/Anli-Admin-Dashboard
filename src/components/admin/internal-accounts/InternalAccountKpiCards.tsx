'use client';

import { InternalAccountStats } from '@/types/internal-accounts';
import { cn } from '@/lib/utils';
import {
    ArrowDownLeft,
    CheckCircle2,
    FolderOpen,
    TrendingDown,
} from 'lucide-react';

interface InternalAccountKpiCardsProps {
    stats: InternalAccountStats | undefined;
    loading?: boolean;
}

const KPI_CONFIG = [
    {
        key: 'totalAccounts' as const,
        label: 'Total Accounts',
        icon: FolderOpen,
        iconBg: 'bg-orange-50',
        iconColor: 'text-orange-600',
    },
    {
        key: 'active' as const,
        label: 'Active',
        icon: CheckCircle2,
        iconBg: 'bg-emerald-50',
        iconColor: 'text-emerald-600',
    },
    {
        key: 'positiveBalance' as const,
        label: 'Positive Balance',
        icon: ArrowDownLeft,
        iconBg: 'bg-amber-50',
        iconColor: 'text-amber-700',
    },
    {
        key: 'negativeBalance' as const,
        label: 'Negative Balance',
        icon: TrendingDown,
        iconBg: 'bg-red-50',
        iconColor: 'text-red-600',
    },
];

export default function InternalAccountKpiCards({
    stats,
    loading = false,
}: InternalAccountKpiCardsProps) {
    if (loading) {
        return (
            <div className="mb-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div
                        key={i}
                        className="h-[88px] animate-pulse rounded-lg border bg-card"
                    />
                ))}
            </div>
        );
    }

    return (
        <div className="mb-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {KPI_CONFIG.map(({ key, label, icon: Icon, iconBg, iconColor }) => (
                <div
                    key={key}
                    className="flex items-center gap-3 rounded-lg border bg-card p-4"
                >
                    <div
                        className={cn(
                            'flex size-10 shrink-0 items-center justify-center rounded-full',
                            iconBg,
                        )}
                    >
                        <Icon className={cn('size-5', iconColor)} />
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground">{label}</p>
                        <p className="text-xl font-semibold tabular-nums text-foreground">
                            {stats?.[key] ?? 0}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
}
