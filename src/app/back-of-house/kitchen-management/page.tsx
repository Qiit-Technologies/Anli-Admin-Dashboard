'use client';

import { createKitchen, getKitchens } from '@/app/actions/back-of-house';
import MutateKitchenForm from '@/components/back-of-house/common/Form/MutateKitchenForm';
import { KitchenColumns } from '@/components/back-of-house/tables/columns/Kitchen';
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

export default function KitchenManagementPage() {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const { data: kitchens } = useSWR('/kitchen', getKitchens);

    const handleSubmit = async (data: any) => {
        setLoading(true);
        try {
            const response = await createKitchen(data);
            if (response?.message === 'Kitchen created successfully!') {
                setIsOpen(false);
                toast.custom(() => (
                    <Toast
                        title="Success!"
                        description={response.message}
                        type="success"
                    />
                ));
                setLoading(false);
                mutate('/kitchen');
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
                    title="Kitchen Management"
                    subtitle="Manage your restaurant's kitchen"
                />
            </PageHeader>
            <>
                <div>
                    <CustomTable
                        data={kitchens?.data ?? []}
                        columns={KitchenColumns}
                        title="Recently Created Kitchen"
                        hasFilter={false}
                        extend={
                            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                                <DialogTrigger asChild>
                                    <Button className="hover:bg-orion-blue bg-orion-blue">
                                        Create New Kitchen
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>
                                            Create New Kitchen
                                        </DialogTitle>
                                        <DialogDescription>
                                            Add a new kitchen to your
                                            restaurant.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <MutateKitchenForm
                                        loading={loading}
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
