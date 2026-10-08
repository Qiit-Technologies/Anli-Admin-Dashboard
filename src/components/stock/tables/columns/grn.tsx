import { deleteItem, updateItem } from '@/app/actions/items';
import { CustomSheet } from '@/components/common/CustomSheet';
import GrnForm from '@/components/common/Form/GrnForm';
import Toast from '@/components/toast';
import { cn, formatCurrency } from '@/lib/utils';
import { Tooltip } from '@heroui/react';
import { ColumnDef } from '@tanstack/react-table';
import { CircleHelp } from 'lucide-react';
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { mutate } from 'swr';
import { stockItemProps } from './items';

type GrnTrimmedProps = {
    id: string;
    itemName: string;
    currentStock: string;
    minimumStock: string;
    status: 'Low Stock' | 'Out of Stock' | 'In Stock';
};

type GrnProps = {
    id: string;
    itemName: string;
    quantity: number;
    unitOfMeasurement: string;
    currentStock: string;
    unitPrice: number;
    total: number;
};

export const grnTrimmedList: GrnTrimmedProps[] = [
    {
        id: '1',
        itemName: 'Hand Towels',
        currentStock: '20',
        minimumStock: '50',
        status: 'Low Stock',
    },
];

export const grnTrimmedFilters = [
    {
        id: 'status',
        label: 'Stock Status',
        options: [
            { value: 'Low Stock', label: 'Low Stock' },
            { value: 'Out of Stock', label: 'Out of Stock' },
            { value: 'In Stock', label: 'In Stock' },
        ],
    },
];

const statusStyles = {
    'Low Stock': {
        bg: 'bg-orange-100',
        dot: 'bg-orange-500',
        text: 'text-orange-600',
    },
    'Out of Stock': {
        bg: 'bg-red-100',
        dot: 'bg-red-500',
        text: 'text-red-600',
    },
    'In Stock': {
        bg: 'bg-green-100',
        dot: 'bg-green-500',
        text: 'text-green-600',
    },
};

export const grnList: GrnProps[] = [
    {
        id: '1',
        itemName: 'Hand Towels',
        quantity: 50,
        unitOfMeasurement: 'Pieces',
        currentStock: '20',
        unitPrice: 10.0,
        total: 500.0,
    },
];

export const grnFilters = [
    {
        id: 'unitOfMeasurement',
        label: 'Unit of Measurement',
        options: [
            { value: 'Pieces', label: 'Pieces' },
            { value: 'Rolls', label: 'Rolls' },
            { value: 'Sets', label: 'Sets' },
        ],
    },
];

interface CellActionsProps {
    row: {
        original: {
            id: string;
            itemName: string;
            unitOfMeasurement: string;
            quantity: number;
            unitPrice: number;
            total: number;
        };
    };
}

