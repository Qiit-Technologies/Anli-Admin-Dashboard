'use client';
import {
    deleteMenuCategory,
    updateMenuCategory,
} from '@/app/actions/menu-category';
import {
    getCategoryReclassifyInfo,
    reclassifyCategory,
    convertCategoryToSubCategory,
} from '@/app/actions/category-reclassify';
import { getMenuCategories } from '@/app/actions/menu-category';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Category } from '@/hooks/useMiniCategory';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import useSWR, { mutate } from 'swr';
import MutateCategoryForm from '../common/Form/MutateCategoryFrom';

interface CellProps {
    category: Category;
}

const ItemCategoryActionCell = ({ category }: CellProps) => {
    const [deleteDialog, setDeleteDialog] = useState(false);
    const [editDialog, setEditDialog] = useState(false);
    const [reclassifyDialog, setReclassifyDialog] = useState(false);
    const [loadingDelete, setLoadingDelete] = useState(false);
    const [loadingUpdate, setLoadingUpdate] = useState(false);
    const [loadingReclassify, setLoadingReclassify] = useState(false);
    const [reclassifyType, setReclassifyType] = useState<'main' | 'item' | 'mini' | null>(null);
    const [targetParentId, setTargetParentId] = useState<number | null>(null);

    const { data: menuCategories } = useSWR('menu-category?=f&b', getMenuCategories);

    const handleUpdate = async (
        id: number,
        data: {
            id?: number;
            name: string;
            category: string;
            description: string;
            menuIds: number[];
        },
    ) => {
        setLoadingUpdate(true);
        try {
            const response = await updateMenuCategory(id, data);
            if (response?.message === 'Menu category updated successfully!') {
                setLoadingUpdate(false);
                setEditDialog(false);
                toast.custom(() => (
                    <Toast
                        title="Success!"
                        description={response.message}
                        type="success"
                    />
                ));
                mutate('menu-category?=f&b');
            } else {
                setLoadingUpdate(false);
                toast.custom(() => (
                    <Toast
                        title="Error!"
                        description={response?.message}
                        type="error"
                    />
                ));
            }
            setEditDialog(false);
        } catch (err) {
            if (err instanceof Error) {
                console.log(err.message);
            } else {
                console.log('An unexpected error occurred');
            }
            setLoadingUpdate(false);
        }
    };

    const handleDelete = async (id: number) => {
        setLoadingDelete(true);
        try {
            const response = await deleteMenuCategory(id);
            if (response?.message === 'Menu category deleted successfully!') {
                setDeleteDialog(false);
                setLoadingDelete(false);
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

    const handleReclassify = async () => {
        if (!reclassifyType) return;

        setLoadingReclassify(true);
        try {
            let response;
            if (reclassifyType === 'mini') {
                if (!targetParentId) {
                    setLoadingReclassify(false);
                    return;
                }
                response = await convertCategoryToSubCategory(category.id, targetParentId);
            } else {
                const targetId = reclassifyType === 'main' ? null : targetParentId;
                response = await reclassifyCategory(category.id, targetId);
            }

            if (response?.message) {
                setLoadingReclassify(false);
                setReclassifyDialog(false);
                setReclassifyType(null);
                setTargetParentId(null);
                toast.custom(() => (
                    <Toast
                        title="Success!"
                        description={response.message}
                        type="success"
                    />
                ));
                mutate('menu-category?=f&b');
                if (reclassifyType === 'mini') {
                    mutate('/menu/sub-category');
                }
            } else {
                setLoadingReclassify(false);
                toast.custom(() => (
                    <Toast
                        title="Error!"
                        description={(response as any)?.error || (response as any)?.message || 'Failed to reclassify category.'}
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
            setLoadingReclassify(false);
        }
    };

    const availableParents = (menuCategories?.data ?? []).filter(
        (c: any) => c.id !== category.id,
    );

    const categoryAny = category as any;
    const isMainCategory = !categoryAny.parentCategory?.id && !categoryAny.parentCategoryId;
    const hasParent = categoryAny.parentCategory?.id || categoryAny.parentCategoryId;

    const needsParentSelection = reclassifyType === 'item' || reclassifyType === 'mini';
    const confirmLabel = reclassifyType === 'mini' ? 'Confirm Move to Mini' : 'Confirm Move';

    return (
        <div className="flex items-center gap-10 text-sm justify-between w-full">
            <Dialog open={editDialog} onOpenChange={setEditDialog}>
                <DialogTrigger asChild>
                    <button className="text-hexbrand">Edit</button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Item Category</DialogTitle>
                    </DialogHeader>
                    <MutateCategoryForm
                        isLoading={loadingUpdate}
                        onSubmit={(data) => {
                            handleUpdate(
                                category.id,
                                data as {
                                    id?: number;
                                    name: string;
                                    category: string;
                                    description: string;
                                    menuIds: number[];
                                },
                            );
                            mutate('menu-category?=f&b');
                        }}
                        mode="edit"
                        initialData={{
                            ...category,
                            menuIds: (category as any).menus?.map((m: any) => m.id || m) || 
                                    ((category as any).menu?.id ? [(category as any).menu.id] : []) ||
                                    ((category as any).menuId ? [(category as any).menuId] : []),
                        }}
                    />
                </DialogContent>
            </Dialog>
            <Dialog open={reclassifyDialog} onOpenChange={setReclassifyDialog}>
                <DialogTrigger asChild>
                    <button className="text-hexbrand">Move</button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Move / Reclassify Category</DialogTitle>
                    </DialogHeader>
                    {!reclassifyType ? (
                        <div className="flex flex-col gap-3">
                            {hasParent && (
                                <Button
                                    variant="outline"
                                    className="w-full"
                                    onClick={() => setReclassifyType('main')}
                                >
                                    Move to Main Category Level
                                </Button>
                            )}
                            {isMainCategory && (
                                <Button
                                    variant="outline"
                                    className="w-full"
                                    onClick={() => setReclassifyType('item')}
                                >
                                    Move to Item Category Level
                                </Button>
                            )}
                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={() => setReclassifyType('mini')}
                            >
                                Move to Mini Category Level
                            </Button>
                        </div>
                    ) : reclassifyType === 'main' ? (
                        <div className="flex flex-col gap-4">
                            <p className="text-sm text-muted-foreground">
                                This will move &quot;{category.name}&quot; to the Main Category level (remove its parent). 
                                Its subcategories and menu items will move with it.
                            </p>
                            <div className="flex items-center gap-4 mt-4">
                                <Button
                                    className="h-12 bg-orion-blue text-white w-full"
                                    onClick={handleReclassify}
                                    disabled={loadingReclassify}
                                >
                                    {loadingReclassify && (
                                        <Loader2 className="mr-2 animate-spin" />
                                    )}
                                    Confirm Move
                                </Button>
                                <Button
                                    variant="outline"
                                    className="h-12 text-orion-blue border-orion-blue w-full"
                                    type="button"
                                    onClick={() => {
                                        setReclassifyType(null);
                                        setReclassifyDialog(false);
                                    }}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-4">
                            <p className="text-sm text-muted-foreground">
                                {reclassifyType === 'mini'
                                    ? 'Select the Item Category to move this category under as a Mini Category:'
                                    : 'Select the parent category to move this category under:'}
                            </p>
                            <Select
                                value={targetParentId?.toString() || ''}
                                onValueChange={(value) => setTargetParentId(Number(value))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select parent category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableParents.map((parent: any) => (
                                        <SelectItem key={parent.id} value={parent.id.toString()}>
                                            {parent.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <div className="flex items-center gap-4 mt-4">
                                <Button
                                    className="h-12 bg-orion-blue text-white w-full"
                                    onClick={handleReclassify}
                                    disabled={loadingReclassify || !targetParentId}
                                >
                                    {loadingReclassify && (
                                        <Loader2 className="mr-2 animate-spin" />
                                    )}
                                    {confirmLabel}
                                </Button>
                                <Button
                                    variant="outline"
                                    className="h-12 text-orion-blue border-orion-blue w-full"
                                    type="button"
                                    onClick={() => {
                                        setReclassifyType(null);
                                        setTargetParentId(null);
                                        setReclassifyDialog(false);
                                    }}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
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
                                Delete Item Category
                            </h1>
                            <p className="text-center text-sm text-muted-foreground">
                                Are you sure you want to delete this Item
                                Category?
                            </p>
                        </div>
                    </DialogHeader>
                    <div className="flex items-center gap-4 mt-4">
                        <Button
                            className="h-12 bg-orion-blue text-white w-full"
                            onClick={() => handleDelete(category.id)}
                        >
                            {loadingDelete && (
                                <Loader2 className="mr-2 animate-spin" />
                            )}
                            Yes, Sure
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
            <Switch className="data-[state=checked]:bg-hexbrand" />
        </div>
    );
};

export default ItemCategoryActionCell;
