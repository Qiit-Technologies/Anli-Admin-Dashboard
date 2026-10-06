'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import useSWR from 'swr';
import { getStaffList } from '@/app/actions/staff';
import { useHotelServicesContext } from '@/context/HotelServicesContext';
import { useItemsContext } from '@/context/ItemsContext';
import { findItemOption, type ItemOption } from '@/lib/item-list';
import { OTPInput } from '@/components/front-of-house/tables/OTPInput';
import { StockItemSearchSelect } from './StockItemSearchSelect';

interface LogBadStockFormProps {
    onSubmit?: (data: any) => void;
    onCancel: () => void;
    isLoading?: boolean;
    hideButtons?: boolean;
}

type SpoilageLine = {
    key: string;
    itemId: string;
    itemName: string;
    quantity: string;
    unit: string;
    category: string;
    unitCost: number;
    estimatedValue: number;
};

const SpoilageLineBuilder = ({
    itemOptions,
    itemsLoading,
    selectedItem,
    draftItemId,
    draftQty,
    draftValue,
    remainingQuantity,
    exceedsStock,
    canCommitLine,
    isEditing,
    onItemChange,
    onQtyChange,
    onCommit,
    onCancelEdit,
}: {
    itemOptions: { value: string; label: string }[];
    itemsLoading: boolean;
    selectedItem: ItemOption | null;
    draftItemId: string;
    draftQty: string;
    draftValue: number;
    remainingQuantity: number;
    exceedsStock: boolean;
    canCommitLine: boolean;
    isEditing: boolean;
    onItemChange: (_value: string) => void;
    onQtyChange: (_value: string) => void;
    onCommit: () => void;
    onCancelEdit: () => void;
}) => (
    <div className="rounded-md border bg-muted/30 p-4 space-y-3">
        <p className="text-sm font-medium">
            {isEditing
                ? 'Edit spoiled / damaged item'
                : 'Add spoiled / damaged items'}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2">
                <StockItemSearchSelect
                    id="spoilage-item"
                    label="Item"
                    required
                    options={itemOptions}
                    value={draftItemId}
                    onValueChange={onItemChange}
                    placeholder={
                        itemsLoading
                            ? 'Loading items...'
                            : 'Type to search inventory items...'
                    }
                    emptyText={
                        itemsLoading
                            ? 'Loading items...'
                            : 'No matching inventory items'
                    }
                />
            </div>
            <div className="space-y-2">
                <Label className="text-sm">
                    Qty affected <span className="text-red-500">*</span>
                </Label>
                <Input
                    type="number"
                    min={0}
                    step="any"
                    className={cn(
                        'h-9 rounded-sm bg-white text-sm',
                        exceedsStock && 'border-red-500',
                    )}
                    placeholder="0"
                    value={draftQty}
                    onChange={(e) => onQtyChange(e.target.value)}
                />
            </div>
        </div>
        {selectedItem ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-muted-foreground">
                <p>
                    Unit:{' '}
                    <span className="text-foreground font-medium">
                        {selectedItem.baseUnit ||
                            selectedItem.unitOfMeasurement ||
                            '—'}
                    </span>
                </p>
                <p>
                    Category:{' '}
                    <span className="text-foreground font-medium">
                        {selectedItem.category || '—'}
                    </span>
                </p>
                <p>
                    In stock:{' '}
                    <span className="text-foreground font-medium">
                        {remainingQuantity.toLocaleString()}
                    </span>
                </p>
                <p>
                    Value lost:{' '}
                    <span className="text-foreground font-medium">
                        ₦{draftValue.toLocaleString()}
                    </span>
                </p>
            </div>
        ) : null}
        {exceedsStock ? (
            <p className="text-xs text-red-500">
                Only {remainingQuantity.toLocaleString()} available for this
                item.
            </p>
        ) : null}
        <div className="flex items-center gap-2">
            <Button
                type="button"
                variant="outline"
                className="flex-1 h-9 rounded-sm"
                disabled={!canCommitLine}
                onClick={onCommit}
            >
                <Plus className="h-4 w-4 mr-2" />
                {isEditing ? 'Save changes' : 'Add Item (+)'}
            </Button>
            {isEditing ? (
                <Button
                    type="button"
                    variant="secondary"
                    className="h-9 rounded-sm"
                    onClick={onCancelEdit}
                >
                    Cancel edit
                </Button>
            ) : null}
        </div>
    </div>
);

