'use client';

import { formatCurrency } from '@/lib/utils';
import { InternalAccount } from '@/types/internal-accounts';
import {
    ArrowDownLeft,
    ArrowUpRight,
    Clock,
    DollarSign,
    RefreshCw,
} from 'lucide-react';
import { ComponentType } from 'react';

interface StatCardConfig {
    label: string;
    value: number;
    icon: ComponentType<{ className?: string }>;
    cardBg: string;
    iconBg: string;
    labelColor: string;
    valueColor: string;
}

function DetailStatCard({
    label,
    value,
    icon: Icon,
    cardBg,
    iconBg,
    labelColor,
    valueColor,
}: Readonly<StatCardConfig>) {
    return (
        <div
            className={`flex min-w-[200px] flex-1 items-center gap-3 rounded-xl p-4 ${cardBg}`}
        >
            <div
                className={`flex size-11 shrink-0 items-center justify-center rounded-full ${iconBg}`}
            >
                <Icon className="size-5 text-white" />
            </div>
            <div className="min-w-0">
                <p className={`text-xs font-medium ${labelColor}`}>{label}</p>
                <p
                    className={`truncate text-sm font-bold tabular-nums ${valueColor}`}
                >
                    {formatCurrency(value)}
                </p>
            </div>
        </div>
    );
}

export default function InternalAccountStatCards({
    account,
}: Readonly<{ account: InternalAccount }>) {
    const cards: StatCardConfig[] = [
        {
            label: 'Current Balance',
            value: account.currentBalance,
            icon: DollarSign,
            cardBg: 'bg-orange-50',
            iconBg: 'bg-orange-500',
            labelColor: 'text-amber-900/80',
            valueColor: 'text-amber-950',
        },
        {
            label: 'Total Funding Added',
            value: account.totalFundingAdded ?? 0,
            icon: ArrowDownLeft,
            cardBg: 'bg-emerald-50',
            iconBg: 'bg-emerald-600',
            labelColor: 'text-emerald-900/80',
            valueColor: 'text-emerald-950',
        },
        {
            label: 'Total Bills Posted',
            value: account.totalBillsPosted ?? 0,
            icon: ArrowUpRight,
            cardBg: 'bg-red-50',
            iconBg: 'bg-red-500',
            labelColor: 'text-red-900/80',
            valueColor: 'text-red-950',
        },
        {
            label: 'Reversed Transactions',
            value: account.reversedTransactions ?? 0,
            icon: RefreshCw,
            cardBg: 'bg-sky-50',
            iconBg: 'bg-sky-500',
            labelColor: 'text-sky-900/80',
            valueColor: 'text-sky-950',
        },
        {
            label: 'Pending Approval',
            value: account.pendingApproval ?? 0,
            icon: Clock,
            cardBg: 'bg-amber-50',
            iconBg: 'bg-amber-500',
            labelColor: 'text-amber-900/80',
            valueColor: 'text-amber-950',
        },
    ];

    return (
        <div className="mb-6 flex gap-4 overflow-x-auto">
            {cards.map((card) => (
                <DetailStatCard key={card.label} {...card} />
            ))}
        </div>
    );
}
