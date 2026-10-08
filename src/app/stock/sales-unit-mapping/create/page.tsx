'use client';

import { getMenuItems } from '@/app/actions/menu-item';
import {
    createMenuItemMapping,
    getMenuItemMappings,
    type LinkedDepartment,
} from '@/app/actions/sales-unit-mapping';
import BrandButton from '@/components/common/Button';
import Toast from '@/components/toast';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { fetchStockItems } from '@/hooks/fetcher';
import { cn } from '@/lib/utils';
import { Calendar, Search, X } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import useSWR from 'swr';

const labelClass = 'text-[14px] font-medium text-foreground mb-2';
const inputClass = 'bg-white border py-[25px] px-3 rounded-md';

const LINKED_DEPARTMENTS = {
    BAR: 'Bar',
    KITCHEN: 'Kitchen',
    RESTAURANT: 'Restaurant',
    OTHERS: 'Others',
} as const;

interface InventoryItemForm {
    inventoryItemId: string;
    quantityPerSale: string;
}

export default function SalesUnitMappingCreatePage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const mode = searchParams.get('mode');
    const menuItemId = searchParams.get('menuItemId');
    const isEditMode = mode === 'edit' && menuItemId;

    const [form, setForm] = useState({
        menuItemId: '',
        category: '',
        sellingPrice: '0',
        salesUoM: '',
        conversionFactor: '',
        conversionRate: '',
        linkedDepartment: LINKED_DEPARTMENTS.KITCHEN as LinkedDepartment,
        autoDeduct: true,
        notes: '',
        inventoryItems: [] as InventoryItemForm[],
        inventoryUoM: '',
        costPerInventoryUnit: '',
        costPerSalesUnit: '',
        expectedProfit: '',
        currentStockQuantity: '',
        minStockLevel: '',
        expiringDate: '',
    });

    const [loadingCreate, setLoadingCreate] = useState(false);
    const [loadingEdit, setLoadingEdit] = useState(false);
    const [menuItemSearch, setMenuItemSearch] = useState('');
    const [inventoryItemSearch, setInventoryItemSearch] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    const { data: menuItemsResponse } = useSWR('/menu/item', getMenuItems);
    const { data: inventoryItems } = useSWR('/items', fetchStockItems);

    interface MenuItem {
        id: number;
        name: string;
        price: number;
        category?: { name: string };
    }

    const menuItems = useMemo(() => {
        const items = (menuItemsResponse?.data || []) as MenuItem[];
        if (!menuItemSearch) return items;
        return items.filter((item) =>
            item.name?.toLowerCase().includes(menuItemSearch.toLowerCase()),
        );
    }, [menuItemsResponse, menuItemSearch]);

    interface InventoryItem {
        id: number;
        itemName?: string;
        name?: string;
        baseUnit?: string;
        unitOfMeasurement?: string;
        costPrice?: number;
        unitPrice?: number | string;
    }

    const filteredInventoryItems = useMemo(() => {
        if (!inventoryItems) return [];
        const items = inventoryItems as InventoryItem[];
        if (!inventoryItemSearch) return items;
        return items.filter((item) => {
            const name = item.itemName || item.name || '';
            return name
                .toLowerCase()
                .includes(inventoryItemSearch.toLowerCase());
        });
    }, [inventoryItems, inventoryItemSearch]);

    useEffect(() => {
        if (!isEditMode || !menuItemId) return;

        // Validate menuItemId is a valid number
        const parsedMenuItemId = Number(menuItemId);
        if (Number.isNaN(parsedMenuItemId) || parsedMenuItemId <= 0) {
            console.error('Invalid menuItemId:', menuItemId);
            return;
        }

        setLoadingEdit(true);
        getMenuItemMappings(parsedMenuItemId)
            .then((response) => {
                if (response.error) {
                    toast.custom(() => (
                        <Toast
                            title="Error!"
                            description={response.error}
                            type="error"
                        />
                    ));
                    return;
                }
                const mappings = response.data || [];
                if (mappings.length === 0) return;

                const firstMapping = mappings[0];
                const menuItem = firstMapping.menuItem;

                setForm({
                    menuItemId: String(menuItem.id),
                    category: menuItem.category?.name || '',
                    sellingPrice: String(menuItem.price || 0),
                    salesUoM: firstMapping.salesUoM || '',
                    conversionFactor: firstMapping.conversionFactor
                        ? String(firstMapping.conversionFactor)
                        : '',
                    conversionRate: firstMapping.conversionFactor
                        ? String(firstMapping.conversionFactor)
                        : '',
                    linkedDepartment:
                        (firstMapping.linkedDepartment as LinkedDepartment) ||
                        LINKED_DEPARTMENTS.KITCHEN,
                    autoDeduct: firstMapping.autoDeduct ?? true,
                    notes: firstMapping.notes || '',
                    inventoryItems: mappings.map(
                        (m: {
                            inventoryItem: { id: number };
                            quantityPerSale: number;
                        }) => ({
                            inventoryItemId: String(m.inventoryItem.id),
                            quantityPerSale: String(m.quantityPerSale),
                        }),
                    ),
                    inventoryUoM: '',
                    costPerInventoryUnit: '',
                    costPerSalesUnit: '',
                    expectedProfit: '',
                    currentStockQuantity: '',
                    minStockLevel: '',
                    expiringDate: '',
                });
            })
            .finally(() => setLoadingEdit(false));
    }, [isEditMode, menuItemId]);

    useEffect(() => {
        if (form.menuItemId) {
            const selectedMenuItem = menuItems.find(
                (item) => String(item.id) === form.menuItemId,
            );
            if (selectedMenuItem) {
                setForm((prev) => ({
                    ...prev,
                    category: selectedMenuItem.category?.name || '',
                    sellingPrice: String(selectedMenuItem.price || 0),
                }));
            }
        }
    }, [form.menuItemId, menuItems]);

    const addInventoryItem = () => {
        setForm((prev) => ({
            ...prev,
            inventoryItems: [
                ...prev.inventoryItems,
                { inventoryItemId: '', quantityPerSale: '0' },
            ],
        }));
    };

    const removeInventoryItem = (index: number) => {
        setForm((prev) => ({
            ...prev,
            inventoryItems: prev.inventoryItems.filter((_, i) => i !== index),
        }));
    };

    const updateInventoryItem = (
        index: number,
        field: keyof InventoryItemForm,
        value: string,
    ) => {
        setForm((prev) => ({
            ...prev,
            inventoryItems: prev.inventoryItems.map((item, i) =>
                i === index ? { ...item, [field]: value } : item,
            ),
        }));
    };

    // Get the first inventory item for calculations
    const firstInventoryItem = useMemo(() => {
        if (!form.inventoryItems[0]?.inventoryItemId || !inventoryItems)
            return null;
        const items = inventoryItems as InventoryItem[];
        return (
            items.find(
                (i) => String(i.id) === form.inventoryItems[0].inventoryItemId,
            ) || null
        );
    }, [form.inventoryItems, inventoryItems]);

    // Calculate auto-filled fields based on selected inventory item
    useEffect(() => {
        if (firstInventoryItem) {
            const costPrice = Number(
                firstInventoryItem.costPrice ||
                    (typeof firstInventoryItem.unitPrice === 'number'
                        ? firstInventoryItem.unitPrice
                        : Number(firstInventoryItem.unitPrice) || 0) ||
                    0,
            );
            const baseUom =
                firstInventoryItem.baseUnit ||
                firstInventoryItem.unitOfMeasurement ||
                '';

            setForm((prev) => ({
                ...prev,
                inventoryUoM: baseUom,
                costPerInventoryUnit: costPrice.toFixed(2),
            }));
        }
    }, [firstInventoryItem]);

    const costPerSalesUnit = useMemo(() => {
        if (!form.inventoryItems.length || !firstInventoryItem) return 0;

        const conversionRate = Number(
            form.conversionRate || form.conversionFactor || 0,
        );

        // If conversion factor exists: Cost = First Item Cost ÷ Conversion Factor
        if (conversionRate > 0) {
            const inventoryCost = Number(
                firstInventoryItem.costPrice ||
                    (typeof firstInventoryItem.unitPrice === 'number'
                        ? firstInventoryItem.unitPrice
                        : Number(firstInventoryItem.unitPrice) || 0) ||
                    0,
            );
            return inventoryCost / conversionRate;
        }

        // If conversion factor is NULL/0 (recipe-based): Sum all (Qty × Unit Cost)
        let totalCost = 0;
        for (const invItem of form.inventoryItems) {
            const items = (inventoryItems || []) as InventoryItem[];
            const item = items.find(
                (i) => String(i.id) === invItem.inventoryItemId,
            );
            if (item) {
                const costPrice = Number(
                    item.costPrice ||
                        (typeof item.unitPrice === 'number'
                            ? item.unitPrice
                            : Number(item.unitPrice) || 0) ||
                        0,
                );
                const qtyPerSale = Number(invItem.quantityPerSale || 0);
                totalCost += costPrice * qtyPerSale;
            }
        }

        return totalCost;
    }, [
        form.inventoryItems,
        form.conversionRate,
        form.conversionFactor,
        firstInventoryItem,
        inventoryItems,
    ]);

    const expectedProfit = useMemo(() => {
        const sellingPrice = Number(form.sellingPrice || 0);
        const cost = costPerSalesUnit;
        return sellingPrice - cost;
    }, [form.sellingPrice, costPerSalesUnit]);

    // Update calculated fields in form state
    useEffect(() => {
        setForm((prev) => ({
            ...prev,
            costPerSalesUnit: costPerSalesUnit.toFixed(2),
            expectedProfit: expectedProfit.toFixed(2),
        }));
    }, [costPerSalesUnit, expectedProfit]);

    // Update current stock and min stock from inventory item
    useEffect(() => {
        if (firstInventoryItem) {
            const items = (inventoryItems || []) as InventoryItem[];
            const fullItem = items.find(
                (i) => String(i.id) === form.inventoryItems[0]?.inventoryItemId,
            );
            if (fullItem) {
                const itemWithQuantity = fullItem as InventoryItem & {
                    quantity?: number;
                    minStock?: number;
                };
                setForm((prev) => ({
                    ...prev,
                    currentStockQuantity: String(
                        itemWithQuantity.quantity || 0,
                    ),
                    minStockLevel: String(itemWithQuantity.minStock || 0),
                }));
            }
        }
    }, [firstInventoryItem, form.inventoryItems, inventoryItems]);

    const canSubmit = useMemo(() => {
        // Validation per PRD:
        // - Menu Item: Required
        // - Sales UoM: Required
        // - Inventory Items: At least one with valid quantity
        // - Conversion Factor: Optional (required only for single item with measurable conversion)
        // - Cost per Unit: Auto-filled, so should always exist

        const hasValidMenuItem = !!form.menuItemId;
        const hasValidSalesUoM = !!form.salesUoM;
        const hasValidInventoryItems =
            form.inventoryItems.length > 0 &&
            form.inventoryItems.every(
                (item) =>
                    item.inventoryItemId && Number(item.quantityPerSale) > 0,
            );

        // Conversion factor is optional - only required if single item and user wants measurable conversion
        // But if provided, it must be > 0
        const conversionRate = Number(
            form.conversionRate || form.conversionFactor || 0,
        );
        const hasValidConversionFactor =
            conversionRate === 0 || conversionRate > 0;

        return (
            hasValidMenuItem &&
            hasValidSalesUoM &&
            hasValidInventoryItems &&
            hasValidConversionFactor
        );
    }, [form]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!canSubmit) {
            toast.custom(() => (
                <Toast
                    title="Error!"
                    description="Please fill in all required fields."
                    type="error"
                />
            ));
            return;
        }

        try {
            if (isEditMode) {
                setLoadingEdit(true);
            } else {
                setLoadingCreate(true);
            }

            const payload = {
                menuItemId: Number(form.menuItemId),
                salesUoM: form.salesUoM,
                conversionFactor:
                    form.conversionRate || form.conversionFactor
                        ? Number(form.conversionRate || form.conversionFactor)
                        : undefined,
                linkedDepartment: form.linkedDepartment,
                autoDeduct: form.autoDeduct,
                notes: form.notes || undefined,
                inventoryItems: form.inventoryItems.map((item) => ({
                    inventoryItemId: Number(item.inventoryItemId),
                    quantityPerSale: Number(item.quantityPerSale),
                })),
            };

            const res = await createMenuItemMapping(payload);
            if (res.message === 'Menu item mapping created successfully!') {
                toast.custom(() => (
                    <Toast
                        title="Success!"
                        description={res.message}
                        type="success"
                    />
                ));
                router.push('/stock/sales-unit-mapping');
            } else {
                toast.custom(() => (
                    <Toast
                        title="Error!"
                        description={res.message || 'Failed to create mapping.'}
                        type="error"
                    />
                ));
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
                    description="Unexpected error. Please try again."
                    type="error"
                />
            ));
        } finally {
            if (isEditMode) {
                setLoadingEdit(false);
            } else {
                setLoadingCreate(false);
            }
        }
    };

    return (
        <div className="min-h-screen pt-6">
            <div className="max-w-6xl mx-auto px-6 pb-12">
                {/* Back Link */}
                <div className="mb-8">
                    <button
                        type="button"
                        onClick={() => router.push('/stock/sales-unit-mapping')}
                        className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
                    >
                        ← Back
                    </button>
                </div>

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">
                        {isEditMode ? 'Edit Mapping' : 'Add New Mapping'}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        {isEditMode
                            ? 'Form for editing an existing sales unit mapping.'
                            : 'Form for creating a new sales unit mapping between menu items and inventory items.'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Auto-fill Section with Search and Toggle */}
                    <div className="flex items-start justify-between gap-6 pb-6 border-b">
                        <div className="flex-1">
                            <h2 className="text-base font-semibold mb-3">
                                Auto-fill from Inventory Master
                            </h2>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                <Input
                                    className="pl-10 h-10"
                                    placeholder="Search"
                                    value={searchQuery}
                                    onChange={(e) =>
                                        setSearchQuery(e.target.value)
                                    }
                                />
                            </div>
                        </div>
                        <div className="pt-1">
                            <div className="bg-gray-100 p-4 rounded-lg min-w-80">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-sm font-semibold text-foreground">
                                            Auto Deduct Inventory
                                        </h3>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Automatically deduct from inventory
                                            when sold through POS
                                        </p>
                                    </div>
                                    <Switch
                                        checked={form.autoDeduct}
                                        onCheckedChange={(checked) =>
                                            setForm((prev) => ({
                                                ...prev,
                                                autoDeduct: checked,
                                            }))
                                        }
                                        className="ml-4"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Item Identification */}
                    <section>
                        <h2 className="text-base font-semibold mb-5">
                            Item Identification
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <FormGroup label="Menu Item" required>
                                <Select
                                    value={form.menuItemId}
                                    onValueChange={(v) =>
                                        setForm((prev) => ({
                                            ...prev,
                                            menuItemId: v,
                                        }))
                                    }
                                >
                                    <SelectTrigger className={inputClass}>
                                        <SelectValue placeholder="Select menu item" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <div className="p-2">
                                            <Input
                                                placeholder="Search menu items..."
                                                value={menuItemSearch}
                                                onChange={(e) =>
                                                    setMenuItemSearch(
                                                        e.target.value,
                                                    )
                                                }
                                                className="mb-2"
                                            />
                                        </div>
                                        {menuItems.map((item) => (
                                            <SelectItem
                                                key={item.id}
                                                value={String(item.id)}
                                            >
                                                {item.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </FormGroup>

                            <FormGroup label="Category" required>
                                <Input
                                    className={inputClass}
                                    value={form.category}
                                    readOnly
                                />
                            </FormGroup>

                            <FormGroup label="Linked Department" required>
                                <Select
                                    value={form.linkedDepartment}
                                    onValueChange={(v) =>
                                        setForm((prev) => ({
                                            ...prev,
                                            linkedDepartment:
                                                v as LinkedDepartment,
                                        }))
                                    }
                                >
                                    <SelectTrigger className={inputClass}>
                                        <SelectValue placeholder="Bar" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem
                                            value={LINKED_DEPARTMENTS.BAR}
                                        >
                                            Bar
                                        </SelectItem>
                                        <SelectItem
                                            value={LINKED_DEPARTMENTS.KITCHEN}
                                        >
                                            Kitchen
                                        </SelectItem>
                                        <SelectItem
                                            value={
                                                LINKED_DEPARTMENTS.RESTAURANT
                                            }
                                        >
                                            Restaurant
                                        </SelectItem>
                                        <SelectItem
                                            value={LINKED_DEPARTMENTS.OTHERS}
                                        >
                                            Others
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </FormGroup>
                        </div>
                    </section>

                    {/* Inventory Items */}
                    <section>
                        <h2 className="text-base font-semibold mb-4">
                            Inventory Items & Qty Used per Sale
                        </h2>
                        <Card className="p-6 shadow-none bg-white">
                            <div className="space-y-4">
                                {form.inventoryItems.map((item, index) => (
                                    <div
                                        key={`${item.inventoryItemId}-${index}`}
                                        className="flex items-end gap-3"
                                    >
                                        <FormGroup label="Item Name" required>
                                            <Select
                                                value={item.inventoryItemId}
                                                onValueChange={(v) =>
                                                    updateInventoryItem(
                                                        index,
                                                        'inventoryItemId',
                                                        v,
                                                    )
                                                }
                                            >
                                                <SelectTrigger
                                                    className={inputClass}
                                                >
                                                    <SelectValue placeholder="Select item" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <div className="p-2">
                                                        <Input
                                                            placeholder="Search inventory items..."
                                                            value={
                                                                inventoryItemSearch
                                                            }
                                                            onChange={(e) =>
                                                                setInventoryItemSearch(
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            className="mb-2"
                                                        />
                                                    </div>
                                                    {filteredInventoryItems.map(
                                                        (invItem) => (
                                                            <SelectItem
                                                                key={invItem.id}
                                                                value={String(
                                                                    invItem.id,
                                                                )}
                                                            >
                                                                {invItem.itemName ||
                                                                    invItem.name}
                                                            </SelectItem>
                                                        ),
                                                    )}
                                                </SelectContent>
                                            </Select>
                                        </FormGroup>

                                        <FormGroup label="Qty" required>
                                            <Input
                                                type="number"
                                                className={inputClass}
                                                value={item.quantityPerSale}
                                                onChange={(e) =>
                                                    updateInventoryItem(
                                                        index,
                                                        'quantityPerSale',
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                        </FormGroup>

                                        {form.inventoryItems.length > 1 && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() =>
                                                    removeInventoryItem(index)
                                                }
                                                className="text-destructive"
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <Button
                                type="button"
                                variant="link"
                                onClick={addInventoryItem}
                                className="mt-4 text-blue-600 p-0"
                            >
                                Add Item
                            </Button>
                        </Card>
                    </section>

                    {/* Units of Measurement */}
                    <section>
                        <h2 className="text-base font-semibold mb-5">
                            Units of Measurement and Conversion
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <FormGroup label="Inventory UoM (Base)" required>
                                <Input
                                    className={inputClass}
                                    value={form.inventoryUoM}
                                    onChange={(e) =>
                                        setForm((prev) => ({
                                            ...prev,
                                            inventoryUoM: e.target.value,
                                        }))
                                    }
                                    readOnly
                                />
                            </FormGroup>

                            <FormGroup label="Sales UoM" required>
                                <Input
                                    className={inputClass}
                                    placeholder="e.g shot, gram, piece"
                                    value={form.salesUoM}
                                    onChange={(e) =>
                                        setForm((prev) => ({
                                            ...prev,
                                            salesUoM: e.target.value,
                                        }))
                                    }
                                />
                            </FormGroup>

                            <FormGroup
                                label="Conversion Rate"
                                labelBottom={
                                    form.conversionRate || form.conversionFactor
                                        ? `How many ${form.salesUoM || 'piece'} per ${form.inventoryUoM || 'unit'}`
                                        : ''
                                }
                                required
                            >
                                <Input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    className={inputClass}
                                    placeholder="e.g 12.5"
                                    value={
                                        form.conversionRate ||
                                        form.conversionFactor
                                    }
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        setForm((prev) => ({
                                            ...prev,
                                            conversionRate: value,
                                            conversionFactor: value,
                                        }));
                                    }}
                                />
                            </FormGroup>

                            <FormGroup label="Cost Per Inventory Unit" required>
                                <Input
                                    className={inputClass}
                                    value={`₦${form.costPerInventoryUnit || '0.00'}`}
                                    readOnly
                                />
                            </FormGroup>
                        </div>
                    </section>

                    {/* Pricing and Profit */}
                    <section>
                        <h2 className="text-base font-semibold mb-5">
                            Pricing and Profit
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <FormGroup label="Cost Per Sales Unit (Calculated)">
                                <Input
                                    className={inputClass}
                                    value={`₦${form.costPerSalesUnit || '0.00'}`}
                                    readOnly
                                />
                            </FormGroup>

                            <FormGroup label="Selling Price" required>
                                <div className="flex items-center">
                                    <span className="text-sm font-medium mr-2">
                                        ₦
                                    </span>
                                    <Input
                                        type="number"
                                        className={inputClass}
                                        value={form.sellingPrice}
                                        onChange={(e) =>
                                            setForm((prev) => ({
                                                ...prev,
                                                sellingPrice: e.target.value,
                                            }))
                                        }
                                    />
                                </div>
                            </FormGroup>

                            <FormGroup
                                label="Expected Profit (₦) - Calculated"
                                labelBottom="Profit per sale"
                            >
                                <Input
                                    className={inputClass}
                                    value={`₦${form.expectedProfit || '0.00'}`}
                                    readOnly
                                />
                            </FormGroup>

                            <FormGroup label="Current Stock Quantity" required>
                                <Input
                                    type="number"
                                    className={inputClass}
                                    value={form.currentStockQuantity}
                                    readOnly
                                />
                            </FormGroup>
                        </div>
                    </section>

                    {/* Additional Information */}
                    <section>
                        <h2 className="text-base font-semibold mb-5">
                            Additional Information
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <FormGroup
                                label="Min Stock Level (Alert Threshold)"
                                required
                            >
                                <Input
                                    type="number"
                                    className={inputClass}
                                    value={form.minStockLevel}
                                    readOnly
                                />
                            </FormGroup>

                            <FormGroup label="Expiring Date">
                                <div className="relative">
                                    <Input
                                        type="date"
                                        className={inputClass}
                                        value={form.expiringDate}
                                        onChange={(e) =>
                                            setForm((prev) => ({
                                                ...prev,
                                                expiringDate: e.target.value,
                                            }))
                                        }
                                    />
                                    <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
                                </div>
                            </FormGroup>

                            <FormGroup label="Notes" className="md:col-span-2">
                                <Input
                                    className={inputClass}
                                    value={form.notes}
                                    onChange={(e) =>
                                        setForm((prev) => ({
                                            ...prev,
                                            notes: e.target.value,
                                        }))
                                    }
                                    placeholder="Enter notes"
                                />
                            </FormGroup>
                        </div>
                    </section>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-6">
                        <BrandButton
                            type="submit"
                            disabled={
                                !canSubmit ||
                                (isEditMode ? loadingEdit : loadingCreate)
                            }
                        >
                            {isEditMode ? 'Update Mapping' : 'Add Mapping'}
                        </BrandButton>
                        <Button
                            type="button"
                            variant="outline"
                            className="text-gray-700"
                            onClick={() =>
                                router.push('/stock/sales-unit-mapping')
                            }
                        >
                            Cancel
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}

interface FormGroupProps {
    label: string;
    children: React.ReactNode;
    className?: string;
    labelBottom?: string;
    labelBottomClassName?: string;
    required?: boolean;
}

function FormGroup({
    label,
    children,
    className,
    labelBottom,
    labelBottomClassName,
    required,
}: Readonly<FormGroupProps>) {
    return (
        <div className={cn('flex flex-col', className)}>
            <label className={cn(labelClass)}>
                {label}
                {required && <span className="text-destructive ml-1">*</span>}
            </label>
            {children}
            {labelBottom ? (
                <p
                    className={cn(
                        'text-xs text-muted-foreground mt-1',
                        labelBottomClassName,
                    )}
                >
                    {labelBottom}
                </p>
            ) : null}
        </div>
    );
}
