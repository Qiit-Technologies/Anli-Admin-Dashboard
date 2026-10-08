'use client';

import { createStockRequestItems } from '@/app/actions/inventory';
import { fetchItems } from '@/app/actions/items';
import Toast from '@/components/toast';
import { StockItemSearchSelect } from '@/components/stock/Form/StockItemSearchSelect';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { Item } from '@/types';
import { Divider } from '@heroui/react';
import { PlusCircle, Trash2 } from 'lucide-react';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { mutate } from 'swr';
import { itemOrderCheckedIllustration } from '../illustrations';

interface InventoryCardProps {
    department?: string;
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
    { id: 'Restaurant', name: 'frontofhouse' },
    { id: 'Account', name: 'account' },
    { id: 'Banquet', name: 'banquet' },
];

const InventoryCreateDialog = ({
    department,
    className,
}: InventoryCardProps) => {
    const [open, setOpen] = useState(false);
    const [formState, setFormState] = useState<'input' | 'success'>('input');
    const [selectedItems, setSelectedItems] = useState<ItemRequest[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [items, setItems] = useState<Item[]>([]);
    const [selectedDepartment, setSelectedDepartment] = useState(department);

    const [requests, setRequests] = useState<ItemRequest[]>([
        { id: Date.now().toString(), itemId: '', itemName: '', quantity: '' },
    ]);

    const itemOptions = useMemo(
        () =>
            items.map((item) => ({
                value: String(item.id),
                label: `${item.itemName} (${Number(item.quantity || 0)} avail.)`,
            })),
        [items],
    );

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const validRequests = requests.filter(
            (req) => req.itemId && req.quantity,
        );
        if (validRequests.length === 0) return;

        setSelectedItems(validRequests);
        setSubmitError(null);
        setIsSubmitting(true);
        try {
            const response = await createStockRequestItems(
                validRequests,
                selectedDepartment ?? '',
            );
            if (response) {
                if (
                    response.message ===
                    'Stock request items created successfully!'
                ) {
                    toast.custom(() => (
                        <Toast
                            title="Success!"
                            description={response.message}
                            type="success"
                        />
                    ));
                    mutate(`/items/stock?department=${selectedDepartment}`);
                    mutate('/items/pending');
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
                setSubmitError(err.message);
            } else {
                setSubmitError('An unexpected error occurred');
            }
        } finally {
            setIsSubmitting(false);
        }
        setFormState('success');
    };

    const resetForm = () => {
        setFormState('input');
        setRequests([
            {
                id: Date.now().toString(),
                itemId: '',
                itemName: '',
                quantity: '',
            },
        ]);
    };

    const closeDialog = () => {
        setOpen(false);
        setTimeout(resetForm, 300);
    };

    const addNewItem = () => {
        setRequests([
            ...requests,
            {
                id: Date.now().toString(),
                itemId: '',
                itemName: '',
                quantity: '',
            },
        ]);
    };

    const removeItem = (id: string) => {
        if (requests.length === 1) return;
        setRequests(requests.filter((item) => item.id !== id)); // Use item.id instead
    };

    const updateRequest = (
        id: string,
        field: keyof ItemRequest,
        value: string,
    ) => {
        setRequests(
            requests.map((req) =>
                req.id === id ? { ...req, [field]: value } : req,
            ),
        );
    };

    const hasQuantityError = () => {
        for (const request of requests) {
            const item = items.find(
                (item) => String(item.id) === request.itemId,
            );
            if (item && Number(request.quantity) > Number(item.quantity)) {
                return true;
            }
        }
        return false;
    };

    useEffect(() => {
        const fetchItem = async () => {
            const result = (await fetchItems()) as any;
            if (result.data.statusCode > 400) {
                return;
            }
            setItems(result.data.data);
        };
        fetchItem();
    }, []);

    if (items.length === 0) {
        return (
            <div className="p-4 border rounded-md mt-4">
                No Item In Inventory
            </div>
        );
    }

    return (
        <>
            <Button
                onClick={() => setOpen(true)}
                className={cn(
                    className,
                    'bg-orion-blue hover:bg-orion-blue px-10 text-white py-5 rounded-md mt-4',
                )}
            >
                Collect Items
            </Button>

            <Dialog open={open} onOpenChange={closeDialog}>
                <DialogTitle className="sr-only">
                    Collect Items Form
                </DialogTitle>
                <DialogContent className="rounded-lg w-[450px] px-0 transition-all duration-300">
                    {formState === 'input' ? (
                        <>
                            <DialogHeader className="px-4">
                                <DialogTitle className="text-base font-bold leading-3 text-gray-900">
                                    Collecting Items
                                </DialogTitle>
                                <DialogDescription className="text-sm text-gray-500">
                                    Enter the products you need.
                                </DialogDescription>
                            </DialogHeader>

                            <Divider />
                            <form className="px-4" onSubmit={handleSubmit}>
                                <div className="flex flex-col gap-3 max-h-[50vh] overflow-y-auto">
                                    {requests.map((request, index) => {
                                        const itemsCount =
                                            items.find(
                                                (item) =>
                                                    String(item.id) ===
                                                    request.itemId,
                                            )?.quantity || 0;
                                        return (
                                            <div
                                                key={request.id}
                                                className="p-3 bg-gray-50 rounded-md"
                                            >
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="text-sm font-medium text-gray-700">
                                                        Item {index + 1}
                                                    </span>
                                                    {requests.length > 1 && (
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() =>
                                                                removeItem(
                                                                    request.id,
                                                                )
                                                            }
                                                            className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-transparent"
                                                        >
                                                            <Trash2 size={16} />
                                                        </Button>
                                                    )}
                                                </div>

                                                <div className="flex flex-col gap-3">
                                                    <StockItemSearchSelect
                                                        id={`itemName-${request.id}`}
                                                        label="Item Name"
                                                        options={itemOptions}
                                                        value={request.itemId}
                                                        onValueChange={(value) => {
                                                            const selectedItem =
                                                                items.find(
                                                                    (item) =>
                                                                        String(
                                                                            item.id,
                                                                        ) === value,
                                                                );
                                                            if (selectedItem) {
                                                                setRequests(
                                                                    requests.map(
                                                                        (req) =>
                                                                            req.id ===
                                                                            request.id
                                                                                ? {
                                                                                      ...req,
                                                                                      itemId: value,
                                                                                      itemName:
                                                                                          selectedItem.itemName,
                                                                                  }
                                                                                : req,
                                                                    ),
                                                                );
                                                            }
                                                        }}
                                                        placeholder="Type item name..."
                                                        emptyText="No items found"
                                                    />
                                                    <div className="flex flex-col mt-4">
                                                        <label
                                                            htmlFor="department-select"
                                                            className="mb-1 text-sm font-medium"
                                                        >
                                                            Requesting
                                                            Department
                                                        </label>
                                                        <Select
                                                            value={
                                                                selectedDepartment
                                                            }
                                                            onValueChange={(
                                                                value,
                                                            ) => {
                                                                setSelectedDepartment(
                                                                    value,
                                                                );
                                                            }}
                                                        >
                                                            <SelectTrigger
                                                                id="department-select"
                                                                className="w-full focus:ring-brand focus-within:ring-brand focus-visible:ring-brand"
                                                            >
                                                                <SelectValue placeholder="Select Department" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {departments.map(
                                                                    (dept) => (
                                                                        <SelectItem
                                                                            key={
                                                                                dept.name
                                                                            }
                                                                            value={
                                                                                dept.name
                                                                            }
                                                                        >
                                                                            {
                                                                                dept.id
                                                                            }
                                                                        </SelectItem>
                                                                    ),
                                                                )}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>

                                                    <div className="flex flex-col">
                                                        <label
                                                            htmlFor={`quantity-${request.id}`}
                                                            className="mb-1 text-sm font-medium"
                                                        >
                                                            Quantity Needed
                                                        </label>
                                                        <Input
                                                            id={`quantity-${request.id}`}
                                                            type="number"
                                                            min="1"
                                                            className="focus:ring-brand focus-visible:ring-brand"
                                                            placeholder="Quantity Needed"
                                                            aria-label="Enter quantity needed"
                                                            value={
                                                                request.quantity
                                                            }
                                                            onChange={(e) =>
                                                                updateRequest(
                                                                    request.id,
                                                                    'quantity',
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            required
                                                        />
                                                        {Number(
                                                            request.quantity,
                                                        ) > itemsCount && (
                                                            <div className="flex text-xs mt-2 items-center justify-between">
                                                                <span className="text-xs text-red-500">
                                                                    Insufficient
                                                                    Quantity
                                                                </span>
                                                                <span className="text-orion-blue/65">
                                                                    {itemsCount}{' '}
                                                                    pc available
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                <DialogFooter className="mt-4">
                                    <div className="w-full flex flex-col gap-2">
                                        {submitError ? (
                                            <p className="text-xs text-red-500">
                                                {submitError}
                                            </p>
                                        ) : null}
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="flex items-center gap-2 text-orion-blue border-dashed border-orion-blue/50 hover:bg-orion-blue/5"
                                            onClick={addNewItem}
                                        >
                                            <PlusCircle size={16} />
                                            Add Another Item
                                        </Button>
                                        <Button
                                            disabled={
                                                isSubmitting ||
                                                hasQuantityError() ||
                                                requests.every(
                                                    (req) =>
                                                        !req.itemId ||
                                                        !req.quantity,
                                                )
                                            }
                                            type="submit"
                                            className="bg-orion-blue w-full hover:bg-orion-blue px-10 text-white py-5 rounded-md"
                                        >
                                            {isSubmitting
                                                ? 'Collecting...'
                                                : 'Collect Items'}
                                        </Button>
                                    </div>
                                </DialogFooter>
                            </form>
                        </>
                    ) : (
                        <div className="flex items-center gap-3 text-center justify-center flex-col py-6">
                            <div className="text-green-500">
                                {itemOrderCheckedIllustration}
                            </div>
                            <div>
                                <h1 className="font-bold text-lg">
                                    Your order has been placed
                                </h1>
                                <p className="text-sm text-muted-foreground">
                                    You have successfully requested{' '}
                                    {selectedItems.length} item
                                    {selectedItems.length > 1 ? 's' : ''}
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

                            <div className="flex items-center gap-3 mt-2">
                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="border-orion-blue text-orion-blue rounded-md shadow-none"
                                    onClick={() => {
                                        // Handle download logic
                                        console.log('Downloading order');
                                    }}
                                >
                                    Download Order
                                </Button>
                                <Button
                                    size="lg"
                                    className="bg-orion-blue hover:bg-orion-blue shadow-none p-4 rounded-md"
                                    onClick={() => {
                                        // Handle print logic
                                        console.log('Printing order');
                                        closeDialog();
                                    }}
                                >
                                    Print Order
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
};

export default InventoryCreateDialog;
