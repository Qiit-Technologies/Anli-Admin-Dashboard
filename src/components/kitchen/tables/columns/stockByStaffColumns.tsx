import { ScopedStockByStaff } from '@/components/front-of-house/types';
import { ColumnDef } from '@tanstack/react-table';

export const stockByStaffColumns: ColumnDef<ScopedStockByStaff>[] = [
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
        accessorKey: 'action',
        header: 'Action',
        cell: ({ row }) => (
            <span className="text-sm font-normal leading-5 text-[#7B7878] text-center">
                {row.original.action}
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
        accessorKey: 'date',
        header: 'Date',
        cell: ({ row }) => (
            <span className="text-sm font-normal leading-5 text-[#7B7878] text-center">
                {row.original.date}
            </span>
        ),
    },
    {
        accessorKey: 'department',
        header: 'Department',
        cell: ({ row }) => (
            <span className="text-sm font-normal leading-5 text-[#7B7878] text-center">
                {row.original.department}
            </span>
        ),
    },
    {
        accessorKey: 'staffName',
        header: 'Staff Name',
        cell: ({ row }) => (
            <span className="text-sm font-normal leading-5 text-[#7B7878] text-center">
                {row.original.staffName}
            </span>
        ),
    },
];
