'use client';
import {
    createMenuItem,
    exportMenuItems,
    getMenuItems,
} from '@/app/actions/menu-item';
import BulkUploadItem from '@/components/back-of-house/common/Form/BulkUploadItems';
import MutateItemForm from '@/components/back-of-house/common/Form/MutateItemForm';
import { ItemTableColumns } from '@/components/back-of-house/tables/columns/ItemCol';
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
import { getDynamicFilters } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'nextjs-toploader/app';
import { useState } from 'react';
import toast from 'react-hot-toast';
import useSWR, { mutate } from 'swr';
import { Item } from '../../../components/back-of-house/types/types';

export default function ItemGroupPage() {
    const { data: menuItems } = useSWR('menu-item?=f&b', getMenuItems);
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [isloading, setIsLoading] = useState(false);
    const [selected, setSelected] = useState<number[]>([]);
    const [openBulk, setOpenBulk] = useState(false);
    const [loadingBulk, setLoadingBulk] = useState(false);

    const handleAddItem = async (data: Item) => {
        try {
            setIsLoading(true);
            const response = await createMenuItem(data);
            if (response?.message === 'Menu item created successfully!') {
                setIsOpen(false);
                toast.custom(() => (
                    <Toast
                        title="Success!"
                        description={response.message}
                        type="success"
                    />
                ));
                mutate('menu-item?=f&b');
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

    const handleOnClose = () => {
        setOpenBulk(false);
        mutate('menu-item?=f&b');
    };

    if (loadingBulk) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="animate-spin h-10 w-10 text-orion-blue" />
                <span> Loaindg Menu Items </span>
            </div>
        );
    }

    const handleExport = async () => {
        try {
            const response = await exportMenuItems();
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
                        description={response?.message ?? "An unexpected error occurred"}
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

    const dynamicFilters = [
        {
            id: 'category',
            label: 'Category',
            options: getDynamicFilters(menuItems?.data ?? [], 'category.name'),
        },
    ];

    return (
        <PageWrapper>
            <PageHeader>
                <PageHeadertitle
                    title="Items"
                    // hasBack={true}
                    subtitle={`Manage Items`}
                />
            </PageHeader>
            <div className="flex items-center gap-2">
                <Button
                    variant={'outline'}
                    onClick={handleExport}
                    className="border-orion-blue text-orion-blue"
                >
                    Export
                </Button>
                <Button
                    onClick={() => router.push('/scan/custom-menu')}
                    className="bg-orion-blue text-white"
                >
                    Print Menu QR Code
                </Button>
                <Button
                    variant={'outline'}
                    onClick={() => router.push('/scan/custom-menu')}
                    className="border-orion-blue text-orion-blue"
                >
                    Print Direct Menu QR Code
                </Button>
                <Dialog open={openBulk} onOpenChange={setOpenBulk}>
                    <DialogTrigger asChild>
                        <Button
                            variant={'outline'}
                            className="border-orion-blue text-orion-blue"
                        >
                            Upload Bulk Items
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Upload Bulk</DialogTitle>
                            <DialogDescription>
                                Upload a bulk of items here.
                            </DialogDescription>
                        </DialogHeader>
                        <BulkUploadItem
                            loading={loadingBulk}
                            setLoading={setLoadingBulk}
                            closeBus={handleOnClose}
                        />
                    </DialogContent>
                </Dialog>
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-orion-blue">Add Item</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New Item</DialogTitle>
                            <DialogDescription>
                                Create a new Item here.
                            </DialogDescription>
                        </DialogHeader>
                        <MutateItemForm
                            isloading={isloading}
                            onSubmit={(data) => {
                                handleAddItem({
                                    ...data,
                                    categoryId: data.categoryId,
                                    category: data.category,
                                    subCategoryId: data.subCategoryId,
                                });
                                mutate('menu-item?=f&b');
                            }}
                            mode="add"
                        />
                    </DialogContent>
                </Dialog>
            </div>
            <div className="w-full h-full rounded-md p-4 flex flex-col gap-4">
                <div>
                    <CustomTable
                        columns={ItemTableColumns(selected, setSelected)}
                        data={menuItems?.data ?? []}
                        filters={dynamicFilters}
                        persistPaginationInQuery
                        paginationQueryKey="itemPage"
                    />
                </div>
            </div>
        </PageWrapper>
    );
}
