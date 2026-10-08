import { cn } from '@/lib/utils';
import { ColumnDef } from '@tanstack/react-table';

interface TransactionHistory {
    transactionType: string;
    guestName: string;
    amount: number;
    date: Date;
    paymentStatus: 'paid' | 'pending' | 'failed';
    paymentMethod: string;
    invoiceNumber: string;
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
    failed: {
        bg: 'bg-red-100',
        dot: 'bg-red-500',
        text: 'text-red-600',
    },
};

export const TransactionHistoryFilters = [
    {
        id: 'paymentStatus',
        label: 'Payment Status',
        options: [
            { value: 'paid', label: 'Paid' },
            { value: 'pending', label: 'Pending' },
            { value: 'failed', label: 'Failed' },
        ],
    },
    {
        id: 'transactionType',
        label: 'Transaction Type',
        options: [
            { value: 'room', label: 'Room Charge' },
            { value: 'food', label: 'Food & Beverage' },
            { value: 'service', label: 'Service' },
            { value: 'refund', label: 'Refund' },
        ],
    },
];

export const TransactionHistoryColumn: ColumnDef<TransactionHistory>[] = [
    {
        accessorKey: 'transactionType',
        header: 'Transaction Type',
        cell: ({ row }) => <span>{row.original.transactionType}</span>,
    },
    {
        accessorKey: 'guestName',
        header: 'Guest Name',
        cell: ({ row }) => <span>{row.original.guestName}</span>,
    },
    {
        accessorKey: 'date',
        header: 'Transaction Date',
        cell: ({ row }) => {
            const date = new Date(row.original.date);

            const formattedDate = date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
            });

            return <span>{formattedDate}</span>;
        },
    },
    {
        accessorKey: 'amount',
        header: 'Amount',
        cell: ({ row }) => {
            const amount = Number(row.original.amount) || 0;
            return <span>₦{amount.toFixed(2)}</span>;
        },
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
            const status = row.original.paymentStatus.toLowerCase();
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

export const sampleTHD: TransactionHistory[] = [
    {
        transactionType: 'Room Charge',
        guestName: 'John Smith',
        amount: 250.0,
        date: new Date('2023-07-15'),
        paymentStatus: 'paid',
        paymentMethod: 'Credit Card',
        invoiceNumber: 'INV-2023-0001',
    },
    {
        transactionType: 'Food & Beverage',
        guestName: 'Emma Johnson',
        amount: 75.5,
        date: new Date('2023-07-16'),
        paymentStatus: 'pending',
        paymentMethod: 'Room Charge',
        invoiceNumber: 'INV-2023-0002',
    },
    {
        transactionType: 'Service',
        guestName: 'Michael Brown',
        amount: 120.0,
        date: new Date('2023-07-17'),
        paymentStatus: 'paid',
        paymentMethod: 'Debit Card',
        invoiceNumber: 'INV-2023-0003',
    },
    {
        transactionType: 'Refund',
        guestName: 'Sarah Davis',
        amount: 50.0,
        date: new Date('2023-07-18'),
        paymentStatus: 'failed',
        paymentMethod: 'Bank Transfer',
        invoiceNumber: 'INV-2023-0004',
    },
];
