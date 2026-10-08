'use client';
import { getMenuCategories } from '@/app/actions/menu-category';
import { exportMenuSubCategories } from '@/app/actions/menu-item';
import {
    createMenuSubCategory,
    getMenuSubCategories,
} from '@/app/actions/menu-sub-category';
import MutateSubCategoryForm from '@/components/back-of-house/common/Form/MutateSubCategory';
import MiniCatColumns from '@/components/back-of-house/tables/columns/MiniCategory';
import { CustomSheet } from '@/components/common/CustomSheet';
import { PageHeader, PageHeadertitle } from '@/components/common/layout/Header';
import PageWrapper from '@/components/common/PageWrapper';
import CustomTable from '@/components/common/table/CustomTable';
import Toast from '@/components/toast';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { LuBell } from 'react-icons/lu';
import useSWR, { mutate } from 'swr';

export default function MiniCategoryPage() {
    const [addDialog, setAddDialog] = useState(false);
    const [selected, setSelected] = useState<number[]>([]);
    const [isloading, setIsLoading] = useState(false);

    const { data: menuSubCategories } = useSWR(
        '/menu/sub-category',
        getMenuSubCategories,
    );

    const { data: menuCategories } = useSWR('mini-category', getMenuCategories);
    const handleAddMiniCategory = async (data: any) => {
        setIsLoading(true);
        try {
            const response = await createMenuSubCategory(data);
            if (
                response?.message === 'Menu sub category created successfully!'
            ) {
                setAddDialog(false);
                toast.custom(() => (
                    <Toast
                        title="Success!"
                        description={response.message}
                        type="success"
                    />
                ));
                mutate('/menu/sub-category');
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
        setAddDialog(false);
    };

    const handleExport = async () => {
        try {
            const response = await exportMenuSubCategories();
            if (response.message === 'File downloaded successfully') {
                toast.custom(() => (
                    <Toast
                        title="Success!"
                        description={response.message}
                        type="success"
                    />
                ));
                mutate('mini-category');
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
                    title="Mini Item Category"
                    subtitle="Manage mini item category"
                />
                <div className="ml-auto flex items-center">
                    <Button className="ml-4 bg-white rounded-full border text-gray-400">
                        <LuBell size={18} />
                    </Button>
                </div>
            </PageHeader>

            <div className="w-full h-full rounded-md flex flex-col gap-4">
                <CustomTable
                    columns={MiniCatColumns(selected, setSelected)}
                    data={menuSubCategories?.data ?? []}
                    title="Mini Category"
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
                            <CustomSheet
                                trigger={
                                    <Button className="bg-orion-blue hover:bg-orion-blue">
                                        Add Sub Category
                                    </Button>
                                }
                                title="Enter or Upload Sub Category"
                                open={addDialog}
                                setOpen={setAddDialog}
                            >
                                <div className="border rounded-lg p-4">
                                    <Tabs
                                        defaultValue="single"
                                        className="w-full"
                                    >
                                        <TabsList className="w-full border-b px-0 justify-start gap-4 rounded-none bg-transparent">
                                            {['single'].map((tab) => (
                                                <TabsTrigger
                                                    className="text-base px-0 data-[state=active]:text-hexbrand data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none border-b-2 border-b-transparent data-[state=active]:border-b-hexbrand"
                                                    key={tab}
                                                    value={tab}
                                                >
                                                    {tab}
                                                </TabsTrigger>
                                            ))}
                                        </TabsList>
                                        <TabsContent value="single">
                                            <div className="mt-4">
                                                <MutateSubCategoryForm
                                                    isloading={isloading}
                                                    categories={
                                                        menuCategories?.data ??
                                                        []
                                                    }
                                                    onSubmit={(data) => {
                                                        handleAddMiniCategory(
                                                            data,
                                                        );
                                                        setAddDialog(false);
                                                    }}
                                                    mode="add"
                                                />
                                            </div>
                                        </TabsContent>
                                    </Tabs>
                                </div>
                            </CustomSheet>
                        </div>
                    }
                />
            </div>
        </PageWrapper>
    );
}
