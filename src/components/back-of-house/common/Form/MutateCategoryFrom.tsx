import { InputField } from '@/components/common/Form';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import React, { useState } from 'react';
import { z } from 'zod';
import useSWR from 'swr';
import { getMenus } from '@/app/actions/menu';
import { MultiSelect } from '@/components/common/multi-select';

const formSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    category: z.string().min(1, 'Category name is required'),
    description: z.string().min(1, 'Description is required'),
    menuIds: z.array(z.number()).min(1, 'At least one menu is required'),
});

interface CategoryFormData {
    name: string;
    category: string;
    description: string;
    menuIds: number[];
}

interface CategoryFormErrors {
    name?: string;
    category?: string;
    description?: string;
    menuIds?: string;
}

interface MutateCategoryFormProps {
    initialData?: Partial<CategoryFormData> | any; // Allow flexible initial data
    onSubmit: (data: CategoryFormData) => void;
    mode?: 'add' | 'edit';
    isLoading?: boolean;
}

const categoryOptions = [
    { value: 'Food', label: 'Food' },
    { value: 'Drink', label: 'Drink' },
];

const MutateCategoryForm: React.FC<MutateCategoryFormProps> = ({
    initialData = { name: '', category: '', description: '', menuIds: [] },
    onSubmit,
    mode = 'add',
    isLoading,
}) => {
    const { data: menus } = useSWR('menus', getMenus);
    // Extract menuIds from initialData (could be menus array, menu object, or menuIds array)
    const getInitialMenuIds = (): number[] => {
        if (
            (initialData as any).menuIds &&
            Array.isArray((initialData as any).menuIds)
        ) {
            return (initialData as any).menuIds;
        }
        if (
            (initialData as any).menus &&
            Array.isArray((initialData as any).menus)
        ) {
            return (initialData as any).menus.map((m: any) => m.id || m);
        }
        if ((initialData as any).menu?.id) {
            return [(initialData as any).menu.id];
        }
        if ((initialData as any).menuId) {
            return [(initialData as any).menuId];
        }
        return [];
    };

    const [formData, setFormData] = React.useState<CategoryFormData>({
        name: initialData.name || '',
        category: initialData.category || '',
        description: initialData.description || '',
        menuIds: getInitialMenuIds(),
    });
    const [errors, setErrors] = useState<CategoryFormErrors>({});

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const result = formSchema.safeParse(formData);
        if (!result.success) {
            setErrors(result.error.flatten().fieldErrors as any);
            return;
        }
        const normalizedFormData = {
            name: result.data.name,
            category: result.data.category,
            description: result.data.description,
            menuIds: result.data.menuIds,
        };
        onSubmit(normalizedFormData);
    };

    const updateFormData = (field: keyof CategoryFormData, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const menuOptions =
        menus?.data?.map((menu: any) => ({
            value: menu.id.toString(),
            label: menu.name,
        })) ?? [];

    return (
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Menus
                </label>
                <MultiSelect
                    options={menuOptions}
                    value={formData.menuIds?.map((id) => id.toString()) || []}
                    onValueChange={(values) => {
                        setFormData({
                            ...formData,
                            menuIds: values.map((v) => Number(v)),
                        });
                        // Clear error when user selects
                        if (errors.menuIds) {
                            setErrors({ ...errors, menuIds: undefined });
                        }
                    }}
                    placeholder="Select one or more menus"
                    variant="inverted"
                    animation={0}
                    maxCount={3}
                />
                {errors.menuIds && formData.menuIds.length === 0 && (
                    <p className="text-red-500 text-sm lowercase mt-2">
                        {errors.menuIds}
                    </p>
                )}
            </div>
            <div>
                <InputField
                    id="name"
                    name="name"
                    label="Name"
                    type="text"
                    placeholder="Enter Name"
                    value={formData.name}
                    onChange={(e) =>
                        setFormData({
                            ...formData,
                            name: e.target.value,
                        })
                    }
                />
                {errors.name && !formData.name && (
                    <p className="text-red-500 text-sm lowercase mt-2">
                        {errors.name}
                    </p>
                )}
            </div>
            <div>
                <label
                    htmlFor="category"
                    className="block text-sm font-medium text-gray-700 mb-1"
                >
                    Category
                </label>
                <Select
                    value={formData.category}
                    onValueChange={(value) => updateFormData('category', value)}
                >
                    <SelectTrigger
                        id="category"
                        className="w-full bg-gray-100 border-none focus:ring-brand focus-within:ring-brand focus-visible:ring-brand"
                    >
                        <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                        {categoryOptions.map(({ value, label }) => (
                            <SelectItem key={value} value={value}>
                                {label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {errors.category && !formData.category && (
                    <p className="text-red-500 text-sm lowercase mt-2">
                        {errors.category}
                    </p>
                )}
            </div>

            <div>
                <InputField
                    id="description"
                    name="description"
                    label="Description"
                    type="text"
                    placeholder="Enter Description"
                    value={formData.description}
                    onChange={(e) =>
                        setFormData({
                            ...formData,
                            description: e.target.value,
                        })
                    }
                />
                {errors.description && !formData.description && (
                    <p className="text-red-500 text-sm lowercase mt-2">
                        {errors.description}
                    </p>
                )}
            </div>

            <Button
                disabled={
                    !formData.name ||
                    !formData.category ||
                    !formData.menuIds ||
                    formData.menuIds.length === 0 ||
                    isLoading
                }
                className="h-12 bg-orion-blue text-white w-full"
                type="submit"
            >
                {isLoading ? (
                    <Loader2 className="animate-spin mr-2" />
                ) : mode === 'add' ? (
                    'Add Category'
                ) : (
                    'Update Category'
                )}
            </Button>
        </form>
    );
};

export default MutateCategoryForm;
