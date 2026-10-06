import { getDineInAreas } from '@/app/actions/back-of-house';
import { SelectField } from '@/components/common/Form';
import { Button } from '@/components/ui/button';
import { KitchenType } from '@/types/back-of-house.type';
import { Spinner } from '@heroui/react';
import React, { useState } from 'react';
import { IoClose } from 'react-icons/io5';
import useSWR from 'swr';

const MutateKitchenFormDineInArea = ({
    onSubmit,
    mode,
    initialData,
    loading,
}: {
    onSubmit: (data: KitchenType) => void;
    mode: 'add' | 'edit';
    initialData?: KitchenType;
    loading?: boolean;
}) => {
    const [selectedDineInAreas, setSelectedDineInAreas] = useState(
        initialData?.dineInAreas || [],
    );

    const { data: dineInAreas } = useSWR(
        '/restaurants/dine-in-areas',
        getDineInAreas,
    );
    const dineInAreaData = dineInAreas?.data;

    const handleSubmit = (e: React.FormEvent) => {
        const dineInAreasToSubmit = selectedDineInAreas?.map(
            (dineInArea) => dineInArea.id,
        );
        const formData = {
            id: initialData?.id || 0,
            dineIds: dineInAreasToSubmit,
        };
        e.preventDefault();
        onSubmit(formData);
    };

    const handleSelectChange = (value: string) => {
        const dineInAreaObj = dineInAreaData?.find(
            (dineInArea: { id: string }) => dineInArea.id === value,
        );
        const existingMenu = selectedDineInAreas?.find(
            (dineInArea: { id: string }) => dineInArea.id === value,
        );
        if (!existingMenu)
            setSelectedDineInAreas([...selectedDineInAreas, dineInAreaObj]);
    };

    const handleRemove = (id: string) => {
        setSelectedDineInAreas(
            selectedDineInAreas.filter((dineInArea) => dineInArea.id !== id),
        );
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-wrap gap-2">
                {selectedDineInAreas?.map((dineInArea) => (
                    <div key={dineInArea.id}>
                        <div className="px-3 py-1 flex gap-2 items-center bg-slate-300 rounded-sm">
                            <p>{dineInArea?.name}</p>
                            <IoClose
                                size={20}
                                className="cursor-pointer"
                                onClick={() => handleRemove(dineInArea?.id)}
                            />
                        </div>
                    </div>
                ))}
            </div>
            <div className="space-y-2">
                <SelectField
                    placeholder="Dine-In Areas"
                    id="dineInAreas"
                    label="Dine-In Areas"
                    name="dineInAreas"
                    value=""
                    // value={selectedDineInAreas[selectedDineInAreas.length - 1] || ''}
                    onValueChange={handleSelectChange}
                    options={dineInAreaData?.map(
                        (dineInArea: { name: string; id: number }) => ({
                            label: dineInArea?.name,
                            value: dineInArea?.id,
                        }),
                    )}
                />
            </div>
            <div className="flex justify-end pt-4">
                <Button
                    type="submit"
                    disabled={loading}
                    className="bg-orion-blue hover:bg-orion-blue/90 w-full h-12"
                >
                    {loading ? (
                        <Spinner color="white" />
                    ) : mode === 'add' ? (
                        'Create Kitchen'
                    ) : (
                        'Update Kitchen'
                    )}
                </Button>
            </div>
        </form>
    );
};

export default MutateKitchenFormDineInArea;
