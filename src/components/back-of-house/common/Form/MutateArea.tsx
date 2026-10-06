import { InputField } from '@/components/common/Form';
import { Button } from '@/components/ui/button';
import React from 'react';
import { z } from 'zod';

const formSchema = z.object({
    area: z.string().min(1, 'Area name is required'),
    numberOfTable: z.string().min(1, 'Table Number is required'),
});

interface AreaFormData {
    area: string;
    numberOfTable: string;
}

interface AreaFormErrors {
    area?: string;
    numberOfTable?: string;
}

interface MutateAreaFormProps {
    initialData?: AreaFormData;
    onSubmit: (data: AreaFormData) => void;
    mode?: 'add' | 'edit';
}

const MutateAreaForm: React.FC<MutateAreaFormProps> = ({
    initialData = { area: '', numberOfTable: '' },
    onSubmit,
    mode = 'add',
}) => {
    const [formData, setFormData] = React.useState<AreaFormData>(initialData);
    const [errors, setErrors] = React.useState<AreaFormErrors>({});

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const result = formSchema.safeParse(formData);
        if (!result.success) {
            setErrors(result.error.flatten().fieldErrors as any);
            return;
        }
        const normalizedFormData = {
            id: 1,
            area: result.data.area,
            numberOfTable: result.data.numberOfTable,
        };
        onSubmit(normalizedFormData);
    };

    return (
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <div>
                <InputField
                    id="area"
                    name="area"
                    label="Area Name"
                    type="text"
                    placeholder="Enter Area Name"
                    value={formData.area}
                    onChange={(e) =>
                        setFormData({
                            ...formData,
                            area: e.target.value,
                        })
                    }
                />
                {errors.area && !formData.area && (
                    <p className="text-red-500 text-sm lowercase mt-2">
                        {errors.area}
                    </p>
                )}
            </div>
            <div>
                <InputField
                    id="numberOfTable"
                    name="numberOfTable"
                    label="Number Of Table"
                    type="text"
                    placeholder="Enter Table Number"
                    value={formData.numberOfTable}
                    onChange={(e) =>
                        setFormData({
                            ...formData,
                            numberOfTable: e.target.value,
                        })
                    }
                />
                {errors.numberOfTable && !formData.numberOfTable && (
                    <p className="text-red-500 text-sm lowercase mt-2">
                        {errors.numberOfTable}
                    </p>
                )}
            </div>

            <Button
                disabled={!formData.area || !formData.numberOfTable}
                className="h-12 bg-orion-blue text-white w-full"
                type="submit"
            >
                {mode === 'add' ? 'Add Area' : 'Update Area'}
            </Button>
        </form>
    );
};

export default MutateAreaForm;
