'use client';

import { cn } from '@/lib/utils';
import { ColumnDef } from '@tanstack/react-table';
import { format, parseISO } from 'date-fns';
import { ArrowDown } from 'lucide-react';
import { RentedItemRow } from '../../types/rented-item';
import RentedItemAction from '../RentedItemAction';

function formatTableDate(value: string | null): string {
    if (!value) return '—';
    try {
        const d = value.includes('T')
            ? parseISO(value)
            : parseISO(`${value}T12:00:00`);
        return format(d, 'dd/MM/yy');
    } catch {
        return value;
    }
}

const returnStatusStyles = {
    returned: {
        bg: 'bg-emerald-100',
        text: 'text-emerald-700',
        dot: 'bg-emerald-600',
    },
    pending: {
        bg: 'bg-red-100',
        text: 'text-red-600',
        dot: 'bg-red-600',
    },
};

export const RentedItemFilters = [
    {
        id: 'returnStatus',
        label: 'Returned Status',
        options: [
            { value: 'returned', label: 'Returned' },
            { value: 'pending', label: 'Pending' },
        ],
    },
];

export const RentedItemColumns: ColumnDef<RentedItemRow>[] = [
    {
        accessorKey: 'customerName',
        header: 'Customer Name',
        cell: ({ row }) => (
            <span className="font-medium">{row.original.customerName}</span>
        ),
    },
    {
        accessorKey: 'assignedDate',
        header: 'Assigned Date',
        cell: ({ row }) => (
            <span>{formatTableDate(row.original.assignedDate)}</span>
        ),
    },
    {
        accessorKey: 'returnedDate',
        header: 'Returned Date',
        cell: ({ row }) => (
            <span>{formatTableDate(row.original.returnedDate)}</span>
        ),
    },
    {
        accessorKey: 'amountPaid',
        header: 'Amount Paid',
        cell: ({ row }) => (
            <span>
                {row.original.amountPaid.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                })}
            </span>
        ),
    },
    {
        accessorKey: 'totalQuantity',
        header: 'Total Quantity',
        cell: ({ row }) => <span>{row.original.totalQuantity}</span>,
    },
    {
        accessorKey: 'returnStatus',
        header: 'Returned Status',
        filterFn: (row, id, value) => row.getValue(id) === value,
        cell: ({ row }) => {
            const status = row.original.returnStatus;
            const styles = returnStatusStyles[status];
            return (
                <span
                    className={cn(
                        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium capitalize',
                        styles.bg,
                        styles.text,
                    )}
                >
                    <ArrowDown className="h-3 w-3" />
                    {status}
                </span>
            );
        },
    },
    {
        id: 'actions',
        header: 'Action',
        cell: ({ row }) => <RentedItemAction row={row.original} />,
    },
];
