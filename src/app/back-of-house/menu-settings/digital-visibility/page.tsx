'use client';

import { getMenuItems, updateMenuItem } from '@/app/actions/menu-item';
import { PageHeader, PageHeadertitle } from '@/components/common/layout/Header';
import PageWrapper from '@/components/common/PageWrapper';
import CustomTable from '@/components/common/table/CustomTable';
import Toast from '@/components/toast';
import { Button } from '@/components/ui/button';
import { getDynamicFilters } from '@/lib/utils';
import { CheckCircle2, XCircle } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import useSWR, { mutate } from 'swr';
import { Item } from '@/components/back-of-house/types/types';

// Extend Item type for digital menu visibility
interface DigitalMenuItem extends Item {
    isVisibleOnDigitalMenu?: boolean;
}

export default function DigitalMenuVisibilityPage() {
    const { data: menuItems } = useSWR('menu-item?=f&b', getMenuItems);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedRows, setSelectedRows] = useState<any[]>([]);

    // Handle single item visibility toggle
    const handleToggleVisibility = async (item: DigitalMenuItem) => {
        setIsLoading(true);
        try {
            const newVisibility = !item.isVisibleOnDigitalMenu;
            const response = await updateMenuItem(item.id, {
                isVisibleOnDigitalMenu: newVisibility,
            });
            if (response?.message === 'Menu item updated successfully!') {
                toast.custom(() => (
                    <Toast
                        title="Success!"
                        description="Visibility updated successfully!"
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
            console.error(err);
            toast.custom(() => (
                <Toast
                    title="Error!"
                    description="Failed to update visibility. Please try again."
                    type="error"
                />
            ));
        } finally {
            setIsLoading(false);
        }
    };

    // Handle bulk actions: hide selected, show selected, reset to default
    const handleBulkAction = async (action: 'hide' | 'show' | 'reset') => {
        setIsLoading(true);
        const selectedIds = selectedRows.map((row) => row.id);
        try {
            const promises = selectedIds.map((id) => {
                const payload: any = {};
                if (action === 'hide') {
                    payload.isVisibleOnDigitalMenu = false;
                } else if (action === 'show') {
                    payload.isVisibleOnDigitalMenu = true;
                } else if (action === 'reset') {
                    payload.isVisibleOnDigitalMenu = true; // default to visible
                }
                return updateMenuItem(id, payload);
            });

            await Promise.all(promises);

            toast.custom(() => (
                <Toast
                    title="Success!"
                    description={`Successfully ${
                        action === 'hide'
                            ? 'hidden'
                            : action === 'show'
                              ? 'shown'
                              : 'reset'
                    } ${selectedIds.length} items!`}
                    type="success"
                />
            ));
            setSelectedRows([]);
            mutate('menu-item?=f&b');
        } catch (err) {
            console.error(err);
            toast.custom(() => (
                <Toast
                    title="Error!"
                    description="Failed to perform bulk action. Please try again."
                    type="error"
                />
            ));
        } finally {
            setIsLoading(false);
        }
    };

    // Define dynamic filters
    const dynamicFilters = [
        {
            id: 'category',
            label: 'Category',
            options: getDynamicFilters(menuItems?.data ?? [], 'category.name'),
        },
        {
            id: 'subCategory',
            label: 'Sub Category',
            options: getDynamicFilters(menuItems?.data ?? [], 'subCategory.name'),
        },
        {
            id: 'isAvailable',
            label: 'POS Status',
            options: [
                { value: 'true', label: 'Available' },
                { value: 'false', label: 'Unavailable' },
            ],
        },
        {
            id: 'isVisibleOnDigitalMenu',
            label: 'Digital Menu Status',
            options: [
                { value: 'true', label: 'Visible' },
                { value: 'false', label: 'Hidden' },
            ],
        },
    ];

    // Define table columns
    const columns = [
        {
            accessorKey: 'name',
            header: 'Item Name',
        },
        {
            accessorKey: 'description',
            header: 'Description',
        },
        {
            accessorKey: 'price',
            header: 'Price',
            cell: ({ getValue }: any) => {
                const price = getValue();
                return <span>{price ? `₦${price}` : '₦0'}</span>;
            },
        },
        {
            accessorKey: 'category',
            header: 'Category',
            cell: ({ row }: any) => (
                <span>{row?.original?.category?.name ?? ''}</span>
            ),
        },
        {
            accessorKey: 'subCategory',
            header: 'Sub Category',
            cell: ({ row }: any) => (
                <span>{row?.original?.subCategory?.name ?? ''}</span>
            ),
        },
        {
            accessorKey: 'isAvailable',
            header: 'POS Status',
            cell: ({ getValue }: any) => {
                const isAvailable = getValue();
                return (
                    <div className="flex items-center gap-1">
                        {isAvailable ? (
                            <>
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                                <span className="text-green-700">
                                    Available
                                </span>
                            </>
                        ) : (
                            <>
                                <XCircle className="h-4 w-4 text-red-500" />
                                <span className="text-red-700">
                                    Unavailable
                                </span>
                            </>
                        )}
                    </div>
                );
            },
        },
        {
            accessorKey: 'isVisibleOnDigitalMenu',
            header: 'Digital Menu Status',
            cell: ({ row }: any) => {
                const item = row.original as DigitalMenuItem;
                const isVisible = item.isVisibleOnDigitalMenu ?? true; // default to visible
                return (
                    <div className="flex items-center gap-1">
                        {isVisible ? (
                            <>
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                                <span className="text-green-700">Visible</span>
                            </>
                        ) : (
                            <>
                                <XCircle className="h-4 w-4 text-red-500" />
                                <span className="text-red-700">Hidden</span>
                            </>
                        )}
                    </div>
                );
            },
        },
        {
            id: 'action',
            header: 'Action',
            cell: ({ row }: any) => {
                const item = row.original as DigitalMenuItem;
                const isVisible = item.isVisibleOnDigitalMenu ?? true;
                return (
                    <Button
                        variant={'outline'}
                        size={'sm'}
                        onClick={() => handleToggleVisibility(item)}
                        disabled={isLoading}
                        className={
                            isVisible
                                ? 'border-red-500 text-red-500 hover:bg-red-50'
                                : 'border-green-500 text-green-500 hover:bg-green-50'
                        }
                    >
                        {isVisible ? 'Hide' : 'Show'}
                    </Button>
                );
            },
        },
    ];

    return (
        <PageWrapper>
            <PageHeader>
                <PageHeadertitle
                    title="Digital Menu Visibility"
                    subtitle="Control which menu items are visible on the digital/QR menu"
                />
            </PageHeader>
            <div className="w-full h-full rounded-md p-4 flex flex-col gap-4">
                <CustomTable
                    columns={columns}
                    data={menuItems?.data ?? []}
                    title="Menu Items"
                    filters={dynamicFilters}
                    persistPaginationInQuery
                    paginationQueryKey="digitalVisibilityPage"
                    rowClickSelect={false}
                    onSelectionChange={setSelectedRows}
                    extend={
                        selectedRows.length > 0 ? (
                            <div className="flex items-center gap-2">
                                <Button
                                    variant={'outline'}
                                    onClick={() => handleBulkAction('hide')}
                                    disabled={isLoading}
                                    className="border-red-500 text-red-500"
                                >
                                    Hide Selected
                                </Button>
                                <Button
                                    variant={'outline'}
                                    onClick={() => handleBulkAction('show')}
                                    disabled={isLoading}
                                    className="border-green-500 text-green-500"
                                >
                                    Show Selected
                                </Button>
                                <Button
                                    variant={'outline'}
                                    onClick={() => handleBulkAction('reset')}
                                    disabled={isLoading}
                                >
                                    Reset to Default
                                </Button>
                            </div>
                        ) : null
                    }
                    searchPlaceholder="Search by item name..."
                />
            </div>
        </PageWrapper>
    );
}
