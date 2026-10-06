'use client';

import { cn, formatCurrency } from '@/lib/utils';
import { LedgerPageStats } from '@/types/internal-accounts-ledger';
import {
    BadgeCheck,
    Clock,
    DollarSign,
    Wallet,
} from 'lucide-react';
import { ComponentType } from 'react';

function formatLedgerKpiValue(value: number) {
    if (value < 0) {
        return `-${formatCurrency(Math.abs(value))}`;
    }
    return formatCurrency(value);
}

function KpiCard({
    label,
    value,
    icon: Icon,
    iconBg,
    iconColor,
    isCount = false,
}: Readonly<{
    label: string;
    value: number;
    icon: ComponentType<{ className?: string }>;
    iconBg: string;
    iconColor: string;
    isCount?: boolean;
}>) {
    return (
        <div className="flex items-center gap-3 rounded-lg border bg-card p-3">
            <div
                className={cn(
                    'flex size-9 shrink-0 items-center justify-center rounded-full',
                    iconBg,
                )}
            >
                <Icon className={cn('size-4', iconColor)} />
            </div>
            <div className="min-w-0">
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-base font-semibold tabular-nums text-foreground">
                    {isCount
                        ? value.toLocaleString()
                        : formatLedgerKpiValue(value)}
                </p>
            </div>
        </div>
    );
}

const KPI_CONFIG = [
    {
        key: 'currentBalance' as const,
        label: 'Current Balance',
        icon: DollarSign,
        iconBg: 'bg-emerald-50',
        iconColor: 'text-emerald-600',
        isCount: false,
        signed: false,
    },
    {
        key: 'totalDebits' as const,
        label: 'Total Debits',
        icon: Wallet,
        iconBg: 'bg-red-50',
        iconColor: 'text-red-600',
        isCount: false,
        signed: true,
    },
    {
        key: 'totalBillsPosted' as const,
        label: 'Total Bills Posted',
        icon: BadgeCheck,
        iconBg: 'bg-orange-50',
        iconColor: 'text-orange-600',
        isCount: false,
        signed: false,
    },
    {
        key: 'reversedTransactions' as const,
        label: 'Reversed Transactions',
        icon: Clock,
        iconBg: 'bg-sky-50',
        iconColor: 'text-sky-600',
        isCount: true,
        signed: false,
    },
];

export default function LedgerKpiCards({
    stats,
}: Readonly<{ stats: LedgerPageStats }>) {
    return (
        <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {KPI_CONFIG.map(
                ({ key, label, icon, iconBg, iconColor, isCount, signed }) => {
                    const rawValue = stats[key];
                    const value =
                        signed && typeof rawValue === 'number'
                            ? -rawValue
                            : rawValue;

                    return (
                        <KpiCard
                            key={key}
                            label={label}
                            value={value}
                            icon={icon}
                            iconBg={iconBg}
                            iconColor={iconColor}
                            isCount={isCount}
                        />
                    );
                },
            )}
        </div>
    );
}
