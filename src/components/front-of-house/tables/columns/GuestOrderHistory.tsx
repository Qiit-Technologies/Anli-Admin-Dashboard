import { formatDate } from '@/lib/helpers';
import { Tooltip } from '@heroui/react';
import { ColumnDef } from '@tanstack/react-table';

interface GuestOrderHistory {
    orderId: string;
    orderDate: string;
    orderAmount: number;
    source: string;
    driverName: string;
}

export const sampleGuestHistoryData: GuestOrderHistory[] = [
    {
        orderId: '12345',
        orderDate: '2023-07-25',
        orderAmount: 50.0,
        source: 'Dine In',
        driverName: 'John Doe',
    },
    {
        orderId: '67890',
        orderDate: '2023-07-26',
        orderAmount: 75.0,
        source: 'Take Away',
        driverName: '',
    },
    {
        orderId: '13579',
        orderDate: '2023-07-27',
        orderAmount: 100.0,
        source: 'Delivery',
        driverName: 'Jane Smith',
    },
];

export const guestOrderHistoryFilters = [
    {
        id: 'source',
        label: 'Source',
        options: [
            { value: 'dine-in', label: 'Dine In' },
            { value: 'takeaway', label: 'Take Away' },
            { value: 'delivery', label: 'Delivery' },
        ],
    },
];

export const guestOrderHistoryColumns: ColumnDef<GuestOrderHistory>[] = [
    {
        accessorKey: 'orderId',
        header: 'Order ID',
        cell: ({ row }) => <span>{row.original.orderId || row.id}</span>,
    },
    {
        accessorKey: 'orderDate',
        header: () => (
            <div>
                <Tooltip
                    className="text-muted-foreground rounded-sm font-medium"
                    content="Date when the order was placed"
                    showArrow={true}
                >
                    <span className="flex items-center gap-2">Date</span>
                </Tooltip>
            </div>
        ),
        cell: ({ row }) => <span>{formatDate(row.original.orderDate)}</span>,
    },
    {
        accessorKey: 'orderAmount',
        header: () => (
            <div>
                <Tooltip
                    className="text-muted-foreground rounded-sm font-medium"
                    content="Total amount of the order"
                    showArrow={true}
                >
                    <span className="flex items-center gap-2">Amount</span>
                </Tooltip>
            </div>
        ),
        cell: ({ row }) => <span>₦{row.original.orderAmount.toFixed(2)}</span>,
    },
    {
        accessorKey: 'source',
        header: () => (
            <div>
                <Tooltip
                    className="text-muted-foreground rounded-sm font-medium"
                    content="Source of the order (e.g., Dine In, Take Away, Delivery)"
                    showArrow={true}
                >
                    <span className="flex items-center gap-2">Source</span>
                </Tooltip>
            </div>
        ),
        cell: ({ row }) => <span>{row.original.source}</span>,
    },
    {
        accessorKey: 'driverName',
        header: () => (
            <div>
                <Tooltip
                    className="text-muted-foreground rounded-sm font-medium"
                    content="Name of the delivery driver (if applicable)"
                    showArrow={true}
                >
                    <span className="flex items-center gap-2">Driver</span>
                </Tooltip>
            </div>
        ),
        cell: ({ row }) => <span>{row.original.driverName || 'N/A'}</span>,
    },
];