export const CellActions: React.FC<CellActionsProps> = ({ row }) => {
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const { itemName, unitOfMeasurement, quantity, unitPrice, total } =
        row.original;
    const handleEdit = async (data: stockItemProps) => {
        try {
            const response = await updateItem(data as any, Number(row.original.id));
            if (response) {
                if (response.message === 'Item updated successfully!') {
                    setIsSheetOpen(false);
                    toast.custom(() => (
                        <Toast
                            title="Success!"
                            description={response.message}
                            type="success"
                        />
                    ));
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
    return (
        <div className="flex items-center gap-2">
            <button onClick={() => handleDelete()} className="text-danger">
                Delete
            </button>
            <CustomSheet
                title="Edit Item"
                open={isSheetOpen}
                setOpen={setIsSheetOpen}
                trigger={
                    <button
                        className="text-orion-blue"
                        onClick={() => setIsSheetOpen(true)}
                    >
                        Edit
                    </button>
                }
            >
                <GrnForm
                    defaultValues={{
                        itemName,
                        unitOfMeasurement,
                        quantity: Number(quantity),
                        unitPrice: unitPrice,
                        total: total,
                    }}
                    onSubmit={handleEdit}
                />
            </CustomSheet>
        </div>
    );
};

export const grnTrimmedColumns: ColumnDef<GrnTrimmedProps>[] = [
    {
        accessorKey: 'itemName',
        header: () => (
            <div>
                <Tooltip
                    className="text-muted-foreground rounded-sm font-medium"
                    content="Item Name - The name of the inventory item"
                    showArrow={true}
                >
                    <span className="flex items-center gap-2">
                        Item Name <CircleHelp className="w-4 h-4" />
                    </span>
                </Tooltip>
            </div>
        ),
    },
    {
        accessorKey: 'currentStock',
        header: () => (
            <div>
                <Tooltip
                    className="text-muted-foreground rounded-sm font-medium"
                    content="Current Stock - Current quantity available in inventory"
                    showArrow={true}
                >
                    <span className="flex items-center gap-2">
                        Current Stock <CircleHelp className="w-4 h-4" />
                    </span>
                </Tooltip>
            </div>
        ),
    },
    {
        accessorKey: 'minimumStock',
        header: () => (
            <div>
                <Tooltip
                    className="text-muted-foreground rounded-sm font-medium"
                    content="Minimum Required - Minimum stock level threshold"
                    showArrow={true}
                >
                    <span className="flex items-center gap-2">
                        Minimum Required <CircleHelp className="w-4 h-4" />
                    </span>
                </Tooltip>
            </div>
        ),
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
                    <button className="flex items-center gap-2">
                        Status <CircleHelp className="w-4 h-4" />
                    </button>
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

export const grnColumns: ColumnDef<GrnProps>[] = [
    {
        accessorKey: 'itemName',
        header: () => (
            <div>
                <Tooltip
                    className="text-muted-foreground rounded-sm font-medium"
                    content="Item Name - The name of the item being received"
                    showArrow={true}
                >
                    <span className="flex items-center gap-2">
                        Item Name <CircleHelp className="w-4 h-4" />
                    </span>
                </Tooltip>
            </div>
        ),
    },
    {
        accessorKey: 'quantity',
        header: () => (
            <div>
                <Tooltip
                    className="text-muted-foreground rounded-sm font-medium"
                    content="Quantity - The number of items being received"
                    showArrow={true}
                >
                    <span className="flex items-center gap-2">
                        Quantity <CircleHelp className="w-4 h-4" />
                    </span>
                </Tooltip>
            </div>
        ),
    },
    {
        accessorKey: 'unitOfMeasurement',
        header: () => (
            <div>
                <Tooltip
                    className="text-muted-foreground rounded-sm font-medium"
                    content="UOM - Unit of Measurement for the item"
                    showArrow={true}
                >
                    <span className="flex items-center gap-2">
                        U.O.M <CircleHelp className="w-4 h-4" />
                    </span>
                </Tooltip>
            </div>
        ),
    },
    {
        accessorKey: 'currentStock',
        header: () => (
            <div>
                <Tooltip
                    className="text-muted-foreground rounded-sm font-medium"
                    content="Current Stock - Available quantity in inventory"
                    showArrow={true}
                >
                    <span className="flex items-center gap-2">
                        Current Stock <CircleHelp className="w-4 h-4" />
                    </span>
                </Tooltip>
            </div>
        ),
    },
    {
        accessorKey: 'unitPrice',
        header: () => (
            <div>
                <Tooltip
                    className="text-muted-foreground rounded-sm font-medium"
                    content="Unit Cost - Cost per individual item"
                    showArrow={true}
                >
                    <span className="flex items-center gap-2">
                        Unit Price <CircleHelp className="w-4 h-4" />
                    </span>
                </Tooltip>
            </div>
        ),
        cell: ({ row }) => {
            return <span>{formatCurrency(row.original.unitPrice)}</span>;
        },
    },
    {
        accessorKey: 'total',
        header: () => (
            <div>
                <Tooltip
                    className="text-muted-foreground rounded-sm font-medium"
                    content="Total Cost - Total cost for all items (Quantity × Unit Cost)"
                    showArrow={true}
                >
                    <span className="flex items-center gap-2">
                        Total Cost <CircleHelp className="w-4 h-4" />
                    </span>
                </Tooltip>
            </div>
        ),
        cell: ({ row }) => {
            return <span> {formatCurrency(row.original.total)}</span>;
        },
    },
    {
        id: 'actions',
        header: () => (
            <div>
                <Tooltip
                    className="text-muted-foreground rounded-sm font-medium"
                    content="Actions - Options to modify or remove the item"
                    showArrow={true}
                >
                    <span className="flex items-center gap-2">
                        Actions <CircleHelp className="w-4 h-4" />
                    </span>
                </Tooltip>
            </div>
        ),
        cell: ({ row }) => <CellActions row={row} />,
    },
];
