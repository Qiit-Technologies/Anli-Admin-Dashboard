import { formatDate } from '@/lib/helpers';
import { cn } from '@/lib/utils';
import { Tooltip } from '@heroui/react';
import { ColumnDef } from '@tanstack/react-table';
import { CircleHelp } from 'lucide-react';
import { ScopedOrder } from '../../types';
import OrderAction from '../OrderAction';
import {
    complimentaryBadgeColumn,
    discountBadgeColumn,
    orderAmountColumn,
} from './complimentaryColumns';

const statusStyles = {
    PENDING: {
        bg: 'bg-yellow-100',
        dot: 'bg-yellow-500',
        text: 'text-yellow-600',
    },
    IN_KITCHEN: {
        bg: 'bg-orange-100',
        dot: 'bg-orange-500',
        text: 'text-orange-600',
    },
    COMPLETED: {
        bg: 'bg-green-100',
        dot: 'bg-green-500',
        text: 'text-green-600',
    },
    CANCELLED: {
        bg: 'bg-red-100',
        dot: 'bg-red-500',
        text: 'text-red-600',
    },
    VOIDED: {
        bg: 'bg-slate-100',
        dot: 'bg-slate-500',
        text: 'text-slate-700',
    },
    DISPATCHED: {
        bg: 'bg-green-100',
        dot: 'bg-green-500',
        text: 'text-green-600',
    },
    PAID: {
        bg: 'bg-green-100',
        dot: 'bg-green-500',
        text: 'text-green-600',
    },
    BILL_SETTLED_FROM_FRONT_DESK: {
        bg: 'bg-blue-100',
        dot: 'bg-blue-500',
        text: 'text-blue-600',
    },
    ADDED_TO_BILL: {
        bg: 'bg-amber-100',
        dot: 'bg-amber-500',
        text: 'text-amber-600',
    },
    READY: {
        bg: 'bg-green-100',
        dot: 'bg-green-500',
        text: 'text-green-600',
    },
};

export const roomServiceFilters = [
    {
        id: 'status',
        label: 'Status',
        options: [
            { value: 'pending', label: 'Pending' },
            { value: 'completed', label: 'Completed' },
            { value: 'cancelled', label: 'Cancelled' },
        ],
    },
    {
        id: 'paymentStatus',
        label: 'Payment Status',
        options: [
            { value: 'pending', label: 'Pending' },
            { value: 'paid', label: 'Paid' },
            { value: 'failed', label: 'Failed' },
            { value: 'added_to_bill', label: 'Posted to Room' },
            {
                value: 'bill_settled_from_front_desk',
                label: 'Bill Settled from Front Desk',
            },
        ],
    },
];

export const roomServiceColumns: ColumnDef<ScopedOrder>[] = [
    {
        accessorKey: 'requestId',
        header: 'S/N',
        cell: ({ row, table }) => {
            const rowIndex = table
                .getFilteredRowModel()
                .rows.findIndex((r) => r.id === row.id);
            return <span>{rowIndex + 1}</span>;
        },
    },
    {
        accessorKey: 'createdAt',
        header: () => (
            <div>
                <Tooltip
                    className="text-muted-foreground rounded-sm font-medium"
                    content="When the order was placed"
                    showArrow={true}
                >
                    <span className="flex items-center gap-2">
                        Date <CircleHelp className="w-4 h-4" />
                    </span>
                </Tooltip>
            </div>
        ),
        cell: ({ row }) => <span>{formatDate(row.original.createdAt)}</span>,
    },
    {
        accessorKey: 'room.roomNumber',
        header: 'Room Number',
        cell: ({ row }) => {
            const roomNumber = row.original?.room?.roomNumber ?? (row.original as any).roomNumber;
            return (
                <span>
                    {(roomNumber ? 'Room-' : '') + (roomNumber ?? '--')}
                </span>
            );
        },
    },
    {
        accessorKey: 'orderType',
        header: () => (
            <div>
                <Tooltip
                    className="text-muted-foreground rounded-sm font-medium"
                    content="Type of order (e.g., Dinner, Lunch)"
                    showArrow={true}
                >
                    <span className="flex items-center gap-2">
                        Order Type <CircleHelp className="w-4 h-4" />
                    </span>
                </Tooltip>
            </div>
        ),
        cell: ({ row }) => <span>{row.original.orderType}</span>,
    },
    {
        accessorKey: 'guestName',
        header: () => (
            <div>
                <Tooltip
                    className="text-muted-foreground rounded-sm font-medium"
                    content="Name of the guest who placed the order"
                    showArrow={true}
                >
                    <span className="flex items-center gap-2">
                        Guest Name <CircleHelp className="w-4 h-4" />
                    </span>
                </Tooltip>
            </div>
        ),
        cell: ({ row }) => <span>{row.original.guestName}</span>,
    },
    {
        accessorKey: 'paymentStatus',
        header: 'Payment Status',
        cell: ({ row }) => {
            const paymentStatus = row.original.paymentStatus;
            const labelMap: Record<string, string> = {
                PAID: 'Paid',
                ADDED_TO_BILL: 'Posted to Room',
                BILL_SETTLED_FROM_FRONT_DESK: 'Bill Settled from Front Desk',
                PENDING: 'Pending',
                COMPLEMENTED: 'Complimentary',
            };
            return (
                <div
                    className={cn(
                        statusStyles[paymentStatus as keyof typeof statusStyles]
                            ?.bg || 'bg-gray-100',
                        'flex items-center justify-center gap-2 w-fit px-3 py-1 rounded-full',
                    )}
                >
                    <div
                        className={cn(
                            statusStyles[
                                paymentStatus as keyof typeof statusStyles
                            ]?.dot || 'bg-gray-500',
                            'w-2 h-2 rounded-full',
                        )}
                    />
                    <span
                        className={cn(
                            statusStyles[
                                paymentStatus as keyof typeof statusStyles
                            ]?.text || 'text-gray-600',
                            'text-xs caption-top',
                        )}
                    >
                        {labelMap[paymentStatus] ?? paymentStatus}
                    </span>
                </div>
            );
        },
    },
    {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
            const status = row.original.status;
            return (
                <div
                    className={cn(
                        statusStyles[status as keyof typeof statusStyles]?.bg ||
                            'bg-gray-100',
                        'flex items-center justify-center gap-2 w-fit px-3 py-1 rounded-full',
                    )}
                >
                    <div
                        className={cn(
                            statusStyles[status as keyof typeof statusStyles]
                                ?.dot || 'bg-gray-500',
                            'w-2 h-2 rounded-full',
                        )}
                    />
                    <span
                        className={cn(
                            statusStyles[status as keyof typeof statusStyles]
                                ?.text || 'text-gray-600',
                            'text-xs caption-top',
                        )}
                    >
                        {status}
                    </span>
                </div>
            );
        },
    },
    orderAmountColumn('Amount'),
    complimentaryBadgeColumn,
    discountBadgeColumn,
    {
        id: 'actions',
        header: 'Action',
        cell: ({ row }) => <OrderAction row={row.original} />,
    },
];
