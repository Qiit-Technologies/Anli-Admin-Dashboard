'use client';
import { createMenu, getMenus } from '@/app/actions/menu';
import MutateMenuForm from '@/components/back-of-house/common/Form/MutateMenuForm';
import { MenuColumns } from '@/components/back-of-house/tables/columns/Menu';
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
import { LuBell } from 'react-icons/lu';
import useSWR, { mutate } from 'swr';

export default function MenuManagementPage() {
    const [isOpen, setIsOpen] = useState(false);
    const [selected, setSelected] = useState<number[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const { data: menus } = useSWR('menus', getMenus);

    const handleSubmit = async (data: {
        name: string;
        description: string;
        dineInAreaId?: number;
    }) => {
        setIsLoading(true);
        try {
            const response = await createMenu(data);
            if (response?.message === 'Menu created successfully!') {
                setIsOpen(false);
                toast.custom(() => (
                    <Toast
                        title="Success!"
                        description={response.message}
                        type="success"
                    />
                ));
                mutate('menus');
            } else {
                toast.custom(() => (
                    <Toast
                        title="Error!"
                        description={response?.message}
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
        setIsOpen(false);
    };

    return (
        <PageWrapper>
            <PageHeader>
                <PageHeadertitle
                    title="Menu Management"
                    subtitle="Manage your restaurant menus"
                />
                <div className="ml-auto flex items-center">
                    <Button className="ml-4 bg-white rounded-full border text-gray-400">
                        <LuBell size={18} />
                    </Button>
                </div>
            </PageHeader>
            <div className="w-full h-full rounded-md p-4 flex flex-col gap-4">
                <div>
                    <CustomTable
                        columns={MenuColumns(selected, setSelected)}
                        data={menus?.data ?? []}
                        title="Menus"
                        hasFilter={false}
                        extend={
                            <div className="flex items-center gap-2 ml-auto">
                                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                                    <DialogTrigger asChild>
                                        <Button className="bg-orion-blue">
                                            Create Menu
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>
                                                Create Menu
                                            </DialogTitle>
                                            <DialogDescription>
                                                Create a new menu for your
                                                restaurant. You can attach it to
                                                a dine area or leave it as a
                                                general menu.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <MutateMenuForm
                                            isLoading={isLoading}
                                            onSubmit={(data) => {
                                                handleSubmit(
                                                    data as {
                                                        name: string;
                                                        description: string;
                                                        dineInAreaId?: number;
                                                    },
                                                );
                                                mutate('menus');
                                            }}
                                            mode="add"
                                        />
                                    </DialogContent>
                                </Dialog>
                            </div>
                        }
                    />
                </div>
            </div>
        </PageWrapper>
    );
}
