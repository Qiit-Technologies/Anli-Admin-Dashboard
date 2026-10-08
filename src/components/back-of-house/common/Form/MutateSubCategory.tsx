import { InputField, SelectField } from '@/components/common/Form';
import { Button } from '@/components/ui/button';
import React from 'react';
import { z } from 'zod';

const formSchema = z.object({
    subCategory: z.string().min(1, 'Sub category name is required'),
});

interface CategoryFormData {
    id?: number;
    menuCategory: string;
    menuCategoryId: number;
    subCategory: string;
    description: string;
}

interface CategoryFormErrors {
    menuCategory?: string;
    subCategory?: string;
    description?: string;
}

interface MutateCategoryFormProps {
    categories: {
        id: number;
        name: string;
        category: string;
        description: string;
    }[];
    initialData?: CategoryFormData;
    onSubmit: (data: CategoryFormData) => void;
    mode?: 'add' | 'edit';
    categoryId?: number;
    isloading?: boolean;
}

const MutateSubCategoryForm: React.FC<MutateCategoryFormProps> = ({
    initialData = {
        id: 0,
        menuCategory: '',
        menuCategoryId: 0,
        subCategory: '',
        description: '',
    },
    onSubmit,
    isloading,
    mode = 'add',
    categories,
    categoryId,
}) => {
    const [formData, setFormData] =
        React.useState<CategoryFormData>(initialData);
    const [errors, setErrors] = React.useState<CategoryFormErrors>({});
    const [loading, setLoading] = React.useState(false);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const result = formSchema.safeParse(formData);
        if (!result.success) {
            setErrors(result.error.flatten().fieldErrors as any);
            return;
        }
        setLoading(true);
        if (mode === 'add') {
            onSubmit({
                menuCategory: formData.menuCategory,
                menuCategoryId: formData.menuCategoryId,
                subCategory: formData.subCategory,
                description: formData.description,
            });
            setLoading(false);
        } else {
            onSubmit({
                id: formData.id,
                menuCategory: formData.menuCategory,
                menuCategoryId: formData.menuCategoryId,
                subCategory: formData.subCategory,
                description: formData.description,
            });
            setLoading(false);
        }
    };
    return (
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <div>
                <SelectField
                    id="menucategory"
                    name="menucategory"
                    label="Menu Category"
                    placeholder="Enter Menu Category"
                    value={
                        mode === 'edit'
                            ? String(categoryId)
                            : String(formData.menuCategoryId)
                    }
                    onValueChange={(value) =>
                        setFormData({
                            ...formData,
                            menuCategoryId: Number(value),
                        })
                    }
                    options={categories.map((category: any) => {
                        return {
                            value: category.id.toString(),
                            label: category.name,
                        };
                    })}
                />
                {errors.menuCategory && !formData.menuCategory && (
                    <p className="text-red-500 text-sm lowercase mt-2">
                        {errors.menuCategory}
                    </p>
                )}
            </div>
            <div>
                <InputField
                    id="subcategory"
                    name="subcategory"
                    label="Sub Category"
                    type="text"
                    placeholder="Enter Sub Category"
                    value={formData.subCategory}
                    onChange={(e) =>
                        setFormData({
                            ...formData,
                            subCategory: e.target.value,
                        })
                    }
                />
                {errors.subCategory && !formData.subCategory && (
                    <p className="text-red-500 text-sm lowercase mt-2">
                        {errors.subCategory}
                    </p>
                )}
            </div>

            <Button
                disabled={
                    isloading ||
                    !formData.subCategory ||
                    !formData.menuCategoryId ||
                    loading
                }
                className="h-12 bg-orion-blue text-white w-full"
                type="submit"
            >
                {(loading || isloading) && (
                    <span className="animate-spin">...</span>
                )}
                {mode === 'add' ? 'Add Category' : 'Update Category'}
            </Button>
        </form>
    );
};

export default MutateSubCategoryForm;
