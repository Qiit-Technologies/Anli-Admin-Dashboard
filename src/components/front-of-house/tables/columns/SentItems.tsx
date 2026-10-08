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
};

export const sentItemsFilters = [
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
        ],
    },
    {
        id: 'orderType',
        label: 'Order Type',
        options: [
            { value: 'dinner', label: 'Dinner' },
            { value: 'lunch', label: 'Lunch' },
            { value: 'breakfast', label: 'Breakfast' },
        ],
    },
];

export const sentItemsColumn: ColumnDef<ScopedOrder>[] = [
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
        accessorKey: 'requestDate',
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
        accessorKey: 'paymentStatus',
        header: 'Payment Status',
        cell: ({ row }) => {
            const paymentStatus = row.original.paymentStatus;
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
                        {paymentStatus}
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
