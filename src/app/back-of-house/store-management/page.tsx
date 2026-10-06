'use client';

import { createDineInArea, getDineInAreas } from '@/app/actions/back-of-house';
import MutateDineAreaForm from '@/components/back-of-house/common/Form/MutateDineAreaForm';
import { DineAreaColumns } from '@/components/back-of-house/tables/columns/DineArea';
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

export default function StoreManagementPage() {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const { data: stores } = useSWR('/restaurants/store', getDineInAreas);

    const handleSubmit = async (data: any) => {
        setLoading(true);
        try {
            const response = await createDineInArea(data);
            if (response?.message === 'Store created successfully!') {
                setIsOpen(false);
                toast.custom(() => (
                    <Toast
                        title="Success!"
                        description={response.message}
                        type="success"
                    />
                ));
                setLoading(false);
                mutate('/restaurants/store');
            } else {
                toast.custom(() => (
                    <Toast
                        title="Error!"
                        description={response?.message}
                        type="error"
                    />
                ));
                setLoading(false);
            }
        } catch (err) {
            if (err instanceof Error) {
                console.log(err.message);
            } else {
                console.log('An unexpected error occurred');
            }
        }
        setLoading(false);
        setIsOpen(false);
    };

    return (
        <PageWrapper>
            <PageHeader>
                <PageHeadertitle
                    title="Store Management"
                    subtitle="Manage your restaurant's dining spaces"
                />
            </PageHeader>
            <>
                <div>
                    <CustomTable
                        data={stores?.data ?? []}
                        columns={DineAreaColumns}
                        title="Recently Created Stores"
                        hasFilter={false}
                        extend={
                            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                                <DialogTrigger asChild>
                                    <Button className="hover:bg-orion-blue bg-orion-blue">
                                        Create New Store
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>
                                            Create New Store
                                        </DialogTitle>
                                        <DialogDescription>
                                            Add a new dining space to your
                                            restaurant.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <MutateDineAreaForm
                                        disabled={loading}
                                        onSubmit={handleSubmit}
                                        mode="add"
                                    />
                                </DialogContent>
                            </Dialog>
                        }
                    />
                </div>
            </>
        </PageWrapper>
    );
}
