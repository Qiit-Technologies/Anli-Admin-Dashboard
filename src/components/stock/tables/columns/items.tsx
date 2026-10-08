import { deleteItem } from '@/app/actions/items';
import Toast from '@/components/toast';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatCurrency } from '@/lib/utils';
import { ColumnDef } from '@tanstack/react-table';
import { BiDotsVertical } from 'react-icons/bi';
import { Pencil, Trash2 } from 'lucide-react';
import Link from 'next/link';
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { mutate } from 'swr';

export type stockItemProps = {
    id?: number | string;
    itemNumber?: string;
    itemName: string;
    itemLocation?: string;
    category?: string;
    outerUnitOfMeasure?: string | null;
    qtyInStockOuter?: number;
    conversionRate?: number;
    baseUnit?: string;
    qtyInStockBase?: number;
    costPerOuter?: number;
    costPerBase?: number;
    inventoryValue?: number;
    minStock?: number;
    reorderQuantity?: number;
    stockDate?: string | Date | null;
    expiryDate?: string | Date | null;
    vendor?: string;
    vendorContactInfo?: string;
    status?: string;
    quantity?: number;
    unitOfMeasurement?: string;
    unitPrice?: number;
    currentStock?: number;
    total?: number;
};

export const stockItemsFilters = [
    {
        id: 'category',
        label: 'All Categories',
        options: [
            { value: 'all', label: 'All Categories' },
            { value: 'beverages', label: 'Beverages' },
            { value: 'vegetables', label: 'Vegetables' },
            { value: 'meat', label: 'Meat' },
            { value: 'drinks', label: 'Drinks' },
            { value: 'fruits', label: 'Fruits' },
            { value: 'dairy', label: 'Dairy' },
            { value: 'seafood', label: 'Seafood' },
            { value: 'grains', label: 'Grains' },
            { value: 'poultry', label: 'Poultry' },
            { value: 'perishables', label: 'Perishables' },
        ],
    },
    {
        id: 'itemLocation',
        label: 'All Location',
        options: [
            { value: 'all', label: 'All Location' },
            { value: 'bar-store', label: 'Bar Store' },
            { value: 'freezer-1', label: 'Freezer 1' },
            { value: 'dry-store', label: 'Dry Store' },
            { value: 'cold-room', label: 'Cold Room' },
            { value: 'freezer-2', label: 'Freezer 2' },
        ],
    },
    {
        id: 'status',
        label: 'All Status',
        options: [
            { value: 'all', label: 'All Status' },
            { value: 'Available', label: 'Available' },
            { value: 'Low', label: 'Low Stock' },
            { value: 'OutOfStock', label: 'Out of Stock' },
            { value: 'Expired', label: 'Expired' },
        ],
    },
];

function displayValue(value: string | number | null | undefined): string {
    if (value === null || value === undefined || value === '') {
        return '—';
    }
    return String(value);
}

function formatItemNumber(itemNumber?: string): string {
    if (!itemNumber) return '—';
    const parsed = parseInt(itemNumber, 10);
    if (!Number.isNaN(parsed)) {
        return String(parsed).padStart(3, '0');
    }
    return itemNumber;
}

function formatStockDate(value?: string | Date | null): string {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '—';
    return date.toISOString().split('T')[0];
}

function formatLocation(location?: string): string {
    if (!location) return '—';
    return location.replace(/-/g, ' ');
}

const textCell = (value: string | number | null | undefined) => (
    <span className="text-muted-foreground whitespace-nowrap normal-case">
        {displayValue(value)}
    </span>
);

/** Multi-line header for dense inventory columns (ANLI-INV-002). */
const columnHeader = (line1: string, line2?: string) => (
    <span className="block whitespace-normal leading-tight">
        {line1}
        {line2 ? (
            <>
                <br />
                {line2}
            </>
        ) : null}
    </span>
);

interface CellActionsProps {
    row: {
        original: stockItemProps;
    };
}

