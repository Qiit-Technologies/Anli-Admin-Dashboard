import { InputField } from '@/components/common/Form';
import { Button } from '@/components/ui/button';
import React, { useState } from 'react';
import { z } from 'zod';

interface DineAreaMutateFormProps {
    id: number;
    name: string;
    description: string;
}

const zodSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    description: z.string().min(1, 'Description is required'),
});
const MutateDineAreaForm = ({
    onSubmit,
    mode,
    initialData,
    disabled,
}: {
    onSubmit: (data: DineAreaMutateFormProps) => void;
    mode: 'add' | 'edit';
    initialData?: {
        id: number;
        name?: string;
        description?: string;
    };
    disabled?: boolean;
}) => {
    const [formData, setFormData] = useState({
        id: initialData?.id || 0,
        name: initialData?.name || '',
        description: initialData?.description || '',
    });

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const result = zodSchema.safeParse(formData);
        if (!result.success) {
            return;
        }
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <InputField
                    type="text"
                    placeholder="Dine Area Name"
                    id="name"
                    label="Dine Area Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                />
            </div>
            <div className="space-y-2">
                <InputField
                    type="text"
                    placeholder="Dine Area Description"
                    id="description"
                    label="Dine Area Description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                />
            </div>
            <div className="flex justify-end pt-4">
                <Button
                    type="submit"
                    disabled={disabled || !formData.name}
                    className="bg-orion-blue hover:bg-orion-blue/90 w-full h-12"
                >
                    {mode === 'add' ? 'Create Dine Area' : 'Update Dine Area'}
                </Button>
            </div>
        </form>
    );
};

export default MutateDineAreaForm;
