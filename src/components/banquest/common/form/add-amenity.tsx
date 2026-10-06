'use client';
import BrandButton from '@/components/common/Button';
import { InputField } from '@/components/common/Form';
import React, { useState } from 'react';
import { z } from 'zod';

export interface AddAmenityFormProps {
    id: string;
    name: string;
    qauntity: number;
    amount: number;
}

const zodSchema = z.object({
    id: z.string().min(1, 'Amenity ID is required'),
    name: z.string().min(1, 'Amenity name is required'),
    qauntity: z.number().min(1, 'Quantity must be at least 1'),
    amount: z.number().min(0, 'Amount must be 0 or greater'),
});

const AddAmenityForm = ({
    onSubmit,
    mode,
    initialData,
}: {
    onSubmit: (data: AddAmenityFormProps) => void | Promise<void>;
    mode: 'add' | 'edit';
    initialData?: {
        id?: string;
        name?: string;
        qauntity?: number;
        amount?: number;
    };
}) => {
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        id: initialData?.id || '',
        name: initialData?.name || '',
        qauntity: initialData?.qauntity ? initialData.qauntity.toString() : '',
        amount: initialData?.amount ? initialData.amount.toString() : '',
    });

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const dataToValidate = {
            id: formData.id,
            name: formData.name,
            qauntity: Number(formData.qauntity),
            amount: Number(formData.amount),
        };

        const result = zodSchema.safeParse(dataToValidate);
        if (!result.success) {
            setLoading(false);
            return;
        }

        await onSubmit(dataToValidate);
        setLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <InputField
                    label="Amenity ID"
                    name="id"
                    type="text"
                    placeholder="Enter amenity ID"
                    id="id"
                    value={formData.id}
                    onChange={handleChange}
                />
            </div>
            <div className="space-y-2">
                <InputField
                    label="Amenity Name"
                    name="name"
                    type="text"
                    placeholder="Enter amenity name"
                    id="name"
                    value={formData.name}
                    onChange={handleChange}
                />
            </div>
            <div className="space-y-2">
                <InputField
                    label="Quantity"
                    name="qauntity"
                    type="number"
                    placeholder="Enter quantity"
                    id="qauntity"
                    value={formData.qauntity}
                    onChange={handleChange}
                />
            </div>
            <div className="space-y-2">
                <InputField
                    label="Amount (per unit)"
                    name="amount"
                    type="number"
                    step="0.01"
                    placeholder="Enter amount per unit"
                    id="amount"
                    value={formData.amount}
                    onChange={handleChange}
                />
            </div>
            <div className="flex justify-end pt-4">
                <BrandButton
                    loading={loading}
                    disabled={
                        !formData.id ||
                        !formData.name ||
                        !formData.qauntity ||
                        !formData.amount ||
                        loading
                    }
                    type="submit"
                    className="bg-orion-blue hover:bg-orion-blue/90 w-full h-12"
                >
                    {mode === 'add' ? 'Add Amenity' : 'Update Amenity'}
                </BrandButton>
            </div>
        </form>
    );
};

export default AddAmenityForm;
