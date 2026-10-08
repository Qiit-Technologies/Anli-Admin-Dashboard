import { formatAmount } from '@/lib/utils';
import { ColumnDef } from '@tanstack/react-table';
import { ScopedCompliment } from '../../types';

export const ComplimentOrderHistoryColumn: ColumnDef<ScopedCompliment>[] = [
    {
        accessorKey: 'orderId',
        header: () => (
            <span className="flex items-center text-[#0A0A0A] font-semibold gap-2">
                Order ID
            </span>
        ),
        cell: ({ row }) => (
            <span className="text-[#7B7878]">{row.original.orderId}</span>
        ),
    },
    {
        accessorKey: 'orderType',
        header: () => (
            <span className="flex items-center text-[#0A0A0A] font-semibold gap-2">
                Order Type
            </span>
        ),
        cell: ({ row }) => (
            <span className="text-[#7B7878]">{row.original.orderType}</span>
        ),
    },
    {
        accessorKey: 'itemName',
        header: () => (
            <span className="flex items-center text-[#0A0A0A] font-semibold gap-2">
                Item Name
            </span>
        ),
        cell: ({ row }) => (
            <span className="text-[#7B7878]">{row.original.itemName}</span>
        ),
    },
    {
        accessorKey: 'amount',
        header: () => (
            <span className="flex items-center text-[#0A0A0A] font-semibold gap-2">
                Amount
            </span>
        ),
        cell: ({ row }) => (
            <span className="text-[#7B7878]">
                {formatAmount(Number(row.original.amount))}
            </span>
        ),
    },
    {
        accessorKey: 'waiter',
        header: () => (
            <span className="flex items-center text-[#0A0A0A] font-semibold gap-2">
                Waiter
            </span>
        ),
        cell: ({ row }) => (
            <span className="text-[#7B7878]">{row.original.waiter}</span>
        ),
    },
    {
        accessorKey: 'date',
        header: () => (
            <span className="flex items-center text-[#0A0A0A] font-semibold gap-2">
                Date
            </span>
        ),
        cell: ({ row }) => (
            <span className="text-[#7B7878]">
                {new Date(row.original.date)?.toLocaleDateString()}
            </span>
        ),
    },
    {
        accessorKey: 'approvedBy',
        header: () => (
            <span className="flex items-center text-[#0A0A0A] font-semibold gap-2">
                Approved By
            </span>
        ),
        cell: ({ row }) => (
            <span className="text-[#7B7878]">{row.original.approvedBy}</span>
        ),
    },
    {
        accessorKey: 'reason',
        header: () => (
            <span className="flex items-center text-[#0A0A0A] font-semibold gap-2">
                Reason
            </span>
        ),
        cell: ({ row }) => (
            <span className="text-[#7B7878]">{row.original.reason || '-'}</span>
        ),
    },
];
