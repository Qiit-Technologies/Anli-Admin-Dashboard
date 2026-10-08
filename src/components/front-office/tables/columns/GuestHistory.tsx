import { cn, formatCurrency } from '@/lib/utils';
import useHotel from '@/hooks/useHotel';
import { Tooltip } from '@heroui/react';
import { ColumnDef } from '@tanstack/react-table';
import { CircleHelp } from 'lucide-react';

interface GuestHistory {
    roomType: string;
    roomNumber: string;
    roomNumberRoman?: string;
    paymentMethod: string;
    amountPaid: number;
    checkInDate: Date;
    status: string;
    nights: number;
    paymentStatus: 'paid' | 'pending' | 'failed';
}

const paymentStatusStyles = {
    paid: {
        bg: 'bg-green-100',
        dot: 'bg-green-500',
        text: 'text-green-600',
    },
    pending: {
        bg: 'bg-orange-100',
        dot: 'bg-orange-500',
        text: 'text-orange-600',
    },
    unpaid: {
        bg: 'bg-red-100',
        dot: 'bg-red-500',
        text: 'text-red-600',
    },
};

export const GuestHistoryFilters = [
    {
        id: 'paymentStatus',
        label: 'Payment Status',
        options: [
            { value: 'paid', label: 'Paid' },
            { value: 'partial', label: 'Partial' },
            { value: 'unpaid', label: 'Unpaid' },
        ],
    },
    {
        id: 'roomType',
        label: 'Room Type',
        options: [
            { value: 'standard', label: 'Standard' },
            { value: 'deluxe', label: 'Deluxe' },
            { value: 'suite', label: 'Suite' },
        ],
    },
];

export const useGuestHistoryColumns = (): ColumnDef<GuestHistory>[] => {
    const { organization } = useHotel();
    const showRoman = organization?.id === 10;

    return [
        {
            accessorKey: 'roomType',
            header: 'Room Type',
            cell: ({ row }) => <span>{row.original.roomType}</span>,
        },
        {
            accessorKey: 'roomNumber',
            header: () => (
                <div>
                    <Tooltip
                        className="text-muted-foreground rounded-sm font-medium"
                        content="Room number assigned during stay"
                        showArrow={true}
                    >
                        <span className="flex items-center gap-2">
                            Room Number <CircleHelp className="w-4 h-4" />
                        </span>
                    </Tooltip>
                </div>
            ),
            cell: ({ row }) => (
                <span>
                    {row?.original?.roomNumber}
                    {showRoman && row?.original?.roomNumberRoman
                        ? ` (${row?.original?.roomNumberRoman})`
                        : ''}
                </span>
            ),
        },
        {
            accessorKey: 'checkInDate',
            header: 'Check-in Date',
            cell: ({ row }) => {
                const date = new Date(row.original.checkInDate);

                const formattedDate = date.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                });

                return <span>{formattedDate}</span>;
            },
        },
        {
            accessorKey: 'nights',
            header: () => (
                <div>
                    <Tooltip
                        className="text-muted-foreground rounded-sm font-medium"
                        content="Number of nights stayed"
                        showArrow={true}
                    >
                        <span className="flex items-center gap-2">
                            Nights <CircleHelp className="w-4 h-4" />
                        </span>
                    </Tooltip>
                </div>
            ),
            cell: ({ row }) => <span>{row.original.nights}</span>,
        },
        {
            accessorKey: 'amountPaid',
            header: 'Amount Paid',
            cell: ({ row }) => (
                <span>{formatCurrency(row.original.amountPaid)}</span>
            ),
        },
        {
            accessorKey: 'paymentMethod',
            header: 'Payment Method',
            cell: ({ row }) => <span>{row.original.paymentMethod}</span>,
        },
        {
            accessorKey: 'paymentStatus',
            header: 'Payment Status',
            cell: ({ row }) => {
                const status = row.original.paymentStatus.toLocaleLowerCase();
                return (
                    <div
                        className={cn(
                            paymentStatusStyles[
                                status as keyof typeof paymentStatusStyles
                            ]?.bg || 'bg-gray-100',
                            'flex items-center justify-center gap-2 w-fit px-3 py-1 rounded-full',
                        )}
                    >
                        <div
                            className={cn(
                                paymentStatusStyles[
                                    status as keyof typeof paymentStatusStyles
                                ]?.dot || 'bg-gray-500',
                                'w-2 h-2 rounded-full',
                            )}
                        />
                        <span
                            className={cn(
                                paymentStatusStyles[
                                    status as keyof typeof paymentStatusStyles
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
    ];
};

export const sampleGHD: GuestHistory[] = [
    {
        roomType: 'Deluxe',
        roomNumber: '301',
        paymentMethod: 'Credit Card',
        amountPaid: 450.0,
        checkInDate: new Date('2023-05-10'),
        status: 'completed',
        nights: 3,
        paymentStatus: 'pending',
    },
    {
        roomType: 'Suite',
        roomNumber: '501',
        paymentMethod: 'Cash',
        amountPaid: 350.0,
        checkInDate: new Date('2023-06-01'),
        status: 'completed',
        nights: 4,
        paymentStatus: 'paid',
    },
    {
        roomType: 'Standard',
        roomNumber: '201',
        paymentMethod: 'Debit Card',
        amountPaid: 0.0,
        checkInDate: new Date('2023-06-15'),
        status: 'cancelled',
        nights: 3,
        paymentStatus: 'pending',
    },
];
