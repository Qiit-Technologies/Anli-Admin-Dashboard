import { formatDate } from '@/lib/helpers';
import { cn } from '@/lib/utils';
import { Tooltip } from '@heroui/react';
import { ColumnDef } from '@tanstack/react-table';
import { CircleHelp } from 'lucide-react';
import { ScopedOrder } from '../../types';
import OrderAction from '../OrderAction';
import {
    // complimentaryBadgeColumn,
    discountBadgeColumn,
    orderAmountColumn,
} from './complimentaryColumns';

export const FOHOrdersFilters = [
    {
        id: 'status',
        label: 'Status',
        options: [
            { value: 'PENDING', label: 'Pending' },
            { value: 'IN_KITCHEN', label: 'In Kitchen' },
            { value: 'COMPLETED', label: 'Completed' },
            { value: 'CANCELLED', label: 'Cancelled' },
            { value: 'DISPATCHED', label: 'Dispatched' },
            { value: 'PAID', label: 'Paid' },
            { value: 'READY', label: 'Ready' },
            { value: 'VOIDED', label: 'Voided' },
        ],
    },
];

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
    READY: {
        bg: 'bg-green-100',
        dot: 'bg-green-500',
        text: 'text-green-600',
    },
    VOIDED: {
        bg: 'bg-slate-100',
        dot: 'bg-slate-500',
        text: 'text-slate-700',
    },
};

const paymentStatusStyles = {
    PAID: {
        bg: 'bg-green-100',
        dot: 'bg-green-500',
        text: 'text-green-800',
    },
    PENDING: {
        bg: 'bg-yellow-100',
        dot: 'bg-yellow-500',
        text: 'text-yellow-800',
    },
    FAILED: {
        bg: 'bg-red-100',
        dot: 'bg-red-500',
        text: 'text-red-800',
    },
    ADDED_TO_BILL: {
        bg: 'bg-green-50',
        dot: 'bg-green-500',
        text: 'text-green-800',
    },
    COMPLEMENTED: {
        bg: 'bg-green-100',
        dot: 'bg-green-500',
        text: 'text-green-600',
    },
    BILL_SETTLED_FROM_FRONT_DESK: {
        bg: 'bg-blue-100',
        dot: 'bg-blue-500',
        text: 'text-blue-600',
    },
    VOIDED: {
        bg: 'bg-slate-100',
        dot: 'bg-slate-500',
        text: 'text-slate-700',
    },
};

export const FOHOrdersColumn: ColumnDef<ScopedOrder>[] = [
    {
        accessorKey: 'requestId',
        header: 'Order ID',
        cell: ({ row }) => {
            return <span>{row.original.requestId || row.original.id}</span>;
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
        cell: ({ row }) => (
            <span>{formatDate(row.original.createdAt) ?? ''}</span>
        ),
    },
    {
        accessorKey: 'requestTable',
        header: () => (
            <div>
                <Tooltip
                    className="text-muted-foreground rounded-sm font-medium"
                    content="Table or room number for the order"
                    showArrow={true}
                >
                    <span className="flex items-center gap-2">
                        Table/Room <CircleHelp className="w-4 h-4" />
                    </span>
                </Tooltip>
            </div>
        ),
        cell: ({ row }) => {
            const tableNumber = row.original.table?.number;
            const roomNumber = row.original.room?.roomNumber;
            return (
                <span>
                    {tableNumber
                        ? `Table-${tableNumber}`
                        : roomNumber
                            ? `Room-${roomNumber}`
                            : '—'}
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
        accessorKey: 'createdBy',
        header: () => (
            <div>
                <Tooltip
                    className="text-muted-foreground rounded-sm font-medium"
                    content="Staff who took the order"
                    showArrow={true}
                >
                    <span className="flex items-center gap-2">
                        User <CircleHelp className="w-4 h-4" />
                    </span>
                </Tooltip>
            </div>
        ),
        cell: ({ row }) => (
            <span>
                {row.original.createdBy?.fullName ||
                    row.original.waiter?.fullName ||
                    '—'}
            </span>
        ),
    },
    {
        accessorKey: 'status',
        header: 'Order Status',
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
    {
        accessorKey: 'paymentStatus',
        header: () => (
            <div>
                <Tooltip
                    className="text-muted-foreground rounded-sm font-medium"
                    content="Status of payment for the order"
                    showArrow={true}
                >
                    <span className="flex items-center gap-2">
                        Payment Status <CircleHelp className="w-4 h-4" />
                    </span>
                </Tooltip>
            </div>
        ),
        cell: ({ row }) => {
            const paymentStatus = row.original.paymentStatus;
            return (
                <div
                    className={cn(
                        paymentStatusStyles[
                            paymentStatus as keyof typeof paymentStatusStyles
                        ]?.bg || 'bg-gray-100',
                        'flex items-center justify-center gap-2 w-fit px-3 py-1 rounded-full',
                    )}
                >
                    <div
                        className={cn(
                            paymentStatusStyles[
                                paymentStatus as keyof typeof paymentStatusStyles
                            ]?.dot || 'bg-gray-500',
                            'w-2 h-2 rounded-full',
                        )}
                    />
                    <span
                        className={cn(
                            paymentStatusStyles[
                                paymentStatus as keyof typeof paymentStatusStyles
                            ]?.text || 'text-gray-600',
                            'text-xs caption-top',
                        )}
                    >
                        {paymentStatus}
                    </span>
                </div>
            );
        },
    },
    orderAmountColumn('Amount'),
    discountBadgeColumn,
    // complimentaryBadgeColumn,
    {
        id: 'actions',
        header: 'Action',
        cell: ({ row }) => <OrderAction row={row.original} />,
    },
];
