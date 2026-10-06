import { ScopedDepartmentalSales } from '@/components/front-of-house/types';
import { ColumnDef } from '@tanstack/react-table';

export const departmentalSalesColumns: ColumnDef<ScopedDepartmentalSales>[] = [
    {
        accessorKey: 'orderID',
        header: 'Order ID',
        cell: ({ row }) => (
            <span className="text-sm font-normal leading-5 text-center">
                {row.original.orderID}
            </span>
        ),
    },
    {
        accessorKey: 'tableRoom',
        header: 'Table/Room',
        cell: ({ row }) => (
            <span className="text-sm font-normal leading-5 text-[#7B7878] text-center">
                {row.original.tableRoom}
            </span>
        ),
    },
    {
        accessorKey: 'itemsSold',
        header: 'Items Sold',
        cell: ({ row }) => (
            <span className="text-sm font-normal leading-5 text-[#7B7878] text-center">
                {row.original.itemsSold}
            </span>
        ),
    },
    {
        accessorKey: 'amount',
        header: 'Amount (₦)',
        cell: ({ row }) => (
            <span className="text-sm font-normal leading-5 text-[#7B7878] text-center">
                {row.original.amount}
            </span>
        ),
    },
    {
        accessorKey: 'paymentMethod',
        header: 'Payment Method',
        cell: ({ row }) => (
            <span className="text-sm font-normal leading-5 text-[#7B7878] text-center">
                {row.original.paymentMethod}
            </span>
        ),
    },
    {
        accessorKey: 'date',
        header: 'Date',
        cell: ({ row }) => (
            <span className="text-sm font-normal leading-5 text-[#7B7878] text-center">
                {row.original.date}
            </span>
        ),
    },
    {
        accessorKey: 'servedBy',
        header: 'Served By',
        cell: ({ row }) => (
            <span className="text-sm font-normal leading-5 text-[#7B7878] text-center">
                {row.original.servedBy}
            </span>
        ),
    },
];
