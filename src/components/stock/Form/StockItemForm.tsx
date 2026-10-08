'use client';

import {
    createItem,
    createItemCategory,
    createItemLocation,
    fetchItemCategories,
    fetchItemLocations,
    getSingleItem,
    updateItem,
} from '@/app/actions/items';
import { DatePicker } from '@/components/common/DatePicker';
import {
    CreatableSearchSelect,
    type CreatableOption,
} from '@/components/stock/CreatableSearchSelect';
import Toast from '@/components/toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import type { ItemProps } from '@/types';
import { ChevronDown, Info, Loader2 } from 'lucide-react';
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import toast from 'react-hot-toast';
import useSWR, { mutate } from 'swr';

/** Payload shape accepted by the stock create/update API. */
export type StockItemSubmitPayload = ItemProps & {
    category: string;
    itemLocation: string;
    vendorName: string;
    vendorContactInfo: string;
    outerUnit: string;
    baseUnit: string;
    portionRate: number;
    costPriceOuter: number;
    stockDate: string;
    expiryDate: string;
    image: string;
    meta: string;
};

export type StockItemFormValues = {
    itemLocation: string;
    itemName: string;
    category: string;
    vendorName: string;
    vendorPhone: string;
    vendorEmail: string;
    outerUoM: string;
    baseUoM: string;
    conversionRate: number;
    qtyInStockOuter: number;
    costPerUnitOuter: number;
    minStock: number;
    stockDate: string;
    expiringDate: string;
    isActive: boolean;
};

const OUTER_UOM_OPTIONS = [
    'bag',
    'sack',
    'box',
    'carton',
    'crate',
    'gallon',
    'pack',
    'roll',
    'bundle',
    'packet',
] as const;

const BASE_UOM_OPTIONS = [
    'piece',
    'kg',
    'bottle',
    'can',
    'ml',
    'liter',
    'jar',
    'unit',
    'package',
] as const;

const emptyForm = (): StockItemFormValues => ({
    itemLocation: '',
    itemName: '',
    category: '',
    vendorName: '',
    vendorPhone: '',
    vendorEmail: '',
    outerUoM: '',
    baseUoM: '',
    conversionRate: 1,
    qtyInStockOuter: 0,
    costPerUnitOuter: 0,
    minStock: 0,
    stockDate: new Date().toISOString().split('T')[0],
    expiringDate: new Date().toISOString().split('T')[0],
    isActive: true,
});

function RequiredMark() {
    return <span className="text-red-500"> *</span>;
}

function splitVendorContact(contact: string | undefined): {
    phone: string;
    email: string;
} {
    const parts = (contact || '').trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return { phone: '', email: '' };
    if (parts.length === 1) {
        return parts[0].includes('@')
            ? { phone: '', email: parts[0] }
            : { phone: parts[0], email: '' };
    }
    const emailIdx = parts.findIndex((p) => p.includes('@'));
    if (emailIdx >= 0) {
        return {
            phone: parts.filter((_, i) => i !== emailIdx).join(' '),
            email: parts[emailIdx],
        };
    }
    return { phone: parts[0], email: parts.slice(1).join(' ') };
}

function mapItemToForm(item: Record<string, unknown>): {
    values: StockItemFormValues;
    itemNumber: string;
} {
    const portionRate = Number(item.portionRate) || 1;
    const baseQty = Number(item.quantity) || 0;
    const { phone, email } = splitVendorContact(
        String(item.vendorContactInfo || ''),
    );
    const itemNumber = String(
        item.itemNumber || item.sku || item.id || '',
    );

    return {
        itemNumber,
        values: {
            itemLocation: String(item.itemLocation || ''),
            itemName: String(item.name || ''),
            category: String(item.category || ''),
            vendorName: String(item.vendorName || ''),
            vendorPhone: phone,
            vendorEmail: email,
            outerUoM: String(item.outerUnit || ''),
            baseUoM: String(
                item.baseUnit || item.unitOfMeasurement || '',
            ),
            conversionRate: portionRate,
            qtyInStockOuter:
                portionRate > 0 ? baseQty / portionRate : baseQty,
            costPerUnitOuter: Number(item.costPriceOuter) || 0,
            minStock: Number(item.minStock) || 0,
            stockDate:
                String(item.stockDate || '').slice(0, 10) ||
                new Date().toISOString().split('T')[0],
            expiringDate:
                String(item.expiryDate || '').slice(0, 10) ||
                new Date().toISOString().split('T')[0],
            isActive: item.isActive !== false,
        },
    };
}

