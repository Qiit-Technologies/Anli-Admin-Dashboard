import { ScopedremainingStock } from '@/components/front-of-house/types';
import { ColumnDef } from '@tanstack/react-table';

export const remainingStockColumns: ColumnDef<ScopedremainingStock>[] = [
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
        accessorKey: 'description',
        header: 'Description',
        cell: ({ row }) => (
            <span className="text-sm font-normal leading-5 text-[#7B7878] text-center truncate">
                {row.original.description}
            </span>
        ),
    },
    {
        accessorKey: 'currentQty',
        header: 'Current Qty',
        cell: ({ row }) => (
            <span className="text-sm font-normal leading-5 text-[#7B7878] text-center">
                {row.original.currentQty}
            </span>
        ),
    },

    {
        accessorKey: 'unit',
        header: 'Unit',
        cell: ({ row }) => (
            <span className="text-sm font-normal leading-5 text-[#7B7878] text-center">
                {row.original.unit}
            </span>
        ),
    },
];
