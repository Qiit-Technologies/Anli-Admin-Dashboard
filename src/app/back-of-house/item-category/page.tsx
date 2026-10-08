'use client';
import {
    createMenuCategory,
    getMenuCategories,
} from '@/app/actions/menu-category';
import { exportMenuCategories } from '@/app/actions/menu-item';
import MutateCategoryForm from '@/components/back-of-house/common/Form/MutateCategoryFrom';
import { ItemCategoryColumns } from '@/components/back-of-house/tables/columns/ItemCategory';
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

export default function ItemCategoryPage() {
    const [isOpen, setIsOpen] = useState(false);
    const [selected, setSelected] = useState<number[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const { data: menuCategories } = useSWR(
        'menu-category?=f&b',
        getMenuCategories,
    );
    const handleSubmit = async (data: {
        id?: number;
        name: string;
        category: string;
        description: string;
        menuIds: number[];
    }) => {
        setIsLoading(true);
        try {
            const response = await createMenuCategory(data);
            if (response?.message === 'Menu category created successfully!') {
                setIsOpen(false);
                toast.custom(() => (
                    <Toast
                        title="Success!"
                        description={response.message}
                        type="success"
                    />
                ));
                mutate('menu-category?=f&b');
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

    const handleExport = async () => {
        try {
            const response = await exportMenuCategories();
            if (response.message === 'File downloaded successfully') {
                toast.custom(() => (
                    <Toast
                        title="Success!"
                        description={response.message}
                        type="success"
                    />
                ));
                mutate('/menu/category');
            } else {
                toast.custom(() => (
                    <Toast
                        title="Error!"
                        description={response?.error.message}
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
        }
    };

    return (
        <PageWrapper>
            <PageHeader>
                <PageHeadertitle
                    title="Item Category"
                    subtitle={`Manage Item Categories`}
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
                        columns={ItemCategoryColumns(selected, setSelected)}
                        data={menuCategories?.data ?? []}
                        title="Item Category"
                        hasFilter={false}
                        extend={
                            <div className="flex items-center gap-2 ml-auto">
                                <Button
                                    variant={'outline'}
                                    onClick={handleExport}
                                    className="border-orion-blue text-orion-blue"
                                >
                                    Export
                                </Button>

                                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                                    <DialogTrigger asChild>
                                        <Button className="bg-orion-blue">
                                            Add Item Category
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>
                                                Create Item Category
                                            </DialogTitle>
                                            <DialogDescription>
                                                Create a new Item Category here.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <MutateCategoryForm
                                            isLoading={isLoading}
                                            onSubmit={(data) => {
                                                handleSubmit(
                                                    data as {
                                                        id?: number;
                                                        name: string;
                                                        description: string;
                                                        category: string;
                                                        menuIds: number[];
                                                    },
                                                );
                                                mutate('menu-category?=f&b');
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
