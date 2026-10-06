'use client';
import {
    deleteMenuItem,
    updateMenuItem,
    updateMenuItemStatus,
} from '@/app/actions/menu-item';
import { CustomSheet } from '@/components/common/CustomSheet';
import { itemOrderRejectedIllustration } from '@/components/house-keeping/common/illustrations';
import Toast from '@/components/toast';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { mutate } from 'swr';
import MutateItemForm from '../common/Form/MutateItemForm';
import { Item } from '../types/types';
import AttachModifiersToItem from '../modifiers/AttachModifiersToItem';

type ItemWithRelations = Item & {
    category?: { id: number; name?: string } | null;
    subCategory?: { id: number; name?: string } | null;
    isAvailable?: boolean;
};

const ItemActionCell = ({ item }: { item: ItemWithRelations }) => {
    const [editItem, setEditItem] = useState(false);
    const [deleteDialog, setDeleteDialog] = useState(false);
    const [loadingUpdate, setLoadingUpdate] = useState(false);
    const [loadingDelete, setLoadingDelete] = useState(false);

    const handleUpdateItem = async (id: number, data: Item) => {
        setLoadingUpdate(true);
        try {
            const payload = {
                name: data.name,
                description: data.description,
                price: Number(data.price),
                imageUrl: data.imageUrl,
                category: data.categoryId,
                subCategory: data.subCategoryId || null,
            };

            const response = await updateMenuItem(id, payload);
            if (response?.message === 'Menu item updated successfully!') {
                setEditItem(false);
                setLoadingUpdate(false);
                toast.custom(() => (
                    <Toast
                        title="Success!"
                        description={response.message}
                        type="success"
                    />
                ));
                setEditItem(false);
                mutate('menu-item?=f&b');
            } else {
                setLoadingUpdate(false);
                toast.custom(() => (
                    <Toast
                        title="Error!"
                        description={response?.message || 'An error occurred'}
                        type="error"
                    />
                ));
            }
            setEditItem(false);
        } catch (err) {
            if (err instanceof Error) {
                console.log(err.message);
            } else {
                console.log('An unexpected error occurred');
            }
        }
    };

    const handleUpdateItemStatus = async (id: number, status: boolean) => {
        try {
            setLoadingUpdate(true);
            const response = await updateMenuItemStatus(id, status);
            if (
                response?.message === 'Menu item status updated successfully!'
            ) {
                toast.custom(() => (
                    <Toast
                        title="Success!"
                        description={response.message}
                        type="success"
                    />
                ));
                setLoadingUpdate(false);
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
        }
    };

    const handleDeleteItem = async (id: number) => {
        setLoadingDelete(true);
        try {
            const response = await deleteMenuItem(id);
            if (response?.message === 'Menu item deleted successfully!') {
                setDeleteDialog(false);
                setLoadingDelete(false);
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
                setLoadingDelete(false);
            }
            setDeleteDialog(false);
        } catch (err) {
            if (err instanceof Error) {
                console.log(err.message);
            } else {
                console.log('An unexpected error occurred');
            }
            setLoadingDelete(false);
        }
    };

    return (
        <div className="flex items-center gap-4 text-sm">
            <Switch
                className="data-[state=checked]:bg-hexbrand"
                checked={item.isAvailable}
                onCheckedChange={(checked) =>
                    handleUpdateItemStatus(item.id, checked)
                }
            />
            <CustomSheet
                trigger={<button className="text-hexbrand">Edit</button>}
                title="Edit Item"
                open={editItem}
                setOpen={setEditItem}
            >
                <div className="border rounded-lg p-4">
                    <MutateItemForm
                        initialData={{
                            ...item,
                        }}
                        isloading={loadingUpdate}
                        categoryId={item?.category?.id}
                        subCategoryId={item?.subCategory?.id}
                        onSubmit={async (data) => {
                            await handleUpdateItem(item.id, {
                                ...item,
                                name: data.name,
                                description: data.description,
                                price: data.price,
                                imageUrl: data.imageUrl,
                                categoryId: data.categoryId,
                                subCategoryId: data.subCategoryId,
                                category: data.category,
                                subCategory: data.subCategory,
                            });
                        }}
                        mode="edit"
                    />
                </div>
            </CustomSheet>
            <AttachModifiersToItem
                menuItemId={item.id}
                trigger={
                    <button className="text-hexbrand">Modifiers</button>
                }
            />
            <Dialog open={deleteDialog} onOpenChange={setDeleteDialog}>
                <DialogTrigger asChild>
                    <button className="text-muted-foreground">Delete</button>
                </DialogTrigger>
                <DialogContent className="w-[400px]">
                    <DialogHeader>
                        <DialogTitle>
                            <span className="flex justify-center items-center">
                                {itemOrderRejectedIllustration}
                            </span>
                        </DialogTitle>
                        <div className="flex flex-col ">
                            <h1 className="text-center text-lg font-semibold">
                                Delete Menu Item
                            </h1>
                            <p className="text-center text-sm text-muted-foreground">
                                Are you sure you want to delete this menu item?
                            </p>
                        </div>
                    </DialogHeader>
                    <div className="flex items-center gap-4 mt-4">
                        <Button
                            className="h-12 bg-orion-blue text-white w-full"
                            onClick={() => handleDeleteItem(item.id)}
                        >
                            {loadingDelete ? (
                                <Loader2 className="animate-spin mr-2" />
                            ) : (
                                'Yes, Sure'
                            )}
                        </Button>
                        <Button
                            variant={'outline'}
                            className="h-12 text-orion-blue border-orion-blue w-full"
                            type="button"
                            onClick={() => setDeleteDialog(false)}
                        >
                            No, Cancel
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ItemActionCell;
