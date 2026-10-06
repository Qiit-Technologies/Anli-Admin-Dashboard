'use client';

import React, { useEffect, useMemo, useState } from 'react';
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
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Pencil, Plus, Trash2 } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { getStaffList } from '@/app/actions/staff';
import { useHotelServicesContext } from '@/context/HotelServicesContext';
import { useItemsContext } from '@/context/ItemsContext';
import { findItemOption, getPurchasableItems } from '@/lib/item-list';
import { StockItemSearchSelect } from '@/components/stock/Form/StockItemSearchSelect';
import useSWR from 'swr';

interface PurchaseLogFormProps {
    onSubmit: (_data: any) => void;
    onCancel: () => void;
    isLoading?: boolean;
    hideButtons?: boolean;
}

type LineItem = {
    key: string;
    itemId: string;
    itemName: string;
    module: string;
    outerQuantity: string;
    costPriceOuter: string;
    supplierName: string;
    portionRate: number;
    outerUnit: string;
    baseUnit: string;
};

const emptyDraft = (): Omit<
    LineItem,
    'key' | 'itemName' | 'portionRate' | 'outerUnit' | 'baseUnit'
> => ({
    itemId: '',
    module: '',
    outerQuantity: '',
    costPriceOuter: '',
    supplierName: '',
});

const calcLine = (
    outerQty: number,
    outerPrice: number,
    conversionRate: number,
) => {
    const rate = conversionRate > 0 ? conversionRate : 1;
    const baseQuantity = outerQty * rate;
    const costPriceBase = rate > 0 ? outerPrice / rate : 0;
    const lineTotal = outerPrice * outerQty;
    const inventoryValue = baseQuantity * costPriceBase;
    return {
        baseQuantity,
        costPriceBase,
        lineTotal,
        inventoryValue,
    };
};

