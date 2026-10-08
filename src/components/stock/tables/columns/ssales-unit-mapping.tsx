import {
    deleteMenuItemMapping,
    MenuItemMapping,
} from '@/app/actions/sales-unit-mapping';
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
import { cn, formatCurrency } from '@/lib/utils';
import { ColumnDef } from '@tanstack/react-table';
import { Check, Pencil, Trash2, XIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { BiDotsVertical } from 'react-icons/bi';
import { mutate } from 'swr';

export type SalesUnitMappingProps = MenuItemMapping & {
    menuItemName?: string;
    category?: string;
    inventoryItemsDisplay?: string;
    costPerSalesUnit?: number;
    sellingPrice?: number;
    expectedProfit?: number;
    inventoryItems?: any[];
    quantities?: number[];
    baseUnits?: string[];
    costPrices?: number[];
};

interface SalesUnitMappingActionsProps {
    id: number;
    menuItemId: number;
}

const SalesUnitMappingActions: React.FC<SalesUnitMappingActionsProps> = ({
    id,
    menuItemId,
}) => {
    const router = useRouter();
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [loadingDelete, setLoadingDelete] = useState(false);

    const handleDelete = async () => {
        try {
            setLoadingDelete(true);
            const response = await deleteMenuItemMapping(id);
            if (response) {
                if (
                    response.message ===
                    'Menu item mapping deleted successfully!'
                ) {
                    toast.custom(() => (
                        <Toast
                            title="Success!"
                            description={response.message}
                            type="success"
                        />
                    ));
                    setDeleteOpen(false);
                    mutate('/items/menu-item-mappings');
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
                console.error(err.message);
            } else {
                console.error('An unexpected error occurred');
            }
            toast.custom(() => (
                <Toast
                    title="Error!"
                    description="Failed to delete mapping. Please try again."
                    type="error"
                />
            ));
        } finally {
            setLoadingDelete(false);
        }
    };

    const handleEdit = () => {
        router.push(
            `/stock/sales-unit-mapping/create?mode=edit&menuItemId=${menuItemId}`,
        );
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" aria-label="Actions">
                    <BiDotsVertical />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem
                    className="flex items-center gap-2"
                    onClick={handleEdit}
                >
                    <Pencil className="h-4 w-4" />
                    Edit
                </DropdownMenuItem>
                <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                    <DialogTrigger asChild>
                        <DropdownMenuItem
                            className="text-destructive focus:text-destructive flex items-center gap-2"
                            onSelect={(e) => {
                                e.preventDefault();
                                setDeleteOpen(true);
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
                                permanently delete this mapping from your
                                inventory.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button
                                    variant="outline"
                                    disabled={loadingDelete}
                                >
                                    Cancel
                                </Button>
                            </DialogClose>
                            <Button
                                variant="destructive"
                                onClick={handleDelete}
                                disabled={loadingDelete}
                            >
                                {loadingDelete ? 'Deleting...' : 'Delete'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export const salesUnitMappingFilters = [
    {
        id: 'linkedDepartment',
        label: 'Linked Department',
        options: [
            { value: 'Bar', label: 'Bar' },
            { value: 'Kitchen', label: 'Kitchen' },
            { value: 'Restaurant', label: 'Restaurant' },
            { value: 'Others', label: 'Others' },
        ],
    },
];

export const salesUnitMappingColumns: ColumnDef<SalesUnitMappingProps>[] = [
    {
        id: 'itemNo',
        header: 'Item No',
        cell: ({ row, table }) => {
            const index = table.getRowModel().rows.indexOf(row);
            return <div className="font-medium">{index + 1}</div>;
        },
    },
    {
        accessorKey: 'menuItem.name',
        header: 'Menu Item',
        cell: ({ row }) => {
            const menuItem = row.original.menuItem;
            const autoGenerated = (row.original as { autoGenerated?: boolean })
                .autoGenerated;
            return (
                <div className="flex items-center gap-2">
                    <div className="font-medium">{menuItem?.name || 'N/A'}</div>
                    {autoGenerated && (
                        <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-800">
                            Auto
                        </span>
                    )}
                </div>
            );
        },
    },
    {
        accessorKey: 'menuItem.category.name',
        header: 'Category',
        cell: ({ row }) => {
            const category = row.original.menuItem?.category?.name;
            return <div>{category || 'N/A'}</div>;
        },
    },
    {
        accessorKey: 'inventoryItemsDisplay',
        header: 'Inventory Items & Qty Used per Sale',
        cell: ({ row }) => {
            const mapping = row.original;

            // If grouped (multiple inventory items)
            if (mapping.inventoryItems && mapping.inventoryItems.length > 0) {
                const items = mapping.inventoryItems.map(
                    (item: any, idx: number) => {
                        const qty = mapping.quantities?.[idx] || 0;
                        const unit = mapping.baseUnits?.[idx] || 'unit';
                        return `${item?.name || 'N/A'} – ${qty} ${unit}`;
                    },
                );
                return (
                    <div className="text-sm space-y-1">
                        {items.map((item: string, idx: number) => (
                            <div key={`${mapping.menuItem?.id}-${idx}-${item}`}>
                                {item}
                            </div>
                        ))}
                    </div>
                );
            }

            // Single inventory item (backward compatibility)
            const inventoryItem = mapping.inventoryItem;
            const qtyPerSale = mapping.quantityPerSale;
            const baseUnit =
                inventoryItem?.baseUnit ||
                inventoryItem?.unitOfMeasurement ||
                'unit';
            return (
                <div className="text-sm">
                    {inventoryItem?.name || 'N/A'} – {qtyPerSale} {baseUnit}
                </div>
            );
        },
    },
    {
        accessorKey: 'inventoryItem.baseUnit',
        header: 'Inventory UoM (Base)',
        cell: ({ row }) => {
            const mapping = row.original;

            // If grouped, show all units
            if (mapping.baseUnits && mapping.baseUnits.length > 0) {
                const uniqueUnits = [...new Set(mapping.baseUnits)];
                return <div>{uniqueUnits.join(' / ')}</div>;
            }

            const baseUnit =
                mapping.inventoryItem?.baseUnit ||
                mapping.inventoryItem?.unitOfMeasurement;
            return <div>{baseUnit || 'N/A'}</div>;
        },
    },
    {
        accessorKey: 'salesUoM',
        header: 'Sales UoM',
        cell: ({ row }) => {
            return <div>{row.original.salesUoM || 'N/A'}</div>;
        },
    },
    {
        accessorKey: 'conversionFactor',
        header: 'Conversion Factor',
        cell: ({ row }) => {
            const factor = row.original.conversionFactor;
            return <div>{factor ? factor.toString() : 'Recipe-based'}</div>;
        },
    },
    {
        accessorKey: 'inventoryItem.costPrice',
        header: 'Cost per Inventory (₦)',
        cell: ({ row }) => {
            const mapping = row.original;

            // If grouped (recipe-based), show breakdown or total
            if (mapping.inventoryItems && mapping.inventoryItems.length > 1) {
                const totalCost =
                    mapping.costPrices?.reduce(
                        (sum: number, cost: number) => sum + cost,
                        0,
                    ) || 0;
                const breakdown = mapping.inventoryItems.map(
                    (item: any, idx: number) => {
                        const cost = mapping.costPrices?.[idx] || 0;
                        return `${item?.name || 'N/A'}: ${formatCurrency(cost)}`;
                    },
                );
                return (
                    <div className="text-sm">
                        <div className="font-medium">
                            {formatCurrency(totalCost)}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                            {breakdown.join(', ')}
                        </div>
                    </div>
                );
            }

            // Single item
            const cost = mapping.inventoryItem?.costPrice;
            return (
                <div className="font-medium">
                    {cost ? formatCurrency(cost) : 'N/A'}
                </div>
            );
        },
    },
    {
        accessorKey: 'costPerSalesUnit',
        header: 'Cost per Sales Unit (₦)',
        cell: ({ row }) => {
            const mapping = row.original;
            const conversionFactor = mapping.conversionFactor;

            let calculatedCost = 0;

            // If grouped (multiple inventory items)
            if (mapping.inventoryItems && mapping.inventoryItems.length > 0) {
                if (conversionFactor && conversionFactor > 0) {
                    // Measurable: Use first item cost ÷ conversion factor
                    const firstItemCost = mapping.costPrices?.[0] || 0;
                    calculatedCost = firstItemCost / conversionFactor;
                } else {
                    // Recipe-based: Sum all (Qty × Unit Cost)
                    calculatedCost = mapping.inventoryItems.reduce(
                        (sum: number, item: any, idx: number) => {
                            const cost = mapping.costPrices?.[idx] || 0;
                            const qty = mapping.quantities?.[idx] || 0;
                            return sum + cost * qty;
                        },
                        0,
                    );
                }
            } else {
                // Single item (backward compatibility)
                const inventoryCost = mapping.inventoryItem?.costPrice || 0;
                const qtyPerSale = mapping.quantityPerSale || 0;

                if (conversionFactor && conversionFactor > 0) {
                    calculatedCost = inventoryCost / conversionFactor;
                } else {
                    calculatedCost = inventoryCost * qtyPerSale;
                }
            }

            return (
                <div className="font-medium">
                    {calculatedCost > 0
                        ? formatCurrency(calculatedCost)
                        : mapping.costPerSalesUnit
                          ? formatCurrency(mapping.costPerSalesUnit)
                          : 'N/A'}
                </div>
            );
        },
    },
    {
        accessorKey: 'menuItem.price',
        header: 'Selling Price (₦)',
        cell: ({ row }) => {
            const price = row.original.menuItem?.price;
            return (
                <div className="font-medium">
                    {price ? formatCurrency(price) : 'N/A'}
                </div>
            );
        },
    },
    {
        accessorKey: 'expectedSalesValue',
        header: 'Expected Sales Value (₦)',
        cell: ({ row }) => {
            const mapping = row.original;
            const sellingPrice = mapping.menuItem?.price || 0;
            const conversionFactor = mapping.conversionFactor || 0;
            const quantityInStock = mapping.inventoryItem?.quantity || 0;

            // Formula: Selling Price × Conversion Factor × Quantity in Stock
            let expectedSalesValue = 0;
            if (conversionFactor > 0 && quantityInStock > 0) {
                expectedSalesValue =
                    sellingPrice * conversionFactor * quantityInStock;
            } else if (sellingPrice > 0 && quantityInStock > 0) {
                // For recipe-based, use selling price × quantity (assuming 1:1 if no conversion)
                expectedSalesValue = sellingPrice * quantityInStock;
            }

            return (
                <div className="font-medium">
                    {expectedSalesValue > 0
                        ? formatCurrency(expectedSalesValue)
                        : 'N/A'}
                </div>
            );
        },
    },
    {
        accessorKey: 'expectedProfit',
        header: 'Expected Profit (₦)',
        cell: ({ row }) => {
            const mapping = row.original;
            const sellingPrice = mapping.menuItem?.price || 0;
            const conversionFactor = mapping.conversionFactor;

            let costPerSalesUnit = 0;

            // Calculate cost per sales unit
            if (mapping.inventoryItems && mapping.inventoryItems.length > 0) {
                if (conversionFactor && conversionFactor > 0) {
                    const firstItemCost = mapping.costPrices?.[0] || 0;
                    costPerSalesUnit = firstItemCost / conversionFactor;
                } else {
                    costPerSalesUnit = mapping.inventoryItems.reduce(
                        (sum: number, item: any, idx: number) => {
                            const cost = mapping.costPrices?.[idx] || 0;
                            const qty = mapping.quantities?.[idx] || 0;
                            return sum + cost * qty;
                        },
                        0,
                    );
                }
            } else {
                const inventoryCost = mapping.inventoryItem?.costPrice || 0;
                const qtyPerSale = mapping.quantityPerSale || 0;

                if (conversionFactor && conversionFactor > 0) {
                    costPerSalesUnit = inventoryCost / conversionFactor;
                } else {
                    costPerSalesUnit = inventoryCost * qtyPerSale;
                }
            }

            const profit = sellingPrice - costPerSalesUnit;
            return (
                <div className="font-medium">
                    {profit > 0 ? formatCurrency(profit) : 'N/A'}
                </div>
            );
        },
    },
    {
        accessorKey: 'projectedProfit',
        header: 'Projected Profit (₦)',
        cell: ({ row }) => {
            const mapping = row.original;
            const sellingPrice = mapping.menuItem?.price || 0;
            const conversionFactor = mapping.conversionFactor || 0;
            const quantityInStock = mapping.inventoryItem?.quantity || 0;

            // Calculate expected sales value
            let expectedSalesValue = 0;
            if (conversionFactor > 0 && quantityInStock > 0) {
                expectedSalesValue =
                    sellingPrice * conversionFactor * quantityInStock;
            } else if (sellingPrice > 0 && quantityInStock > 0) {
                expectedSalesValue = sellingPrice * quantityInStock;
            }

            // Calculate total inventory cost
            let totalInventoryCost = 0;
            if (mapping.inventoryItems && mapping.inventoryItems.length > 0) {
                // For recipe-based, sum all costs
                totalInventoryCost =
                    (mapping.costPrices?.reduce(
                        (sum: number, cost: number) => sum + cost,
                        0,
                    ) || 0) * quantityInStock;
            } else {
                const inventoryCost = mapping.inventoryItem?.costPrice || 0;
                totalInventoryCost = inventoryCost * quantityInStock;
            }

            // Formula: Expected Sales Value - (Cost per Inventory Unit × Quantity in Stock)
            const projectedProfit = expectedSalesValue - totalInventoryCost;

            return (
                <div className="font-medium">
                    {projectedProfit > 0
                        ? formatCurrency(projectedProfit)
                        : 'N/A'}
                </div>
            );
        },
    },
    {
        accessorKey: 'stockDate',
        header: 'Stock Date',
        cell: ({ row }) => {
            const mapping = row.original;
            const stockDate = mapping.inventoryItem?.stockDate;
            if (!stockDate) return <div>N/A</div>;

            const date = new Date(stockDate);
            return (
                <div>
                    {date.toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                    })}
                </div>
            );
        },
    },
    {
        accessorKey: 'expiryDate',
        header: 'Expiry Date',
        cell: ({ row }) => {
            const mapping = row.original;
            const expiryDate = mapping.inventoryItem?.expiryDate;
            if (!expiryDate) return <div>N/A</div>;

            const date = new Date(expiryDate);
            const today = new Date();
            const daysUntilExpiry = Math.ceil(
                (date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
            );

            let className = '';
            if (daysUntilExpiry < 0) {
                className = 'text-red-600 font-semibold'; // Expired
            } else if (daysUntilExpiry <= 3) {
                className = 'text-orange-600 font-semibold'; // Close to expiry
            } else if (
                mapping.inventoryItem?.quantity !== undefined &&
                mapping.inventoryItem.quantity <=
                    (mapping.inventoryItem?.minStock || 0)
            ) {
                className = 'text-yellow-600'; // Low stock
            }

            return (
                <div className={className}>
                    {date.toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                    })}
                </div>
            );
        },
    },
    {
        accessorKey: 'linkedDepartment',
        header: 'Linked Dept',
        cell: ({ row }) => {
            return <div>{row.original.linkedDepartment || 'N/A'}</div>;
        },
    },
    {
        accessorKey: 'autoDeduct',
        header: 'Auto Deduct',
        cell: ({ row }) => {
            return (
                <div
                    className={cn(
                        'p-1 w-[24px] h-[24px] flex items-center justify-center rounded-lg',
                        row.original.autoDeduct
                            ? 'bg-[#007BFF]'
                            : 'bg-gray-200',
                    )}
                >
                    <span className="sr-only">
                        {row.original.autoDeduct
                            ? 'Auto-deduct enabled'
                            : 'Auto-deduct disabled'}
                    </span>
                    {row.original.autoDeduct ? (
                        <Check
                            className="w-6 h-6 text-white"
                            aria-hidden="true"
                        />
                    ) : (
                        <XIcon
                            className="w-6 h-6 text-white"
                            aria-hidden="true"
                        />
                    )}
                </div>
            );
        },
    },
    {
        accessorKey: 'notes',
        header: 'Notes',
        cell: ({ row }) => {
            return (
                <div className="text-sm text-muted-foreground max-w-xs truncate">
                    {row.original.notes || 'N/A'}
                </div>
            );
        },
    },
    {
        accessorKey: 'actions',
        header: '',
        cell: ({ row }) => {
            const id = row.original?.id;
            const menuItemId = row.original?.menuItem?.id;
            if (!id || !menuItemId) return null;

            return <SalesUnitMappingActions id={id} menuItemId={menuItemId} />;
        },
    },
];
