import { ScopedStockMovement } from '@/components/front-of-house/types';
import { getStatusColor } from '@/lib/utils';
import { ColumnDef } from '@tanstack/react-table';

export const stockMovementColumns: ColumnDef<ScopedStockMovement>[] = [
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
        accessorKey: 'qtyIssued',
        header: 'Qty Issued',
        cell: ({ row }) => (
            <span className="text-sm font-normal leading-5 text-[#7B7878] text-center">
                {row.original.qtyIssued}
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
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => (
            <div
                className={`w-fit px-3 py-1 rounded-full capitalize ${getStatusColor(row.original.status?.toLocaleLowerCase())}`}
            >
                <span className={`text-xs caption-top`}>
                    {row.original.status
                        ?.replaceAll('_', ' ')
                        ?.toLocaleLowerCase()}
                </span>
            </div>
        ),
    },
    {
        accessorKey: 'receivedBy',
        header: 'Received By',
        cell: ({ row }) => (
            <span className="text-sm font-normal leading-5 text-[#7B7878] text-center">
                {row.original.receivedBy}
            </span>
        ),
    },
    {
        accessorKey: 'approvedBy',
        header: 'Approved By',
        cell: ({ row }) => (
            <span className="text-sm font-normal leading-5 text-[#7B7878] text-center">
                {row.original.approvedBy}
            </span>
        ),
    },
];