const PurchaseLogForm: React.FC<PurchaseLogFormProps> = ({
    onSubmit,
    onCancel,
    isLoading,
    hideButtons = false,
}) => {
    const { itemsList, isLoading: itemsLoading } = useItemsContext();
    const { data: staffData, isLoading: staffLoading } = useSWR(
        '/staff-list',
        () => getStaffList(1, 1000),
    );
    const { hotelServices } = useHotelServicesContext();

    const staffList: any[] = useMemo(
        () =>
            (staffData?.data || []).filter((staff: any) =>
                Number.isFinite(Number(staff?.id)),
            ),
        [staffData?.data],
    );

    const [date, setDate] = useState<Date | undefined>(new Date());
    const [receivedBy, setReceivedBy] = useState('');
    const [remarks, setRemarks] = useState('');
    const [miscExpense, setMiscExpense] = useState('');
    const [lines, setLines] = useState<LineItem[]>([]);
    const [draft, setDraft] = useState(emptyDraft());
    const [editingKey, setEditingKey] = useState<string | null>(null);

    useEffect(() => {
        if (!receivedBy && staffList.length > 0) {
            setReceivedBy(String(staffList[0].id));
        }
    }, [receivedBy, staffList]);

    const purchasableItems = useMemo(
        () => getPurchasableItems(itemsList),
        [itemsList],
    );

    const selectedItem = useMemo(
        () => findItemOption(purchasableItems, draft.itemId),
        [draft.itemId, purchasableItems],
    );

    const conversionRate = Number(selectedItem?.portionRate) || 1;

    const draftCalcs = useMemo(() => {
        const outerQty = Number(draft.outerQuantity) || 0;
        const outerPrice = Number(draft.costPriceOuter) || 0;
        return calcLine(outerQty, outerPrice, conversionRate);
    }, [conversionRate, draft.outerQuantity, draft.costPriceOuter]);

    const lineTotals = useMemo(() => {
        return lines.map((line) => {
            const item = findItemOption(purchasableItems, line.itemId);
            const rate =
                Number(line.portionRate) ||
                Number(item?.portionRate) ||
                1;
            const outerQty = Number(line.outerQuantity) || 0;
            const outerPrice = Number(line.costPriceOuter) || 0;
            const calcs = calcLine(outerQty, outerPrice, rate);
            return {
                ...line,
                ...calcs,
            };
        });
    }, [lines, purchasableItems]);

    const itemsSubtotal = lineTotals.reduce((sum, l) => sum + l.lineTotal, 0);
    const inventoryValueTotal = lineTotals.reduce(
        (sum, l) => sum + l.inventoryValue,
        0,
    );
    const misc = Number(miscExpense) || 0;
    const grandTotal = itemsSubtotal + misc;

    const canAddLine =
        Boolean(draft.itemId) &&
        Boolean(selectedItem) &&
        Boolean(draft.module) &&
        Number(draft.outerQuantity) > 0 &&
        Number(draft.costPriceOuter) >= 0;

    const handleItemSelect = (itemId: string) => {
        const item = findItemOption(purchasableItems, itemId);
        setDraft((prev) => ({
            ...prev,
            itemId,
            costPriceOuter:
                prev.costPriceOuter ||
                (item?.costPriceOuter
                    ? String(item.costPriceOuter)
                    : prev.costPriceOuter),
            module: prev.module || item?.itemLocation || prev.module,
        }));
    };

    const addLine = () => {
        if (!canAddLine || !selectedItem) return;
        const nextLine: LineItem = {
            key: editingKey || `${Date.now()}-${draft.itemId}`,
            itemId: draft.itemId,
            itemName: selectedItem.label || 'Item',
            module: draft.module,
            outerQuantity: draft.outerQuantity,
            costPriceOuter: draft.costPriceOuter,
            supplierName: draft.supplierName,
            portionRate: conversionRate,
            outerUnit: selectedItem.outerUnit || 'Unit',
            baseUnit:
                selectedItem.baseUnit ||
                selectedItem.unitOfMeasurement ||
                'Pcs',
        };

        setLines((prev) =>
            editingKey
                ? prev.map((line) =>
                      line.key === editingKey ? nextLine : line,
                  )
                : [...prev, nextLine],
        );
        setEditingKey(null);
        setDraft(emptyDraft());
    };

    const editLine = (key: string) => {
        const line = lines.find((l) => l.key === key);
        if (!line) return;
        setEditingKey(key);
        setDraft({
            itemId: line.itemId,
            module: line.module,
            outerQuantity: line.outerQuantity,
            costPriceOuter: line.costPriceOuter,
            supplierName: line.supplierName,
        });
    };

    const cancelEdit = () => {
        setEditingKey(null);
        setDraft(emptyDraft());
    };

    const removeLine = (key: string) => {
        if (editingKey === key) cancelEdit();
        setLines((prev) => prev.filter((l) => l.key !== key));
    };

    const hasReceiverSelection = Boolean(receivedBy) || staffList.length === 0;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!lines.length || !hasReceiverSelection || !date) return;

        const formattedDate = date.toISOString().split('T')[0];

        const receivedById = Number(receivedBy);
        const resolvedReceivedById = Number.isFinite(receivedById)
            ? receivedById
            : undefined;

        onSubmit({
            purchaseDate: formattedDate,
            items: lines.map((line) => ({
                itemId: Number(line.itemId),
                itemLocation: line.module || 'store',
                quantityOuter: Number(line.outerQuantity) || 0,
                costPerOuter: Number(line.costPriceOuter) || 0,
                quantityBase:
                    Number(line.outerQuantity) *
                    (Number(line.portionRate) || 1),
                supplierName: line.supplierName || undefined,
            })),
            receivedById: resolvedReceivedById,
            miscellaneousExpense: misc > 0 ? misc : undefined,
            remarks: remarks.trim() || undefined,
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label className="text-sm">
                        Date <span className="text-destructive">*</span>
                    </Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                className={cn(
                                    'w-full h-9 rounded-sm justify-start text-left font-normal text-sm',
                                    !date && 'text-muted-foreground',
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {date
                                    ? format(date, 'dd/MM/yyyy')
                                    : 'Pick a date'}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={date}
                                onSelect={setDate}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                </div>

                <div className="space-y-2">
                    <Label className="text-sm">
                        Received By <span className="text-destructive">*</span>
                    </Label>
                    <Select value={receivedBy} onValueChange={setReceivedBy}>
                        <SelectTrigger className="h-9 rounded-sm text-sm">
                            <SelectValue
                                placeholder={
                                    staffLoading ? 'Loading…' : 'Select staff'
                                }
                            />
                        </SelectTrigger>
                        <SelectContent>
                            {staffList.map((opt: any) => (
                                <SelectItem key={opt.id} value={String(opt.id)}>
                                    {opt.fullName}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="rounded-md border bg-muted/30 p-4 space-y-3">
                <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">
                        {editingKey ? 'Edit purchased item' : 'Add purchased items'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                        {editingKey
                            ? 'Update the values and save the change'
                            : 'Search and add multiple items before saving'}
                    </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2 col-span-2">
                        <StockItemSearchSelect
                            id="purchase-log-item"
                            label="Item"
                            required
                            options={purchasableItems.map((item) => ({
                                value: item.value,
                                label: item.label,
                            }))}
                            value={draft.itemId}
                            onValueChange={(selectedValue) => {
                                if (selectedValue) {
                                    handleItemSelect(selectedValue);
                                } else {
                                    setDraft((prev) => ({ ...prev, itemId: '' }));
                                }
                            }}
                            placeholder={
                                itemsLoading
                                    ? 'Loading items...'
                                    : 'Type to search inventory items...'
                            }
                            emptyText={
                                itemsLoading
                                    ? 'Loading items...'
                                    : 'No matching active inventory items'
                            }
                        />
                        {selectedItem ? (
                            <p className="text-xs text-muted-foreground">
                                {selectedItem.outerUnit || 'Outer'} →{' '}
                                {selectedItem.baseUnit ||
                                    selectedItem.unitOfMeasurement ||
                                    'Base'}{' '}
                                · Conversion {conversionRate}
                                {selectedItem.category
                                    ? ` · ${selectedItem.category}`
                                    : ''}
                            </p>
                        ) : null}
                    </div>

                    <div className="space-y-2">
                        <Label className="text-sm">
                            Department{' '}
                            <span className="text-destructive">*</span>
                        </Label>
                        <Select
                            value={draft.module}
                            onValueChange={(v) =>
                                setDraft((prev) => ({ ...prev, module: v }))
                            }
                        >
                            <SelectTrigger className="h-9 rounded-sm bg-white text-sm">
                                <SelectValue placeholder="Select department" />
                            </SelectTrigger>
                            <SelectContent>
                                {hotelServices.map((service: any) => (
                                    <SelectItem
                                        key={service.value}
                                        value={service.value}
                                    >
                                        {service.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-sm">Supplier (optional)</Label>
                        <Input
                            className="h-9 rounded-sm bg-white text-sm"
                            placeholder="Vendor name"
                            value={draft.supplierName}
                            onChange={(e) =>
                                setDraft((prev) => ({
                                    ...prev,
                                    supplierName: e.target.value,
                                }))
                            }
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-sm">
                            Qty (outer){' '}
                            <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            type="number"
                            min={0}
                            step="any"
                            className="h-9 rounded-sm bg-white text-sm"
                            value={draft.outerQuantity}
                            onChange={(e) =>
                                setDraft((prev) => ({
                                    ...prev,
                                    outerQuantity: e.target.value,
                                }))
                            }
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-sm">
                            Cost / outer (₦){' '}
                            <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            type="number"
                            min={0}
                            step="any"
                            className="h-9 rounded-sm bg-white text-sm"
                            value={draft.costPriceOuter}
                            onChange={(e) =>
                                setDraft((prev) => ({
                                    ...prev,
                                    costPriceOuter: e.target.value,
                                }))
                            }
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-sm">Qty (base)</Label>
                        <Input
                            className="h-9 rounded-sm bg-gray-100 text-sm"
                            value={
                                draftCalcs.baseQuantity
                                    ? draftCalcs.baseQuantity.toLocaleString()
                                    : ''
                            }
                            readOnly
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-sm">Cost / base (₦)</Label>
                        <Input
                            className="h-9 rounded-sm bg-gray-100 text-sm"
                            value={draftCalcs.costPriceBase.toFixed(2)}
                            readOnly
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-sm">Line total (₦)</Label>
                        <Input
                            className="h-9 rounded-sm bg-gray-100 text-sm"
                            value={draftCalcs.lineTotal.toFixed(2)}
                            readOnly
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-sm">Inventory value (₦)</Label>
                        <Input
                            className="h-9 rounded-sm bg-gray-100 text-sm"
                            value={draftCalcs.inventoryValue.toFixed(2)}
                            readOnly
                        />
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        className="flex-1 h-9 rounded-sm"
                        disabled={!canAddLine}
                        onClick={addLine}
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        {editingKey ? 'Save changes' : 'Add Item (+)'}
                    </Button>
                    {editingKey && (
                        <Button
                            type="button"
                            variant="secondary"
                            className="h-9 rounded-sm"
                            onClick={cancelEdit}
                        >
                            Cancel edit
                        </Button>
                    )}
                </div>
            </div>

            <div className="rounded-md border overflow-hidden">
                <div className="px-3 py-2 bg-gray-50 border-b text-sm font-medium">
                    Selected items ({lines.length})
                </div>
                {lineTotals.length === 0 ? (
                    <p className="p-4 text-sm text-muted-foreground">
                        No items added yet. Search and add items above.
                    </p>
                ) : (
                    <div className="divide-y max-h-56 overflow-y-auto">
                        {lineTotals.map((line) => (
                            <div
                                key={line.key}
                                className={cn(
                                    'flex items-center justify-between gap-3 px-3 py-2.5 text-sm',
                                    editingKey === line.key && 'bg-blue-50/60',
                                )}
                            >
                                <div className="min-w-0">
                                    <p className="font-medium truncate">
                                        {line.itemName}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {line.module} · Qty {line.outerQuantity}{' '}
                                        {line.outerUnit} (
                                        {line.baseQuantity.toLocaleString()}{' '}
                                        {line.baseUnit}) · ₦
                                        {Number(
                                            line.costPriceOuter,
                                        ).toLocaleString()}
                                        {line.supplierName
                                            ? ` · ${line.supplierName}`
                                            : ''}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-0.5 tabular-nums">
                                        Cost/base ₦
                                        {line.costPriceBase.toFixed(2)} ·
                                        Inventory value ₦
                                        {line.inventoryValue.toLocaleString()}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <span className="tabular-nums font-medium">
                                        ₦{line.lineTotal.toLocaleString()}
                                    </span>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8"
                                        aria-label="Edit item"
                                        onClick={() => editLine(line.key)}
                                    >
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-red-500"
                                        aria-label="Remove item"
                                        onClick={() => removeLine(line.key)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                <div className="border-t bg-white px-3 py-3 space-y-1 text-sm">
                    <div className="flex justify-between text-muted-foreground">
                        <span>Items subtotal</span>
                        <span>₦{itemsSubtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                        <span>Inventory value</span>
                        <span>₦{inventoryValueTotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                        <span>Miscellaneous</span>
                        <span>₦{misc.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-base pt-1">
                        <span>Grand total</span>
                        <span>₦{grandTotal.toLocaleString()}</span>
                    </div>
                </div>
            </div>

            <div className="rounded-md border bg-card p-4 space-y-4">
                <div>
                    <p className="text-sm font-medium">Transaction details</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        Enter after all purchased items have been added
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label className="text-sm">
                            Miscellaneous Expense (₦)
                        </Label>
                        <Input
                            type="number"
                            min={0}
                            placeholder="e.g. transport"
                            className="h-9 rounded-sm text-sm"
                            value={miscExpense}
                            onChange={(e) => setMiscExpense(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-sm">Remarks</Label>
                        <Input
                            placeholder="Notes for this market run"
                            className="h-9 rounded-sm text-sm"
                            value={remarks}
                            onChange={(e) => setRemarks(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {!hideButtons && (
                <div className="flex items-center gap-4 pt-2">
                    <Button
                        type="button"
                        variant="secondary"
                        className="flex-1 h-9 rounded-sm"
                        onClick={onCancel}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        className="flex-1 h-9 rounded-sm bg-orion-blue hover:bg-orion-blue/90 text-white"
                        disabled={
                            isLoading ||
                            lines.length === 0 ||
                            !hasReceiverSelection ||
                            !date
                        }
                    >
                        {isLoading
                            ? 'Saving…'
                            : `Save Purchase Log (${lines.length} items)`}
                    </Button>
                </div>
            )}
        </form>
    );
};

export default PurchaseLogForm;
