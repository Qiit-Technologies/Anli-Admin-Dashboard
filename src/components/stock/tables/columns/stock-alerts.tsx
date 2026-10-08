import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { Tooltip } from '@heroui/react';
import { ColumnDef } from '@tanstack/react-table';
import { CircleHelp } from 'lucide-react';

type StockAlertProps = {
    id: string;
    itemName: string;
    currentStock: number;
    minimumStock: number;
    status: 'Low Stock' | 'Out of Stock' | 'Full';
};

export const StockAlerts: StockAlertProps[] = [
    {
        id: '1',
        itemName: 'Hand Towels',
        currentStock: 50,
        minimumStock: 100,
        status: 'Low Stock',
    },
    {
        id: '2',
        itemName: 'Toilet Paper',
        currentStock: 0,
        minimumStock: 50,
        status: 'Out of Stock',
    },
    {
        id: '3',
        itemName: 'Bed Sheets',
        currentStock: 200,
        minimumStock: 100,
        status: 'Full',
    },
    {
        id: '4',
        itemName: 'Bath Soap',
        currentStock: 25,
        minimumStock: 150,
        status: 'Low Stock',
    },
    {
        id: '5',
        itemName: 'Shampoo Bottles',
        currentStock: 0,
        minimumStock: 200,
        status: 'Out of Stock',
    },
    {
        id: '6',
        itemName: 'Bath Towels',
        currentStock: 300,
        minimumStock: 200,
        status: 'Full',
    },
];

export const stockAlertFilters = [
    {
        id: 'status',
        label: 'Status',
        options: [
            { value: 'Low Stock', label: 'Low Stock' },
            { value: 'Out of Stock', label: 'Out of Stock' },
            { value: 'Full', label: 'Full' },
        ],
    },
];

const statusStyles = {
    'low stock': {
        bg: 'bg-orange-100',
        dot: 'bg-orange-500',
        text: 'text-orange-600',
    },
    'out of stock': {
        bg: 'bg-red-100',
        dot: 'bg-red-500',
        text: 'text-red-600',
    },
    full: {
        bg: 'bg-green-100',
        dot: 'bg-green-500',
        text: 'text-green-600',
    },
};

export const stockAlertColumn: ColumnDef<StockAlertProps>[] = [
    {
        id: 'select',
        header: ({ table }) => (
            <div className="w-fit h-full flex items-center bg-red">
                <Checkbox
                    className="shadow-none border-gray-300 data-[state=checked]:bg-brand"
                    checked={
                        table.getIsAllPageRowsSelected() ||
                        (table.getIsSomePageRowsSelected() && 'indeterminate')
                    }
                    onCheckedChange={(value) =>
                        table.toggleAllPageRowsSelected(!!value)
                    }
                    aria-label="Select all"
                />
            </div>
        ),
        cell: ({ row }) => (
            <div className="w-full h-full flex items-center bg-red">
                <Checkbox
                    className="shadow-none border-gray-300 data-[state=checked]:bg-brand"
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label="Select row"
                />
            </div>
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: 'itemName',
        header: 'Item Name',
        cell: ({ row }) => {
            const itemName = row.original.itemName;
            return (
                <div className="capitalize flex flex-col">
                    <span className="text-muted-foreground">{itemName}</span>
                </div>
            );
        },
    },
    {
        accessorKey: 'currentStock',
        header: () => (
            <div>
                <Tooltip
                    className="text-muted-foreground rounded-sm font-medium"
                    content="Current quantity in stock"
                    showArrow={true}
                >
                    <span className="flex items-center gap-2">
                        Current Stock <CircleHelp className="w-4 h-4" />
                    </span>
                </Tooltip>
            </div>
        ),
        cell: ({ row }) => {
            return <span>{row.original.currentStock}</span>;
        },
    },
    {
        accessorKey: 'minimumStock',
        header: () => (
            <div>
                <Tooltip
                    className="text-muted-foreground rounded-sm font-medium"
                    content="Minimum required stock level"
                    showArrow={true}
                >
                    <span className="flex items-center gap-2">
                        Minimum Stock <CircleHelp className="w-4 h-4" />
                    </span>
                </Tooltip>
            </div>
        ),
        cell: ({ row }) => {
            return <span>{row.original.minimumStock}</span>;
        },
    },
    {
        accessorKey: 'status',
        header: () => (
            <div>
                <Tooltip
                    className="text-muted-foreground rounded-sm font-medium"
                    content="Stock Status"
                    showArrow={true}
                >
                    <span className="flex items-center gap-2">
                        Status <CircleHelp className="w-4 h-4" />
                    </span>
                </Tooltip>
            </div>
        ),
        cell: ({ row }) => {
            const status = row.original.status;
            return (
                <div
                    className={cn(
                        statusStyles[
                            status.toLowerCase() as keyof typeof statusStyles
                        ]?.bg || 'bg-gray-100',
                        'flex items-center justify-center gap-2 w-fit px-3 py-1 rounded-full',
                    )}
                >
                    <div
                        className={cn(
                            statusStyles[
                                status.toLowerCase() as keyof typeof statusStyles
                            ]?.dot || 'bg-gray-500',
                            'w-2 h-2 rounded-full',
                        )}
                    />
                    <span
                        className={cn(
                            statusStyles[
                                status.toLowerCase() as keyof typeof statusStyles
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
