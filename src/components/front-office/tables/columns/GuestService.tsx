import { cn, formatCurrency } from '@/lib/utils';
import { Tooltip } from '@heroui/react';
import { ColumnDef } from '@tanstack/react-table';
import { CircleHelp } from 'lucide-react';

export interface GuestService {
    id: number;
    type: string; // Can be 'laundry', 'restaurant', 'new reservation', 'Wake up call', etc.
    date: string;
    time: string;
    paymentStatus:
    | 'PAID'
    | 'PENDING'
    | 'paid'
    | 'pending'
    | 'failed'
    | 'completed'
    | 'ADDED_TO_BILL'
    | 'BILL_SETTLED_FROM_FRONT_DESK';
    amount: number;
    notes: string;
    orderItems?: Array<{
        id: number;
        name: string;
        quantity: number;
        price: number;
        notes?: string | null;
    }>;
}

const paymentStatusStyles = {
    paid: {
        bg: 'bg-green-100',
        dot: 'bg-green-500',
        text: 'text-green-600',
    },
    added_to_bill: {
        bg: 'bg-green-100',
        dot: 'bg-green-500',
        text: 'text-green-600',
    },
    pending: {
        bg: 'bg-orange-100',
        dot: 'bg-orange-500',
        text: 'text-orange-600',
    },
    failed: {
        bg: 'bg-red-100',
        dot: 'bg-red-500',
        text: 'text-red-600',
    },
};

export const GuestServiceFilters = [
    {
        id: 'type',
        label: 'Service Type',
        options: [
            { value: 'laundry', label: 'Laundry' },
            { value: 'restaurant', label: 'Restaurant' },
            { value: 'new reservation', label: 'New Reservation' },
            { value: 'Wake up call', label: 'Wake Up Call' },
        ],
    },
    {
        id: 'paymentStatus',
        label: 'Payment Status',
        options: [
            { value: 'PAID', label: 'Paid' },
            { value: 'ADDED_TO_BILL', label: 'Posted To Room' },
            { value: 'BILL_SETTLED_FROM_FRONT_DESK', label: 'Bill settled from front desk' },
            { value: 'PENDING', label: 'Pending' },
            { value: 'FAILED', label: 'Failed' },
        ],
    },
];

export const GuestServiceColumn: ColumnDef<GuestService>[] = [
    {
        accessorKey: 'type',
        header: () => (
            <div>
                <Tooltip
                    className="text-muted-foreground rounded-sm font-medium"
                    content="Type of service requested by the guest"
                    showArrow={true}
                >
                    <span className="flex items-center gap-2">
                        Service Type <CircleHelp className="w-4 h-4" />
                    </span>
                </Tooltip>
            </div>
        ),
        cell: ({ row }) => {
            const type = row.original.type;
            // Capitalize first letter of each word
            const capitalizedType = type
                .split(' ')
                .map(
                    (word: string) =>
                        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
                )
                .join(' ');
            return <span>{capitalizedType}</span>;
        },
    },
    {
        accessorKey: 'date',
        header: 'Service Date',
        cell: ({ row }) => {
            const date = new Date(row.original.date);
            const time = row.original.time
                ? new Date(`1970-01-01T${row.original.time}`)
                : null;

            const formattedDate = date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
            });

            const formattedTime = time?.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
            });

            return (
                <div className="flex gap-1">
                    <span>{formattedDate},</span>
                    {formattedTime && (
                        <span className="text-sm text-gray-500">
                            {formattedTime}
                        </span>
                    )}
                </div>
            );
        },
    },
    {
        accessorKey: 'amount',
        header: () => (
            <div>
                <Tooltip
                    className="text-muted-foreground rounded-sm font-medium"
                    content="Amount charged for the service"
                    showArrow={true}
                >
                    <span className="flex items-center gap-2">
                        Amount <CircleHelp className="w-4 h-4" />
                    </span>
                </Tooltip>
            </div>
        ),
        cell: ({ row }) => <span>{formatCurrency(row.original.amount)}</span>,
    },
    {
        accessorKey: 'paymentStatus',
        header: 'Payment Status',
        filterFn: (row, columnId, filterValue) => {
            if (!filterValue) return true;
            const status = String(row.getValue(columnId) || '').toUpperCase();
            const filter = String(filterValue).toUpperCase();

            if (filter === 'ADDED_TO_BILL') {
                return status === 'ADDED_TO_BILL';
            }
            if (filter === 'PAID' || filter === 'COMPLETED') {
                return status === 'PAID' || status === 'COMPLETED' || status === 'BILL_SETTLED_FROM_FRONT_DESK';
            }
            if (filter === 'BILL_SETTLED_FROM_FRONT_DESK') {
                return status === 'BILL_SETTLED_FROM_FRONT_DESK';
            }
            if (filter === 'PENDING') {
                return status === 'PENDING';
            }
            return status === filter;
        },
        cell: ({ row }) => {
            const rawStatus = String(row.original.paymentStatus || '').toUpperCase();

            let styleKey: 'paid' | 'added_to_bill' | 'pending' | 'failed' = 'failed';
            let label = rawStatus;

            if (rawStatus === 'ADDED_TO_BILL') {
                styleKey = 'added_to_bill';
                label = 'Posted To Room';
            } else if (rawStatus === 'BILL_SETTLED_FROM_FRONT_DESK') {
                styleKey = 'paid';
                label = 'Bill settled from front desk';
            } else if (rawStatus === 'PAID' || rawStatus === 'COMPLETED') {
                styleKey = 'paid';
                label = 'Paid';
            } else if (rawStatus === 'PENDING') {
                styleKey = 'pending';
                label = 'Pending';
            } else if (rawStatus === 'FAILED') {
                styleKey = 'failed';
                label = 'Failed';
            } else {
                label = rawStatus.charAt(0) + rawStatus.slice(1).toLowerCase().replaceAll('_', ' ');
            }

            return (
                <div
                    className={cn(
                        paymentStatusStyles[styleKey]?.bg || 'bg-gray-100',
                        'flex items-center justify-center gap-2 w-fit px-3 py-1 rounded-full',
                    )}
                >
                    <div
                        className={cn(
                            paymentStatusStyles[styleKey]?.dot || 'bg-gray-500',
                            'w-2 h-2 rounded-full',
                        )}
                    />
                    <span
                        className={cn(
                            paymentStatusStyles[styleKey]?.text || 'text-gray-600',
                            'text-xs caption-top',
                        )}
                    >
                        {label}
                    </span>
                </div>
            );
        },
    },
    {
        accessorKey: 'notes',
        header: 'Notes',
        cell: ({ row }) => {
            const service = row.original;
            // For restaurant orders, display order items instead of notes
            if (service.type?.toLowerCase() === 'restaurant' && service.orderItems && service.orderItems.length > 0) {
                return (
                    <div className="flex flex-col gap-1">
                        {service.orderItems.map((item, index) => (
                            <span key={item.id || index} className="text-sm">
                                {item.quantity}x {item.name}
                                {item.notes && (
                                    <span className="text-gray-500 text-xs ml-1">
                                        ({item.notes})
                                    </span>
                                )}
                            </span>
                        ))}
                    </div>
                );
            }
            // For other services, display notes as before
            return <span>{service.notes || 'N/A'}</span>;
        },
    },
];

