'use client';
import { Button } from '@/components/ui/button';
import { useRouter } from 'nextjs-toploader/app';
import React, { FormEvent, useEffect, useState } from 'react';
import { InputField, SelectField } from './index';

interface GrnFormProps {
    defaultValues?: {
        itemName?: string;
        description?: string;
        minimumStock?: number;
        quantity?: number;
        unitOfMeasurement?: string;
        unitPrice?: number;
        total?: number;
    };
    onSubmit?: (data: {
        itemName: string;
        description: string;
        minStock: number;
        unitOfMeasurement: string;
        quantity: number;
        unitPrice: number;
        total: number;
    }) => void;
}

const GrnForm: React.FC<GrnFormProps> = ({ defaultValues = {}, onSubmit }) => {
    const [itemName, setItemName] = useState(defaultValues.itemName ?? '');
    const [quantity, setQuantity] = useState(defaultValues.quantity ?? '');
    const [unitOfMeasurement, setUnitOfMeasurement] = useState(
        defaultValues.unitOfMeasurement ?? '',
    );
    const [description, setDescription] = useState('');
    const [minimumStock, setMinimumStock] = useState('');
    const [unitPrice, setUnitPrice] = useState(defaultValues.unitPrice ?? '');
    const [total, setTotal] = useState(defaultValues.total ?? 0);
    const router = useRouter();

    const uomOptions = [
        { value: 'piece', label: 'Piece' },
        { value: 'kg', label: 'Kilogram (kg)' },
        { value: 'g', label: 'Gram (g)' },
        { value: 'l', label: 'Liter (L)' },
        { value: 'ml', label: 'Milliliter (ml)' },
        { value: 'box', label: 'Box' },
        { value: 'pack', label: 'Pack' },
        { value: 'each', label: 'Each' },
    ];

    useEffect(() => {
        setTotal(Number(quantity) * Number(unitPrice));
    }, [quantity, unitPrice]);

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const calculatedTotal = Number(quantity) * Number(unitPrice);

        const data = {
            itemName,
            quantity: Number(quantity),
            description,
            minStock: Number(minimumStock),
            unitOfMeasurement,
            unitPrice: Number(unitPrice),
            total: calculatedTotal,
        };

        if (onSubmit) {
            onSubmit(data);
        }
        router.refresh();
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-3">
                <InputField
                    id="itemName"
                    name="itemName"
                    label="Name"
                    placeholder="Select Item"
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                    required
                />

                <InputField
                    id="description"
                    name="description"
                    label="Description"
                    type="text"
                    placeholder="Enter Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />

                <div className="flex flex-row w-full gap-4">
                    <InputField
                        id="unitPrice"
                        name="unitPrice"
                        label="Unit Price"
                        type="number"
                        value={unitPrice}
                        onChange={(e) =>
                            setUnitPrice(parseFloat(e.target.value) || '')
                        }
                        min="0"
                        className="flex-1"
                    />
                    <InputField
                        id="minimumStock"
                        name="minimumStock"
                        label="Min Stock"
                        type="number"
                        value={minimumStock}
                        onChange={(e) => setMinimumStock(e.target.value || '')}
                        min="0"
                        className="flex-1"
                    />
                </div>

                <div className="flex flex-row w-full gap-4">
                    <InputField
                        id="quantity"
                        name="quantity"
                        label="Qty"
                        type="number"
                        placeholder="Enter Quantity"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value || '')}
                    />
                    <SelectField
                        id="unitOfMeasurement"
                        name="unitOfMeasurement"
                        label="U.O.M"
                        value={unitOfMeasurement}
                        onValueChange={setUnitOfMeasurement}
                        options={uomOptions}
                        placeholder="Select U.O.M"
                        className="flex-1"
                    />
                </div>

                <InputField
                    id="total"
                    name="total"
                    label="Total"
                    type="number"
                    value={total}
                    onChange={() => {}}
                    readOnly
                />

                <div className="mt-4">
                    <Button
                        type="submit"
                        className="px-4 w-full h-14 py-2 bg-orion-blue text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                        Submit
                    </Button>
                </div>
            </div>
        </form>
    );
};

export default GrnForm;
