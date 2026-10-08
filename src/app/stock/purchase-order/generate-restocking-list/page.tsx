'use client';
import { createItem } from '@/app/actions/items';
import { PageHeader } from '@/components/common/layout/Header';
import { NewStockItemModal } from '@/components/common/modals/NewStockItem';
import PageWrapper from '@/components/common/PageWrapper';
import { NotificationsPopover } from '@/components/house-keeping/common/Notification';
import SearchInput from '@/components/house-keeping/common/SearchInput';
import { grnColumns } from '@/components/stock/tables/columns/grn';
import { stockItemsFilters } from '@/components/stock/tables/columns/items';
import GRTable from '@/components/stock/tables/GRTable';
import Toast from '@/components/toast';
import { Button } from '@/components/ui/button';
import { fetchStockItems } from '@/hooks/fetcher';
import { Item, ItemProps } from '@/types';
import { BreadcrumbItem, Breadcrumbs } from '@heroui/react';
import toast from 'react-hot-toast';
import useSWR, { mutate } from 'swr';
import { SendEmailToVendor } from './send-mail-to-vendor';

const GRLPage = () => {
    const { data: items } = useSWR('/items', fetchStockItems);
    const handleStockItemSubmit = async (data: ItemProps) => {
        try {
            const response = await createItem(data);
            if (response) {
                if (response.message === 'Item created successfully!') {
                    toast.custom(() => (
                        <Toast
                            title="Success!"
                            description={response.message}
                            type="success"
                        />
                    ));
                    mutate('/items');
                } else {
                    toast.custom(() => (
                        <Toast
                            title="Error!"
                            description={response.message}
                            type="error"
                        />
                    ));
                }
            }
        } catch (err: unknown) {
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
                <Breadcrumbs>
                    <BreadcrumbItem
                        classNames={{
                            item: [
                                'hover:underline',
                                'hover:text-brand',
                                'text-base',
                            ],
                        }}
                        href="/stock/purchase-order"
                    >
                        Purchase Order
                    </BreadcrumbItem>
                    <BreadcrumbItem
                        classNames={{
                            item: ['text-orion-blue text-base'],
                        }}
                    >
                        Generate Restocking List
                    </BreadcrumbItem>
                </Breadcrumbs>
                <div className="ml-auto flex items-center">
                    <SearchInput />
                    <NotificationsPopover />
                </div>
            </PageHeader>
            <div>
                <GRTable
                    data={(items as Item[]) ?? []}
                    columns={grnColumns}
                    filters={stockItemsFilters}
                    hasHeader={true}
                    title="Restocking List"
                    extendControls={
                        <>
                            <Button
                                className="rounded-md border bg-white"
                                variant="outline"
                                onClick={() =>
                                    SendEmailToVendor((items as Item[]) ?? [])
                                }
                            >
                                Send to vendor via email
                            </Button>
                            <NewStockItemModal
                                onSubmit={handleStockItemSubmit}
                                trigger={
                                    <Button
                                        variant={'outline'}
                                        className="border-orion-blue text-orion-blue"
                                    >
                                        Add new item
                                    </Button>
                                }
                            />
                        </>
                    }
                />
            </div>
        </PageWrapper>
    );
};

export default GRLPage;
