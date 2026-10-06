'use client';

import { useState } from 'react';
import {
    PageHeader,
    PageHeadertitle,
    HeaderActions,
} from '@/components/common/layout/Header';
import PageWrapper from '@/components/common/PageWrapper';
import { Button } from '@/components/ui/button';
import { Plus, ChevronLeft } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import useSWR, { mutate as globalMutate } from 'swr';
import {
    getPurchaseLog,
    addPurchaseLogItem,
    updatePurchaseLogItem,
    deletePurchaseLogItem,
} from '@/app/actions/stock';
import CustomTable from '@/components/stock/tables/CustomTable';
import { ColumnDef } from '@tanstack/react-table';
import { formatCurrency } from '@/lib/utils';
import { CircleHelp } from 'lucide-react';

import {
    PurchaseLogInventoryModal,
    PurchaseLogInventoryFormData,
} from '@/components/common/modals/PurchaseLogInventoryModal';
import { DeleteConfirmationModal } from '@/components/common/modals/DeleteConfirmationModal';
import toast from 'react-hot-toast';
import Toast from '@/components/toast';

const ManagePurchaseLogItemsPage = () => {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    const [isItemModalOpen, setIsItemModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
    const [currentItem, setCurrentItem] = useState<any>(null);

    const [isSaving, setIsSaving] = useState(false);

    const {
        data: logResponse,
        isLoading,
        mutate,
    } = useSWR(id ? `/items/purchase-logs/${id}` : null, () =>
        getPurchaseLog(id),
    );

    const log = logResponse?.data;

    const handleAddItem = () => {
        setModalMode('add');
        setCurrentItem(null);
        setIsItemModalOpen(true);
    };

    const handleEditItem = (item: any) => {
        console.log('Editing item:', item);
        setModalMode('edit');
        setCurrentItem({
            id: item.id,
            itemId: item.item?.id,
            itemNumber: item.itemNumber || item.item?.itemNumber || 'INV-001',
            itemName: item.name || item.item?.name,
            category: (
                item.category ||
                item.item?.category?.name ||
                'grains'
            ).toLowerCase(),
            location: (
                item.itemLocation ||
                item.item?.itemLocation ||
                'bar-store'
            ).toLowerCase(),
            outerUnit: (
                item.outerUnit ||
                item.item?.outerUnit ||
                'bag'
            ).toLowerCase(),
            baseUnit: (
                item.baseUnit ||
                item.item?.baseUnit ||
                'kg'
            ).toLowerCase(),
            conversionRate: item.conversionRate || item.item?.portionRate || 50,
            costPerOuter:
                item.costPerOuter || item.item?.costPriceOuter || 30000,
            qtyInStockOuter: item.quantityOuter || 10,
        });
        setIsItemModalOpen(true);
    };

    const handleDeleteItemClick = (item: any) => {
        setCurrentItem(item);
        setIsDeleteModalOpen(true);
    };

    const handleItemSubmit = async (data: PurchaseLogInventoryFormData) => {
        try {
            setIsSaving(true);

            let response;
            if (modalMode === 'add') {
                const payload = {
                    itemId: Number(data.itemId),
                    itemLocation: data.location,
                    quantityOuter: Number(data.qtyInStockOuter),
                    costPerOuter: Number(data.costPerOuter),
                    category: data.category,
                    outerUnit: data.outerUnit,
                    baseUnit: data.baseUnit,
                };
                response = await addPurchaseLogItem(id, payload);
            } else {
                const payload = {
                    itemLocation: data.location,
                    quantityOuter: Number(data.qtyInStockOuter),
                    costPerOuter: Number(data.costPerOuter),
                    category: data.category,
                    outerUnit: data.outerUnit,
                    baseUnit: data.baseUnit,
                };
                response = await updatePurchaseLogItem(data.id!, payload);
            }

            if (response.error) {
                toast.custom(() => (
                    <Toast
                        title="Error"
                        description={response.error}
                        type="error"
                    />
                ));
                return;
            }

            toast.custom(() => (
                <Toast
                    title="Success!"
                    description={`Item ${
                        modalMode === 'add' ? 'added' : 'updated'
                    } successfully!`}
                    type="success"
                />
            ));
            mutate();
            globalMutate('/items');
            setIsItemModalOpen(false);
        } catch (error: any) {
            console.error(error);
            toast.error('An unexpected error occurred');
        } finally {
            setIsSaving(false);
        }
    };

    const handleConfirmDelete = async () => {
        if (!currentItem?.id) return;

        try {
            setIsSaving(true);
            const response = await deletePurchaseLogItem(currentItem.id);

            if (response.error) {
                toast.custom(() => (
                    <Toast
                        title="Error"
                        description={response.error}
                        type="error"
                    />
                ));
                return;
            }

            toast.custom(() => (
                <Toast
                    title="Deleted!"
                    description="Item removed from purchase log."
                    type="success"
                />
            ));
            mutate();
            globalMutate('/items');
            setIsDeleteModalOpen(false);
        } catch (error: any) {
            console.error(error);
            toast.error('Failed to delete item');
        } finally {
            setIsSaving(false);
        }
    };

    const columns: ColumnDef<any>[] = [
        {
            accessorKey: 'itemNumber',
            header: () => (
                <div className="flex items-center gap-1 font-semibold text-xs uppercase">
                    Item No{' '}
                    <CircleHelp className="h-3 w-3 text-muted-foreground" />
                </div>
            ),
            cell: ({ row }) => (
                <span className="font-medium">
                    {row.original.itemNumber || 'INV-001'}
                </span>
            ),
        },
        {
            accessorKey: 'itemName',
            header: () => (
                <div className="font-semibold text-xs uppercase">Item Name</div>
            ),
            cell: ({ row }) => (
                <span className="font-medium">
                    {row.original.name || row.original.item?.name}
                </span>
            ),
        },
        {
            accessorKey: 'category',
            header: () => (
                <div className="font-semibold text-xs uppercase">Category</div>
            ),
            cell: ({ row }) => (
                <span className="text-muted-foreground capitalize">
                    {row.original.category || 'grains'}
                </span>
            ),
        },
        {
            accessorKey: 'location',
            header: () => (
                <div className="flex items-center gap-1 font-semibold text-xs uppercase">
                    Location{' '}
                    <CircleHelp className="h-3 w-3 text-muted-foreground" />
                </div>
            ),
            cell: ({ row }) => (
                <span className="text-muted-foreground capitalize">
                    {(row.original.location || 'bar-store').replace('-', ' ')}
                </span>
            ),
        },
        {
            accessorKey: 'units',
            header: () => (
                <div className="flex items-center gap-1 font-semibold text-xs uppercase">
                    Units{' '}
                    <CircleHelp className="h-3 w-3 text-muted-foreground" />
                </div>
            ),
            cell: ({ row }) => (
                <span className="text-muted-foreground capitalize">
                    {row.original.outerUnit || 'bag'} /{' '}
                    {row.original.baseUnit || 'kg'}
                </span>
            ),
        },
        {
            accessorKey: 'quantityBase',
            header: () => (
                <div className="font-semibold text-xs uppercase">Base Qty</div>
            ),
            cell: ({ row }) => (
                <span className="text-muted-foreground">
                    {row.original.quantityBase} {row.original.baseUnit}
                </span>
            ),
        },
        {
            accessorKey: 'costPerOuter',
            header: () => (
                <div className="font-semibold text-xs uppercase">
                    Cost/Outer (₦)
                </div>
            ),
            cell: ({ row }) => (
                <span className="font-semibold">
                    {formatCurrency(Number(row.original.costPerOuter))}
                </span>
            ),
        },
        {
            accessorKey: 'quantityOuter',
            header: () => (
                <div className="font-semibold text-xs uppercase">
                    Qty (Outer)
                </div>
            ),
            cell: ({ row }) => (
                <span className="font-semibold text-orion-blue">
                    {row.original.quantityOuter} {row.original.outerUnit}
                </span>
            ),
        },
        {
            accessorKey: 'totalCost',
            header: () => (
                <div className="font-semibold text-xs uppercase">Value (₦)</div>
            ),
            cell: ({ row }) => (
                <span className="font-semibold">
                    {formatCurrency(Number(row.original.totalCost))}
                </span>
            ),
        },
        {
            id: 'actions',
            header: () => (
                <div className="font-semibold text-xs uppercase">Action</div>
            ),
            cell: ({ row }) => (
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => handleDeleteItemClick(row.original)}
                        className="text-destructive hover:underline transition-colors text-sm"
                    >
                        Delete
                    </button>
                    <button
                        onClick={() => handleEditItem(row.original)}
                        className="text-orion-blue font-medium hover:underline text-sm"
                    >
                        Edit
                    </button>
                </div>
            ),
        },
    ];

    return (
        <div className="flex flex-col h-full overflow-hidden bg-gray-50/50">
            <PageHeader>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => router.back()}
                        className="p-1 hover:bg-gray-100 rounded-md transition-colors"
                    >
                        <ChevronLeft className="h-5 w-5 text-muted-foreground" />
                    </button>
                    <PageHeadertitle
                        title="Purchase Log (Manual Restock)"
                        subtitle="Track and manage inventory restocking activities"
                    />
                </div>
                <HeaderActions />
            </PageHeader>

            <PageWrapper className="flex-1 overflow-auto pt-4">
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <h2 className="text-lg font-semibold text-foreground">
                                Inventory Management
                            </h2>
                            <p className="text-xs text-muted-foreground italic flex items-center gap-1">
                                Add, edit, or remove inventory items
                            </p>
                        </div>
                    </div>

                    <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
                        <div className="p-4 border-b flex items-center justify-between bg-gray-50/30">
                            <h3 className="font-semibold text-foreground">
                                All Registered Inventory Management
                            </h3>
                            <Button
                                onClick={handleAddItem}
                                className="bg-orion-blue hover:bg-orion-blue/90 h-9 px-4 rounded-lg flex items-center gap-2 text-sm"
                            >
                                <Plus className="h-4 w-4" />
                                Add New Item
                            </Button>
                        </div>
                        <div className="p-0">
                            <CustomTable
                                columns={columns}
                                data={log?.items || []}
                                isLoading={isLoading}
                                hasHeader={false}
                                isPaginated={true}
                                variant="none"
                            />
                        </div>
                    </div>
                </div>

                <PurchaseLogInventoryModal
                    open={isItemModalOpen}
                    onOpenChange={setIsItemModalOpen}
                    onSubmit={handleItemSubmit}
                    initialData={currentItem}
                    mode={modalMode}
                    isLoading={isSaving}
                />

                <DeleteConfirmationModal
                    open={isDeleteModalOpen}
                    onOpenChange={setIsDeleteModalOpen}
                    onConfirm={handleConfirmDelete}
                    itemName={
                        currentItem?.name || currentItem?.item?.name || 'Item'
                    }
                    itemNumber={currentItem?.itemNumber || 'INV-001'}
                />
            </PageWrapper>
        </div>
    );
};

export default ManagePurchaseLogItemsPage;
