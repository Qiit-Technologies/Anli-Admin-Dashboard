'use client';
import { createModifierGroup, getModifierGroups } from '@/app/actions/modifier';
import { PageHeader, PageHeadertitle } from '@/components/common/layout/Header';
import PageWrapper from '@/components/common/PageWrapper';
import CustomTable from '@/components/common/table/CustomTable';
import Toast from '@/components/toast';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { useState } from 'react';
import toast from 'react-hot-toast';
import useSWR, { mutate } from 'swr';
import ModifierGroupForm from '@/components/back-of-house/modifiers/ModifierGroupForm';
import { ModifierGroupColumns } from '@/components/back-of-house/tables/columns/ModifierGroup';

export default function ModifiersPage() {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [selected, setSelected] = useState<number[]>([]);

    const { data: modifierGroups } = useSWR('modifier-groups', getModifierGroups);

    const handleSubmit = async (data: any) => {
        if (data.cancel) {
            setIsOpen(false);
            return;
        }

        setIsLoading(true);
        try {
            const response = await createModifierGroup(data);
            if (response?.data) {
                setIsOpen(false);
                toast.custom(() => (
                    <Toast
                        title="Success!"
                        description="Modifier group created successfully!"
                        type="success"
                    />
                ));
                mutate('modifier-groups');
            } else {
                toast.custom(() => (
                    <Toast
                        title="Error!"
                        description={response?.error || 'An error occurred'}
                        type="error"
                    />
                ));
            }
        } catch (err) {
            if (err instanceof Error) {
                console.log(err.message);
            } else {
                console.log('An unexpected error occurred');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <PageWrapper>
            <PageHeader>
                <PageHeadertitle
                    title="Modifiers"
                    subtitle="Manage modifier groups and options"
                />
            </PageHeader>
            <div className="w-full h-full rounded-md p-4 flex flex-col gap-4">
                <CustomTable
                    columns={ModifierGroupColumns(selected, setSelected)}
                    data={modifierGroups?.data ?? []}
                    title="Modifier Groups"
                    hasFilter={false}
                    extend={
                        <div className="flex items-center gap-2 ml-auto">
                            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                                <DialogTrigger asChild>
                                    <Button className="bg-orion-blue">
                                        Add Modifier Group
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                                    <DialogHeader>
                                        <DialogTitle>Add New Modifier Group</DialogTitle>
                                        <DialogDescription>
                                            Create a new modifier group (e.g., Size,
                                            Toppings)
                                        </DialogDescription>
                                    </DialogHeader>
                                    <ModifierGroupForm
                                        initialData={null}
                                        onSubmit={handleSubmit}
                                        isLoading={isLoading}
                                    />
                                </DialogContent>
                            </Dialog>
                        </div>
                    }
                />
            </div>
        </PageWrapper>
    );
}

