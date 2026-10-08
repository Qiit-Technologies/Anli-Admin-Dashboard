'use client';

import Link from 'next/link';
import { format } from 'date-fns';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Eye, MoreHorizontal } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import {
    ReturnVoucher,
    rtvNumber,
    rtvDate,
    rtvFromDepartment,
    rtvReceivedBy,
    rtvItemCount,
    rtvTotalValue,
} from './types';

export const returnVoucherColumns: ColumnDef<ReturnVoucher>[] = [
    {
        accessorKey: 'rtvNumber',
        header: 'RTV No.',
        cell: ({ row }) => (
            <span className="font-medium">{rtvNumber(row.original)}</span>
        ),
    },
    {
        accessorKey: 'returnDate',
        header: 'Date',
        cell: ({ row }) => {
            const d = rtvDate(row.original);
            return d ? format(new Date(d), 'dd MMM yyyy') : '—';
        },
    },
    {
        accessorKey: 'fromDepartment',
        header: 'From Department',
        cell: ({ row }) => rtvFromDepartment(row.original),
    },
    {
        accessorKey: 'itemCount',
        header: 'Items',
        cell: ({ row }) => (
            <span className="tabular-nums">
                {rtvItemCount(row.original)}
            </span>
        ),
    },
    {
        accessorKey: 'totalValue',
        header: 'Value',
        cell: ({ row }) => (
            <span className="tabular-nums font-medium">
                {formatCurrency(rtvTotalValue(row.original))}
            </span>
        ),
    },
    {
        accessorKey: 'receivedBy',
        header: 'Received By',
        cell: ({ row }) => rtvReceivedBy(row.original),
    },
    {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                        <Link
                            href={`/stock/return-voucher/${row.original.id}`}
                            className="flex items-center gap-2"
                        >
                            <Eye className="h-3.5 w-3.5" />
                            View voucher
                        </Link>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        ),
    },
];
