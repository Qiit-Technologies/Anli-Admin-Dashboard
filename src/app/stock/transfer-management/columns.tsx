'use client';

import { ColumnDef } from '@tanstack/react-table';
import { StockTransfer } from './types';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface CustomTableMeta {
    actionHandlers?: {
        onApprove?: (_transfer: StockTransfer) => void;
        onReject?: (_transfer: StockTransfer) => void;
        onPrint?: (_transfer: StockTransfer) => void;
        onSend?: (_transfer: StockTransfer) => void;
    };
}

const TRANSFER_STATUS_STYLES: Record<string, string> = {
    APPROVED: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-50',
    PENDING: 'bg-amber-50 text-amber-700 hover:bg-amber-50',
    SENT: 'bg-blue-50 text-blue-700 hover:bg-blue-50',
    IN_TRANSIT: 'bg-blue-50 text-blue-700 hover:bg-blue-50',
    RECEIVED: 'bg-green-50 text-green-700 hover:bg-green-50',
    REJECTED: 'bg-rose-50 text-rose-700 hover:bg-rose-50',
};

export const transferColumns: ColumnDef<StockTransfer>[] = [
    {
        accessorKey: 'transferId',
        header: 'Transfer ID',
        cell: ({ row }) => (
            <span className="font-mono text-sm font-medium">
                {row.original.transferId}
            </span>
        ),
    },
    {
        accessorKey: 'transferDate',
        header: 'Date',
        cell: ({ row }) => {
            const date = new Date(row.original.transferDate);
            return (
                <span className="font-medium">
                    {format(date, 'dd MMM yyyy')}
                </span>
            );
        },
    },
    {
        accessorKey: 'transferType',
        header: 'Type',
        cell: ({ row }) => (
            <Badge variant="outline" className="text-xs">
                {row.original.transferType === 'INTER'
                    ? 'Inter-dept'
                    : 'Intra-dept'}
            </Badge>
        ),
    },
    {
        accessorKey: 'fromDepartment',
        header: 'From',
        cell: ({ row }) => (
            <span className="font-medium">{row.original.fromDepartment}</span>
        ),
    },
    {
        accessorKey: 'toDepartment',
        header: 'To',
        cell: ({ row }) => (
            <span className="font-medium">{row.original.toDepartment}</span>
        ),
    },
    {
        accessorKey: 'items',
        header: 'Items',
        cell: ({ row }) => {
            const items = row.original.items || [];
            const totalQuantity = items.reduce(
                (sum: number, item: any) => sum + Number(item.quantity),
                0,
            );
            const itemNames = items
                .slice(0, 2)
                .map((item: any) => item.item?.name || 'Unknown')
                .join(', ');
            const remainingCount = items.length - 2;

            return (
                <div className="max-w-xs">
                    <div className="font-medium">{totalQuantity} items</div>
                    {itemNames && (
                        <div className="text-xs text-muted-foreground">
                            {itemNames}
                            {remainingCount > 0 && ` +${remainingCount} more`}
                        </div>
                    )}
                </div>
            );
        },
    },
    {
        accessorKey: 'totalValue',
        header: 'Value (N)',
        cell: ({ row }) => (
            <span className="font-medium">
                {formatCurrency(row.original.totalValue).replace('N', '')}
            </span>
        ),
    },
    {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
            const status = String(row.original.status || '').toUpperCase();
            return (
                <Badge
                    className={cn(
                        'capitalize font-normal rounded-full px-3 py-1 shadow-none border-none text-xs font-semibold',
                        TRANSFER_STATUS_STYLES[status] ||
                            'bg-gray-100 text-gray-700',
                    )}
                >
                    {status.replace('_', ' ').toLowerCase()}
                </Badge>
            );
        },
    },
    {
        accessorKey: 'approvedBy',
        header: 'Approved By',
        cell: ({ row }) => (
            <span className="text-sm">
                {row.original.approvedBy?.fullName || '-'}
            </span>
        ),
    },
    {
        id: 'actions',
        header: 'Action',
        cell: ({ row, table }) => {
            const transfer = row.original;
            const { onApprove, onReject, onPrint, onSend } =
                (table.options.meta as CustomTableMeta)?.actionHandlers || {};
            const status = String(transfer.status || '').toUpperCase();
            const canReceive = ['APPROVED', 'SENT', 'IN_TRANSIT'].includes(
                status,
            );

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44">
                        {status === 'PENDING' && onApprove && (
                            <DropdownMenuItem
                                className="text-emerald-600 font-medium py-3"
                                onClick={() => onApprove(transfer)}
                            >
                                Approve
                            </DropdownMenuItem>
                        )}
                        {status === 'PENDING' && onReject && (
                            <DropdownMenuItem
                                className="text-red-600 font-medium py-3"
                                onClick={() => onReject(transfer)}
                            >
                                Reject
                            </DropdownMenuItem>
                        )}
                        {status === 'APPROVED' && onSend && (
                            <DropdownMenuItem
                                className="text-blue-600 font-medium py-3"
                                onClick={() => onSend(transfer)}
                            >
                                Mark as Sent
                            </DropdownMenuItem>
                        )}
                        {canReceive && (
                            <DropdownMenuItem className="py-3 font-medium" asChild>
                                <Link
                                    href={`/stock/transfer-management/${transfer.id}/receive`}
                                >
                                    Receive
                                </Link>
                            </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                            className="py-3 font-medium"
                            onClick={() => onPrint && onPrint(transfer)}
                        >
                            Print
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];
