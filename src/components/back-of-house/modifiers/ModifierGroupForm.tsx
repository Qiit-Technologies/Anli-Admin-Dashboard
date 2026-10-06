'use client';
import { InputField } from '@/components/common/Form';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { ModifierGroup } from '@/app/actions/modifier';

interface ModifierGroupFormProps {
    initialData?: ModifierGroup | null;
    onSubmit: (data: any) => void;
    isLoading?: boolean;
}

export default function ModifierGroupForm({
    initialData,
    onSubmit,
    isLoading = false,
}: ModifierGroupFormProps) {
    const [formData, setFormData] = useState({
        name: initialData?.name || '',
        description: initialData?.description || '',
        isRequired: initialData?.isRequired ?? false,
        allowMultiple: initialData?.allowMultiple ?? false,
        minSelections: initialData?.minSelections ?? 0,
        maxSelections: initialData?.maxSelections ?? 0,
        displayOrder: initialData?.displayOrder ?? 0,
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <InputField
                id="modifier-group-name"
                name="name"
                label="Name"
                value={formData.name}
                onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g., Size, Toppings, Preparation"
                required
            />

            <InputField
                id="modifier-group-description"
                name="description"
                label="Description"
                value={formData.description}
                onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Optional description"
            />

            <div className="flex items-center space-x-2">
                <Checkbox
                    id="isRequired"
                    checked={formData.isRequired}
                    onCheckedChange={(checked) =>
                        setFormData({
                            ...formData,
                            isRequired: checked as boolean,
                        })
                    }
                />
                <Label htmlFor="isRequired" className="cursor-pointer">
                    Required (customer must select at least one option)
                </Label>
            </div>

            <div className="flex items-center space-x-2">
                <Checkbox
                    id="allowMultiple"
                    checked={formData.allowMultiple}
                    onCheckedChange={(checked) =>
                        setFormData({
                            ...formData,
                            allowMultiple: checked as boolean,
                        })
                    }
                />
                <Label htmlFor="allowMultiple" className="cursor-pointer">
                    Allow Multiple Selections
                </Label>
            </div>

            {formData.allowMultiple && (
                <>
                    <div className="grid grid-cols-2 gap-4">
                        <InputField
                            id="modifier-group-min-selections"
                            name="minSelections"
                            label="Min Selections"
                            type="number"
                            min="0"
                            value={String(formData.minSelections)}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    minSelections: parseInt(e.target.value) || 0,
                                })
                            }
                        />
                        <InputField
                            id="modifier-group-max-selections"
                            name="maxSelections"
                            label="Max Selections (0 = unlimited)"
                            type="number"
                            min="0"
                            value={String(formData.maxSelections)}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    maxSelections: parseInt(e.target.value) || 0,
                                })
                            }
                        />
                    </div>
                </>
            )}

            <InputField
                id="modifier-group-display-order"
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

