import { formatDate } from '@/lib/helpers';
import { cn } from '@/lib/utils';
import { Tooltip } from '@heroui/react';
import { ColumnDef } from '@tanstack/react-table';
import { CircleHelp } from 'lucide-react';
import { ScopedOrder } from '../../types';
import { KOTAction } from '../KOTAction';
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
    READY: {
        bg: 'bg-green-100',
        dot: 'bg-green-500',
        text: 'text-green-600',
    },
};

export const kotOverviewFilters = [
    {
        id: 'status',
        label: 'Status',
        options: [
            { value: 'pending', label: 'Pending' },
            { value: 'preparing', label: 'Preparing' },
            { value: 'ready', label: 'Ready' },
            { value: 'cancelled', label: 'Cancelled' },
        ],
    },
    {
        id: 'orderType',
        label: 'Order Type',
        options: [
            { value: 'breakfast', label: 'Breakfast' },
            { value: 'lunch', label: 'Lunch' },
            { value: 'dinner', label: 'Dinner' },
        ],
    },
];

export const kotOverviewColumns: ColumnDef<ScopedOrder>[] = [
    {
        accessorKey: 'orderId',
        header: 'S/N',
        cell: ({ row, table }) => {
            const rowIndex = table
                .getFilteredRowModel()
                .rows.findIndex((r) => r.id === row.id);
            return <span>{rowIndex + 1}</span>;
        },
    },
    {
        accessorKey: 'date',
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
        cell: ({ row }) => (
            <span>
                {row.original.orderType === 'ROOM'
                    ? `${row.original.orderType} (${row.original.room?.roomNumber ?? (row.original as any).roomNumber ?? 'N/A'})`
                    : row.original.orderType}
            </span>
        ),
    },
    {
        accessorKey: 'customerName',
        header: () => (
            <div>
                <Tooltip
                    className="text-muted-foreground rounded-sm font-medium"
                    content="Name of the customer"
                    showArrow={true}
                >
                    <span className="flex items-center gap-2">
                        Guest Name <CircleHelp className="w-4 h-4" />
                    </span>
                </Tooltip>
            </div>
        ),
        cell: ({ row }) => (
            <span>{row.original?.waiter?.fullName ?? '--'}</span>
        ),
    },
    {
        accessorKey: 'guestName',
        header: () => (
            <div>
                <Tooltip
                    className="text-muted-foreground rounded-sm font-medium"
                    content="Name of the customer"
                    showArrow={true}
                >
                    <span className="flex items-center gap-2">
                        Waiter/Waitress <CircleHelp className="w-4 h-4" />
                    </span>
                </Tooltip>
            </div>
        ),
        cell: ({ row }) => <span>{row.original.guestName}</span>,
    },
    {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
            const status = row.original.status;
            return (
                <div
                    className={cn(
                        statusStyles[status]?.bg || 'bg-gray-100',
                        'flex items-center justify-center gap-2 w-fit px-3 py-1 rounded-full',
                    )}
                >
                    <div
                        className={cn(
                            statusStyles[status]?.dot || 'bg-gray-500',
                            'w-2 h-2 rounded-full',
                        )}
                    />
                    <span
                        className={cn(
                            statusStyles[status]?.text || 'text-gray-600',
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
        cell: ({ row }) => <KOTAction order={row.original} />,
    },
];
