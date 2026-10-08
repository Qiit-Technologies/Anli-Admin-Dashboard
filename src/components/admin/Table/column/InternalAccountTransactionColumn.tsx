'use client';

import {
    LedgerStatusBadge,
    TransactionTypeBadge,
} from '@/components/admin/internal-accounts/ledger/LedgerBadges';
import {
    DateTimeCell,
    LedgerAmountCell,
} from '@/components/admin/internal-accounts/ledger/LedgerCells';
import {
    formatLedgerInvoiceNoDisplay,
    formatLedgerSourceModuleDisplay,
    formatLedgerTransactionIdDisplay,
} from '@/lib/internal-accounts/transaction-display';
import { InternalAccountTransaction } from '@/types/internal-accounts-ledger';
import { ColumnDef } from '@tanstack/react-table';

function TruncateText({
    value,
    className = 'max-w-[140px]',
}: {
    value: string;
    className?: string;
}) {
    return (
        <span className={`block truncate text-sm ${className}`} title={value}>
            {value}
        </span>
    );
}

export const InternalAccountTransactionColumn: ColumnDef<InternalAccountTransaction>[] =
    [
        {
            accessorKey: 'dateTime',
            header: 'Date / Time',
            cell: ({ row }) => <DateTimeCell value={row.original.dateTime} />,
        },
        {
            accessorKey: 'transactionId',
            header: 'Transaction ID',
            cell: ({ row }) => (
                <TruncateText
                    className="max-w-[100px] font-mono"
                    value={formatLedgerTransactionIdDisplay(
                        row.original.transactionId,
                    )}
                />
            ),
        },
        {
            accessorKey: 'type',
            header: 'Type',
            cell: ({ row }) => (
                <TransactionTypeBadge type={row.original.type} />
            ),
        },
        {
            accessorKey: 'invoiceNo',
            header: 'Invoice No',
            cell: ({ row }) => (
                <TruncateText
                    className="max-w-[120px] font-mono"
                    value={formatLedgerInvoiceNoDisplay(row.original)}
                />
            ),
        },
        {
            accessorKey: 'sourceModule',
            header: 'Source Module',
            cell: ({ row }) => (
                <TruncateText
                    value={formatLedgerSourceModuleDisplay(row.original)}
                />
            ),
        },
        {
            accessorKey: 'customer',
            header: 'Customer',
            cell: ({ row }) => (
                <TruncateText
                    className="max-w-[160px]"
                    value={row.original.customer || '—'}
                />
            ),
        },
        {
            accessorKey: 'debit',
            header: 'Debit',
            cell: ({ row }) => (
                <LedgerAmountCell amount={row.original.debit} />
            ),
        },
        {
            accessorKey: 'credit',
            header: 'Credit',
            cell: ({ row }) => (
                <LedgerAmountCell amount={row.original.credit} />
            ),
        },
        {
            accessorKey: 'runningBalance',
            header: 'Running Balance',
            cell: ({ row }) => (
                <LedgerAmountCell amount={row.original.runningBalance} />
            ),
        },
        {
            accessorKey: 'description',
            header: 'Description / Reason',
            cell: ({ row }) => (
                <span
                    className="block max-w-[220px] truncate text-sm"
                    title={row.original.description}
                >
                    {row.original.description}
                </span>
            ),
        },
        {
            accessorKey: 'initiatedBy',
            header: 'Initiated By',
            cell: ({ row }) => (
                <TruncateText
                    className="max-w-[120px]"
                    value={row.original.initiatedBy || '—'}
                />
            ),
        },
        {
            accessorKey: 'approvedBy',
            header: 'Approved By',
            cell: ({ row }) => (
                <TruncateText
                    className="max-w-[120px]"
                    value={row.original.approvedBy || '—'}
                />
            ),
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => (
                <LedgerStatusBadge status={row.original.status} />
            ),
        },
    ];
