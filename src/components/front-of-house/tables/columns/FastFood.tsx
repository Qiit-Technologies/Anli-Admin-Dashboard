import { formatDate } from '@/lib/helpers';
import { cn } from '@/lib/utils';
import { Tooltip } from '@heroui/react';
import { ColumnDef } from '@tanstack/react-table';
import { CircleHelp } from 'lucide-react';
import { ScopedOrder } from '../../types';
import OrderAction from '../OrderAction';
import {
    discountBadgeColumn,
    orderAmountColumn,
} from './complimentaryColumns';

export interface Item {
    id: string;
    name: string;
    quantity: number;
    price: number;
    total: number;
}

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
    READY: {
        bg: 'bg-green-100',
        dot: 'bg-green-500',
        text: 'text-green-600',
    },
};

export const fastFoodFilters = [
    {
        id: 'status',
        label: 'Status',
        options: [
            { value: 'pending', label: 'Pending' },
            { value: 'done', label: 'Done' },
        ],
    },
    {
        id: 'paymentStatus',
        label: 'Payment Status',
        options: [
            { value: 'pending', label: 'Pending' },
            { value: 'paid', label: 'Paid' },
            { value: 'added to bill', label: 'Added to Bill' },
        ],
    },
    {
        id: 'orderType',
        label: 'Order Type',
        options: [
            { value: 'DINE_IN', label: 'Dine In' },
            { value: 'FAST_FOOD', label: 'Fast Food' },
            { value: 'TAKE_AWAY', label: 'Take Away' },
            { value: 'DELIVERY', label: 'Delivery' },
            { value: 'ROOM', label: 'Room' },
            { value: 'NO_CHARGE', label: 'No Charge' },
        ],
    },
];

export const fastFoodColumns: ColumnDef<ScopedOrder>[] = [
    {
        accessorKey: 'id',
        header: 'Order ID',
        cell: ({ row }) => <span>{`#ORD-${row.original.id}`}</span>,
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
        cell: ({ row }) => <span>{formatDate(row.original.createdAt)}</span>,
    },
    {
        accessorKey: 'orderType',
        header: () => (
            <div>
                <Tooltip
                    className="text-muted-foreground rounded-sm font-medium"
                    content="Type of order (e.g., Fast Food)"
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
        id: 'guestName',
        header: () => (
            <div>
                <Tooltip
                    className="text-muted-foreground rounded-sm font-medium"
                    content="Name of the guest"
                    showArrow={true}
                >
                    <span className="flex items-center gap-2">
                        Guest Name <CircleHelp className="w-4 h-4" />
                    </span>
                </Tooltip>
            </div>
        ),
        cell: ({ row }) => <span>{row.original.guestName || '-'}</span>,
    },
    orderAmountColumn('Price'),
    discountBadgeColumn,
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
        accessorKey: 'paymentStatus',
        header: 'Payment Status',
        cell: ({ row }) => {
            const isComplimentary =
                row.original.complimentaryStatus === 'FULL' &&
                Number(row.original.remainingBalance ?? 0) <= 0;
            if (isComplimentary) {
                return (
                    <div className="flex items-center justify-center gap-2 w-fit px-3 py-1 rounded-full bg-green-100">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        <span className="text-xs caption-top text-green-700">
                            COMPLIMENTARY
                        </span>
                    </div>
                );
            }
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
    {
        id: 'actions',
        header: 'Action',
        cell: ({ row }) => <OrderAction row={row.original} />,
    },
    {
        accessorKey: 'dineInArea.id',
        id: 'dineInAreaId',
        header: () => null,
        cell: () => null,
        enableHiding: true,
    },
];
