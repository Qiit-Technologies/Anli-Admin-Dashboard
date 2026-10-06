'use client';

import type React from 'react';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useState, type ReactNode } from 'react';

interface StockItemFormData {
    name: string;
    description: string;
    price: string;
    minStock: string;
    quantity: string;
    unitOfMeasurement: string;
}

interface StockItemDialogProps {
    trigger?: ReactNode;
    onSubmit: (data: StockItemFormData) => void;
}

function StockItemDialog({ trigger, onSubmit }: StockItemDialogProps) {
    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState<StockItemFormData>({
        name: '',
        description: '',
        price: '',
        minStock: '',
        quantity: '',
        unitOfMeasurement: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
        setFormData({
            name: '',
            description: '',
            price: '',
            minStock: '',
            quantity: '',
            unitOfMeasurement: '',
        });
        setOpen(false);
    };

    const updateFormData = (field: keyof StockItemFormData, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const defaultTrigger = <Button>Add New Stock Item</Button>;

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{trigger || defaultTrigger}</DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Add New Stock Item</DialogTitle>
                    <DialogDescription>
                        Fill in the details to add a new item to your inventory.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="flex flex-col">
                            <label
                                htmlFor="name"
                                className="mb-1 text-sm font-medium"
                            >
                                Name
                            </label>
                            <Input
                                id="name"
                                className="bg-gray-100 border-none focus:ring-brand focus-visible:ring-brand"
                                placeholder="Item Name"
                                aria-label="Enter item name"
                                value={formData.name}
                                onChange={(e) =>
                                    updateFormData('name', e.target.value)
                                }
                                required
                            />
                        </div>

                        <div className="flex flex-col">
                            <label
                                htmlFor="description"
                                className="mb-1 text-sm font-medium"
                            >
                                Description
                            </label>
                            <Textarea
                                id="description"
                                className="bg-gray-100 border-none focus:ring-brand focus-visible:ring-brand"
                                placeholder="Item Description"
                                aria-label="Enter item description"
                                value={formData.description}
                                onChange={(e) =>
                                    updateFormData(
                                        'description',
                                        e.target.value,
                                    )
                                }
                                rows={3}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col">
                                <label
                                    htmlFor="price"
                                    className="mb-1 text-sm font-medium"
                                >
                                    Price
                                </label>
                                <Input
                                    id="price"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    className="bg-gray-100 border-none focus:ring-brand focus-visible:ring-brand"
                                    placeholder="Price"
                                    aria-label="Enter price"
                                    value={formData.price}
                                    onChange={(e) =>
                                        updateFormData('price', e.target.value)
                                    }
                                    required
                                />
                            </div>

                            <div className="flex flex-col">
                                <label
                                    htmlFor="minStock"
                                    className="mb-1 text-sm font-medium"
                                >
                                    Minimum Stock
                                </label>
                                <Input
                                    id="minStock"
                                    type="number"
                                    min="0"
                                    className="bg-gray-100 border-none focus:ring-brand focus-visible:ring-brand"
                                    placeholder="Minimum Stock"
                                    aria-label="Enter minimum stock level"
                                    value={formData.minStock}
                                    onChange={(e) =>
                                        updateFormData(
                                            'minStock',
                                            e.target.value,
                                        )
                                    }
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col">
                                <label
                                    htmlFor="quantity"
                                    className="mb-1 text-sm font-medium"
                                >
                                    Quantity
                                </label>
                                <Input
                                    id="quantity"
                                    type="number"
                                    min="0"
                                    className="bg-gray-100 border-none focus:ring-brand focus-visible:ring-brand"
                                    placeholder="Quantity"
                                    aria-label="Enter quantity"
                                    value={formData.quantity}
                                    onChange={(e) =>
                                        updateFormData(
                                            'quantity',
                                            e.target.value,
                                        )
                                    }
                                    required
                                />
                            </div>

                            <div className="flex flex-col">
                                <label
                                    htmlFor="unitOfMeasurement"
                                    className="mb-1 text-sm font-medium"
                                >
                                    Unit Of Measurement
                                </label>
                                <Select
                                    value={formData.unitOfMeasurement}
                                    onValueChange={(value) =>
                                        updateFormData(
                                            'unitOfMeasurement',
                                            value,
                                        )
                                    }
                                >
                                    <SelectTrigger
                                        id="unitOfMeasurement"
                                        className="w-full bg-gray-100 border-none focus:ring-brand focus-within:ring-brand focus-visible:ring-brand"
                                    >
                                        <SelectValue placeholder="Select Unit" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="piece">
                                            Piece
                                        </SelectItem>
                                        <SelectItem value="kg">
                                            Kilogram (kg)
                                        </SelectItem>
                                        <SelectItem value="g">
                                            Gram (g)
                                        </SelectItem>
                                        <SelectItem value="l">
                                            Liter (L)
                                        </SelectItem>
                                        <SelectItem value="ml">
                                            Milliliter (ml)
                                        </SelectItem>
                                        <SelectItem value="box">Box</SelectItem>
                                        <SelectItem value="pack">
                                            Pack
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            className="w-full bg-orion-blue hover:bg-orion-blue h-10"
                            type="submit"
                        >
                            Add Item
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

interface NewStockItemModalProps {
    onSubmit: (data: {
        name: string;
        description: string;
        price: string;
        minStock: string;
        quantity: string;
        unitOfMeasurement: string;
    }) => void;
    trigger?: ReactNode;
}

export function NewStockItemModal({
    onSubmit,
    trigger,
}: NewStockItemModalProps) {
    return <StockItemDialog trigger={trigger} onSubmit={onSubmit} />;
}
