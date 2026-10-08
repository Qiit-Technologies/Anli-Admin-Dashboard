import { formatDateStacked } from '@/lib/helpers';
import { cn } from '@/lib/utils';
import { Tooltip } from '@heroui/react';
import { ColumnDef } from '@tanstack/react-table';
import { CircleHelp } from 'lucide-react';
import { KOTAction } from '@/components/front-of-house/tables/KOTAction';
import { ScopedOrder } from '@/components/front-of-house/types';
import {
    orderAmountColumn,
} from '@/components/front-of-house/tables/columns/complimentaryColumns';

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

export const KDSOverviewColumns: ColumnDef<ScopedOrder>[] = [
    {
        accessorKey: 'orderId',
        header: 'Order ID',
        cell: ({ row }) => <span>{'Order-' + row.original.id}</span>,
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
        cell: ({ row }) => {
            const { date, time } = formatDateStacked(row.original.createdAt);
            return (
                <div className="flex flex-col">
                    <span className="text-sm font-medium">{date}</span>
                    <span className="text-xs text-gray-500">{time}</span>
                </div>
            );
        },
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
            if (tableNumber) return <span>Table {tableNumber}</span>;
            if (roomNumber) return <span>Room {roomNumber}</span>;
            return <span>—</span>;
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
        accessorKey: 'items',
        header: () => (
            <div>
                <Tooltip
                    className="text-muted-foreground rounded-sm font-medium"
                    content="Food items on this ticket"
                    showArrow={true}
                >
                    <span className="flex items-center gap-2">
                        Items <CircleHelp className="w-4 h-4" />
                    </span>
                </Tooltip>
            </div>
        ),
        cell: ({ row }) => {
            const items = row.original.items ?? [];
            if (!items.length) return <span>—</span>;
            const names = items
                .map((item) => item.menuItem?.name)
                .filter((name): name is string => Boolean(name));
            const preview = names.slice(0, 2).join(', ');
            const extra = names.length > 2 ? ` +${names.length - 2}` : '';
            return (
                <span className="line-clamp-2 max-w-[180px]" title={names.join(', ')}>
                    {preview}
                    {extra}
                </span>
            );
        },
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
                        Guest Name <CircleHelp className="w-4 h-4" />
                    </span>
                </Tooltip>
            </div>
        ),
        cell: ({ row }) => <span>{row.original?.guestName ?? '--'}</span>,
    },
    {
        accessorKey: 'createdBy',
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
        cell: ({ row }) => (
            <span>{row.original?.waiter?.fullName ?? '--'}</span>
        ),
    },
    orderAmountColumn('Amount'),
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
    {
        id: 'actions',
        header: 'Action',
        cell: ({ row }) => <KOTAction module="kitchen" order={row.original} />,
    },
];
