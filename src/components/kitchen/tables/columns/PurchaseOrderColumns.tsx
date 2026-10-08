import { ScopedPurchaseOrder } from '@/components/front-of-house/types';
import { Tooltip } from '@heroui/react';
import { ColumnDef } from '@tanstack/react-table';
import { CircleHelp } from 'lucide-react';

export const PurchaseOrderColumns: ColumnDef<ScopedPurchaseOrder>[] = [
    {
        accessorKey: 'item',
        header: 'Item Name',
        cell: ({ row }) => {
            const item = row.original.item;
            const itemName =
                typeof item === 'object' && item !== null
                    ? (item as any)?.name || (item as any)?.description || 'N/A'
                    : item || 'N/A';

            return (
                <span className="text-sm font-normal leading-5 text-[#667085] text-center">
                    {itemName}
                </span>
            );
        },
    },
    {
        accessorKey: 'quantity',
        header: () => (
            <div className="w-fit">
                <Tooltip
                    className="text-muted-foreground rounded-sm font-medium"
                    content="Quantity of the item"
                    showArrow={true}
                >
                    <span className="flex items-center gap-2">
                        Qty <CircleHelp className="w-4 h-4" />
                    </span>
                </Tooltip>
            </div>
        ),
        cell: ({ row }) => (
            <span className="text-sm font-normal leading-5 text-[#667085] text-center">
                {row.original.quantity}
            </span>
        ),
    },
    {
        accessorKey: 'amount',
        header: 'Amount',
        cell: ({ row }) => (
            <span className="text-sm font-normal leading-5 text-[#667085] text-center">
                {row.original.amount}
            </span>
        ),
    },
];
