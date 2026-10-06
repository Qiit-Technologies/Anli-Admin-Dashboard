import { InputField } from '@/components/common/Form';
import { SelectField } from '@/components/common/Form';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import React, { useState } from 'react';
import { z } from 'zod';
import useSWR from 'swr';
import { getDineInAreas } from '@/app/actions/back-of-house';

const formSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    description: z.string().optional(),
    dineInAreaId: z.number().optional(),
});

interface MenuFormData {
    id?: number;
    name?: string;
    description?: string;
    dineInAreaId?: number;
    menuCategories?: any[];
}

type ValidatedMenuFormData = {
    name: string;
    description: string;
    dineInAreaId?: number;
};

interface MenuFormErrors {
    name?: string;
    description?: string;
    dineInAreaId?: string;
}

interface MutateMenuFormProps {
    initialData?: MenuFormData;
    onSubmit: (data: ValidatedMenuFormData) => void;
    mode?: 'add' | 'edit';
    isLoading?: boolean;
}

const MutateMenuForm: React.FC<MutateMenuFormProps> = ({
    initialData = { name: '', description: '', dineInAreaId: undefined },
    onSubmit,
    mode = 'add',
    isLoading,
}) => {
    const { data: dineInAreas } = useSWR(
        '/restaurants/dine-in-areas',
        getDineInAreas,
    );
    const [formData, setFormData] = React.useState<MenuFormData>(initialData);
    const [errors, setErrors] = useState<MenuFormErrors>({});

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const result = formSchema.safeParse(formData);
        if (!result.success) {
            setErrors(result.error.flatten().fieldErrors as any);
            return;
        }
        const normalizedFormData: ValidatedMenuFormData = {
            name: result.data.name,
            description: result.data.description || '',
            dineInAreaId: result.data.dineInAreaId,
        };
        onSubmit(normalizedFormData);
    };

    return (
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <div>
                <InputField
                    id="name"
                    name="name"
                    label="Menu Name"
                    type="text"
                    placeholder="Enter Menu Name"
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
                <InputField
                    id="description"
                    name="description"
                    label="Description"
                    type="text"
                    placeholder="Enter Description (Optional)"
                    value={formData.description}
                    onChange={(e) =>
                        setFormData({
                            ...formData,
                            description: e.target.value,
                        })
                    }
                />
            </div>

            <div>
                <SelectField
                    id="dineInArea"
                    name="dineInArea"
                    label="Dine Area (Optional)"
                    placeholder="Select Dine Area"
                    value={
                        formData.dineInAreaId
                            ? String(formData.dineInAreaId)
                            : 'none'
                    }
                    onValueChange={(value) =>
                        setFormData({
                            ...formData,
                            dineInAreaId:
                                value && value !== 'none'
                                    ? Number(value)
                                    : undefined,
                        })
                    }
                    options={[
                        { value: 'none', label: 'None (General Menu)' },
                        ...(dineInAreas?.data?.map((area: any) => ({
                            value: area.id.toString(),
                            label: area.name,
                        })) ?? []),
                    ]}
                />
                <p className="text-xs text-muted-foreground mt-1">
                    Attach this menu to a specific dine area, or leave blank for
                    a general menu
                </p>
            </div>

            <Button
                disabled={!formData.name || isLoading}
                className="h-12 bg-orion-blue text-white w-full"
                type="submit"
            >
                {isLoading ? (
                    <Loader2 className="animate-spin mr-2" />
                ) : mode === 'add' ? (
                    'Create Menu'
                ) : (
                    'Update Menu'
                )}
            </Button>
        </form>
    );
};

export default MutateMenuForm;