const SpoilageLinesList = ({
    lines,
    editingKey,
    totalValueLost,
    onEdit,
    onRemove,
}: {
    lines: SpoilageLine[];
    editingKey: string | null;
    totalValueLost: number;
    onEdit: (_key: string) => void;
    onRemove: (_key: string) => void;
}) => (
    <div className="rounded-md border overflow-hidden">
        <div className="px-3 py-2 bg-gray-50 border-b text-sm font-medium">
            Selected items ({lines.length})
        </div>
        {lines.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground">
                Add one or more items discovered during this inspection.
            </p>
        ) : (
            <div className="divide-y max-h-48 overflow-y-auto">
                {lines.map((line) => (
                    <div
                        key={line.key}
                        className={cn(
                            'flex items-center justify-between gap-2 px-3 py-2 text-sm',
                            editingKey === line.key && 'bg-blue-50/60',
                        )}
                    >
                        <div className="min-w-0">
                            <p className="font-medium truncate">
                                {line.itemName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {`Qty ${line.quantity} ${line.unit}`}
                                {line.category ? ` · ${line.category}` : ''}
                                {` · ₦${line.unitCost.toLocaleString()}/${line.unit || 'unit'}`}
                            </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                            <span className="tabular-nums">
                                ₦{line.estimatedValue.toLocaleString()}
                            </span>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                aria-label="Edit item"
                                onClick={() => onEdit(line.key)}
                            >
                                <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-red-500"
                                aria-label="Remove item"
                                onClick={() => onRemove(line.key)}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        )}
        <div className="border-t px-3 py-2 flex justify-between text-sm font-semibold">
            <span>Est. value lost</span>
            <span>₦{totalValueLost.toLocaleString()}</span>
        </div>
    </div>
);

const ManagerPinApproval = ({
    pin,
    onPinChange,
    canSubmit,
    isLoading,
    onBack,
    onApprove,
    onSubmitForApproval,
}: {
    pin: string;
    onPinChange: (_pin: string) => void;
    canSubmit: boolean;
    isLoading: boolean;
    onBack: () => void;
    onApprove: () => void;
    onSubmitForApproval: () => void;
}) => (
    <div className="rounded-md border bg-muted/30 px-4 py-3">
        <p className="text-sm font-medium mb-1">Manager PIN approval</p>
        <p className="text-xs text-muted-foreground mb-2">
            Enter a manager’s 4-digit PIN to approve and update inventory
            immediately.
        </p>
        <OTPInput length={4} value={pin} onChange={onPinChange} />
        <div className="flex gap-2 mt-3">
            <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={onBack}
            >
                Back
            </Button>
            <Button
                type="button"
                className="flex-1 bg-orion-blue text-white"
                disabled={!canSubmit || isLoading || pin.length !== 4}
                onClick={onApprove}
            >
                {isLoading ? 'Approving…' : 'Approve & Update Inventory'}
            </Button>
        </div>
        <Button
            type="button"
            variant="ghost"
            className="w-full mt-2 h-9 text-muted-foreground"
            disabled={!canSubmit || isLoading}
            onClick={onSubmitForApproval}
        >
            Submit for pending approval instead
        </Button>
    </div>
);

const LogBadStockForm = ({
    onSubmit,
    onCancel,
    isLoading,
    hideButtons = false,
}: LogBadStockFormProps) => {
    const { itemsList, isLoading: itemsLoading } = useItemsContext();
    const { data: staffData } = useSWR('/staff-list', () =>
        getStaffList(1, 1000),
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
    const [department, setDepartment] = useState('');
    const [discoveredBy, setDiscoveredBy] = useState('');
    const [reason, setReason] = useState('');
    const [reasonOther, setReasonOther] = useState('');
    const [remarks, setRemarks] = useState('');
    const [lines, setLines] = useState<SpoilageLine[]>([]);
    const [draftItemId, setDraftItemId] = useState('');
    const [draftQty, setDraftQty] = useState('');
    const [editingKey, setEditingKey] = useState<string | null>(null);
    const [showPinApproval, setShowPinApproval] = useState(false);
    const [managerPin, setManagerPin] = useState('');

    useEffect(() => {
        if (!discoveredBy && staffList.length > 0) {
            setDiscoveredBy(String(staffList[0].id));
        }
    }, [discoveredBy, staffList]);

    const itemOptions = useMemo(
        () =>
            (itemsList || []).map((item) => ({
                value: item.value,
                label: item.label,
            })),
        [itemsList],
    );

    const selectedItem = useMemo(
        () => findItemOption(itemsList, draftItemId),
        [draftItemId, itemsList],
    );

    /** Write-offs are valued at cost, not at the selling price. */
    const unitCost = useMemo(() => {
        if (!selectedItem) return 0;
        return Number(selectedItem.costPrice) || Number(selectedItem.price) || 0;
    }, [selectedItem]);

    const availableQuantity = Number(selectedItem?.quantity) || 0;

    /** Stock already committed to other lines can't be spoiled twice. */
    const quantityOnOtherLines = useMemo(
        () =>
            lines
                .filter(
                    (line) =>
                        line.itemId === draftItemId && line.key !== editingKey,
                )
                .reduce((sum, line) => sum + (Number(line.quantity) || 0), 0),
        [lines, draftItemId, editingKey],
    );

    const remainingQuantity = Math.max(
        0,
        availableQuantity - quantityOnOtherLines,
    );

    const draftQtyValue = Number(draftQty) || 0;
    const exceedsStock = Boolean(
        selectedItem && draftQtyValue > remainingQuantity,
    );

    const draftValue = useMemo(
        () => unitCost * draftQtyValue,
        [unitCost, draftQtyValue],
    );

    const totalValueLost = lines.reduce((sum, l) => sum + l.estimatedValue, 0);

    const canCommitLine =
        Boolean(selectedItem) && draftQtyValue > 0 && !exceedsStock;

    const resetDraft = () => {
        setDraftItemId('');
        setDraftQty('');
        setEditingKey(null);
    };

    const addLine = () => {
        if (!canCommitLine || !selectedItem) return;
        const category =
            typeof selectedItem.category === 'string'
                ? selectedItem.category
                : '';
        const nextLine: SpoilageLine = {
            key: editingKey || `${Date.now()}-${draftItemId}`,
            itemId: draftItemId,
            itemName: selectedItem.label || 'Item',
            quantity: draftQty,
            unit:
                selectedItem.baseUnit || selectedItem.unitOfMeasurement || '',
            category,
            unitCost,
            estimatedValue: unitCost * draftQtyValue,
        };

        setLines((prev) =>
            editingKey
                ? prev.map((line) =>
                      line.key === editingKey ? nextLine : line,
                  )
                : [...prev, nextLine],
        );
        resetDraft();
    };

    const editLine = (key: string) => {
        const line = lines.find((l) => l.key === key);
        if (!line) return;
        setEditingKey(key);
        setDraftItemId(line.itemId);
        setDraftQty(line.quantity);
    };

    const removeLine = (key: string) => {
        if (editingKey === key) resetDraft();
        setLines((prev) => prev.filter((l) => l.key !== key));
    };

    const canSubmit =
        lines.length > 0 &&
        Boolean(department) &&
        Boolean(reason) &&
        Boolean(date) &&
        (reason !== 'OTHER' || Boolean(reasonOther.trim()));

    const submit = (pin?: string) => {
        if (!onSubmit || !canSubmit) return;
        onSubmit({
            date,
            department,
            discoveredBy,
            reason,
            reasonOther: reason === 'OTHER' ? reasonOther.trim() : undefined,
            remarks,
            managerPin: pin,
            items: lines.map((line) => ({
                itemId: Number(line.itemId),
                quantity: Number(line.quantity),
            })),
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!canSubmit) return;
        setShowPinApproval(true);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label className="text-xs font-bold">
                        Date <span className="text-red-500">*</span>
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
                    <Label className="text-xs font-bold">
                        Department <span className="text-red-500">*</span>
                    </Label>
                    <Select value={department} onValueChange={setDepartment}>
                        <SelectTrigger className="h-9 rounded-sm text-sm">
                            <SelectValue placeholder="Select Department" />
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
                    <Label className="text-xs font-bold">
                        Reason <span className="text-red-500">*</span>
                    </Label>
                    <Select value={reason} onValueChange={setReason}>
                        <SelectTrigger className="h-9 rounded-sm text-sm">
                            <SelectValue placeholder="Select reason" />
                        </SelectTrigger>
                        <SelectContent>
                            {[
                                'DAMAGED',
                                'EXPIRED',
                                'SPOILED',
                                'WASTED',
                                'OTHER',
                            ].map((r) => (
                                <SelectItem key={r} value={r}>
                                    {r}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label className="text-xs font-bold">Discovered By</Label>
                    <Select
                        value={discoveredBy}
                        onValueChange={setDiscoveredBy}
                    >
                        <SelectTrigger className="h-9 rounded-sm text-sm">
                            <SelectValue placeholder="Select staff" />
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

            <SpoilageLineBuilder
                itemOptions={itemOptions}
                itemsLoading={Boolean(itemsLoading)}
                selectedItem={selectedItem}
                draftItemId={draftItemId}
                draftQty={draftQty}
                draftValue={draftValue}
                remainingQuantity={remainingQuantity}
                exceedsStock={exceedsStock}
                canCommitLine={canCommitLine}
                isEditing={Boolean(editingKey)}
                onItemChange={setDraftItemId}
                onQtyChange={setDraftQty}
                onCommit={addLine}
                onCancelEdit={resetDraft}
            />

            <SpoilageLinesList
                lines={lines}
                editingKey={editingKey}
                totalValueLost={totalValueLost}
                onEdit={editLine}
                onRemove={removeLine}
            />

            {reason === 'OTHER' ? (
                <div className="space-y-2">
                    <Label className="text-xs font-bold">
                        Specify reason <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        className="h-9 rounded-sm text-sm"
                        placeholder="Describe why the stock was written off"
                        value={reasonOther}
                        onChange={(e) => setReasonOther(e.target.value)}
                    />
                </div>
            ) : null}

            <div className="space-y-2">
                <Label className="text-xs font-bold">Remarks</Label>
                <Textarea
                    placeholder="Optional notes"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                />
            </div>

            {showPinApproval ? (
                <ManagerPinApproval
                    pin={managerPin}
                    onPinChange={setManagerPin}
                    canSubmit={canSubmit}
                    isLoading={Boolean(isLoading)}
                    onBack={() => {
                        setShowPinApproval(false);
                        setManagerPin('');
                    }}
                    onApprove={() => submit(managerPin)}
                    onSubmitForApproval={() => submit()}
                />
            ) : null}

            {!hideButtons && !showPinApproval ? (
                <div className="flex flex-col sm:flex-row gap-2 pt-2">
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
                        className="flex-1 h-9 rounded-sm bg-orion-blue text-white"
                        disabled={!canSubmit || isLoading}
                    >
                        Continue to Manager PIN
                    </Button>
                </div>
            ) : null}
        </form>
    );
};

export default LogBadStockForm;
