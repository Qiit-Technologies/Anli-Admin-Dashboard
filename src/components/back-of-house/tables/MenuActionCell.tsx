'use client';
import { deleteMenu, updateMenu, getMenu } from '@/app/actions/menu';
import { reorderMenuCategories } from '@/app/actions/menu-category';
import { reorderMenuSubCategories } from '@/app/actions/menu-sub-category';
import Toast from '@/components/toast';
import { Button } from '@/components/ui/button';
import MenuCategoryOrder from '@/components/back-of-house/MenuCategoryOrder';
import type { MenuCategoryOrderGroup } from '@/components/back-of-house/MenuCategoryOrder';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogDescription,
} from '@/components/ui/dialog';
import { Menu } from './columns/Menu';
import { Loader2, MapPin, UtensilsCrossed, ChefHat, Bell } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { mutate } from 'swr';
import MutateMenuForm from '../common/Form/MutateMenuForm';
import useSWR from 'swr';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { ScrollableTabs } from '@/components/front-of-house/ScrollTab';
import {
    getMenusForMenuItem,
    updateMenuItemOnMenus,
} from '@/app/actions/menu-item';

interface CellProps {
    menu: Menu;
}

const MenuActionCell = ({ menu }: CellProps) => {
    const [deleteDialog, setDeleteDialog] = useState(false);
    const [editDialog, setEditDialog] = useState(false);
    const [viewDialog, setViewDialog] = useState(false);
    const [loadingDelete, setLoadingDelete] = useState(false);
    const [loadingUpdate, setLoadingUpdate] = useState(false);
    const [priceEditItemId, setPriceEditItemId] = useState<number | null>(null);
    const [priceEditValue, setPriceEditValue] = useState<string>('');
    const [availableMenusForItem, setAvailableMenusForItem] = useState<
        { id: number; name: string }[]
    >([]);
    const [selectedExtraMenuIds, setSelectedExtraMenuIds] = useState<number[]>(
        [],
    );

    const { data: menuDetails, isLoading: isLoadingMenuDetails } = useSWR(
        viewDialog || deleteDialog
            ? [`menu-details-${menu.id}`, menu.id]
            : null,
        () => getMenu(menu.id),
    );
    const [categoryIdsToDelete, setCategoryIdsToDelete] = useState<number[]>(
        [],
    );
    const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
    const menuCategories = menuDetails?.data?.categories ?? [];
    const categoryOrderGroups = (menuCategories as any[]).reduce<
        MenuCategoryOrderGroup[]
    >((groups, category) => {
        const parentCategoryId = category.parentCategory?.id ?? null;
        const groupId = `category-${parentCategoryId ?? 'root'}`;
        let group = groups.find((candidate) => candidate.id === groupId);
        if (!group) {
            group = {
                id: groupId,
                label: parentCategoryId
                    ? `Mini-categories under ${category.parentCategory.name}`
                    : 'Categories',
                rankType: 'category',
                parentCategoryId,
                items: [],
            };
            groups.push(group);
        }
        group.items.push({ id: category.id, label: category.name });
        return groups;
    }, []);
    const subCategoryOrderGroups = (menuCategories as any[]).reduce<
        MenuCategoryOrderGroup[]
    >((groups, category) => {
        const subCategories = category.subCategories ?? [];
        if (subCategories.length === 0) return groups;
        groups.push({
            id: `sub-category-${category.id}`,
            label: `Sub-categories under ${category.name}`,
            rankType: 'sub-category',
            menuCategoryId: category.id,
            items: subCategories.map((subCategory: any) => ({
                id: subCategory.id,
                label: subCategory.name,
            })),
        });
        return groups;
    }, []);
    const menuOrderGroups = [...categoryOrderGroups, ...subCategoryOrderGroups];

    const saveMenuCategoryOrder = async (groups: MenuCategoryOrderGroup[]) => {
        const categoryGroups = groups.filter(
            (group) => group.rankType === 'category',
        );
        const subCategoryGroups = groups.filter(
            (group) => group.rankType === 'sub-category',
        );

        if (categoryGroups.length > 0) {
            const result = await reorderMenuCategories(
                categoryGroups.map((group) => ({
                    parentCategoryId: group.parentCategoryId ?? null,
                    ids: group.items.map((item) => item.id),
                })),
            );
            if (!result.message.includes('successfully')) {
                throw new Error(result.message);
            }
        }

        if (subCategoryGroups.length > 0) {
            const result = await reorderMenuSubCategories(
                subCategoryGroups.map((group) => ({
                    menuCategoryId: group.menuCategoryId!,
                    ids: group.items.map((item) => item.id),
                })),
            );
            if (!result.message.includes('successfully')) {
                throw new Error(result.message);
            }
        }

        await mutate([`menu-details-${menu.id}`, menu.id]);
        mutate('menus');
    };

    const handleUpdate = async (
        id: number,
        data: {
            name: string;
            description: string;
            dineInAreaId?: number;
        },
    ) => {
        setLoadingUpdate(true);
        try {
            const response = await updateMenu(id, data);
            if (response?.message === 'Menu updated successfully!') {
                setLoadingUpdate(false);
                setEditDialog(false);
                toast.custom(() => (
                    <Toast
                        title="Success!"
                        description={response.message}
                        type="success"
                    />
                ));
                mutate('menus');
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

    const openPriceEdit = async (item: { id: number; price: number }) => {
        setPriceEditItemId(item.id);
        setPriceEditValue(String(item.price));
        setSelectedExtraMenuIds([]);

        const menusResult = await getMenusForMenuItem(item.id);
        const menus = menusResult.data ?? [];
        // Exclude current menu from the extra menus list
        const extraMenus = menus.filter((m: any) => m.id !== menu.id) ?? [];
        setAvailableMenusForItem(
            extraMenus.map((m: any) => ({ id: m.id, name: m.name })),
        );
    };

    const handleSavePriceEdit = async () => {
        if (!priceEditItemId || !priceEditValue) return;
        setLoadingUpdate(true);
        try {
            const payload = {
                menuId: menu.id,
                menuItemId: priceEditItemId,
                price: Number(priceEditValue),
                propagateToMenuIds: selectedExtraMenuIds,
            };

            const response = await updateMenuItemOnMenus(payload);
            if (
                response?.message === 'Menu item updated on menus successfully!'
            ) {
                toast.custom(() => (
                    <Toast
                        title="Success!"
                        description={response.message}
                        type="success"
                    />
                ));
                // Refresh menus list and this menu's details
                mutate('menus');
                mutate([`menu-details-${menu.id}`, menu.id]);
                setPriceEditItemId(null);
                setPriceEditValue('');
                setSelectedExtraMenuIds([]);
            } else {
                toast.custom(() => (
                    <Toast
                        title="Error!"
                        description={response?.message}
                        type="error"
                    />
                ));
            }
        } finally {
            setLoadingUpdate(false);
        }
    };

    const handleDelete = async (id: number) => {
        setLoadingDelete(true);
        try {
            const response = await deleteMenu(id, categoryIdsToDelete);
            if (response?.message === 'Menu deleted successfully!') {
                setDeleteDialog(false);
                setLoadingDelete(false);
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
        <div className="flex items-center gap-10 text-sm justify-between w-full">
            <Dialog open={viewDialog} onOpenChange={setViewDialog}>
                <DialogTrigger asChild>
                    <button className="text-hexbrand underline-offset-4 hover:underline text-sm">
                        View
                    </button>
                </DialogTrigger>
                <DialogContent className="max-w-6xl w-full max-h-[90vh] overflow-hidden p-0 flex flex-col bg-white">
                    {isLoadingMenuDetails ? (
                        <div className="flex items-center justify-center py-16">
                            <Loader2 className="w-6 h-6 animate-spin text-orion-blue" />
                        </div>
                    ) : menuDetails?.data ? (
                        <>
                            {/* Compact header */}
                            <div className="border-b px-6 py-4 bg-slate-50">
                                <div className="flex flex-wrap items-start justify-between gap-4">
                                    <DialogHeader className="text-left space-y-1">
                                        <DialogTitle className="text-xl font-semibold">
                                            {menuDetails.data.name}
                                        </DialogTitle>
                                        {menuDetails.data.description && (
                                            <DialogDescription className="text-sm text-muted-foreground">
                                                {menuDetails.data.description}
                                            </DialogDescription>
                                        )}
                                        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mt-1">
                                            <span className="inline-flex items-center gap-1">
                                                <MapPin className="w-3 h-3" />
                                                {menuDetails.data.dineInArea
                                                    ?.name ? (
                                                    menuDetails.data.dineInArea
                                                        .name
                                                ) : (
                                                    <span className="italic">
                                                        General menu
                                                    </span>
                                                )}
                                            </span>
                                            <span className="inline-flex items-center gap-1">
                                                <UtensilsCrossed className="w-3 h-3" />
                                                <span>
                                                    {menuDetails.data.categories
                                                        ?.length ?? 0}{' '}
                                                    categories
                                                </span>
                                            </span>
                                        </div>
                                    </DialogHeader>
                                    <MenuCategoryOrder
                                        groups={menuOrderGroups}
                                        onSave={saveMenuCategoryOrder}
                                    />
                                </div>
                            </div>

                            {/* Content: use tabs like FoodMenu for categories */}
                            <div className="flex-1 px-6 py-4 overflow-y-auto bg-white">
                                {menuDetails.data.categories &&
                                menuDetails.data.categories.length > 0 ? (
                                    <Tabs
                                        defaultValue={String(
                                            menuDetails.data.categories[0].id,
                                        )}
                                        value={
                                            selectedCategoryId ||
                                            String(
                                                menuDetails.data.categories[0]
                                                    .id,
                                            )
                                        }
                                        onValueChange={setSelectedCategoryId}
                                        className="w-full h-full"
                                    >
                                        <ScrollableTabs
                                            categoryOptions={menuDetails.data.categories.map(
                                                (category: any) => ({
                                                    value: String(category.id),
                                                    label: category.name,
                                                }),
                                            )}
                                        />
                                        <TabsContent
                                            value={
                                                selectedCategoryId ||
                                                String(
                                                    menuDetails.data
                                                        .categories[0].id,
                                                )
                                            }
                                            className="mt-4 h-full"
                                        >
                                            <div className="space-y-8">
                                                {menuDetails.data.categories
                                                    .filter(
                                                        (category: any) =>
                                                            String(
                                                                category.id,
                                                            ) ===
                                                            (selectedCategoryId ||
                                                                String(
                                                                    menuDetails
                                                                        .data
                                                                        .categories[0]
                                                                        .id,
                                                                )),
                                                    )
                                                    .map(
                                                        (category: {
                                                            id: number;
                                                            name: string;
                                                            description?: string;
                                                            category: string;
                                                            subCategories?: Array<{
                                                                id: number;
                                                                name: string;
                                                                items?: Array<{
                                                                    id: number;
                                                                    name: string;
                                                                    description?: string;
                                                                    price: number;
                                                                    imageUrl?: string;
                                                                    isAvailable: boolean;
                                                                }>;
                                                            }>;
                                                            items?: Array<{
                                                                id: number;
                                                                name: string;
                                                                description?: string;
                                                                price: number;
                                                                imageUrl?: string;
                                                                isAvailable: boolean;
                                                            }>;
                                                        }) => (
                                                            <div
                                                                key={
                                                                    category.id
                                                                }
                                                                className="border rounded-lg p-4 space-y-4 bg-white"
                                                            >
                                                                <div className="flex items-start justify-between gap-3">
                                                                    <div className="space-y-1">
                                                                        <h3 className="text-base font-semibold">
                                                                            {
                                                                                category.name
                                                                            }
                                                                        </h3>
                                                                        {category.description && (
                                                                            <p className="text-xs text-muted-foreground">
                                                                                {
                                                                                    category.description
                                                                                }
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                    <Badge
                                                                        variant="outline"
                                                                        className="text-[10px] uppercase tracking-wide"
                                                                    >
                                                                        {
                                                                            category.category
                                                                        }
                                                                    </Badge>
                                                                </div>

                                                                {/* Items directly under category */}
                                                                {category.items &&
                                                                    category
                                                                        .items
                                                                        .length >
                                                                        0 && (
                                                                        <div className="mb-4">
                                                                            <h4 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
                                                                                Items
                                                                            </h4>
                                                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                                                                {category.items.map(
                                                                                    (item: {
                                                                                        id: number;
                                                                                        name: string;
                                                                                        description?: string;
                                                                                        price: number;
                                                                                        imageUrl?: string;
                                                                                        isAvailable: boolean;
                                                                                    }) => (
                                                                                        <div
                                                                                            key={
                                                                                                item.id
                                                                                            }
                                                                                            className="group border rounded-md overflow-hidden bg-white hover:shadow-sm transition-all duration-150"
                                                                                        >
                                                                                            <div className="relative w-full h-40 bg-slate-100">
                                                                                                {item.imageUrl ? (
                                                                                                    <Image
                                                                                                        src={
                                                                                                            item.imageUrl
                                                                                                        }
                                                                                                        alt={
                                                                                                            item.name
                                                                                                        }
                                                                                                        fill
                                                                                                        className="object-cover group-hover:scale-105 transition-transform duration-200"
                                                                                                    />
                                                                                                ) : (
                                                                                                    <div className="w-full h-full flex items-center justify-center">
                                                                                                        <UtensilsCrossed className="w-12 h-12 text-muted-foreground/30" />
                                                                                                    </div>
                                                                                                )}
                                                                                                {!item.isAvailable && (
                                                                                                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
                                                                                                        <Badge className="bg-red-500/90 text-white">
                                                                                                            Unavailable
                                                                                                        </Badge>
                                                                                                    </div>
                                                                                                )}
                                                                                            </div>
                                                                                            <div className="p-3 space-y-1">
                                                                                                <p className="text-sm font-semibold line-clamp-1">
                                                                                                    {
                                                                                                        item.name
                                                                                                    }
                                                                                                </p>
                                                                                                {item.description && (
                                                                                                    <p className="text-xs text-muted-foreground line-clamp-2">
                                                                                                        {
                                                                                                            item.description
                                                                                                        }
                                                                                                    </p>
                                                                                                )}
                                                                                                <div className="flex items-center justify-between pt-1">
                                                                                                    <p className="text-sm font-semibold text-primary">
                                                                                                        NGN{' '}
                                                                                                        {new Intl.NumberFormat(
                                                                                                            'en-NG',
                                                                                                        ).format(
                                                                                                            Number(
                                                                                                                item.price,
                                                                                                            ),
                                                                                                        )}
                                                                                                    </p>
                                                                                                    <button
                                                                                                        type="button"
                                                                                                        className="text-xs text-hexbrand hover:underline"
                                                                                                        onClick={() =>
                                                                                                            openPriceEdit(
                                                                                                                item,
                                                                                                            )
                                                                                                        }
                                                                                                    >
                                                                                                        Edit
                                                                                                        price
                                                                                                    </button>
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>
                                                                                    ),
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    )}

                                                                {/* Subcategories with their items */}
                                                                {category.subCategories &&
                                                                    category
                                                                        .subCategories
                                                                        .length >
                                                                        0 && (
                                                                        <div className="space-y-4 pt-2">
                                                                            {category.subCategories.map(
                                                                                (subCat: {
                                                                                    id: number;
                                                                                    name: string;
                                                                                    items?: Array<{
                                                                                        id: number;
                                                                                        name: string;
                                                                                        description?: string;
                                                                                        price: number;
                                                                                        imageUrl?: string;
                                                                                        isAvailable: boolean;
                                                                                    }>;
                                                                                }) => (
                                                                                    <div
                                                                                        key={
                                                                                            subCat.id
                                                                                        }
                                                                                        className="border-l-2 border-hexbrand/40 pl-3 space-y-2"
                                                                                    >
                                                                                        <h4 className="text-sm font-semibold flex items-center gap-2">
                                                                                            <span className="w-1.5 h-1.5 rounded-full bg-hexbrand" />
                                                                                            {
                                                                                                subCat.name
                                                                                            }
                                                                                        </h4>
                                                                                        {subCat.items &&
                                                                                        subCat
                                                                                            .items
                                                                                            .length >
                                                                                            0 ? (
                                                                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pt-1">
                                                                                                {subCat.items.map(
                                                                                                    (item: {
                                                                                                        id: number;
                                                                                                        name: string;
                                                                                                        description?: string;
                                                                                                        price: number;
                                                                                                        imageUrl?: string;
                                                                                                        isAvailable: boolean;
                                                                                                    }) => (
                                                                                                        <div
                                                                                                            key={
                                                                                                                item.id
                                                                                                            }
                                                                                                            className="group border rounded-md overflow-hidden bg-white hover:shadow-sm transition-all duration-150"
                                                                                                        >
                                                                                                            <div className="relative w-full h-40 bg-slate-100">
                                                                                                                {item.imageUrl ? (
                                                                                                                    <Image
                                                                                                                        src={
                                                                                                                            item.imageUrl
                                                                                                                        }
                                                                                                                        alt={
                                                                                                                            item.name
                                                                                                                        }
                                                                                                                        fill
                                                                                                                        className="object-cover group-hover:scale-105 transition-transform duration-200"
                                                                                                                    />
                                                                                                                ) : (
                                                                                                                    <div className="w-full h-full flex items-center justify-center">
                                                                                                                        <UtensilsCrossed className="w-12 h-12 text-muted-foreground/30" />
                                                                                                                    </div>
                                                                                                                )}
                                                                                                                {!item.isAvailable && (
                                                                                                                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
                                                                                                                        <Badge className="bg-red-500/90 text-white">
                                                                                                                            Unavailable
                                                                                                                        </Badge>
                                                                                                                    </div>
                                                                                                                )}
                                                                                                            </div>
                                                                                                            <div className="p-3 space-y-1">
                                                                                                                <p className="text-sm font-semibold line-clamp-1">
                                                                                                                    {
                                                                                                                        item.name
                                                                                                                    }
                                                                                                                </p>
                                                                                                                {item.description && (
                                                                                                                    <p className="text-xs text-muted-foreground line-clamp-2">
                                                                                                                        {
                                                                                                                            item.description
                                                                                                                        }
                                                                                                                    </p>
                                                                                                                )}
                                                                                                                <div className="flex items-center justify-between pt-1">
                                                                                                                    <p className="text-sm font-semibold text-primary">
                                                                                                                        NGN{' '}
                                                                                                                        {new Intl.NumberFormat(
                                                                                                                            'en-NG',
                                                                                                                        ).format(
                                                                                                                            Number(
                                                                                                                                item.price,
                                                                                                                            ),
                                                                                                                        )}
                                                                                                                    </p>
                                                                                                                    <button
                                                                                                                        type="button"
                                                                                                                        className="text-xs text-hexbrand hover:underline"
                                                                                                                        onClick={() =>
                                                                                                                            openPriceEdit(
                                                                                                                                item,
                                                                                                                            )
                                                                                                                        }
                                                                                                                    >
                                                                                                                        Edit
                                                                                                                        price
                                                                                                                    </button>
                                                                                                                </div>
                                                                                                            </div>
                                                                                                        </div>
                                                                                                    ),
                                                                                                )}
                                                                                            </div>
                                                                                        ) : (
                                                                                            <p className="text-sm text-muted-foreground italic py-4">
                                                                                                No
                                                                                                items
                                                                                                in
                                                                                                this
                                                                                                subcategory
                                                                                            </p>
                                                                                        )}
                                                                                    </div>
                                                                                ),
                                                                            )}
                                                                        </div>
                                                                    )}

                                                                {/* Show message if no items at all */}
                                                                {(!category.items ||
                                                                    category
                                                                        .items
                                                                        .length ===
                                                                        0) &&
                                                                    (!category.subCategories ||
                                                                        category.subCategories.every(
                                                                            (
                                                                                sc,
                                                                            ) =>
                                                                                !sc.items ||
                                                                                sc
                                                                                    .items
                                                                                    .length ===
                                                                                    0,
                                                                        )) && (
                                                                        <p className="text-xs text-muted-foreground italic text-center py-4">
                                                                            No
                                                                            items
                                                                            in
                                                                            this
                                                                            category
                                                                            yet.
                                                                        </p>
                                                                    )}
                                                            </div>
                                                        ),
                                                    )}
                                            </div>
                                        </TabsContent>
                                    </Tabs>
                                ) : (
                                    <div className="text-center py-16 text-muted-foreground space-y-2">
                                        <ChefHat className="w-10 h-10 mx-auto opacity-30" />
                                        <p className="text-sm font-medium">
                                            No categories in this menu yet.
                                        </p>
                                        <p className="text-xs">
                                            Add categories to start building
                                            this menu.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="py-20 text-center text-muted-foreground">
                            <ChefHat className="w-16 h-16 mx-auto mb-4 opacity-30" />
                            <p className="text-lg font-medium">
                                Failed to load menu details
                            </p>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
            <Dialog open={editDialog} onOpenChange={setEditDialog}>
                <DialogTrigger asChild>
                    <button className="text-hexbrand">Edit</button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Menu</DialogTitle>
                    </DialogHeader>
                    <MutateMenuForm
                        isLoading={loadingUpdate}
                        onSubmit={(data) => {
                            handleUpdate(
                                menu.id,
                                data as {
                                    name: string;
                                    description: string;
                                    dineInAreaId?: number;
                                },
                            );
                            mutate('menus');
                        }}
                        mode="edit"
                        initialData={{
                            name: menu.name,
                            description: menu.description || '',
                            dineInAreaId: menu.dineInArea?.id,
                        }}
                    />
                </DialogContent>
            </Dialog>
            <Dialog open={deleteDialog} onOpenChange={setDeleteDialog}>
                <DialogTrigger asChild>
                    <button className="text-muted-foreground">Delete</button>
                </DialogTrigger>
                <DialogContent className="max-w-xl w-full p-0 overflow-hidden bg-white rounded-2xl shadow-2xl border-none">
                    <div className="px-6 py-6 border-b">
                        <DialogHeader className="text-left flex flex-col gap-1">
                            <DialogTitle className="text-xl font-bold text-gray-900">
                                Delete Menu
                            </DialogTitle>
                            <DialogDescription className="text-sm text-muted-foreground">
                                Are you sure you want to delete{' '}
                                <span className="font-semibold text-gray-900">
                                    &ldquo;{menu.name}&rdquo;
                                </span>
                                ?
                            </DialogDescription>
                        </DialogHeader>
                    </div>

                    <div className="max-h-[50vh] overflow-y-auto px-6 py-4">
                        {isLoadingMenuDetails ? (
                            <div className="flex flex-col items-center justify-center py-16 space-y-4">
                                <Loader2 className="w-8 h-8 animate-spin text-orion-blue" />
                                <p className="text-xs text-muted-foreground animate-pulse">
                                    Analyzing menu relationships...
                                </p>
                            </div>
                        ) : menuDetails?.data?.categories?.length > 0 ? (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between px-1">
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                                        Categories (
                                        {menuDetails?.data?.categories
                                            ?.length || 0}
                                        )
                                    </h3>
                                    <button
                                        onClick={() => {
                                            const categories =
                                                menuDetails?.data?.categories ||
                                                [];
                                            if (
                                                categoryIdsToDelete.length ===
                                                categories.length
                                            ) {
                                                setCategoryIdsToDelete([]);
                                            } else {
                                                setCategoryIdsToDelete(
                                                    categories.map(
                                                        (c: any) => c.id,
                                                    ),
                                                );
                                            }
                                        }}
                                        className="text-[11px] font-semibold text-orion-blue hover:underline"
                                    >
                                        {categoryIdsToDelete.length ===
                                        (menuDetails?.data?.categories
                                            ?.length || 0)
                                            ? 'Deselect All'
                                            : 'Select All'}
                                    </button>
                                </div>
                                <div className="grid gap-3">
                                    {menuDetails?.data?.categories?.map(
                                        (category: any) => {
                                            const otherMenus =
                                                category.menus?.filter(
                                                    (m: any) =>
                                                        m.id !== menu.id,
                                                ) || [];
                                            const isShared =
                                                otherMenus.length > 0;

                                            return (
                                                <div
                                                    key={category.id}
                                                    className={`group relative border rounded-xl p-4 transition-all duration-200 ${
                                                        categoryIdsToDelete.includes(
                                                            category.id,
                                                        )
                                                            ? 'border-red-200 bg-red-50/20 shadow-sm'
                                                            : 'border-gray-100 bg-white hover:border-gray-300'
                                                    }`}
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <input
                                                            type="checkbox"
                                                            id={`cat-${category.id}`}
                                                            className="mt-1 h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500 cursor-pointer"
                                                            checked={categoryIdsToDelete.includes(
                                                                category.id,
                                                            )}
                                                            onChange={(e) => {
                                                                if (
                                                                    e.target
                                                                        .checked
                                                                ) {
                                                                    setCategoryIdsToDelete(
                                                                        [
                                                                            ...categoryIdsToDelete,
                                                                            category.id,
                                                                        ],
                                                                    );
                                                                } else {
                                                                    setCategoryIdsToDelete(
                                                                        categoryIdsToDelete.filter(
                                                                            (
                                                                                id,
                                                                            ) =>
                                                                                id !==
                                                                                category.id,
                                                                        ),
                                                                    );
                                                                }
                                                            }}
                                                        />
                                                        <div className="flex-1 space-y-2">
                                                            <div className="flex items-center justify-between">
                                                                <label
                                                                    htmlFor={`cat-${category.id}`}
                                                                    className="text-sm font-semibold text-gray-900 cursor-pointer"
                                                                >
                                                                    {
                                                                        category.name
                                                                    }
                                                                </label>
                                                                {isShared && (
                                                                    <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-200 text-[10px] h-5">
                                                                        SHARED
                                                                    </Badge>
                                                                )}
                                                            </div>

                                                            {isShared && (
                                                                <div className="flex items-center gap-2 p-2 bg-amber-50/50 rounded-lg text-[10px] text-amber-700 border border-amber-100/50 mt-2">
                                                                    <Bell
                                                                        size={
                                                                            12
                                                                        }
                                                                        className="shrink-0 text-amber-500"
                                                                    />
                                                                    <p className="leading-tight">
                                                                        Shared
                                                                        with:{' '}
                                                                        <span className="font-bold">
                                                                            {otherMenus
                                                                                .map(
                                                                                    (
                                                                                        m: any,
                                                                                    ) =>
                                                                                        m.name,
                                                                                )
                                                                                .join(
                                                                                    ', ',
                                                                                )}
                                                                        </span>
                                                                    </p>
                                                                </div>
                                                            )}

                                                            <div className="flex flex-wrap gap-2 pt-1">
                                                                {category.items?.map(
                                                                    (
                                                                        item: any,
                                                                    ) => (
                                                                        <span
                                                                            key={
                                                                                item.id
                                                                            }
                                                                            className="px-2 py-0.5 bg-gray-100/50 text-[9px] text-gray-500 rounded-md"
                                                                        >
                                                                            {
                                                                                item.name
                                                                            }
                                                                        </span>
                                                                    ),
                                                                )}
                                                                {category.subCategories?.map(
                                                                    (
                                                                        sub: any,
                                                                    ) =>
                                                                        sub.items?.map(
                                                                            (
                                                                                item: any,
                                                                            ) => (
                                                                                <span
                                                                                    key={
                                                                                        item.id
                                                                                    }
                                                                                    className="px-2 py-0.5 bg-gray-100/50 text-[9px] text-gray-500 rounded-md italic"
                                                                                >
                                                                                    {
                                                                                        item.name
                                                                                    }
                                                                                </span>
                                                                            ),
                                                                        ),
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        },
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-12 space-y-3">
                                <ChefHat className="w-12 h-12 mx-auto text-gray-300" />
                                <p className="text-sm text-muted-foreground">
                                    This menu is empty. Only the menu name will
                                    be deleted.
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="p-6 bg-gray-50 flex flex-col gap-4 border-t">
                        <div className="flex items-center gap-2 text-[11px] text-muted-foreground px-1">
                            <div
                                className={`w-2 h-2 rounded-full ${categoryIdsToDelete.length > 0 ? 'bg-red-500 animate-pulse' : 'bg-gray-300'}`}
                            />
                            {categoryIdsToDelete.length > 0
                                ? `Warning: ${categoryIdsToDelete.length} categories and their items will be permanently erased.`
                                : 'If nothing is selected, the menu will be deleted but categories and items will be preserved.'}
                        </div>
                        <div className="flex items-center gap-3">
                            <Button
                                variant="outline"
                                className="flex-1 h-11 border-gray-200 text-gray-600 hover:bg-gray-100 font-semibold"
                                onClick={() => {
                                    setDeleteDialog(false);
                                    setCategoryIdsToDelete([]);
                                }}
                                disabled={loadingDelete}
                            >
                                No, Cancel
                            </Button>
                            <Button
                                className="flex-[1.5] h-11 bg-red-600 hover:bg-red-700 text-white font-bold transition-all active:scale-[0.98]"
                                onClick={() => handleDelete(menu.id)}
                                disabled={loadingDelete}
                            >
                                {loadingDelete ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    'Delete Menu Structure'
                                )}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
            {/* Inline price edit dialog */}
            {priceEditItemId !== null && (
                <Dialog
                    open={true}
                    onOpenChange={() => setPriceEditItemId(null)}
                >
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Edit Item Price</DialogTitle>
                            <DialogDescription>
                                Update the price for this item in{' '}
                                <span className="font-semibold">
                                    {menu.name}
                                </span>
                                . You can also apply the same price to other
                                menus that use this item.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Price
                                </label>
                                <input
                                    type="text"
                                    className="w-full border rounded-md px-3 py-2 text-sm"
                                    placeholder="Enter Price"
                                    value={
                                        priceEditValue
                                            ? `₦${Number(
                                                  priceEditValue,
                                              ).toLocaleString('en-NG', {
                                                  maximumFractionDigits: 0,
                                              })}`
                                            : ''
                                    }
                                    onChange={(e) => {
                                        const value = e.target.value.replace(
                                            /[^0-9]/g,
                                            '',
                                        );
                                        setPriceEditValue(value);
                                    }}
                                />
                            </div>
                            {availableMenusForItem.length > 0 && (
                                <div className="space-y-2">
                                    <p className="text-sm font-medium">
                                        Also update in:
                                    </p>
                                    <div className="space-y-1">
                                        {availableMenusForItem.map((m) => (
                                            <label
                                                key={m.id}
                                                className="flex items-center gap-2 text-sm"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={selectedExtraMenuIds.includes(
                                                        m.id,
                                                    )}
                                                    onChange={(e) => {
                                                        setSelectedExtraMenuIds(
                                                            (prev) =>
                                                                e.target.checked
                                                                    ? [
                                                                          ...prev,
                                                                          m.id,
                                                                      ]
                                                                    : prev.filter(
                                                                          (
                                                                              id,
                                                                          ) =>
                                                                              id !==
                                                                              m.id,
                                                                      ),
                                                        );
                                                    }}
                                                />
                                                <span>{m.name}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}
                            <div className="flex justify-end gap-2 pt-2">
                                <Button
                                    variant="outline"
                                    onClick={() => setPriceEditItemId(null)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleSavePriceEdit}
                                    disabled={loadingUpdate || !priceEditValue}
                                    className="bg-orion-blue text-white"
                                >
                                    {loadingUpdate ? (
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    ) : null}
                                    Save
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
};

export default MenuActionCell;
