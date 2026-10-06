'use client';

import React from 'react';
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
    FormTextarea,
} from '@/components/reservation/form/components';
import { Button } from '@/components/ui/button';

export interface SpaceFormData {
    name: string;
    description: string;
}

interface NewSpaceModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: SpaceFormData) => void;
    isLoading?: boolean;
}

export default function NewSpaceModal({
    open,
    onOpenChange,
    onSubmit,
    isLoading = false,
}: NewSpaceModalProps) {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isValid },
    } = useForm<SpaceFormData>({
        defaultValues: {
            name: '',
            description: '',
        },
    });

    const onFormSubmit = (data: SpaceFormData) => {
        onSubmit(data);
        reset();
    };

    const handleOpenChange = (isOpen: boolean) => {
        if (!isOpen) {
            reset();
        }
        onOpenChange(isOpen);
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>New Table/Space</DialogTitle>
                    <DialogDescription>
                        Enter details to create a new reservation space
                    </DialogDescription>
                </DialogHeader>

                <form
                    onSubmit={handleSubmit(onFormSubmit)}
                    className="space-y-4 mt-4"
                >
                    <FormInput
                        label="Space Name"
                        placeholder="Enter space name (e.g. Indoor Area)"
                        registration={register('name', {
                            required: 'Space name is required',
                        })}
                        error={errors.name?.message}
                    />

                    <FormTextarea
                        label="Space Description"
                        placeholder="Write a short description about this space"
                        registration={register('description')}
                        error={errors.description?.message}
                        rows={3}
                    />

                    <Button
                        type="submit"
                        disabled={isLoading || !isValid}
                        className="w-full bg-[#0A84FF] hover:bg-[#0A84FF]/90 text-white py-6"
                    >
                        {isLoading ? 'Saving...' : 'Save Space'}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