type StockItemFormProps = {
    mode: 'create' | 'edit';
    itemId?: number;
    onSuccess: () => void;
    onCancel: () => void;
};

export function StockItemForm({
    mode,
    itemId,
    onSuccess,
    onCancel,
}: Readonly<StockItemFormProps>) {
    const [isLoading, setIsLoading] = useState(false);
    const [isHydrating, setIsHydrating] = useState(mode === 'edit');
    const [itemNumber, setItemNumber] = useState('');
    const [form, setForm] = useState<StockItemFormValues>(emptyForm);
    const [addStockOuter, setAddStockOuter] = useState(0);

    const { data: locations = [], mutate: mutateLocations } = useSWR(
        '/items/locations',
        fetchItemLocations,
    );
    const { data: categories = [], mutate: mutateCategories } = useSWR(
        '/items/categories',
        fetchItemCategories,
    );

    useEffect(() => {
        if (mode !== 'edit' || !itemId) return;

        let cancelled = false;
        const load = async () => {
            setIsHydrating(true);
            try {
                const response = await getSingleItem(itemId);
                const item = (response?.data || response) as Record<
                    string,
                    unknown
                >;
                if (cancelled || !item?.name) return;
                const mapped = mapItemToForm(item);
                setForm(mapped.values);
                setItemNumber(mapped.itemNumber);
            } catch {
                toast.custom(() => (
                    <Toast
                        title="Error"
                        description="Failed to load item data."
                        type="error"
                    />
                ));
            } finally {
                if (!cancelled) setIsHydrating(false);
            }
        };
        void load();
        return () => {
            cancelled = true;
        };
    }, [mode, itemId]);

    const locationOptions: CreatableOption[] = useMemo(() => {
        const opts = locations.map((loc) => ({
            value: loc.name,
            label: loc.name,
        }));
        if (
            form.itemLocation &&
            !opts.some((o) => o.value === form.itemLocation)
        ) {
            opts.unshift({
                value: form.itemLocation,
                label: form.itemLocation,
            });
        }
        return opts;
    }, [locations, form.itemLocation]);

    const categoryOptions: CreatableOption[] = useMemo(() => {
        const opts = categories.map((cat) => ({
            value: cat.name,
            label: cat.name,
        }));
        if (
            form.category &&
            !opts.some((o) => o.value === form.category)
        ) {
            opts.unshift({ value: form.category, label: form.category });
        }
        return opts;
    }, [categories, form.category]);

    const qtyInStockBaseAuto =
        Number(form.qtyInStockOuter) * Number(form.conversionRate);
    const costInBaseAuto =
        form.conversionRate > 0
            ? form.costPerUnitOuter / form.conversionRate
            : 0;
    const inventoryValueAuto = qtyInStockBaseAuto * costInBaseAuto;

    const isFormValid = useMemo(() => {
        return (
            Boolean(form.itemLocation.trim()) &&
            Boolean(form.itemName.trim()) &&
            Boolean(form.category.trim()) &&
            Boolean(form.outerUoM) &&
            Boolean(form.baseUoM) &&
            form.conversionRate > 0 &&
            form.qtyInStockOuter >= 0 &&
            form.costPerUnitOuter >= 0 &&
            form.minStock >= 0 &&
            Boolean(form.stockDate)
        );
    }, [form]);

    const conversionHint = useMemo(() => {
        const outer = form.outerUoM || 'Outer';
        const base = form.baseUoM || 'Base';
        const rate = Number(form.conversionRate) || 0;
        return `1 ${outer} = ${rate} ${base}`;
    }, [form.outerUoM, form.baseUoM, form.conversionRate]);

    const buildPayload = (): StockItemSubmitPayload => ({
        name: form.itemName.trim(),
        description: '',
        category: form.category,
        unitOfMeasurement: form.baseUoM,
        price: String(costInBaseAuto),
        quantity: String(qtyInStockBaseAuto),
        itemLocation: form.itemLocation,
        vendorName: form.vendorName,
        vendorContactInfo: `${form.vendorPhone} ${form.vendorEmail}`.trim(),
        outerUnit: form.outerUoM,
        baseUnit: form.baseUoM,
        portionRate: Number(form.conversionRate),
        costPriceOuter: Number(form.costPerUnitOuter),
        stockDate: form.stockDate,
        expiryDate: form.expiringDate,
        minStock: String(form.minStock),
        image: '',
        meta: '',
    });

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (!isFormValid) {
            toast.custom(() => (
                <Toast
                    title="Error!"
                    description="Please complete all required fields before saving."
                    type="error"
                />
            ));
            return;
        }

        setIsLoading(true);
        try {
            const payload = buildPayload();

            if (mode === 'create') {
                const response = await createItem(
                    payload as unknown as ItemProps,
                );
                if (response?.message === 'Item created successfully!') {
                    toast.custom(() => (
                        <Toast
                            title="Success!"
                            description={response.message}
                            type="success"
                        />
                    ));
                    setTimeout(onSuccess, 800);
                } else {
                    toast.custom(() => (
                        <Toast
                            title="Error"
                            description={
                                response?.message || 'Failed to create item'
                            }
                            type="error"
                        />
                    ));
                }
            } else if (itemId) {
                const addedBase =
                    Number(addStockOuter || 0) * Number(form.conversionRate || 1);
                const response = await updateItem(
                    {
                        name: payload.name,
                        category: payload.category,
                        unitOfMeasurement: payload.unitOfMeasurement,
                        price: Number(costInBaseAuto),
                        quantity: Number(qtyInStockBaseAuto) + addedBase,
                        itemLocation: payload.itemLocation,
                        vendorName: payload.vendorName,
                        vendorContactInfo: payload.vendorContactInfo,
                        outerUnit: payload.outerUnit,
                        baseUnit: payload.baseUnit,
                        portionRate: payload.portionRate,
                        costPriceOuter: payload.costPriceOuter,
                        stockDate: payload.stockDate,
                        expiryDate: payload.expiryDate,
                        minStock: Number(form.minStock),
                        isActive: form.isActive,
                    },
                    itemId,
                );
                if (response?.message === 'Item updated successfully!') {
                    mutate('/items');
                    setAddStockOuter(0);
                    toast.custom(() => (
                        <Toast
                            title="Success!"
                            description={response.message}
                            type="success"
                        />
                    ));
                    setTimeout(onSuccess, 800);
                } else {
                    toast.custom(() => (
                        <Toast
                            title="Error"
                            description={
                                response?.message || 'Failed to update item'
                            }
                            type="error"
                        />
                    ));
                }
            }
        } catch {
            toast.custom(() => (
                <Toast
                    title="Error"
                    description="An unexpected error occurred. Please try again."
                    type="error"
                />
            ));
        } finally {
            setIsLoading(false);
        }
    };

    const updateForm = (
        field: keyof StockItemFormValues,
        value: string | number | boolean,
    ) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleCreateLocation = async (name: string) => {
        const created = await createItemLocation(name);
        if (!created) {
            toast.custom(() => (
                <Toast
                    title="Error"
                    description="Could not create location. Try again."
                    type="error"
                />
            ));
            return null;
        }
        await mutateLocations();
        return { value: created.name, label: created.name };
    };

    const handleCreateCategory = async (name: string) => {
        const created = await createItemCategory(name);
        if (!created) {
            toast.custom(() => (
                <Toast
                    title="Error"
                    description="Could not create category. Try again."
                    type="error"
                />
            ));
            return null;
        }
        await mutateCategories();
        return { value: created.name, label: created.name };
    };

    const inputClass =
        'h-9 rounded-sm border-border bg-background text-sm focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-0';
    const labelClass = 'text-sm font-medium text-foreground mb-1.5 block';
    const sectionTitleClass = 'text-base font-semibold text-foreground mb-4';

    if (isHydrating) {
        return (
            <div className="flex items-center justify-center py-24 text-[#667085]">
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                Loading item…
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            <section>
                <h2 className={sectionTitleClass}>Basic Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div className="space-y-1.5">
                        <Label className={labelClass}>
                            Item Location
                            <RequiredMark />
                        </Label>
                        <CreatableSearchSelect
                            options={locationOptions}
                            value={form.itemLocation}
                            onChange={(val) => updateForm('itemLocation', val)}
                            onCreate={handleCreateLocation}
                            placeholder="Search or create location"
                            searchPlaceholder="Type to search…"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label className={labelClass}>Item Number</Label>
                        <Input
                            className={cn(inputClass, 'bg-muted text-muted-foreground')}
                            disabled
                            value={
                                mode === 'edit' && itemNumber
                                    ? itemNumber
                                    : 'Auto-generated'
                            }
                            readOnly
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                            {mode === 'edit'
                                ? 'System-generated — cannot be changed'
                                : 'Assigned automatically when the item is saved'}
                        </p>
                    </div>
                    <div className="space-y-1.5">
                        <Label className={labelClass}>
                            Item Name
                            <RequiredMark />
                        </Label>
                        <Input
                            className={inputClass}
                            placeholder="Enter item name"
                            value={form.itemName}
                            onChange={(e) =>
                                updateForm('itemName', e.target.value)
                            }
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label className={labelClass}>
                            Category
                            <RequiredMark />
                        </Label>
                        <CreatableSearchSelect
                            options={categoryOptions}
                            value={form.category}
                            onChange={(val) => updateForm('category', val)}
                            onCreate={handleCreateCategory}
                            placeholder="Search or create category"
                            searchPlaceholder="Type to search…"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                        <Label className={labelClass}>Vendors Name</Label>
                        <Input
                            className={inputClass}
                            placeholder="Enter Name"
                            value={form.vendorName}
                            onChange={(e) =>
                                updateForm('vendorName', e.target.value)
                            }
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label className={labelClass}>
                            Vendors Phone Number
                        </Label>
                        <Input
                            className={inputClass}
                            placeholder="08067564267"
                            value={form.vendorPhone}
                            onChange={(e) =>
                                updateForm('vendorPhone', e.target.value)
                            }
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label className={labelClass}>
                            Vendors Email Address
                        </Label>
                        <Input
                            className={inputClass}
                            placeholder="vendor@email.com"
                            value={form.vendorEmail}
                            onChange={(e) =>
                                updateForm('vendorEmail', e.target.value)
                            }
                        />
                    </div>
                </div>
            </section>

            <section className="space-y-4">
                <h2 className={sectionTitleClass}>Units & Conversion</h2>

                <div className="bg-amber-50/50 border border-amber-200 rounded-lg p-4 flex gap-3">
                    <div className="mt-0.5">
                        <Info className="h-5 w-5 text-[#B45309]" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground leading-relaxed">
                        <div>
                            <p className="font-semibold text-foreground mb-1">
                                Outer Unit
                            </p>
                            <p>
                                (container like Carton, Box, Bag) to specify how
                                items are packaged. Then choose the
                            </p>
                        </div>
                        <div>
                            <p className="font-semibold text-foreground mb-1">
                                Base Unit
                            </p>
                            <p>
                                (individual item like Bottle, Piece, kg) and
                                enter the conversion rate.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-1.5">
                        <Label className={labelClass}>
                            Outer UoM (Container)
                            <RequiredMark />
                        </Label>
                        <Select
                            value={form.outerUoM || undefined}
                            onValueChange={(val) => updateForm('outerUoM', val)}
                        >
                            <SelectTrigger className={inputClass}>
                                <SelectValue placeholder="e.g carton, bag, case" />
                            </SelectTrigger>
                            <SelectContent>
                                {OUTER_UOM_OPTIONS.map((uom) => (
                                    <SelectItem key={uom} value={uom}>
                                        {uom.charAt(0).toUpperCase() +
                                            uom.slice(1)}
                                    </SelectItem>
                                ))}
                                {form.outerUoM &&
                                !(OUTER_UOM_OPTIONS as readonly string[]).includes(
                                    form.outerUoM,
                                ) ? (
                                    <SelectItem value={form.outerUoM}>
                                        {form.outerUoM}
                                    </SelectItem>
                                ) : null}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-1.5">
                        <Label className={labelClass}>
                            Base UoM (individual item)
                            <RequiredMark />
                        </Label>
                        <Select
                            value={form.baseUoM || undefined}
                            onValueChange={(val) => updateForm('baseUoM', val)}
                        >
                            <SelectTrigger className={inputClass}>
                                <SelectValue placeholder="Select basic unit" />
                            </SelectTrigger>
                            <SelectContent>
                                {BASE_UOM_OPTIONS.map((uom) => (
                                    <SelectItem key={uom} value={uom}>
                                        {uom.charAt(0).toUpperCase() +
                                            uom.slice(1)}
                                    </SelectItem>
                                ))}
                                {form.baseUoM &&
                                !(BASE_UOM_OPTIONS as readonly string[]).includes(
                                    form.baseUoM,
                                ) ? (
                                    <SelectItem value={form.baseUoM}>
                                        {form.baseUoM}
                                    </SelectItem>
                                ) : null}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5 mb-1.5">
                            <Label className="text-sm font-medium text-foreground mb-0">
                                Conversion Rate
                                <RequiredMark />
                            </Label>
                            <Info className="h-4 w-4 text-[#98A2B3]" />
                        </div>
                        <Input
                            className={inputClass}
                            type="number"
                            min={0}
                            step="any"
                            value={form.conversionRate}
                            onChange={(e) =>
                                updateForm(
                                    'conversionRate',
                                    Number(e.target.value),
                                )
                            }
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                            {conversionHint}
                        </p>
                    </div>
                    <div className="space-y-1.5">
                        <Label className={labelClass}>
                            Qty In Stock (Outer)
                            <RequiredMark />
                        </Label>
                        <div className="relative">
                            <Input
                                className={inputClass}
                                type="text"
                                placeholder="0"
                                value={
                                    form.qtyInStockOuter === 0
                                        ? ''
                                        : form.qtyInStockOuter
                                }
                                onChange={(e) => {
                                    const val = e.target.value;
                                    if (
                                        val === '' ||
                                        /^\d*\.?\d*$/.test(val)
                                    ) {
                                        updateForm(
                                            'qtyInStockOuter',
                                            val === '' ? 0 : Number(val),
                                        );
                                    }
                                }}
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col items-center justify-center">
                                <ChevronDown className="h-4 w-4 text-gray-400 rotate-180" />
                                <ChevronDown className="h-4 w-4 text-gray-400" />
                            </div>
                        </div>
                    </div>
                    {mode === 'edit' ? (
                        <div className="space-y-1.5">
                            <Label className={labelClass}>
                                Add stock (Outer)
                            </Label>
                            <Input
                                className={inputClass}
                                type="text"
                                placeholder="0"
                                value={addStockOuter === 0 ? '' : addStockOuter}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    if (val === '' || /^\d*\.?\d*$/.test(val)) {
                                        setAddStockOuter(
                                            val === '' ? 0 : Number(val),
                                        );
                                    }
                                }}
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                                Added to current qty. Example: 5 in stock + 10
                                added = 15.
                            </p>
                        </div>
                    ) : null}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                        <Label className={labelClass}>
                            Qty In Stock (Base) - Auto calculated
                        </Label>
                        <Input
                            className={cn(inputClass, 'bg-muted text-muted-foreground')}
                            disabled
                            value={`${qtyInStockBaseAuto + Number(addStockOuter || 0) * Number(form.conversionRate || 1)} ${form.baseUoM || 'unit'}`}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                            Conversion Rate × Qty In Stock (outer)
                        </p>
                    </div>
                    <div className="space-y-1.5">
                        <Label className={labelClass}>
                            Cost per unit (Outer)
                            <RequiredMark />
                        </Label>
                        <div className="relative">
                            <Input
                                className={inputClass}
                                type="text"
                                placeholder="0"
                                value={
                                    form.costPerUnitOuter === 0
                                        ? ''
                                        : form.costPerUnitOuter
                                }
                                onChange={(e) => {
                                    const val = e.target.value;
                                    if (
                                        val === '' ||
                                        /^\d*\.?\d*$/.test(val)
                                    ) {
                                        updateForm(
                                            'costPerUnitOuter',
                                            val === '' ? 0 : Number(val),
                                        );
                                    }
                                }}
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col items-center justify-center">
                                <ChevronDown className="h-4 w-4 text-gray-400 rotate-180" />
                                <ChevronDown className="h-4 w-4 text-gray-400" />
                            </div>
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <Label className={labelClass}>
                            Cost In Base - Auto calculated
                        </Label>
                        <Input
                            className={cn(inputClass, 'bg-muted text-muted-foreground')}
                            disabled
                            value={`₦ ${costInBaseAuto.toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-1.5">
                        <Label className={labelClass}>
                            Inventory Value (₦) - Auto calculated
                        </Label>
                        <Input
                            className={cn(inputClass, 'bg-muted text-muted-foreground')}
                            disabled
                            value={`₦ ${inventoryValueAuto.toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label className={labelClass}>
                            Minimum Stock Level
                            <RequiredMark />
                        </Label>
                        <Input
                            className={inputClass}
                            type="text"
                            placeholder="0"
                            value={form.minStock === 0 ? '' : form.minStock}
                            onChange={(e) => {
                                const val = e.target.value;
                                if (val === '' || /^\d*\.?\d*$/.test(val)) {
                                    updateForm(
                                        'minStock',
                                        val === '' ? 0 : Number(val),
                                    );
                                }
                            }}
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label className={labelClass}>
                            Stock Date
                            <RequiredMark />
                        </Label>
                        <DatePicker
                            value={form.stockDate}
                            onChange={(val) => updateForm('stockDate', val)}
                            placeholder="23/11/2025"
                            className="h-9 rounded-sm bg-background border-border"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label className={labelClass}>Expiring Date</Label>
                        <DatePicker
                            value={form.expiringDate}
                            onChange={(val) => updateForm('expiringDate', val)}
                            placeholder="23/11/2025"
                            className="h-9 rounded-sm bg-background border-border"
                        />
                    </div>
                </div>

                {mode === 'edit' && (
                    <div className="mt-6 flex items-start justify-between gap-6 rounded-md border border-gray-200 bg-white p-4 max-w-[600px]">
                        <div>
                            <Label className="text-sm font-medium text-[#101828] mb-0">
                                Active for purchasing
                            </Label>
                            <p className="text-[12px] text-[#667085] mt-1">
                                Inactive items are hidden from purchase logs and
                                automatic stock deduction.
                            </p>
                        </div>
                        <Switch
                            checked={form.isActive}
                            onCheckedChange={(checked) =>
                                updateForm('isActive', checked)
                            }
                        />
                    </div>
                )}
            </section>

            <div className="flex gap-3 pt-2 max-w-[600px]">
                <Button
                    type="submit"
                    disabled={isLoading || !isFormValid}
                    className="bg-orion-blue hover:bg-orion-blue/90 text-white font-medium flex-1 h-9 rounded-sm text-sm disabled:opacity-50"
                >
                    {isLoading
                        ? mode === 'edit'
                            ? 'Saving...'
                            : 'Adding...'
                        : mode === 'edit'
                          ? 'Save Changes'
                          : 'Add Item'}
                </Button>
                <Button
                    type="button"
                    onClick={onCancel}
                    variant="ghost"
                    className="bg-muted hover:bg-muted/80 text-foreground font-medium flex-1 h-9 rounded-sm text-sm"
                >
                    {mode === 'edit' ? 'Cancel' : 'Cancel Item'}
                </Button>
            </div>
        </form>
    );
}
