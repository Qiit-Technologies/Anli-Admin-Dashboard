'use client';

import useSWR, { mutate } from 'swr';
import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import PageWrapper from '@/components/common/PageWrapper';
import { Input } from '@/components/ui/input';
import { NewStockItemModal } from '@/components/common/modals/NewStockItem';
import { fetchStockItems } from '@/hooks/fetcher';
import { Check, Pencil } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { createPurchaseOrder } from '@/app/actions/stock';
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from '@/components/ui/select';
import toast from 'react-hot-toast';
import Toast from '@/components/toast';
import { createItem } from '@/app/actions/items';
import { getVendors } from '@/app/actions/vendor';
import { useRouter } from 'nextjs-toploader/app';

export default function CreatePurchaseOrderPage() {
    const { data: items, isLoading } = useSWR('/items', fetchStockItems);
    const itemsData = items ?? [];
    const router = useRouter();
    const [selected, setSelected] = useState<number[]>([]);
    const [search, setSearch] = useState('');
    const [editValues, setEditValues] = useState<
        Record<
            number,
            {
                price: string;
                quantity: string;
                minStock: string;
                unitOfMeasurement: string;
                dirty: boolean;
            }
        >
    >({});
    const [saving, setSaving] = useState<Record<number, boolean>>({});
    const [summaryOpen, setSummaryOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedVendorId, setSelectedVendorId] = useState<string | null>(
        null,
    );
    const [itemGrouping, setItemGrouping] = useState('');
    // Fetch real vendors
    const { data: vendorData } = useSWR('/accounts/vendors', getVendors);
    const vendors: any[] =
        vendorData && Array.isArray((vendorData as any).data)
            ? (vendorData as any).data.map((v: any) => ({
                  id: String(v.id),
                  vendorName: v.vendorName,
              }))
            : [];

    // Initialize unitOfMeasurement in editValues when itemsData loads
    useEffect(() => {
        if (itemsData.length > 0) {
            setEditValues((prev) => {
                const updated = { ...prev };
                itemsData.forEach((item) => {
                    if (!updated[item.id]) {
                        updated[item.id] = {
                            price: item.unitPrice?.toString() ?? '',
                            quantity: item.quantity?.toString() ?? '',
                            minStock: item.minStock?.toString() ?? '',
                            unitOfMeasurement: item.unitOfMeasurement ?? 'pcs',
                            dirty: false,
                        };
                    }
                });
                return updated;
            });
        }
    }, [itemsData]);

    const filteredItems = useMemo(() => {
        if (!search) return itemsData;
        return itemsData.filter((item: any) =>
            item.name?.toLowerCase().includes(search.toLowerCase()),
        );
    }, [itemsData, search]);

    const allSelected =
        filteredItems.length > 0 &&
        filteredItems.every((item: any) => selected.includes(item.id));

    const toggleItem = (id: number) => {
        setSelected((prev) =>
            prev.includes(id)
                ? prev.filter((itemId) => itemId !== id)
                : [...prev, id],
        );
    };

    const toggleAll = () => {
        if (allSelected) {
            setSelected((prev) =>
                prev.filter(
                    (id) => !filteredItems.some((item: any) => item.id === id),
                ),
            );
        } else {
            setSelected((prev) => [
                ...prev,
                ...filteredItems
                    .map((item: any) => item.id)
                    .filter((id: number) => !prev.includes(id)),
            ]);
        }
    };

    const handleEditChange = (
        id: number,
        field: 'price' | 'quantity' | 'minStock' | 'unitOfMeasurement',
        value: string,
    ) => {
        setEditValues((prev) => ({
            ...prev,
            [id]: {
                ...prev[id],
                [field]: value,
                dirty: true,
            },
        }));
    };

    const handleUpdate = async (item: any) => {
        const values = editValues[item.id];
        if (!values) return;
        setSaving((prev) => ({ ...prev, [item.id]: true }));
        await fetch(`/items/${item.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                price: values.price,
                quantity: values.quantity,
                minStock: values.minStock,
            }),
        });
        setEditValues((prev) => ({
            ...prev,
            [item.id]: { ...prev[item.id], dirty: false },
        }));
        setSaving((prev) => ({ ...prev, [item.id]: false }));
        mutate('/items');
    };

    const grandTotal = useMemo(() => {
        return filteredItems.reduce((sum: number, item: any) => {
            if (!selected.includes(item.id)) return sum;
            const price = Number(editValues[item.id]?.price ?? item.price ?? 0);
            const quantity = Number(
                editValues[item.id]?.quantity ?? item.quantity ?? 0,
            );
            return sum + price * quantity;
        }, 0);
    }, [filteredItems, selected, editValues]);

    const selectedItems = useMemo(() => {
        return itemsData.filter((item: any) => selected.includes(item.id));
    }, [itemsData, selected]);

    async function handleSubmit() {
        if (!selectedVendorId) return;
        setIsSubmitting(true);
        // Build the payload
        const payload = {
            // poNumber: removed, backend will generate
            vendorId: Number(selectedVendorId),
            total: grandTotal,
            itemGrouping,
            status: 'pending',
            dateSent: new Date(),
            items: selectedItems.map((item: any) => ({
                itemId: item.id,
                quantity: Number(
                    editValues[item.id]?.quantity ?? item.quantity ?? 0,
                ),
                amount: Number(editValues[item.id]?.price ?? item.price ?? 0),
                unitOfMeasurement:
                    editValues[item.id]?.unitOfMeasurement ??
                    item.unitOfMeasurement ??
                    'pcs',
            })),
        } as const;
        const res = await createPurchaseOrder(payload);
        setIsSubmitting(false);
        if (res && !res.error) {
            toast.custom(() => (
                <Toast
                    title="Success!"
                    description={res.data.message}
                    type="success"
                />
            ));
            setSummaryOpen(false);
            router.push('/stock/purchase-order');
        } else {
            toast.custom(() => (
                <Toast
                    title="Error!"
                    description={
                        typeof res.data === 'string'
                            ? res.data
                            : 'Failed to create purchase order.'
                    }
                    type="error"
                />
            ));
        }
    }

    const handleItemSubmit = async (data: any) => {
        try {
            const response = await createItem(data);
            if (response) {
                if (response.message === 'Item created successfully!') {
                    toast.custom(() => (
                        <Toast
                            title="Success!"
                            description={response.message}
                            type="success"
                        />
                    ));
                    setTimeout(() => {
                        router.push('/stock/purchase-order');
                    }, 500);
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
        <PageWrapper>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-brand">
                    Create Purchase Order
                </h1>
                <div className="flex items-center gap-2">
                    <Input
                        type="text"
                        placeholder="Search items..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-64 border-gray-300 focus:border-brand focus:ring-brand"
                    />
                    <NewStockItemModal
                        onSubmit={handleItemSubmit}
                        trigger={
                            <Button className="bg-brand text-white">
                                Add New Item
                            </Button>
                        }
                    />
                </div>
            </div>
            <div className="bg-white rounded-xl shadow p-0 overflow-x-auto">
                {isLoading ? (
                    <div className="text-center text-gray-500 py-12">
                        Loading items...
                    </div>
                ) : (
                    <div className="relative min-w-[900px]">
                        <table className="w-full text-left border-collapse">
                            <thead className="sticky top-0 z-10 bg-gray-100 border-b border-gray-200">
                                <tr>
                                    <th className="p-4 sticky left-0 bg-gray-100 z-20">
                                        <input
                                            type="checkbox"
                                            checked={allSelected}
                                            onChange={toggleAll}
                                            className="accent-brand w-4 h-4 cursor-pointer"
                                        />
                                    </th>
                                    <th className="p-4 text-brand font-semibold sticky left-12 bg-gray-100 z-20">
                                        Name
                                    </th>
                                    <th className="p-4 text-brand font-semibold">
                                        U.O.M
                                    </th>
                                    <th className="p-4 text-brand font-semibold">
                                        Price
                                    </th>
                                    <th className="p-4 text-brand font-semibold">
                                        Quantity
                                    </th>
                                    <th className="p-4 text-brand font-semibold">
                                        Min Stock
                                    </th>
                                    <th className="p-4 text-brand font-semibold">
                                        Total
                                    </th>
                                    <th className="p-4"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredItems.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={8}
                                            className="text-center text-gray-400 py-8"
                                        >
                                            No items found.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredItems.map(
                                        (item: any, idx: number) => {
                                            const price =
                                                editValues[item.id]?.price ??
                                                item.price ??
                                                '';
                                            const quantity =
                                                editValues[item.id]?.quantity ??
                                                item.quantity ??
                                                '';
                                            const minStock =
                                                editValues[item.id]?.minStock ??
                                                item.minStock ??
                                                '';
                                            const total =
                                                Number(price) *
                                                Number(quantity);
                                            const isDirty =
                                                editValues[item.id]?.dirty;
                                            return (
                                                <tr
                                                    key={item.id}
                                                    className={
                                                        idx % 2 === 0
                                                            ? 'bg-white hover:bg-gray-50'
                                                            : 'bg-gray-50 hover:bg-gray-100'
                                                    }
                                                >
                                                    <td className="p-4 sticky left-0 bg-inherit z-10">
                                                        <input
                                                            type="checkbox"
                                                            checked={selected.includes(
                                                                item.id,
                                                            )}
                                                            onChange={() =>
                                                                toggleItem(
                                                                    item.id,
                                                                )
                                                            }
                                                            className="accent-brand w-4 h-4 cursor-pointer"
                                                        />
                                                    </td>
                                                    <td className="p-4 font-medium text-gray-900 sticky left-12 bg-inherit z-10">
                                                        {item.name}
                                                    </td>
                                                    <td className="p-4">
                                                        <Select
                                                            value={
                                                                editValues[
                                                                    item.id
                                                                ]
                                                                    ?.unitOfMeasurement !==
                                                                undefined
                                                                    ? editValues[
                                                                          item
                                                                              .id
                                                                      ]
                                                                          ?.unitOfMeasurement
                                                                    : (item.unitOfMeasurement ??
                                                                      'pcs')
                                                            }
                                                            onValueChange={(
                                                                value,
                                                            ) =>
                                                                handleEditChange(
                                                                    item.id,
                                                                    'unitOfMeasurement',
                                                                    value,
                                                                )
                                                            }
                                                        >
                                                            <SelectTrigger className="w-24">
                                                                <SelectValue placeholder="U.O.M" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="piece">
                                                                    Piece
                                                                </SelectItem>
                                                                <SelectItem value="kg">
                                                                    Kilogram
                                                                    (kg)
                                                                </SelectItem>
                                                                <SelectItem value="g">
                                                                    Gram (g)
                                                                </SelectItem>
                                                                <SelectItem value="l">
                                                                    Liter (L)
                                                                </SelectItem>
                                                                <SelectItem value="ml">
                                                                    Milliliter
                                                                    (ml)
                                                                </SelectItem>
                                                                <SelectItem value="box">
                                                                    Box
                                                                </SelectItem>
                                                                <SelectItem value="pack">
                                                                    Pack
                                                                </SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="flex items-center gap-2">
                                                            <input
                                                                type="number"
                                                                className="w-24 border rounded px-2 py-1 focus:border-brand"
                                                                value={price}
                                                                onChange={(e) =>
                                                                    handleEditChange(
                                                                        item.id,
                                                                        'price',
                                                                        e.target
                                                                            .value,
                                                                    )
                                                                }
                                                            />
                                                            {isDirty && (
                                                                <button
                                                                    className="text-brand hover:text-orion-blue"
                                                                    onClick={() =>
                                                                        handleUpdate(
                                                                            item,
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        saving[
                                                                            item
                                                                                .id
                                                                        ]
                                                                    }
                                                                    title="Save"
                                                                    type="button"
                                                                >
                                                                    {saving[
                                                                        item.id
                                                                    ] ? (
                                                                        <Pencil className="w-4 h-4 animate-pulse" />
                                                                    ) : (
                                                                        <Check className="w-4 h-4" />
                                                                    )}
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="flex items-center gap-2">
                                                            <input
                                                                type="number"
                                                                className="w-20 border rounded px-2 py-1 focus:border-brand"
                                                                value={quantity}
                                                                onChange={(e) =>
                                                                    handleEditChange(
                                                                        item.id,
                                                                        'quantity',
                                                                        e.target
                                                                            .value,
                                                                    )
                                                                }
                                                            />
                                                            {isDirty && (
                                                                <button
                                                                    className="text-brand hover:text-orion-blue"
                                                                    onClick={() =>
                                                                        handleUpdate(
                                                                            item,
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        saving[
                                                                            item
                                                                                .id
                                                                        ]
                                                                    }
                                                                    title="Save"
                                                                    type="button"
                                                                >
                                                                    {saving[
                                                                        item.id
                                                                    ] ? (
                                                                        <Pencil className="w-4 h-4 animate-pulse" />
                                                                    ) : (
                                                                        <Check className="w-4 h-4" />
                                                                    )}
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="flex items-center gap-2">
                                                            <input
                                                                type="number"
                                                                className="w-20 border rounded px-2 py-1 focus:border-brand"
                                                                value={minStock}
                                                                onChange={(e) =>
                                                                    handleEditChange(
                                                                        item.id,
                                                                        'minStock',
                                                                        e.target
                                                                            .value,
                                                                    )
                                                                }
                                                            />
                                                            {isDirty && (
                                                                <button
                                                                    className="text-brand hover:text-orion-blue"
                                                                    onClick={() =>
                                                                        handleUpdate(
                                                                            item,
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        saving[
                                                                            item
                                                                                .id
                                                                        ]
                                                                    }
                                                                    title="Save"
                                                                    type="button"
                                                                >
                                                                    {saving[
                                                                        item.id
                                                                    ] ? (
                                                                        <Pencil className="w-4 h-4 animate-pulse" />
                                                                    ) : (
                                                                        <Check className="w-4 h-4" />
                                                                    )}
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="p-4">
                                                        ₦
                                                        {total
                                                            ? total.toLocaleString()
                                                            : '0'}
                                                    </td>
                                                    <td className="p-4"></td>
                                                </tr>
                                            );
                                        },
                                    )
                                )}
                            </tbody>
                            {filteredItems.length > 0 && (
                                <tfoot>
                                    <tr className="bg-gray-100 border-t border-gray-200">
                                        <td
                                            colSpan={6}
                                            className="p-4 text-right font-semibold text-brand"
                                        >
                                            Grand Total:
                                        </td>
                                        <td className="p-4 font-bold text-lg text-brand">
                                            ₦{grandTotal.toLocaleString()}
                                        </td>
                                        <td></td>
                                    </tr>
                                </tfoot>
                            )}
                        </table>
                        {selected.length > 0 && (
                            <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 shadow-lg px-6 py-4 flex items-center gap-4 z-30 animate-fade-in justify-between">
                                <span className="font-semibold text-brand">
                                    {selected.length} item(s) selected
                                </span>
                                <Button
                                    className="bg-orion-blue text-white hover:bg-orion-blue rounded-full px-8 py-3 text-lg font-semibold"
                                    onClick={() => setSummaryOpen(true)}
                                >
                                    Continue
                                </Button>
                            </div>
                        )}
                        {/* Summary Modal */}
                        <Dialog
                            open={summaryOpen}
                            onOpenChange={setSummaryOpen}
                        >
                            <DialogContent className="max-w-3xl w-full">
                                <DialogHeader>
                                    <DialogTitle>
                                        <div className="flex items-center gap-2 text-orion-blue text-2xl font-bold pb-2 border-b border-gray-200 mb-4">
                                            <span>Purchase Order Summary</span>
                                        </div>
                                    </DialogTitle>
                                </DialogHeader>
                                <div className="max-h-[350px] overflow-y-auto">
                                    <table className="w-full text-left border-collapse mb-4">
                                        <thead>
                                            <tr className="bg-gray-100">
                                                <th className="p-2 font-semibold">
                                                    Name
                                                </th>
                                                <th className="p-2 font-semibold">
                                                    U.O.M
                                                </th>
                                                <th className="p-2 font-semibold">
                                                    Price
                                                </th>
                                                <th className="p-2 font-semibold">
                                                    Quantity
                                                </th>
                                                <th className="p-2 font-semibold">
                                                    Min Stock
                                                </th>
                                                <th className="p-2 font-semibold">
                                                    Total
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selectedItems.map(
                                                (item: any, idx: number) => {
                                                    const price = Number(
                                                        editValues[item.id]
                                                            ?.price ??
                                                            item.price ??
                                                            0,
                                                    );
                                                    const quantity = Number(
                                                        editValues[item.id]
                                                            ?.quantity ??
                                                            item.quantity ??
                                                            0,
                                                    );
                                                    const minStock =
                                                        editValues[item.id]
                                                            ?.minStock ??
                                                        item.minStock ??
                                                        '';
                                                    const total =
                                                        price * quantity;
                                                    return (
                                                        <tr
                                                            key={item.id}
                                                            className={
                                                                idx % 2 === 0
                                                                    ? 'bg-white'
                                                                    : 'bg-gray-50'
                                                            }
                                                        >
                                                            <td className="p-2">
                                                                {item.name}
                                                            </td>
                                                            <td className="p-2">
                                                                {item.unitOfMeasurement ??
                                                                    '-'}
                                                            </td>
                                                            <td className="p-2">
                                                                ₦
                                                                {price.toLocaleString()}
                                                            </td>
                                                            <td className="p-2">
                                                                {quantity}
                                                            </td>
                                                            <td className="p-2">
                                                                {minStock}
                                                            </td>
                                                            <td className="p-2">
                                                                ₦
                                                                {total.toLocaleString()}
                                                            </td>
                                                        </tr>
                                                    );
                                                },
                                            )}
                                        </tbody>
                                        <tfoot>
                                            <tr className="bg-gray-100 border-t border-gray-200">
                                                <td
                                                    colSpan={5}
                                                    className="p-2 text-right font-semibold"
                                                >
                                                    Grand Total:
                                                </td>
                                                <td className="p-2 font-bold text-lg text-brand">
                                                    ₦
                                                    {grandTotal.toLocaleString()}
                                                </td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                                {/* Prominent Grand Total Summary */}
                                <div className="flex justify-end mb-4">
                                    <div className="bg-orion-blue/10 border border-orion-blue rounded-lg px-6 py-4 flex flex-col items-end w-full max-w-xs">
                                        <span className="text-base text-gray-700 font-medium">
                                            Total
                                        </span>
                                        <span className="text-2xl font-bold text-orion-blue">
                                            ₦{grandTotal.toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                                {/* Vendor and Grouping Selection */}
                                <div className="flex flex-col md:flex-row gap-4 mb-4">
                                    <div className="flex-1">
                                        <label className="block text-sm font-medium mb-1 text-gray-700">
                                            Vendor
                                        </label>
                                        <Select
                                            value={selectedVendorId ?? ''}
                                            onValueChange={setSelectedVendorId}
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select a vendor" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {vendors.map((vendor) => (
                                                    <SelectItem
                                                        key={vendor.id}
                                                        value={vendor.id}
                                                    >
                                                        {vendor.vendorName}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="flex-1">
                                        <label className="block text-sm font-medium mb-1 text-gray-700">
                                            Item Grouping
                                        </label>
                                        <input
                                            type="text"
                                            className="w-full border rounded px-3 py-2 focus:border-orion-blue"
                                            placeholder="e.g. Food, Beverages, Stationery"
                                            value={itemGrouping}
                                            onChange={(e) =>
                                                setItemGrouping(e.target.value)
                                            }
                                        />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button
                                        variant="outline"
                                        onClick={() => setSummaryOpen(false)}
                                        disabled={isSubmitting}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        className="bg-orion-blue text-white hover:bg-orion-blue"
                                        onClick={handleSubmit}
                                        disabled={
                                            isSubmitting ||
                                            !selectedVendorId ||
                                            !itemGrouping
                                        }
                                    >
                                        {isSubmitting
                                            ? 'Submitting...'
                                            : 'Submit'}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                )}
            </div>
        </PageWrapper>
    );
}
