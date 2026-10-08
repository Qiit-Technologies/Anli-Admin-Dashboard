import { cn } from '@/lib/utils';
import { Tooltip } from '@heroui/react';
import { ColumnDef } from '@tanstack/react-table';
import ItemStatusUpdateAction from '../../../front-of-house/ItemStatusUpdateAction';
import ItemOrderTableAction, {
    ItemOrderTableActionForUpdate,
} from '../ItemOrderTableAction';

interface Item {
    id: number | string;
    name: string;
    quantity: number;
    price: number;
    status?: string;
}

export const ItemOrderFilters = [
    {
        id: 'quantity',
        label: 'Quantity',
        options: [
            { value: '1', label: '1' },
            { value: '2', label: '2' },
            { value: '3+', label: '3+' },
        ],
    },
    {
        id: 'price',
        label: 'Price Range',
        options: [
            { value: 'low', label: 'Under 1000' },
            { value: 'medium', label: '1000-2000' },
            { value: 'high', label: 'Over 2000' },
        ],
    },
];
export const ItemOrderColumnsNoAction: ColumnDef<Item>[] = [
    {
        accessorKey: 'id',
        header: () => (
            <div>
                <Tooltip
                    className="text-muted-foreground rounded-sm font-medium"
                    content="Unique identifier for the item"
                    showArrow={true}
                >
                    <span className="flex items-center gap-2">ID</span>
                </Tooltip>
            </div>
        ),
        cell: ({ row }) => <span>#{row.original.id}</span>,
    },
    {
        accessorKey: 'name',
        header: () => (
            <div>
                <Tooltip
                    className="text-muted-foreground rounded-sm font-medium"
                    content="Name of the item"
                    showArrow={true}
                >
                    <span className="flex items-center gap-2">Item Name</span>
                </Tooltip>
            </div>
        ),
        cell: ({ row }) => (
            <span className="font-medium">{row.original.name}</span>
        ),
    },
    {
        accessorKey: 'quantity',
        header: () => (
            <div>
                <Tooltip
                    className="text-muted-foreground rounded-sm font-medium"
                    content="Quantity ordered"
                    showArrow={true}
                >
                    <span className="flex items-center gap-2">Quantity</span>
                </Tooltip>
            </div>
        ),
        cell: ({ row }) => {
            const quantity = row.original.quantity;
            return (
                <div className="flex items-center">
                    <span
                        className={cn(
                            quantity > 2 ? 'text-blue-600' : 'text-gray-600',
                            'font-medium',
                        )}
                    >
                        {quantity}
                    </span>
                </div>
            );
        },
    },
    {
        accessorKey: 'price',
        header: () => (
            <div>
                <Tooltip
                    className="text-muted-foreground rounded-sm font-medium"
                    content="Price per item"
                    showArrow={true}
                >
                    <span className="flex items-center gap-2">Price</span>
                </Tooltip>
            </div>
        ),
        cell: ({ row }) => <span>{row.original.price}</span>,
    },
    {
        id: 'actions',
        header: '',
        cell: ({ row }) => {
            return <ItemStatusUpdateAction item={row.original} />;
        },
    },
];

export const ItemOrderWithUpdateAction: ColumnDef<Item>[] = [
    {
        accessorKey: 'id',
        header: () => (
            <div>
                <Tooltip
                    className="text-muted-foreground rounded-sm font-medium"
                    content="Unique identifier for the item"
                    showArrow={true}
                >
                    <span className="flex items-center gap-2">ID</span>
                </Tooltip>
            </div>
        ),
        cell: ({ row }) => <span>#{row.original.id}</span>,
    },
    {
        accessorKey: 'name',
        header: () => (
            <div>
                <Tooltip
                    className="text-muted-foreground rounded-sm font-medium"
                    content="Name of the item"
                    showArrow={true}
                >
                    <span className="flex items-center gap-2">Item Name</span>
                </Tooltip>
            </div>
        ),
        cell: ({ row }) => (
            <span className="font-medium">{row.original.name}</span>
        ),
    },
    {
        accessorKey: 'quantity',
        header: () => (
            <div>
                <Tooltip
                    className="text-muted-foreground rounded-sm font-medium"
                    content="Quantity ordered"
                    showArrow={true}
                >
                    <span className="flex items-center gap-2">Quantity</span>
                </Tooltip>
            </div>
        ),
        cell: ({ row }) => {
            const quantity = row.original.quantity;
            return (
                <div className="flex items-center">
                    <span
                        className={cn(
                            quantity > 2 ? 'text-blue-600' : 'text-gray-600',
                            'font-medium',
                        )}
                    >
                        {quantity}
                    </span>
                </div>
            );
        },
    },
    {
        accessorKey: 'price',
        header: () => (
            <div>
                <Tooltip
                    className="text-muted-foreground rounded-sm font-medium"
                    content="Price per item"
                    showArrow={true}
                >
                    <span className="flex items-center gap-2">Price</span>
                </Tooltip>
            </div>
        ),
        cell: ({ row }) => <span>{row.original.price}</span>,
    },
    {
        id: 'actions',
        header: '',
        cell: ({ row }) => {
            return <ItemStatusUpdateAction item={row.original} />;
        },
    },
];

