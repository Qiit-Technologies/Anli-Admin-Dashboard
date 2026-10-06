import { ScopedStockAdditions } from '@/components/front-of-house/types';
import { ColumnDef } from '@tanstack/react-table';

export const stockAdditionsColumns: ColumnDef<ScopedStockAdditions>[] = [
    {
        accessorKey: 'itemName',
        header: 'Item Name',
        cell: ({ row }) => (
            <span className="text-sm font-normal leading-5 text-center">
                {row.original.itemName}
            </span>
        ),
    },
    {
        accessorKey: 'openingQty',
        header: 'Opening Qty',
        cell: ({ row }) => (
            <span className="text-sm font-normal leading-5 text-[#7B7878] text-center">
                {row.original.openingQty}
            </span>
        ),
    },
    {
        accessorKey: 'qtyAdded',
        header: 'Qty Added',
        cell: ({ row }) => (
            <span className="text-sm font-normal leading-5 text-[#7B7878] text-center">
                {row.original.qtyAdded}
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
        accessorKey: 'addedBy',
        header: 'Added By',
        cell: ({ row }) => (
            <span className="text-sm font-normal leading-5 text-[#7B7878] text-center">
                {row.original.addedBy}
            </span>
        ),
    },
];
