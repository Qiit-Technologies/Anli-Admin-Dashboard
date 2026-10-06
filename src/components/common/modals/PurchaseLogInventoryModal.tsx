'use client';

import type React from 'react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Info, X, Loader2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { fetchItems } from '@/app/actions/items';

export interface PurchaseLogInventoryFormData {
    id?: string;
    itemId?: number;
    itemNumber: string;
    itemName: string;
    category: string;
    location: string;
    outerUnit: string;
    baseUnit: string;
    conversionRate: number;
    costPerOuter: number;
    qtyInStockOuter: number;
}

interface PurchaseLogInventoryModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: PurchaseLogInventoryFormData) => void;
    initialData?: PurchaseLogInventoryFormData | null;
    mode: 'add' | 'edit';
    isLoading?: boolean;
}

export function PurchaseLogInventoryModal({
    open,
    onOpenChange,
    onSubmit,
    initialData,
    mode,
    isLoading = false,
}: PurchaseLogInventoryModalProps) {
    const [formData, setFormData] = useState<PurchaseLogInventoryFormData>({
        itemNumber: '',
        itemName: '',
        category: '',
        location: '',
        outerUnit: '',
        baseUnit: '',
        conversionRate: 1,
        costPerOuter: 0,
        qtyInStockOuter: 0,
    });

    const [availableItems, setAvailableItems] = useState<any[]>([]);
    const [isFetchingItems, setIsFetchingItems] = useState(false);

    useEffect(() => {
        if (open) {
            const loadItems = async () => {
                setIsFetchingItems(true);
                const response = await fetchItems(1, 100);
                if (response.data?.data && Array.isArray(response.data.data)) {
                    setAvailableItems(response.data.data);
                } else if (Array.isArray(response.data)) {
                    setAvailableItems(response.data);
                }
                setIsFetchingItems(false);
            };
            loadItems();
        }
    }, [open]);

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        } else {
            setFormData({
                itemNumber: '',
                itemName: '',
                category: '',
                location: '',
                outerUnit: '',
                baseUnit: '',
                conversionRate: 1,
                costPerOuter: 0,
                qtyInStockOuter: 0,
            });
        }
    }, [initialData, open]);

    const handleItemSelection = (itemId: string) => {
        const item = availableItems.find((i) => i.id === Number(itemId));
        if (item) {
            setFormData((prev) => ({
                ...prev,
                itemId: item.id,
                itemNumber: item.itemNumber || '',
                itemName: item.name || '',
                category: (item.category?.name || item.category || '').toLowerCase(),
                outerUnit: (item.outerUnit || '').toLowerCase(),
                baseUnit: (item.baseUnit || '').toLowerCase(),
                conversionRate: item.portionRate || 1,
                costPerOuter: Number(item.costPriceOuter) || 0,
                location: (item.itemLocation || prev.location || '').toLowerCase(),
            }));
        }
    };

    const handleChange = (
        field: keyof PurchaseLogInventoryFormData,
        value: any,
    ) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    const costPerBase =
        formData.conversionRate > 0
            ? formData.costPerOuter / formData.conversionRate
            : 0;

    const qtyInStockBase = formData.qtyInStockOuter * formData.conversionRate;
    const inventoryValue = formData.qtyInStockOuter * formData.costPerOuter;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden border-none shadow-lg rounded-lg">
                <div className="p-6 bg-white space-y-6">
                    <div className="flex items-center justify-between border-b pb-4">
                        <div className="space-y-1">
                            <DialogTitle className="text-xl font-bold text-foreground">
                                {mode === 'edit'
                                    ? 'Edit Inventory Item'
                                    : 'Add Inventory Item'}
                            </DialogTitle>
                            <DialogDescription className="text-sm text-muted-foreground">
                                {mode === 'edit'
                                    ? 'Update inventory item details'
                                    : 'Add a new item to your inventory'}
                            </DialogDescription>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="max-h-[60vh] overflow-y-auto pr-2 -mr-2 space-y-6 custom-scrollbar">
                            <div className="grid grid-cols-2 gap-4">
                            {/* Item No & Item Name */}
                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-foreground">
                                    Item No <span className="text-red-500">*</span>
                                </Label>
                                <Select
                                    value={formData.itemId?.toString() || ''}
                                    onValueChange={handleItemSelection}
                                    disabled={mode === 'edit' || isFetchingItems}
                                >
                                    <SelectTrigger className="h-11 border-gray-200 bg-gray-50/30 rounded-md">
                                        <SelectValue placeholder={isFetchingItems ? "Loading items..." : "Select Item No"} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableItems.map((item) => (
                                            <SelectItem key={item.id} value={item.id.toString()}>
                                                {item.itemNumber} - {item.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-foreground">
                                    Item Name <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    value={formData.itemName}
                                    onChange={(e) =>
                                        handleChange('itemName', e.target.value)
                                    }
                                    placeholder="Cooking Oil"
                                    className="h-11 border-gray-200 bg-gray-50/30 rounded-md"
                                    required
                                />
                            </div>

                            {/* Category & Location */}
                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-foreground">
                                    Category
                                </Label>
                                <Select
                                    value={formData.category}
                                    onValueChange={(val) =>
                                        handleChange('category', val)
                                    }
                                >
                                    <SelectTrigger className="h-11 border-gray-200 bg-gray-50/30 rounded-md">
                                        <SelectValue placeholder="Select Category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="beverages">Beverages</SelectItem>
                                        <SelectItem value="vegetables">Vegetables</SelectItem>
                                        <SelectItem value="meat">Meat</SelectItem>
                                        <SelectItem value="drinks">Drinks</SelectItem>
                                        <SelectItem value="fruits">Fruits</SelectItem>
                                        <SelectItem value="dairy">Dairy</SelectItem>
                                        <SelectItem value="seafood">Seafood</SelectItem>
                                        <SelectItem value="grains">Grains</SelectItem>
                                        <SelectItem value="poultry">Poultry</SelectItem>
                                        <SelectItem value="snacks">Snacks</SelectItem>
                                        <SelectItem value="bakery">Bakery</SelectItem>
                                        <SelectItem value="spices">Spices</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-foreground">
                                    Location <span className="text-red-500">*</span>
                                </Label>
                                <Select
                                    value={formData.location}
                                    onValueChange={(val) =>
                                        handleChange('location', val)
                                    }
                                >
                                    <SelectTrigger className="h-11 border-gray-200 bg-gray-50/30 rounded-md">
                                        <SelectValue placeholder="Select Location" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="bar-store">Bar Store</SelectItem>
                                        <SelectItem value="freezer-1">Freezer 1</SelectItem>
                                        <SelectItem value="dry-store">Dry Store</SelectItem>
                                        <SelectItem value="cold-room">Cold Room</SelectItem>
                                        <SelectItem value="freezer-2">Freezer 2</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Outer Unit & Base Unity */}
                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-foreground">
                                    Outer Unit <span className="text-red-500">*</span>
                                </Label>
                                <Select
                                    value={formData.outerUnit}
                                    onValueChange={(val) =>
                                        handleChange('outerUnit', val)
                                    }
                                >
                                    <SelectTrigger className="h-11 border-gray-200 bg-gray-50/30 rounded-md">
                                        <SelectValue placeholder="Select Outer Unit" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="bag">Bag</SelectItem>
                                        <SelectItem value="sack">Sack</SelectItem>
                                        <SelectItem value="box">Box</SelectItem>
                                        <SelectItem value="carton">Carton</SelectItem>
                                        <SelectItem value="crate">Crate</SelectItem>
                                        <SelectItem value="gallon">Gallon</SelectItem>
                                        <SelectItem value="pack">Pack</SelectItem>
                                        <SelectItem value="roll">Roll</SelectItem>
                                        <SelectItem value="bundle">Bundle</SelectItem>
                                        <SelectItem value="packet">Packet</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-foreground">
                                    Base Unit <span className="text-red-500">*</span>
                                </Label>
                                <Select
                                    value={formData.baseUnit}
                                    onValueChange={(val) =>
                                        handleChange('baseUnit', val)
                                    }
                                >
                                    <SelectTrigger className="h-11 border-gray-200 bg-gray-50/30 rounded-md">
                                        <SelectValue placeholder="Select Base Unit" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="piece">Piece</SelectItem>
                                        <SelectItem value="kg">Kg</SelectItem>
                                        <SelectItem value="bottle">Bottle</SelectItem>
                                        <SelectItem value="can">Can</SelectItem>
                                        <SelectItem value="ml">ML</SelectItem>
                                        <SelectItem value="liter">Liter</SelectItem>
                                        <SelectItem value="jar">Jar</SelectItem>
                                        <SelectItem value="unit">Unit</SelectItem>
                                        <SelectItem value="package">Package</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Conversation Rate & Cost Per Outer */}
                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-foreground flex items-center gap-2">
                                    Conversation Rate{' '}
                                    <Info className="h-3 w-3 text-muted-foreground" />
                                </Label>
                                <div className="space-y-1">
                                    <Input
                                        type="number"
                                        value={formData.conversionRate}
                                        onChange={(e) =>
                                            handleChange(
                                                'conversionRate',
                                                Number(e.target.value),
                                            )
                                        }
                                        className="h-11 border-gray-200 bg-gray-50/30 rounded-md"
                                    />
                                    <p className="text-[10px] text-muted-foreground font-medium italic">
                                        1 {formData.outerUnit || 'Outer'} ={' '}
                                        {formData.conversionRate}{' '}
                                        {formData.baseUnit || 'Base'}
                                    </p>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-foreground">
                                    Cost Per Outer (₦) <span className="text-red-500">*</span>
                                </Label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold">
                                        ₦
                                    </span>
                                    <Input
                                        type="number"
                                        value={formData.costPerOuter}
                                        onChange={(e) =>
                                            handleChange(
                                                'costPerOuter',
                                                Number(e.target.value),
                                            )
                                        }
                                        className="h-11 pl-7 border-gray-200 bg-gray-50/30 rounded-md font-bold"
                                    />
                                </div>
                            </div>

                            {/* Cost Per Base & Qty in Stock Outer */}
                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-foreground">
                                    Cost Per {formData.baseUnit || 'Base'} (₦){' '}
                                    <span className="text-red-500">*</span>
                                </Label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">
                                        ₦
                                    </span>
                                    <Input
                                        type="text"
                                        readOnly
                                        value={costPerBase.toFixed(2)}
                                        className="h-11 pl-7 border-gray-200 bg-gray-50/30 rounded-md text-muted-foreground font-medium"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-foreground">
                                    Qty in Stock ({formData.outerUnit || 'Outer'})
                                </Label>
                                <Input
                                    type="number"
                                    value={formData.qtyInStockOuter}
                                    onChange={(e) =>
                                        handleChange(
                                            'qtyInStockOuter',
                                            Number(e.target.value),
                                        )
                                    }
                                    className="h-11 border-gray-200 bg-gray-50/30 rounded-md"
                                />
                            </div>

                            {/* Qty in Stock Base & Inventory Value */}
                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-foreground">
                                    Qty in Stock ({formData.baseUnit || 'Base'})
                                </Label>
                                <Input
                                    type="text"
                                    readOnly
                                    value={qtyInStockBase}
                                    className="h-11 border-gray-200 bg-gray-50/30 rounded-md text-muted-foreground font-medium"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-foreground">
                                    Inventory Value (₦)
                                </Label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold">
                                        ₦
                                    </span>
                                    <Input
                                        type="text"
                                        readOnly
                                        value={inventoryValue.toLocaleString()}
                                        className="h-11 pl-7 border-gray-200 bg-gray-50/30 rounded-md text-foreground font-bold"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4 pt-4 border-t">
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="flex-1 bg-orion-blue hover:bg-orion-blue/90 h-12 rounded-md font-bold text-white shadow-sm"
                        >
                            {isLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : null}
                            {mode === 'edit' ? 'Update Item' : 'Add Item'}
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => onOpenChange(false)}
                            className="flex-1 h-12 bg-gray-50 rounded-md font-bold text-foreground hover:bg-gray-100"
                        >
                            Cancel
                        </Button>
                    </div>
                </form>
            </div>
        </DialogContent>
    </Dialog>
);
}
