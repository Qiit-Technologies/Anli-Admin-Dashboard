import { ScopedStockUsage } from '@/components/front-of-house/types';
import { formatCurrency } from '@/lib/utils';
import { ColumnDef } from '@tanstack/react-table';

export const stockUsageColumns: ColumnDef<ScopedStockUsage>[] = [
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
        accessorKey: 'departmentUsed',
        header: 'Department used',
        cell: ({ row }) => (
            <span className="text-sm font-normal leading-5 text-[#7B7878] text-center">
                {row.original.departmentUsed}
            </span>
        ),
    },
    {
        accessorKey: 'quantityIssued',
        header: 'Quantity Issued',
        cell: ({ row }) => (
            <span className="text-sm font-normal leading-5 text-[#7B7878] text-center">
                {row.original.quantityIssued}
            </span>
        ),
    },
    {
        accessorKey: 'unitCost',
        header: 'Unit Cost (₦)',
        cell: ({ row }) => (
            <span className="text-sm font-normal leading-5 text-[#7B7878] text-center">
                {formatCurrency(row.original.unitCost)}
            </span>
        ),
    },
    {
        accessorKey: 'totalCost',
        header: 'Total Cost (₦)',
        cell: ({ row }) => (
            <span className="text-sm font-normal leading-5 text-[#7B7878] text-center">
                {formatCurrency(row.original.totalCost)}
            </span>
        ),
    },
];