export const ItemOrderColumns: ColumnDef<Item>[] = [
    {
        accessorKey: 'id',
        header: () => (
            <div>
                <Tooltip
                    className="text-muted-foreground rounded-sm font-medium"
                    content="Unique identifier for the item"
                    showArrow={true}
                >
                    <span className="flex items-center gap-2">ID</span>
                </Tooltip>
            </div>
        ),
        cell: ({ row }) => <span>#{row.original.id}</span>,
    },
    {
        accessorKey: 'name',
        header: () => (
            <div>
                <Tooltip
                    className="text-muted-foreground rounded-sm font-medium"
                    content="Name of the item"
                    showArrow={true}
                >
                    <span className="flex items-center gap-2">Item Name</span>
                </Tooltip>
            </div>
        ),
        cell: ({ row }) => (
            <span className="font-medium">{row.original.name}</span>
        ),
    },
    {
        accessorKey: 'quantity',
        header: () => (
            <div>
                <Tooltip
                    className="text-muted-foreground rounded-sm font-medium"
                    content="Quantity ordered"
                    showArrow={true}
                >
                    <span className="flex items-center gap-2">Quantity</span>
                </Tooltip>
            </div>
        ),
        cell: ({ row }) => {
            const quantity = row.original.quantity;
            return (
                <div className="flex items-center">
                    <span
                        className={cn(
                            quantity > 2 ? 'text-blue-600' : 'text-gray-600',
                            'font-medium',
                        )}
                    >
                        {quantity}
                    </span>
                </div>
            );
        },
    },
    {
        accessorKey: 'price',
        header: () => (
            <div>
                <Tooltip
                    className="text-muted-foreground rounded-sm font-medium"
                    content="Price per item"
                    showArrow={true}
                >
                    <span className="flex items-center gap-2">Price</span>
                </Tooltip>
            </div>
        ),
        cell: ({ row }) => <span>{row.original.price}</span>,
    },
    {
        id: 'actions',
        header: '',
        cell: ({ row }) => {
            return <ItemOrderTableAction item={row.original} />;
        },
    },
];

export const ItemOrderColumnsFunc = (
    originalItemIds: Set<number>,
    originalItemQuantities?: Map<number, number>,
    canRemoveItems?: boolean,
): ColumnDef<Item>[] => [
    {
        accessorKey: 'id',
        header: () => (
            <div>
                <Tooltip
                    className="text-muted-foreground rounded-sm font-medium"
                    content="Unique identifier for the item"
                    showArrow={true}
                >
                    <span className="flex items-center gap-2">ID</span>
                </Tooltip>
            </div>
        ),
        cell: ({ row }) => <span>#{row.original.id}</span>,
    },
    {
        accessorKey: 'name',
        header: () => (
            <div>
                <Tooltip
                    className="text-muted-foreground rounded-sm font-medium"
                    content="Name of the item"
                    showArrow={true}
                >
                    <span className="flex items-center gap-2">Item Name</span>
                </Tooltip>
            </div>
        ),
        cell: ({ row }) => (
            <span className="font-medium">{row.original.name}</span>
        ),
    },
    {
        accessorKey: 'quantity',
        header: () => (
            <div>
                <Tooltip
                    className="text-muted-foreground rounded-sm font-medium"
                    content="Quantity ordered"
                    showArrow={true}
                >
                    <span className="flex items-center gap-2">Quantity</span>
                </Tooltip>
            </div>
        ),
        cell: ({ row }) => {
            const quantity = row.original.quantity;
            return (
                <div className="flex items-center">
                    <span
                        className={cn(
                            quantity > 2 ? 'text-blue-600' : 'text-gray-600',
                            'font-medium',
                        )}
                    >
                        {quantity}
                    </span>
                </div>
            );
        },
    },
    {
        accessorKey: 'price',
        header: () => (
            <div>
                <Tooltip
                    className="text-muted-foreground rounded-sm font-medium"
                    content="Price per item"
                    showArrow={true}
                >
                    <span className="flex items-center gap-2">Price</span>
                </Tooltip>
            </div>
        ),
        cell: ({ row }) => <span>{row.original.price}</span>,
    },
    {
        id: 'actions',
        header: '',
        cell: ({ row }) => {
            return (
                <ItemOrderTableActionForUpdate
                    item={row.original}
                    originalItemIds={originalItemIds}
                    originalItemQuantities={originalItemQuantities}
                    canRemoveItems={canRemoveItems}
                />
            );
        },
    },
];
