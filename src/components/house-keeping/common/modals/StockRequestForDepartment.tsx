'use client';

import { createStockRequestItems } from '@/app/actions/inventory';
import { fetchItems } from '@/app/actions/items';
import { getStaffByDepartment } from '@/app/actions/staff';
import { OTPInput } from '@/components/front-of-house/tables/OTPInput';
import Toast from '@/components/toast';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { StockItemSearchSelect } from '@/components/stock/Form/StockItemSearchSelect';
import { cn } from '@/lib/utils';
import { Item } from '@/types';
import { Divider } from '@heroui/react';
import { Check, Minus, Plus, Trash2 } from 'lucide-react';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import useSWR, { mutate } from 'swr';
import { itemOrderCheckedIllustration } from '../illustrations';

interface InventoryCardProps {
    className?: string;
}

export interface ItemRequest {
    id: string;
    itemId: string;
    itemName: string;
    quantity: string;
}

const departments = [
    { id: 'House Keeping', name: 'housekeeping' },
    { id: 'Stock', name: 'stock' },
    { id: 'Front Office', name: 'frontoffice' },
    { id: 'Kitchen', name: 'kitchen' },
    { id: 'Bar', name: 'bar' },
    { id: 'Front of House', name: 'frontofhouse' },
    { id: 'Account', name: 'account' },
    { id: 'Banquet', name: 'banquet' },
];

function availableQty(item?: Item): number {
    if (!item) return 0;
    const qty = Number(item.quantity ?? item.currentStock ?? 0);
    return Number.isFinite(qty) ? qty : 0;
}

