'use client';
import { getMenuCategories } from '@/app/actions/menu-category';
import {
    deleteMenuSubCategory,
    updateMenuSubCategory,
} from '@/app/actions/menu-sub-category';
import { convertSubCategoryToCategory } from '@/app/actions/category-reclassify';
import { CustomSheet } from '@/components/common/CustomSheet';
import Toast from '@/components/toast';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { PenBox, X, Loader2 } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import useSWR, { mutate } from 'swr';
import MutateSubCategoryForm from '../common/Form/MutateSubCategory';
import { MiniCategory } from './columns/MiniCategory';

const MiniCatActionCell = ({
    miniCategory,
}: {
    miniCategory: MiniCategory;
}) => {
    const { data: menuCategories } = useSWR(
        '/menu/category',
        getMenuCategories,
    );
    const [edit, setEdit] = useState(false);
    const [moveToCategoryDialog, setMoveToCategoryDialog] = useState(false);
    const [loadingMoveToCategory, setLoadingMoveToCategory] = useState(false);

    const handleUpdateMiniCategory = async (
        id: number,
        data: {
            name: string;
            category: string;
        },
    ) => {
        try {
            const response = await updateMenuSubCategory(id, data);
            if (
                response?.message === 'Menu sub category updated successfully!'
            ) {
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
                console.log('An unexpected error occurred here');
            }
        }
    };

    const handleDeleteMiniCategory = async (id: number) => {
        try {
            const response = await deleteMenuSubCategory(id);
            if (
                response?.message === 'Menu sub category deleted successfully!'
            ) {
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
        }
    };

    const handleMoveToCategory = async () => {
        setLoadingMoveToCategory(true);
        try {
            const response = await convertSubCategoryToCategory(miniCategory.id);
            if (response?.message) {
                setLoadingMoveToCategory(false);
                setMoveToCategoryDialog(false);
                toast.custom(() => (
                    <Toast
                        title="Success!"
                        description={response.message}
                        type="success"
                    />
                ));
                mutate('/menu/sub-category');
                mutate('menu-category?=f&b');
            } else {
                setLoadingMoveToCategory(false);
                toast.custom(() => (
                    <Toast
                        title="Error!"
                        description={(response as any)?.error || (response as any)?.message || 'Failed to convert sub-category.'}
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
            setLoadingMoveToCategory(false);
        }
    };

    return (
        <div className="flex items-center justify-between">
            <CustomSheet
                trigger={
                    <button className="text-sm rounded-md flex items-center gap-2 w-full hover:text-hexbrand p-2 text-muted-foreground">
                        <PenBox className="w-4 h-4" />
                        Edit
                    </button>
                }
                title="Edit Sub Category"
                open={edit}
                setOpen={setEdit}
            >
                <div className="border rounded-lg p-4">
                    <MutateSubCategoryForm
                        categories={menuCategories?.data ?? []}
                        categoryId={miniCategory?.menuCategory?.id}
                        onSubmit={(data) => {
                            handleUpdateMiniCategory(miniCategory?.id, {
                                name: data.subCategory,
                                category: menuCategories?.data.find(
                                    (cat: any) => cat?.id === data.menuCategory,
                                ),
                            });
                            setEdit(false);
                        }}
                        initialData={{
                            ...miniCategory,
                            subCategory: miniCategory.name,
                            menuCategory: menuCategories?.data.find(
                                (cat: any) =>
                                    Number(cat?.id) ===
                                    Number(miniCategory.menuCategory?.id),
                            ),
                        }}
                        mode="edit"
                    />
                </div>
            </CustomSheet>
            <Dialog open={moveToCategoryDialog} onOpenChange={setMoveToCategoryDialog}>
                <DialogTrigger asChild>
                    <button className="text-sm flex items-center gap-2 w-full hover:text-hexbrand rounded-lg p-2 text-muted-foreground">
                        Move to Category
                    </button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Move to Item Category</DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-muted-foreground">
                        This will convert &quot;{miniCategory.name}&quot; into a standalone Item Category.
                        The subcategory record will be archived and a new Item Category will be created with the same name.
                        Any menu items associated with this subcategory will be transferred to the new category.
                    </p>
                    <div className="flex items-center gap-4 mt-4">
                        <Button
                            className="h-12 bg-orion-blue text-white w-full"
                            onClick={handleMoveToCategory}
                            disabled={loadingMoveToCategory}
                        >
                            {loadingMoveToCategory && (
                                <Loader2 className="mr-2 animate-spin" />
                            )}
                            Confirm Move
                        </Button>
                        <Button
                            variant="outline"
                            className="h-12 text-orion-blue border-orion-blue w-full"
                            type="button"
                            onClick={() => setMoveToCategoryDialog(false)}
                        >
                            Cancel
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
            <button
                onClick={() => handleDeleteMiniCategory(miniCategory?.id)}
                className="text-sm flex items-center gap-2 w-full hover:text-hexbrand rounded-lg p-2 text-muted-foreground"
            >
                <X className="w-4 h-4" />
                Delete
            </button>
        </div>
    );
};

export default MiniCatActionCell;