export const CellActions: React.FC<CellActionsProps> = ({ row }) => {
    const [deleteOpen, setDeleteItemOpen] = useState(false);

    const handleDelete = async () => {
        try {
            const response = await deleteItem(Number(row.original.id));
            if (response) {
                if (response.message === 'Item deleted successfully!') {
                    toast.custom(() => (
                        <Toast
                            title="Success!"
                            description={response.message}
                            type="success"
                        />
                    ));
                    setDeleteItemOpen(false);
                    mutate('/items');
                } else {
                    toast.custom(() => (
                        <Toast
                            title="Error!"
                            description={response.message}
                            type="error"
                        />
                    ));
                }
            }
        } catch (err: unknown) {
            if (err instanceof Error) {
                console.log(err.message);
            } else {
                console.log('An unexpected error occurred');
            }
        }
    };

    if (!row.original.id) return null;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    aria-label="Item actions"
                >
                    <BiDotsVertical className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem asChild>
                    <Link
                        href={`/stock/items/${row.original.id}/edit`}
                        className="flex items-center gap-2 cursor-pointer"
                    >
                        <Pencil className="h-4 w-4" />
                        Edit
                    </Link>
                </DropdownMenuItem>
                <Dialog open={deleteOpen} onOpenChange={setDeleteItemOpen}>
                    <DialogTrigger asChild>
                        <DropdownMenuItem
                            className="text-destructive focus:text-destructive flex items-center gap-2"
                            onSelect={(e) => {
                                e.preventDefault();
                                setDeleteItemOpen(true);
                            }}
                        >
                            <Trash2 className="h-4 w-4" />
                            Delete
                        </DropdownMenuItem>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Are you sure?</DialogTitle>
                            <DialogDescription>
                                This action cannot be undone. This will
                                permanently delete this item.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button variant="outline">Cancel</Button>
                            </DialogClose>
                            <Button
                                variant="destructive"
                                onClick={handleDelete}
                            >
                                Delete
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export const stockItemsColumn: ColumnDef<stockItemProps>[] = [
    {
        accessorKey: 'itemLocation',
        header: () => columnHeader('Item', 'Location'),
        cell: ({ row }) => textCell(formatLocation(row.original.itemLocation)),
    },
    {
        accessorKey: 'itemNumber',
        header: () => columnHeader('Item No'),
        cell: ({ row }) => (
            <span className="text-muted-foreground whitespace-nowrap normal-case">
                {formatItemNumber(row.original.itemNumber)}
            </span>
        ),
    },
    {
        accessorKey: 'itemName',
        header: () => columnHeader('Item Name'),
        cell: ({ row }) => textCell(row.original.itemName),
    },
    {
        accessorKey: 'category',
        header: () => columnHeader('Category'),
        cell: ({ row }) => textCell(row.original.category),
    },
    {
        accessorKey: 'outerUnitOfMeasure',
        header: () => columnHeader('Outer Unit', 'of Measure'),
        cell: ({ row }) => textCell(row.original.outerUnitOfMeasure),
    },
    {
        accessorKey: 'qtyInStockOuter',
        header: () => columnHeader('Qty in Stock', '(Outer)'),
        cell: ({ row }) => textCell(row.original.qtyInStockOuter),
    },
    {
        accessorKey: 'conversionRate',
        header: () => columnHeader('Conversion', 'Rate'),
        cell: ({ row }) => textCell(row.original.conversionRate),
    },
    {
        accessorKey: 'baseUnit',
        header: () => columnHeader('Base Unit'),
        cell: ({ row }) =>
            textCell(row.original.baseUnit ?? row.original.unitOfMeasurement),
    },
    {
        accessorKey: 'qtyInStockBase',
        header: () => columnHeader('Qty in Stock', '(Base)'),
        cell: ({ row }) =>
            textCell(
                row.original.qtyInStockBase ?? row.original.quantity,
            ),
    },
    {
        accessorKey: 'costPerOuter',
        header: () => columnHeader('Cost per', 'Outer (₦)'),
        cell: ({ row }) => (
            <span className="text-muted-foreground whitespace-nowrap normal-case">
                {formatCurrency(row.original.costPerOuter ?? 0)}
            </span>
        ),
    },
    {
        accessorKey: 'costPerBase',
        header: () => columnHeader('Cost per', 'Base (₦)'),
        cell: ({ row }) => (
            <span className="text-muted-foreground whitespace-nowrap normal-case">
                {formatCurrency(
                    row.original.costPerBase ?? row.original.unitPrice ?? 0,
                )}
            </span>
        ),
    },
    {
        accessorKey: 'inventoryValue',
        header: () => columnHeader('Inventory', 'Value (₦)'),
        cell: ({ row }) => (
            <span className="text-muted-foreground whitespace-nowrap normal-case">
                {formatCurrency(
                    row.original.inventoryValue ?? row.original.total ?? 0,
                )}
            </span>
        ),
    },
    {
        accessorKey: 'minStock',
        header: () => columnHeader('Min Stock'),
        cell: ({ row }) => textCell(row.original.minStock),
    },
    {
        accessorKey: 'reorderQuantity',
        header: () => columnHeader('Reorder', 'Qty'),
        cell: ({ row }) => textCell(row.original.reorderQuantity),
    },
    {
        accessorKey: 'stockDate',
        header: () => columnHeader('Stock Date'),
        cell: ({ row }) => (
            <span className="text-muted-foreground whitespace-nowrap normal-case">
                {formatStockDate(row.original.stockDate)}
            </span>
        ),
    },
    {
        accessorKey: 'expiryDate',
        header: () => columnHeader('Expiry Date'),
        cell: ({ row }) => (
            <span className="text-muted-foreground whitespace-nowrap normal-case">
                {formatStockDate(row.original.expiryDate)}
            </span>
        ),
    },
    {
        accessorKey: 'vendor',
        header: () => columnHeader('Vendors', 'Name'),
        cell: ({ row }) => textCell(row.original.vendor),
    },
    {
        accessorKey: 'vendorContactInfo',
        header: () => columnHeader('Vendor', 'Contact'),
        cell: ({ row }) => textCell(row.original.vendorContactInfo),
    },
    {
        accessorKey: 'status',
        header: () => columnHeader('Status'),
        filterFn: (row, id, value) => {
            if (!value || value === 'all') return true;
            return row.getValue(id) === value;
        },
        cell: ({ row }) => textCell(row.original.status),
    },
    {
        id: 'actions',
        header: '',
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => <CellActions row={row} />,
    },
];