const StockRequestForDepartmentDialog = ({ className }: InventoryCardProps) => {
    const [open, setOpen] = useState(false);
    const [formState, setFormState] = useState<'input' | 'success'>('input');
    const [selectedItems, setSelectedItems] = useState<ItemRequest[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const [items, setItems] = useState<Item[]>([]);
    const [selectedDepartment, setSelectedDepartment] = useState('');
    const [selectedOfficer, setSelectedOfficer] = useState('');
    const [itemToAddId, setItemToAddId] = useState('');
    const [showPinApproval, setShowPinApproval] = useState(false);
    const [managerPin, setManagerPin] = useState('');
    const [pinApproved, setPinApproved] = useState(false);

    const [requests, setRequests] = useState<ItemRequest[]>([]);

    const { data: staffs } = useSWR(
        selectedDepartment
            ? `/staff/department?department=${selectedDepartment}`
            : null,
        () => getStaffByDepartment(selectedDepartment),
    );

    const itemOptions = useMemo(
        () =>
            items.map((item) => ({
                value: String(item.id),
                label: `${item.itemName} (${availableQty(item)} avail.)`,
            })),
        [items],
    );

    const canSubmit =
        Boolean(selectedDepartment) &&
        Boolean(selectedOfficer) &&
        requests.length > 0 &&
        requests.every((req) => req.itemId && Number(req.quantity) > 0) &&
        !requests.some((req) => {
            const item = items.find((i) => String(i.id) === req.itemId);
            return Number(req.quantity) > availableQty(item);
        });

    const submitRequests = async (pin?: string) => {
        if (!canSubmit) return;
        setSubmitting(true);
        try {
            const response = await createStockRequestItems(
                requests,
                selectedDepartment,
                selectedOfficer,
                pin,
            );
            if (
                response?.message ===
                    'Stock request items created successfully!' ||
                response?.message ===
                    'Stock request approved with manager PIN!'
            ) {
                setSelectedItems(requests);
                setPinApproved(Boolean(pin));
                toast.custom(() => (
                    <Toast
                        title="Success!"
                        description={response.message}
                        type="success"
                    />
                ));
                mutate(`/items/stock?department=${selectedDepartment}`);
                mutate('/items/pending');
                mutate('/items/stock/request/metrics');
                setFormState('success');
            } else {
                toast.custom(() => (
                    <Toast
                        title="Error!"
                        description={
                            response?.message ||
                            'Failed to create stock request'
                        }
                        type="error"
                    />
                ));
            }
        } catch {
            toast.custom(() => (
                <Toast
                    title="Error!"
                    description="An unexpected error occurred"
                    type="error"
                />
            ));
        } finally {
            setSubmitting(false);
        }
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        await submitRequests();
    };

    const handlePinApprove = async () => {
        if (managerPin.length !== 4) {
            toast.custom(() => (
                <Toast
                    title="Error!"
                    description="Enter a 4-digit manager PIN"
                    type="error"
                />
            ));
            return;
        }
        await submitRequests(managerPin);
    };

    const resetForm = () => {
        setFormState('input');
        setRequests([]);
        setSelectedDepartment('');
        setSelectedOfficer('');
        setItemToAddId('');
        setShowPinApproval(false);
        setManagerPin('');
        setPinApproved(false);
        setSelectedItems([]);
    };

    const closeDialog = () => {
        setOpen(false);
        setTimeout(resetForm, 300);
    };

    const addItem = (item: Item) => {
        const existing = requests.find((r) => r.itemId === String(item.id));
        if (existing) {
            setRequests(
                requests.map((r) =>
                    r.id === existing.id
                        ? {
                              ...r,
                              quantity: String(Number(r.quantity || 0) + 1),
                          }
                        : r,
                ),
            );
        } else {
            setRequests([
                ...requests,
                {
                    id: `${Date.now()}-${item.id}`,
                    itemId: String(item.id),
                    itemName: item.itemName,
                    quantity: '1',
                },
            ]);
        }
        setItemToAddId('');
    };

    const removeItem = (id: string) => {
        setRequests(requests.filter((item) => item.id !== id));
    };

    const adjustQuantity = (id: string, delta: number) => {
        setRequests(
            requests.map((req) => {
                if (req.id !== id) return req;
                const next = Math.max(1, Number(req.quantity || 1) + delta);
                return { ...req, quantity: String(next) };
            }),
        );
    };

    useEffect(() => {
        const fetchItem = async () => {
            const result = (await fetchItems()) as {
                data?: { statusCode?: number; data?: Item[] };
            };
            if ((result.data?.statusCode ?? 0) > 400) return;
            setItems(result.data?.data ?? []);
        };
        fetchItem();
    }, []);

    return (
        <>
            <Button
                onClick={() => setOpen(true)}
                className={cn(
                    className,
                    'bg-orion-blue hover:bg-orion-blue px-6 text-white h-10 rounded-md',
                )}
            >
                Collect Items
            </Button>

            <Dialog
                open={open}
                onOpenChange={(next) => {
                    if (!next) closeDialog();
                    else setOpen(true);
                }}
            >
                <DialogTitle className="sr-only">Collect Items Form</DialogTitle>
                <DialogContent className="rounded-lg w-[min(920px,95vw)] max-w-4xl px-0 transition-all duration-300">
                    {formState === 'input' ? (
                        <>
                            <DialogHeader className="px-6">
                                <DialogTitle className="text-base font-bold text-gray-900">
                                    Collecting Items
                                </DialogTitle>
                                <DialogDescription className="text-sm text-gray-500">
                                    Search and add items, review quantities,
                                    then submit or approve with a manager PIN.
                                </DialogDescription>
                            </DialogHeader>

                            <Divider />
                            <form className="px-6" onSubmit={handleSubmit}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                                    <div className="flex flex-col gap-1">
                                        <label
                                            htmlFor="stock-request-department"
                                            className="text-sm font-medium"
                                        >
                                            Requesting Department
                                        </label>
                                        <Select
                                            value={selectedDepartment}
                                            onValueChange={(value) => {
                                                setSelectedDepartment(value);
                                                setSelectedOfficer('');
                                            }}
                                        >
                                            <SelectTrigger
                                                id="stock-request-department"
                                                className="w-full focus:ring-brand"
                                            >
                                                <SelectValue placeholder="Select Department" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {departments.map((dept) => (
                                                    <SelectItem
                                                        key={dept.name}
                                                        value={dept.name}
                                                    >
                                                        {dept.id}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <label
                                            htmlFor="stock-request-officer"
                                            className="text-sm font-medium"
                                        >
                                            Requesting Officer
                                        </label>
                                        <Select
                                            disabled={!selectedDepartment}
                                            value={selectedOfficer}
                                            onValueChange={setSelectedOfficer}
                                        >
                                            <SelectTrigger
                                                id="stock-request-officer"
                                                className="w-full focus:ring-brand"
                                            >
                                                <SelectValue placeholder="Select Officer" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {staffs?.data?.map(
                                                    (staff: {
                                                        id: number;
                                                        fullName: string;
                                                    }) => (
                                                        <SelectItem
                                                            key={staff.id}
                                                            value={String(
                                                                staff.id,
                                                            )}
                                                        >
                                                            {staff.fullName}
                                                        </SelectItem>
                                                    ),
                                                )}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-1 mb-4">
                                    <StockItemSearchSelect
                                        id="stock-request-item-search"
                                        label="Search inventory items"
                                        options={itemOptions}
                                        value={itemToAddId}
                                        onValueChange={(value) => {
                                            setItemToAddId(value);
                                            const selectedItem = items.find(
                                                (item) => String(item.id) === value,
                                            );
                                            if (selectedItem) {
                                                addItem(selectedItem);
                                            }
                                        }}
                                        placeholder="Type an item name to add..."
                                        emptyText="No items found"
                                        className="space-y-1"
                                    />
                                </div>

                                <div className="border rounded-md overflow-hidden mb-4">
                                    <div className="bg-gray-50 px-3 py-2 text-sm font-medium text-gray-700 border-b">
                                        Selected items ({requests.length})
                                    </div>
                                    {requests.length === 0 ? (
                                        <div className="px-3 py-8 text-center text-sm text-muted-foreground">
                                            No items selected yet. Search above
                                            to add items.
                                        </div>
                                    ) : (
                                        <div className="max-h-[40vh] overflow-y-auto divide-y">
                                            {requests.map((request) => {
                                                const item = items.find(
                                                    (i) =>
                                                        String(i.id) ===
                                                        request.itemId,
                                                );
                                                const stock =
                                                    availableQty(item);
                                                const over =
                                                    Number(request.quantity) >
                                                    stock;
                                                return (
                                                    <div
                                                        key={request.id}
                                                        className="flex flex-wrap items-center gap-3 px-3 py-2.5"
                                                    >
                                                        <div className="min-w-[160px] flex-1">
                                                            <p className="text-sm font-medium text-gray-900">
                                                                {
                                                                    request.itemName
                                                                }
                                                            </p>
                                                            <p
                                                                className={cn(
                                                                    'text-xs',
                                                                    over
                                                                        ? 'text-red-500'
                                                                        : 'text-muted-foreground',
                                                                )}
                                                            >
                                                                {stock} available
                                                            </p>
                                                        </div>
                                                        <div className="flex items-center gap-1 border rounded-md">
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8"
                                                                onClick={() =>
                                                                    adjustQuantity(
                                                                        request.id,
                                                                        -1,
                                                                    )
                                                                }
                                                            >
                                                                <Minus className="h-3.5 w-3.5" />
                                                            </Button>
                                                            <span className="w-10 text-center text-sm tabular-nums">
                                                                {
                                                                    request.quantity
                                                                }
                                                            </span>
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8"
                                                                onClick={() =>
                                                                    adjustQuantity(
                                                                        request.id,
                                                                        1,
                                                                    )
                                                                }
                                                            >
                                                                <Plus className="h-3.5 w-3.5" />
                                                            </Button>
                                                        </div>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-red-500 hover:text-red-700"
                                                            onClick={() =>
                                                                removeItem(
                                                                    request.id,
                                                                )
                                                            }
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>

                                {showPinApproval ? (
                                    <div className="mb-4 rounded-md border bg-gray-50 px-4 py-3">
                                        <p className="text-sm font-medium text-gray-900 mb-1">
                                            Manager PIN approval
                                        </p>
                                        <p className="text-xs text-muted-foreground mb-2">
                                            Enter a manager’s 4-digit PIN to
                                            approve this request immediately.
                                        </p>
                                        <OTPInput
                                            length={4}
                                            value={managerPin}
                                            onChange={setManagerPin}
                                        />
                                        <div className="flex gap-2 mt-3">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                className="flex-1"
                                                onClick={() => {
                                                    setShowPinApproval(false);
                                                    setManagerPin('');
                                                }}
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                type="button"
                                                disabled={
                                                    !canSubmit ||
                                                    submitting ||
                                                    managerPin.length !== 4
                                                }
                                                className="flex-1 bg-orion-blue hover:bg-orion-blue text-white"
                                                onClick={handlePinApprove}
                                            >
                                                {submitting
                                                    ? 'Approving…'
                                                    : 'Approve with PIN'}
                                            </Button>
                                        </div>
                                    </div>
                                ) : null}

                                <DialogFooter className="mt-2">
                                    <div className="w-full flex flex-col sm:flex-row gap-2">
                                        {!showPinApproval ? (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                className="flex-1 border-orion-blue text-orion-blue"
                                                disabled={!canSubmit || submitting}
                                                onClick={() =>
                                                    setShowPinApproval(true)
                                                }
                                            >
                                                Approve with Manager PIN
                                            </Button>
                                        ) : null}
                                        <Button
                                            disabled={!canSubmit || submitting}
                                            type="submit"
                                            className="flex-1 bg-orion-blue hover:bg-orion-blue text-white"
                                        >
                                            {submitting
                                                ? 'Submitting…'
                                                : 'Submit for approval'}
                                        </Button>
                                    </div>
                                </DialogFooter>
                            </form>
                        </>
                    ) : (
                        <div className="flex items-center gap-3 text-center justify-center flex-col py-6 px-6">
                            <div className="text-green-500">
                                {itemOrderCheckedIllustration}
                            </div>
                            <div>
                                <h1 className="font-bold text-lg">
                                    {pinApproved
                                        ? 'Request approved'
                                        : 'Your order has been placed'}
                                </h1>
                                <p className="text-sm text-muted-foreground">
                                    {pinApproved
                                        ? 'Approved instantly with manager PIN. '
                                        : 'Submitted for approval. '}
                                    {selectedItems.length} item
                                    {selectedItems.length > 1 ? 's' : ''}{' '}
                                    requested.
                                </p>
                            </div>

                            <div className="w-full mt-3 mb-3">
                                <div className="p-3 bg-gray-50 rounded-md text-left">
                                    {selectedItems.map((item) => (
                                        <div
                                            key={item.id}
                                            className="flex justify-between items-center border-b border-gray-200 py-2 last:border-0"
                                        >
                                            <span className="text-sm">
                                                {item.itemName}
                                            </span>
                                            <span className="text-sm font-medium">
                                                {item.quantity} pcs
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <Button
                                size="lg"
                                className="bg-orion-blue hover:bg-orion-blue shadow-none p-4 rounded-md"
                                onClick={closeDialog}
                            >
                                <Check className="h-4 w-4 mr-2" />
                                Done
                            </Button>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
};

export default StockRequestForDepartmentDialog;
