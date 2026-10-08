import { formatDateStacked } from '@/lib/helpers';
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
import { getComplimentaryStatus } from '../../utils/complimentary';
import ComplimentaryBadge from '../../complimentary/ComplimentaryBadge';

export const incomingOrdersFilters = [
    {
        id: 'status',
        label: 'Status',
        options: [
            { value: 'pending', label: 'Pending' },
            { value: 'completed', label: 'Completed' },
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
        text: 'text-green-600',
    },
    PENDING: {
        bg: 'bg-yellow-100',
        dot: 'bg-yellow-500',
        text: 'text-yellow-600',
    },
    FAILED: {
        bg: 'bg-red-100',
        dot: 'bg-red-500',
        text: 'text-red-600',
    },
    UNPAID: {
        bg: 'bg-gray-100',
        dot: 'bg-gray-500',
        text: 'text-gray-600',
    },
    ADDED_TO_BILL: {
        bg: 'bg-green-50',
        dot: 'bg-green-500',
        text: 'text-green-800',
    },
    COMPLEMENTED: {
        bg: 'bg-purple-100',
        dot: 'bg-purple-500',
        text: 'text-purple-700',
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

function renderIncomingPaymentStatus(order: ScopedOrder) {
    if (order.isVoided || order.status === 'VOIDED' || order.paymentStatus === 'VOIDED') {
        const style = paymentStatusStyles.VOIDED;
        return (
            <div className="flex items-center gap-2">
                <div
                    className={cn(
                        'flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium',
                        style.bg,
                        style.text,
                    )}
                >
                    <div className={cn('w-2 h-2 rounded-full', style.dot)} />
                    VOIDED
                </div>
            </div>
        );
    }

    const compStatus = getComplimentaryStatus(order);
    const balance = Number(order.remainingBalance ?? 0);

    if (compStatus === 'FULL' && balance <= 0) {
        return (
            <div className="flex items-center gap-2">
                <ComplimentaryBadge status="FULL" compact />
            </div>
        );
    }
    if (compStatus === 'FULL' && balance > 0) {
        // More items added after a full complimentary grant (CMP-015)
        return (
            <div className="flex items-center gap-2 flex-wrap">
                <ComplimentaryBadge status="PARTIAL" compact />
            </div>
        );
    }
    if (compStatus === 'PARTIAL') {
        return (
            <div className="flex items-center gap-2 flex-wrap">
                {balance <= 0 ? (
                    <div className="flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        PAID
                    </div>
                ) : null}
                <ComplimentaryBadge status="PARTIAL" compact />
            </div>
        );
    }

    const paymentStatus = order.paymentStatus as keyof typeof paymentStatusStyles;
    const style =
        paymentStatusStyles[paymentStatus] || paymentStatusStyles.PENDING;

    return (
        <div className="flex items-center gap-2">
            <div
                className={cn(
                    'flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium',
                    style.bg,
                    style.text,
                )}
            >
                <div className={cn('w-2 h-2 rounded-full', style.dot)} />
                {paymentStatus || 'PENDING'}
            </div>
        </div>
    );
}

const baseColumns: ColumnDef<ScopedOrder>[] = [
    {
        accessorKey: 'dineInArea.id',
        id: 'dineInAreaId',
        header: () => null,
        cell: () => null,
        enableHiding: true,
    },
    {
        accessorKey: 'id',
        header: 'Order ID',
        cell: ({ row }) => <span>{`#ORD-${row.original.id}`}</span>,
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

            if (tableNumber) {
                return <span>Table {tableNumber}</span>;
            } else if (roomNumber) {
                return <span>Room {roomNumber}</span>;
            } else {
                return <span>-</span>;
            }
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
];

const statusColumn: ColumnDef<ScopedOrder> = {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
        const status = row.original.status as keyof typeof statusStyles;
        const style = statusStyles[status] || statusStyles.PENDING;

        return (
            <div className="flex items-center gap-2">
                <div
                    className={cn(
                        'flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium',
                        style.bg,
                        style.text,
                    )}
                >
                    <div className={cn('w-2 h-2 rounded-full', style.dot)} />
                    {status}
                </div>
            </div>
        );
    },
};

const actionColumn: ColumnDef<ScopedOrder> = {
    id: 'actions',
    header: 'Action',
    cell: ({ row }) => <OrderAction row={row.original} />,
};

export const incomingOrdersColumn: ColumnDef<ScopedOrder>[] = [
    ...baseColumns,
    orderAmountColumn('Amount'),
    discountBadgeColumn,
    statusColumn,
    actionColumn,
];

export const runningOrdersColumn: ColumnDef<ScopedOrder>[] = [
    ...baseColumns,
    {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
            const status = row.original.status as keyof typeof statusStyles;
            const style = statusStyles[status] || statusStyles.PENDING;

            return (
                <div className="flex items-center gap-2">
                    <div
                        className={cn(
                            'flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium',
                            style.bg,
                            style.text,
                        )}
                    >
                        <div
                            className={cn('w-2 h-2 rounded-full', style.dot)}
                        />
                        {status === 'PENDING'
                            ? 'Pending'
                            : status === 'IN_KITCHEN'
                              ? 'In Kitchen'
                              : status}
                    </div>
                </div>
            );
        },
    },
    {
        accessorKey: 'paymentStatus',
        header: 'Payment Status',
        cell: ({ row }) => renderIncomingPaymentStatus(row.original),
    },
    orderAmountColumn('Balance'),
    discountBadgeColumn,
    actionColumn,
];

export const readyOrdersColumn: ColumnDef<ScopedOrder>[] = [
    ...baseColumns,
    {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
            const status = row.original.status as keyof typeof statusStyles;
            const style = statusStyles[status] || statusStyles.READY;

            return (
                <div className="flex items-center gap-2">
                    <div
                        className={cn(
                            'flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium',
                            style.bg,
                            style.text,
                        )}
                    >
                        <div
                            className={cn('w-2 h-2 rounded-full', style.dot)}
                        />
                        Ready
                    </div>
                </div>
            );
        },
    },
    {
        accessorKey: 'paymentStatus',
        header: 'Payment Status',
        cell: ({ row }) => renderIncomingPaymentStatus(row.original),
    },
    {
        accessorKey: 'readyTime',
        header: () => (
            <div>
                <Tooltip
                    className="text-muted-foreground rounded-sm font-medium"
                    content="When the order was marked as ready"
                    showArrow={true}
                >
                    <span className="flex items-center gap-2">
                        Ready At <CircleHelp className="w-4 h-4" />
                    </span>
                </Tooltip>
            </div>
        ),
        cell: ({ row }) => {
            const readyTime = row.original.updatedAt || row.original.createdAt;
            const { date, time } = formatDateStacked(readyTime);
            return (
                <div className="flex flex-col">
                    <span className="text-sm font-medium">{date}</span>
                    <span className="text-xs text-gray-500">{time}</span>
                </div>
            );
        },
    },
    orderAmountColumn('Total'),
    discountBadgeColumn,
    actionColumn,
];

export const settledOrdersColumn: ColumnDef<ScopedOrder>[] = [
    ...baseColumns,
    {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
            const status = row.original.status as keyof typeof statusStyles;
            const style = statusStyles[status] || statusStyles.COMPLETED;

            return (
                <div className="flex items-center gap-2">
                    <div
                        className={cn(
                            'flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium',
                            style.bg,
                            style.text,
                        )}
                    >
                        <div
                            className={cn('w-2 h-2 rounded-full', style.dot)}
                        />
                        {status === 'COMPLETED'
                            ? 'Completed'
                            : status === 'DISPATCHED'
                              ? 'Dispatched'
                              : status === 'PAID'
                                ? 'Paid'
                                : status === 'CANCELLED'
                                  ? 'Cancelled'
                                  : status === 'VOIDED'
                                    ? 'Voided'
                                    : status}
                    </div>
                </div>
            );
        },
    },
    {
        accessorKey: 'paymentStatus',
        header: 'Payment Status',
        cell: ({ row }) => renderIncomingPaymentStatus(row.original),
    },
    {
        accessorKey: 'updatedAt',
        header: () => (
            <div>
                <Tooltip
                    className="text-muted-foreground rounded-sm font-medium"
                    content="When the order was completed"
                    showArrow={true}
                >
                    <span className="flex items-center gap-2">
                        Completed At <CircleHelp className="w-4 h-4" />
                    </span>
                </Tooltip>
            </div>
        ),
        cell: ({ row }) => {
            if (!row.original.completedAt) {
                return <span>-</span>;
            }
            const { date, time } = formatDateStacked(
                row.original.updatedAt || row.original.createdAt,
            );
            return (
                <div className="flex flex-col">
                    <span className="text-sm font-medium">{date}</span>
                    <span className="text-xs text-gray-500">{time}</span>
                </div>
            );
        },
    },
    orderAmountColumn('Total'),
    discountBadgeColumn,
];
