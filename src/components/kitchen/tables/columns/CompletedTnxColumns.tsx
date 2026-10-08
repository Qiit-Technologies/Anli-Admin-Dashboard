import { ScopedCompletedTnx } from '@/components/front-of-house/types';
import { formatAmount } from '@/lib/utils';
import { ColumnDef } from '@tanstack/react-table';

export const CompletedTnxColumns: ColumnDef<ScopedCompletedTnx>[] = [
    {
        accessorKey: 'transactionID',
        header: 'Transaction ID',
        cell: ({ row }) => (
            <span className="text-sm font-normal leading-5 text-center">
                {row.original.transactionID}
            </span>
        ),
    },
    {
        accessorKey: 'department',
        header: 'Department',
        cell: ({ row }) => (
            <span className="text-sm font-normal leading-5 text-[#101828] text-center">
                {row.original.department}
            </span>
        ),
    },
    {
        accessorKey: 'description',
        header: 'Description',
        cell: ({ row }) => (
            <span className="text-sm font-normal leading-5 text-[#101828] text-center truncate">
                {row.original.description}
            </span>
        ),
    },
    {
        accessorKey: 'paymentMethod',
        header: 'Payment Method',
        cell: ({ row }) => (
            <span className="text-sm font-normal leading-5 text-[#101828] text-center">
                {row.original.paymentMethod}
            </span>
        ),
    },
    {
        accessorKey: 'amount',
        header: 'Amount (₦)',
        cell: ({ row }) => (
            <span className="text-sm font-normal leading-5 text-[#101828] text-center">
                {formatAmount(Number(row.original.amount))}
            </span>
        ),
    },
    {
        accessorKey: 'date',
        header: 'Date',
        cell: ({ row }) => (
            <span className="text-sm font-normal leading-5 text-[#101828] text-center">
                {new Date(row.original.date).toISOString().split('T')[0]}
            </span>
        ),
    },
];
