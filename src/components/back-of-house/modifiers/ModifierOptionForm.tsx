'use client';
import { InputField } from '@/components/common/Form';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { ModifierOption } from '@/app/actions/modifier';

interface ModifierOptionFormProps {
    initialData?: ModifierOption | null;
    onSubmit: (data: any) => void;
    isLoading?: boolean;
}

export default function ModifierOptionForm({
    initialData,
    onSubmit,
    isLoading = false,
}: ModifierOptionFormProps) {
    const [formData, setFormData] = useState({
        name: initialData?.name || '',
        description: initialData?.description || '',
        price: initialData?.price ?? 0,
        isAvailable: initialData?.isAvailable ?? true,
        displayOrder: initialData?.displayOrder ?? 0,
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <InputField
                id="modifier-option-name"
                name="name"
                label="Name"
                value={formData.name}
                onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g., Small, Medium, Large, Extra Cheese"
                required
            />

            <InputField
                id="modifier-option-description"
                name="description"
                label="Description"
                value={formData.description}
                onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Optional description"
            />

            <InputField
                id="modifier-option-price"
                name="price"
                label="Price Adjustment (₦)"
                type="number"
                step="0.01"
                value={String(formData.price)}
                onChange={(e) =>
                    setFormData({
                        ...formData,
                        price: parseFloat(e.target.value) || 0,
                    })
                }
                placeholder="0.00 (can be negative, zero, or positive)"
            />

            <div className="flex items-center space-x-2">
                <Checkbox
                    id="isAvailable"
                    checked={formData.isAvailable}
                    onCheckedChange={(checked) =>
                        setFormData({
                            ...formData,
                            isAvailable: checked as boolean,
                        })
                    }
                />
                <Label htmlFor="isAvailable" className="cursor-pointer">
                    Available
                </Label>
            </div>

            <InputField
                id="modifier-option-display-order"
                name="displayOrder"
                label="Display Order"
                type="number"
                value={String(formData.displayOrder)}
                onChange={(e) =>
                    setFormData({
                        ...formData,
                        displayOrder: parseInt(e.target.value) || 0,
                    })
                }
                placeholder="0"
            />

            <div className="flex justify-end gap-2 pt-4">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => onSubmit({ cancel: true })}
                >
                    Cancel
                </Button>
                <Button type="submit" disabled={isLoading} className="bg-orion-blue">
                    {isLoading ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            Saving...
                        </>
                    ) : initialData ? (
                        'Update'
                    ) : (
                        'Create'
                    )}
                </Button>
            </div>
        </form>
    );
}

