'use client';

import InternalAccountActionsMenu from '@/components/admin/internal-accounts/InternalAccountActionsMenu';
import {
    InternalAccountStatusBadge,
    InternalAccountTypeBadge,
} from '@/components/admin/internal-accounts/InternalAccountBadges';
import { formatShortTableDate } from '@/lib/internal-accounts/format';
import { cn } from '@/lib/utils';
import { InternalAccount } from '@/types/internal-accounts';
import { ColumnDef } from '@tanstack/react-table';
import Link from 'next/link';

function formatLedgerAmount(amount: number | string | null | undefined): string {
    const numeric = Number(amount ?? 0);
    const safe = Number.isFinite(numeric) ? numeric : 0;
    return `₦${safe.toLocaleString('en-NG', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
}

function resolveAccountId(account: InternalAccount): string {
    const id = account.id;
    if (id === undefined || id === null || id === '') {
        return '';
    }
    return String(id);
}

export function createInternalAccountColumns(
    basePath: string,
): ColumnDef<InternalAccount>[] {
    return [
        {
            accessorKey: 'accountCode',
            header: 'Account Code',
            cell: ({ row }) => (
                <span className="font-mono text-sm">
                    {row.original.accountCode}
                </span>
            ),
        },
        {
            accessorKey: 'accountName',
            header: 'Account Name',
            cell: ({ row }) => {
                const accountId = resolveAccountId(row.original);
                return (
                    <Link
                        href={`${basePath}/${accountId}`}
                        className="font-medium hover:text-orion-blue hover:underline"
                    >
                        {row.original.accountName}
                    </Link>
                );
            },
        },
        {
            accessorKey: 'accountType',
            header: 'Account Type',
            cell: ({ row }) => (
                <InternalAccountTypeBadge type={row.original.accountType} />
            ),
        },
        {
            accessorKey: 'openingBalance',
            header: 'Opening Balance',
            cell: ({ row }) => (
                <span className="tabular-nums">
                    {formatLedgerAmount(row.original.openingBalance)}
                </span>
            ),
        },
        {
            accessorKey: 'currentBalance',
            header: 'Current Balance',
            cell: ({ row }) => {
                const balance = Number(row.original.currentBalance ?? 0);
                return (
                    <span
                        className={cn(
                            'tabular-nums font-medium',
                            balance < 0 && 'text-red-600',
                        )}
                    >
                        {balance < 0 ? '-' : ''}
                        {formatLedgerAmount(Math.abs(balance))}
                    </span>
                );
            },
        },
        {
            accessorKey: 'owner',
            header: 'Owner',
            cell: ({ row }) => (
                <span>{row.original.owner?.trim() || '—'}</span>
            ),
        },
        {
            accessorKey: 'lastTransaction',
            header: 'Last Transaction',
            cell: ({ row }) => (
                <span className="tabular-nums text-muted-foreground">
                    {formatShortTableDate(row.original.lastTransaction)}
                </span>
            ),
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => (
                <InternalAccountStatusBadge status={row.original.status} />
            ),
        },
        {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => (
                <InternalAccountActionsMenu
                    account={row.original}
                    accountId={resolveAccountId(row.original)}
                    basePath={basePath}
                />
            ),
        },
    ];
}
