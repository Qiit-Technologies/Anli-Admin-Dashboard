import { KOTAction } from '@/components/front-of-house/tables/KOTAction';
import { ScopedOrder } from '@/components/front-of-house/types';
import { formatDate } from '@/lib/helpers';
import { cn } from '@/lib/utils';
import { Tooltip } from '@heroui/react';
import { ColumnDef } from '@tanstack/react-table';
import { CircleHelp } from 'lucide-react';

const statusStyles = {
    pending: {
        bg: 'bg-orange-100',
        dot: 'bg-orange-500',
        text: 'text-orange-600',
    },
    completed: {
        bg: 'bg-green-100',
        dot: 'bg-green-500',
        text: 'text-green-600',
    },
    cancelled: {
        bg: 'bg-red-100',
        dot: 'bg-red-500',
        text: 'text-red-600',
    },
};

export const OrderHistoryFilters = [
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

export const OrderHistoryColumn: ColumnDef<ScopedOrder>[] = [
    {
        accessorKey: 'requestId',
        header: 'Order ID',
        cell: ({ row }) => (
            <span>{row.original.requestId || '#RED-' + row.original.id}</span>
        ),
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
        accessorKey: 'orderType',
        header: () => (
            <div>
                <Tooltip
                    className="text-muted-foreground rounded-sm font-medium"
                    content="Type of order (e.g., Dinner, Lunch)"
                    showArrow={true}
                >
                    <span className="flex items-center gap-2">
                        Type <CircleHelp className="w-4 h-4" />
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
    {
        accessorKey: 'paymentStatus',
        header: 'Payment Status',
        cell: ({ row }) => {
            const paymentStatus = row.original.paymentStatus;
            return (
                <div
                    className={cn(
                        statusStyles[
                            paymentStatus.toLowerCase() as keyof typeof statusStyles
                        ]?.bg || 'bg-gray-100',
                        'flex items-center justify-center gap-2 w-fit px-3 py-1 rounded-full',
                    )}
                >
                    <div
                        className={cn(
                            statusStyles[
                                paymentStatus.toLowerCase() as keyof typeof statusStyles
                            ]?.dot || 'bg-gray-500',
                            'w-2 h-2 rounded-full',
                        )}
                    />
                    <span
                        className={cn(
                            statusStyles[
                                paymentStatus.toLowerCase() as keyof typeof statusStyles
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
                        statusStyles[
                            status.toLowerCase() as keyof typeof statusStyles
                        ]?.bg || 'bg-gray-100',
                        'flex items-center justify-center gap-2 w-fit px-3 py-1 rounded-full',
                    )}
                >
                    <div
                        className={cn(
                            statusStyles[
                                status.toLowerCase() as keyof typeof statusStyles
                            ]?.dot || 'bg-gray-500',
                            'w-2 h-2 rounded-full',
                        )}
                    />
                    <span
                        className={cn(
                            statusStyles[
                                status.toLowerCase() as keyof typeof statusStyles
                            ]?.text || 'text-gray-600',
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
        cell: ({ row }) => {
            return <KOTAction order={row.original} />;
        },
    },
];
