'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    FormInput,
    FormSelect,
} from '@/components/reservation/form/components';
import { Button } from '@/components/ui/button';
import type { Space } from './SpaceList';

export interface TableFormData {
    spaceId: string;
    tableNumber: string;
    capacity: string;
}

interface NewTableModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: TableFormData) => void;
    spaces: Space[];
    selectedSpaceId?: string;
    initialData?: TableFormData | null;
    isLoading?: boolean;
}

export default function NewTableModal({
    open,
    onOpenChange,
    onSubmit,
    spaces,
    selectedSpaceId,
    initialData,
    isLoading = false,
}: NewTableModalProps) {
    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors, isValid },
    } = useForm<TableFormData>({
        defaultValues: {
            spaceId: selectedSpaceId || '',
            tableNumber: '',
            capacity: '',
        },
    });

    const spaceIdValue = watch('spaceId');

    useEffect(() => {
        if (open) {
            if (initialData) {
                reset(initialData);
            } else {
                reset({
                    spaceId: selectedSpaceId || '',
                    tableNumber: '',
                    capacity: '',
                });
            }
        }
    }, [open, initialData, selectedSpaceId, reset]);

    useEffect(() => {
        if (selectedSpaceId && !initialData) {
            setValue('spaceId', selectedSpaceId);
        }
    }, [selectedSpaceId, setValue, initialData]);

    const onFormSubmit = (data: TableFormData) => {
        onSubmit(data);
        reset({
            spaceId: selectedSpaceId || '',
            tableNumber: '',
            capacity: '',
        });
    };

    const handleOpenChange = (isOpen: boolean) => {
        if (!isOpen) {
            reset({
                spaceId: selectedSpaceId || '',
                tableNumber: '',
                capacity: '',
            });
        }
        onOpenChange(isOpen);
    };

    const spaceOptions = spaces.map((space) => ({
        value: space.id.toString(),
        label: space.name,
    }));

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>
                        {initialData ? 'Update table' : 'Create new table'}
                    </DialogTitle>
                    <DialogDescription>
                        {initialData
                            ? 'Update the details for this table'
                            : 'Enter every details to create or add table to a space'}
                    </DialogDescription>
                </DialogHeader>

                <form
                    onSubmit={handleSubmit(onFormSubmit)}
                    className="space-y-4 mt-4"
                >
                    <FormSelect
                        label="Space Name"
                        placeholder="Enter space name"
                        options={spaceOptions}
                        registration={register('spaceId', {
                            required: 'Space is required',
                        })}
                        value={spaceIdValue}
                        onChange={(value) => setValue('spaceId', value)}
                        error={errors.spaceId?.message}
                    />

                    <FormInput
                        label="Table Number"
                        placeholder="Enter Table Number"
                        registration={register('tableNumber', {
                            required: 'Table number is required',
                        })}
                        error={errors.tableNumber?.message}
                    />

                    <FormInput
                        label="Table Capacity"
                        placeholder="Enter Capacity"
                        type="number"
                        registration={register('capacity', {
                            required: 'Capacity is required',
                        })}
                        error={errors.capacity?.message}
                    />

                    <Button
                        type="submit"
                        disabled={isLoading || !isValid}
                        className="w-full bg-[#0A84FF] hover:bg-[#0A84FF]/90 text-white py-6"
                    >
                        {isLoading
                            ? initialData
                                ? 'Updating...'
                                : 'Adding...'
                            : initialData
                              ? 'Update Table'
                              : 'Add Table'}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
