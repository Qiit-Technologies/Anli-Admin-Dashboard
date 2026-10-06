import { getDineInAreas } from '@/app/actions/back-of-house';
import { InputField, SelectField } from '@/components/common/Form';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import React, { useState } from 'react';
import useSWR from 'swr';
import { z } from 'zod';

export interface TableMutateProps {
    areaId: number;
    number: number;
    numberOfSeats: number;
}

const zodSchema = z.object({
    areaId: z.number().min(1, 'Area is required'),
    number: z.number().min(1, 'Table number is required'),
    numberOfSeats: z.number().min(1, 'Number of seats is required'),
});

const MutateAreaTableForm = ({
    onSubmit,
    mode,
    initialData,
}: {
    onSubmit: (data: TableMutateProps) => void;
    mode: 'add' | 'edit';
    initialData?: {
        areaId?: number;
        number: number;
        numberOfSeats: number;
    };
}) => {
    const { data: dineInAreas } = useSWR(
        '/restaurants/dine-in-areas',
        getDineInAreas,
    );

    const areaOptions =
        dineInAreas?.data?.map((area: { id: number; name: string }) => ({
            value: area.id.toString(),
            label: area.name,
        })) || [];
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        areaId: initialData?.areaId || 0,
        number: initialData?.number ? initialData.number.toString() : '',
        numberOfSeats: initialData?.numberOfSeats
            ? initialData.numberOfSeats.toString()
            : '',
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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const dataToValidate = {
            areaId: formData.areaId,
            number: Number(formData.number),
            numberOfSeats: Number(formData.numberOfSeats),
        };

        const result = zodSchema.safeParse(dataToValidate);
        if (!result.success) {
            setLoading(false);
            return;
        }

        onSubmit(dataToValidate);
        setLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <SelectField
                    label="Area"
                    name="area"
                    id="area"
                    placeholder="Select area"
                    value={
                        formData.areaId === 0 ? '' : formData.areaId.toString()
                    }
                    onValueChange={(value) =>
                        setFormData({ ...formData, areaId: Number(value) })
                    }
                    options={areaOptions}
                    //disabled={mode === 'edit'}
                />
            </div>
            <div className="space-y-2">
                <InputField
                    label="Table Number"
                    name="number"
                    type="text"
                    placeholder="Enter table number"
                    id="number"
                    value={formData.number}
                    onChange={handleChange}
                />
            </div>
            <div className="space-y-2">
                <InputField
                    label="Number of Seats"
                    name="numberOfSeats"
                    type="text"
                    id="numberOfSeats"
                    placeholder="Enter number of seats"
                    value={formData.numberOfSeats}
                    onChange={handleChange}
                />
            </div>
            <div className="flex justify-end pt-4">
                <Button
                    disabled={
                        !formData.areaId ||
                        !formData.number ||
                        !formData.numberOfSeats ||
                        loading
                    }
                    type="submit"
                    className="bg-orion-blue hover:bg-orion-blue/90 w-full h-12"
                >
                    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                    {mode === 'add' ? 'Create Table' : 'Update Table'}
                </Button>
            </div>
        </form>
    );
};

export default MutateAreaTableForm;
