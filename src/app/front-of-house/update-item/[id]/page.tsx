'use client';

import { getCustomCharges } from '@/app/actions/hotel';
import { getMenusByDineArea } from '@/app/actions/menu';
import {
    getMenuCategories,
    getOneMenuCategories,
} from '@/app/actions/menu-category';
import { getMenuItems } from '@/app/actions/menu-item';
import { getOrderById, updateOrder } from '@/app/actions/order';
import { CustomSheet } from '@/components/common/CustomSheet';
import { ItemsTable } from '@/components/common/ItemsTable';
import { PageHeader, PageHeadertitle } from '@/components/common/layout/Header';
import PageWrapper from '@/components/common/PageWrapper';
import SearchInput from '@/components/common/SearchInput';
import { ItemOrderColumnsFunc } from '@/components/common/table/column/ItemOrder';
import { MiniCategory } from '@/components/front-of-house/data/types/types';
import {
    MenuItem,
    MenuItemGrid,
} from '@/components/front-of-house/MenuItemCard';
import MiniCategoryList from '@/components/front-of-house/MiniCategoryList';
import OrderSkeleton from '@/components/front-of-house/OrderSkeleton';
import { ScrollableTabs } from '@/components/front-of-house/ScrollTab';
import {
    getFilteredItems,
    handlePrintOrder,
} from '@/components/front-of-house/utils';
import { SimplePrintButton } from '@/components/SimplePrintButton';
import Toast from '@/components/toast';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { useUser } from '@/context/useUser';
import useHotel from '@/hooks/useHotel';
import useOrderStore from '@/store/useOrder';
import { ArrowLeft, LoaderCircle, Save, ShoppingCart } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useRouter } from 'nextjs-toploader/app';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { LuBell } from 'react-icons/lu';
import useSWR, { mutate } from 'swr';

const MenuItemsPage = () => {
    const params = useParams();
    const router = useRouter();
    const { id: orderId } = params;
    const {
        order,
        setOrder,
        clearOrder,
        addItem: addOrderItem,
        // removeItem,
        increaseItemQuantity,
        decreaseItemQuantity,
        updateTotalAmount,
    } = useOrderStore();
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [selectedSubCategory, setSelectedSubCategory] = useState<string>('');
    const [subCategories, setSubCategories] = useState([]);
    const [loadingUpdate, setLoadingUpdate] = useState(false);
    const [referrer, setReferrer] = useState<string | null>(null);
    const [isLoadingSubcategories, setIsLoadingSubcategories] = useState(false);
    const [originalItemIds, setOriginalItemIds] = useState<Set<number>>(
        new Set(),
    );
    const [originalItemQuantities, setOriginalItemQuantities] = useState<
        Map<number, number>
    >(new Map());
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredItem, setFilteredItem] = useState(null);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [includeTip, setIncludeTip] = useState(false);
    const initialCategorySet = useRef(false);

    const { user, loading: isUserLoading } = useUser();
    const currentUserId = user?.id;
    const currentUserRole = user?.roles?.name?.toLowerCase() || '';

    const isCreator = useMemo(() => {
        if (!currentUserId) return false;
        if (!order?.createdBy) return false;
        const createdById =
            typeof order.createdBy === 'object'
                ? order.createdBy.id
                : order.createdBy;
        return Number(createdById) === Number(currentUserId);
    }, [order?.createdBy, currentUserId]);

    const isManager = useMemo(
        () =>
            currentUserRole === 'administrator' ||
            currentUserRole === 'manager' ||
            currentUserRole === 'general manager',
        [currentUserRole],
    );

    const canDeterminePermissions =
        !isUserLoading && Boolean(currentUserId && order?.createdBy);
    const canModifyItems = canDeterminePermissions && (isCreator || isManager);
    const canRemoveItems = isCreator;

    const dineAreaId = useMemo(() => {
        if (
            order?.orderType === 'DINE_IN' &&
            order?.table &&
            typeof order.table === 'object' &&
            order.table !== null
        ) {
            const table = order.table as any;
            const dineAreaRaw = table.dineArea || table.dineInArea;
            if (
                typeof dineAreaRaw === 'object' &&
                dineAreaRaw !== null &&
                'id' in dineAreaRaw
            ) {
                return String(dineAreaRaw.id);
            }
            if (
                typeof dineAreaRaw === 'string' ||
                typeof dineAreaRaw === 'number'
            ) {
                return String(dineAreaRaw);
            }
        }
        return null;
    }, [order?.orderType, order?.table]);

    const shouldUseDineCategories = useMemo(
        () =>
            order?.orderType === 'DINE_IN' &&
            dineAreaId !== null &&
            dineAreaId !== '',
        [order?.orderType, dineAreaId],
    );

    const { data: menusByDine } = useSWR(
        shouldUseDineCategories && dineAreaId
            ? ['/dine/menus', dineAreaId]
            : null,
        () => getMenusByDineArea(dineAreaId!),
    );

    const { data: menuCategories } = useSWR(
        !shouldUseDineCategories ? '/menu/category' : null,
        getMenuCategories,
    );

    const menuCategoriesData = useMemo(() => {
        if (shouldUseDineCategories && menusByDine?.data) {
            const allCategories = menusByDine.data.flatMap(
                (menu: any) => menu.categories || [],
            );
            if (allCategories.length > 0) {
                return { data: allCategories };
            }
            return undefined;
        }
        return menuCategories;
    }, [shouldUseDineCategories, menusByDine, menuCategories]);
    const { data: items } = useSWR(
        !shouldUseDineCategories ? '/menu/item' : null,
        getMenuItems,
    );

    const itemsFromMenus = useMemo(() => {
        if (shouldUseDineCategories && menusByDine?.data) {
            const allItems: any[] = [];
            menusByDine.data.forEach((menu: any) => {
                if (menu.categories) {
                    menu.categories.forEach((category: any) => {
                        if (category.items && Array.isArray(category.items)) {
                            allItems.push(...category.items);
                        }
                        if (
                            category.subCategories &&
                            Array.isArray(category.subCategories)
                        ) {
                            category.subCategories.forEach((subCat: any) => {
                                if (
                                    subCat.items &&
                                    Array.isArray(subCat.items)
                                ) {
                                    allItems.push(...subCat.items);
                                }
                            });
                        }
                    });
                }
            });
            return allItems;
        }
        return null;
    }, [shouldUseDineCategories, menusByDine]);

    const allMenuItems = useMemo(() => {
        if (shouldUseDineCategories && itemsFromMenus) {
            return itemsFromMenus;
        }
        return items?.data || [];
    }, [shouldUseDineCategories, itemsFromMenus, items?.data]);

    const categoryOptions = useMemo(() => {
        return (
            menuCategoriesData?.data?.map((category: any) => ({
                value: category.id,
                label: category.name,
            })) || []
        );
    }, [menuCategoriesData?.data]);

    const subCategoryOptions = useMemo(
        () =>
            subCategories.map((category: any) => ({
                value: category.id,
                label: category.name,
            })) || [],
        [subCategories],
    );

    const handleSearch = useCallback((query: string) => {
        setSearchQuery(query);
    }, []);

    const filteredItems = useMemo(() => {
        if (searchQuery.trim()) {
            return filteredItem || [];
        }

        return getFilteredItems(
            allMenuItems,
            selectedCategory ?? '',
            selectedSubCategory ?? '',
        );
    }, [
        allMenuItems,
        selectedCategory,
        selectedSubCategory,
        searchQuery,
        filteredItem,
    ]);

    useEffect(() => {
        if (!allMenuItems || allMenuItems.length === 0) {
            setFilteredItem(null);
            return;
        }

        if (!searchQuery.trim()) {
            setFilteredItem(allMenuItems);
            return;
        }

        const filtered = allMenuItems.filter(
            (item: any) =>
                item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.description
                    ?.toLowerCase()
                    .includes(searchQuery.toLowerCase()),
        );

        setFilteredItem(filtered);
    }, [allMenuItems, searchQuery]);

    const mappedOrderItems = useMemo(
        () =>
            order.items.map((item) => {
                return {
                    id: item.id,
                    name: item.menuItem?.name ?? item.name,
                    price: item.price,
                    quantity: item.quantity,
                };
            }),
        [order.items],
    );

    const totalAmount = useMemo(
        () =>
            order.items.reduce((acc, item) => {
                return acc + item.price * item.quantity;
            }, 0),
        [order.items],
    );
    const { organization } = useHotel();

    const isRestaurantOrder = useMemo(() => {
        return (
            order.orderType === 'DINE_IN' ||
            order.orderType === 'TAKE_AWAY' ||
            order.orderType === 'DELIVERY'
        );
    }, [order.orderType]);

    const vatRate = useMemo(() => {
        const rateFromOrder = order?.vatRate ?? order?.vatRateSnapshot ?? null;
        if (rateFromOrder !== null && rateFromOrder !== undefined) {
            return Number(rateFromOrder) || 0;
        }
        return Number(organization?.restaurantVatRate ?? organization?.vatRate ?? 0);
    }, [order?.vatRate, order?.vatRateSnapshot, organization?.restaurantVatRate, organization?.vatRate]);

    const serviceChargeRate = useMemo(() => {
        const rateFromOrder =
            order?.serviceChargeRate ??
            order?.serviceChargeRateSnapshot ??
            null;
        if (rateFromOrder !== null && rateFromOrder !== undefined) {
            return Number(rateFromOrder) || 0;
        }
        return Number(organization?.restaurantServiceChargeRate ?? organization?.serviceChargeRate ?? 0);
    }, [
        order?.serviceChargeRate,
        order?.serviceChargeRateSnapshot,
        organization?.restaurantServiceChargeRate,
        organization?.serviceChargeRate,
    ]);

    const tipRate = useMemo(() => {
        const rateFromOrder = order?.tipRate ?? order?.tipRateSnapshot ?? null;
        if (rateFromOrder !== null && rateFromOrder !== undefined) {
            return Number(rateFromOrder) || 0;
        }
        return Number(organization?.restaurantTipRate ?? organization?.tipRate ?? 0);
    }, [order?.tipRate, order?.tipRateSnapshot, organization?.restaurantTipRate, organization?.tipRate]);

    const hasVatRate = useMemo(() => vatRate > 0, [vatRate]);
    const hasServiceChargeRate = useMemo(
        () => serviceChargeRate > 0,
        [serviceChargeRate],
    );
    const hasTipRate = useMemo(() => tipRate > 0, [tipRate]);

    const vatAmount = useMemo(() => {
        if (!hasVatRate) {
            return 0;
        }
        return (totalAmount * vatRate) / 100;
    }, [totalAmount, vatRate, hasVatRate]);

    const serviceChargeAmount = useMemo(() => {
        if (!hasServiceChargeRate) {
            return 0;
        }
        return (totalAmount * serviceChargeRate) / 100;
    }, [totalAmount, serviceChargeRate, hasServiceChargeRate]);

    const tipAmount = useMemo(() => {
        if (!hasTipRate || !includeTip) {
            return 0;
        }
        return (totalAmount * tipRate) / 100;
    }, [totalAmount, tipRate, hasTipRate, includeTip]);

    const { data: customChargesData } = useSWR(
        'custom-charges-update-item',
        async () => {
            const result = await getCustomCharges();
            if ('error' in result) {
                console.error('Error fetching custom charges:', result.error);
                return [];
            }
            return (result.data || []).filter(
                (charge: any) => charge.isActive === true,
            );
        },
    );

    const customChargesAmount = useMemo(() => {
        if (!customChargesData || customChargesData.length === 0) return 0;
        return customChargesData.reduce((sum: number, charge: any) => {
            const rate = Math.min(Math.max(Number(charge.rate ?? 0), 0), 100);
            return sum + (totalAmount * rate) / 100;
        }, 0);
    }, [customChargesData, totalAmount]);

    const totalWithVat = useMemo(
        () =>
            totalAmount +
            vatAmount +
            serviceChargeAmount +
            tipAmount +
            customChargesAmount,
        [
            totalAmount,
            vatAmount,
            serviceChargeAmount,
            tipAmount,
            customChargesAmount,
        ],
    );

    const breakdownRows = useMemo(() => {
        const rows = [{ label: 'Subtotal', value: totalAmount }];
        if (hasVatRate) {
            rows.push({
                label: `VAT (${vatRate.toFixed(2)}%)`,
                value: vatAmount,
            });
        }
        if (hasServiceChargeRate && isRestaurantOrder) {
            rows.push({
                label: `Service Charge (${serviceChargeRate.toFixed(2)}%)`,
                value: serviceChargeAmount,
            });
        }
        if (hasTipRate && isRestaurantOrder && includeTip) {
            rows.push({
                label: `Tip (${tipRate.toFixed(2)}%)`,
                value: tipAmount,
            });
        }
        if (customChargesData && customChargesData.length > 0) {
            customChargesData.forEach((charge: any) => {
                const rate = Math.min(
                    Math.max(Number(charge.rate ?? 0), 0),
                    100,
                );
                const amount = (totalAmount * rate) / 100;
                if (amount > 0) {
                    rows.push({
                        label: `${charge.name} (${rate.toFixed(2)}%)`,
                        value: amount,
                    });
                }
            });
        }
        return rows;
    }, [
        totalAmount,
        hasVatRate,
        vatRate,
        vatAmount,
        hasServiceChargeRate,
        serviceChargeRate,
        serviceChargeAmount,
        hasTipRate,
        tipRate,
        tipAmount,
        isRestaurantOrder,
        includeTip,
        customChargesData,
    ]);

    useEffect(() => {
        const fetchCategory = async () => {
            if (!selectedCategory) return;

            setIsLoadingSubcategories(true);
            try {
                const response = await getOneMenuCategories(selectedCategory);
                setSubCategories(response?.data?.subCategories || []);

                if (response?.data?.subCategories?.length > 0) {
                    setSelectedSubCategory(response.data.subCategories[0].id);
                } else {
                    setSelectedSubCategory('');
                }
            } catch (error: any) {
                console.error('Failed to fetch menu category:', error);
            } finally {
                setIsLoadingSubcategories(false);
            }
        };

        if (selectedCategory) {
            fetchCategory();
        }
    }, [selectedCategory]);

    const handleSubCategoryChange = useCallback((subCategory: string) => {
        setSelectedSubCategory(subCategory);
    }, []);

    const addItem = useCallback(
        (item: MenuItem) => {
            if (!canModifyItems) {
                toast.custom(() => (
                    <Toast
                        title="Permission Denied"
                        description="Only the staff who created this order or a manager can modify items."
                        type="error"
                    />
                ));
                return;
            }

            const menuItem = order.items.find((i) => i.id === item.id);

            if (menuItem) {
                increaseItemQuantity(item.id);
            } else {
                addOrderItem({
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    quantity: 1,
                });
            }
        },
        [
            order.items,
            originalItemIds,
            increaseItemQuantity,
            addOrderItem,
            canModifyItems,
        ],
    );

    const increaseQuantity = useCallback(
        (id: number) => {
            if (!canModifyItems) {
                toast.custom(() => (
                    <Toast
                        title="Permission Denied"
                        description="Only the staff who created this order or a manager can modify items."
                        type="error"
                    />
                ));
                return;
            }
            increaseItemQuantity(id);
        },
        [increaseItemQuantity, canModifyItems],
    );

    const decreaseQuantity = useCallback(
        (id: number) => {
            if (!canModifyItems) {
                toast.custom(() => (
                    <Toast
                        title="Permission Denied"
                        description="Only the staff who created this order or a manager can modify items."
                        type="error"
                    />
                ));
                return;
            }
            const item = order.items.find((i) => i.id === id);
            const isOriginalItem = originalItemIds.has(id);
            const originalQty = originalItemQuantities.get(id) ?? 0;
            const currentQty = item?.quantity ?? 0;

            if (isOriginalItem && !canRemoveItems) {
                if (currentQty <= originalQty) {
                    toast.custom(() => (
                        <Toast
                            title="Permission Denied"
                            description={`Cannot reduce below original quantity (${originalQty}). Only the original staff can reduce further.`}
                            type="error"
                        />
                    ));
                    return;
                }
            }

            if (currentQty === 1 && isOriginalItem && !canRemoveItems) {
                toast.custom(() => (
                    <Toast
                        title="Permission Denied"
                        description="Only the original staff can remove items from this order."
                        type="error"
                    />
                ));
                return;
            }
            decreaseItemQuantity(id);
        },
        [
            decreaseItemQuantity,
            canModifyItems,
            canRemoveItems,
            order.items,
            originalItemIds,
            originalItemQuantities,
        ],
    );

    const handleQuantityChange = useCallback(
        (id: number, increase: boolean) =>
            increase ? increaseQuantity(id) : decreaseQuantity(id),
        [increaseQuantity, decreaseQuantity],
    );

    const fetchOrder = useCallback(async () => {
        try {
            const response = await getOrderById(Number(orderId));
            if (response.data && response.data.items) {
                const formattedItems = (response.data.items as any).map(
                    (item: any) => ({
                        ...item,
                        orderItemId: item.id,
                        id: item.menuItem?.id,
                        name: item.name || item.menuItem?.name,
                        price: item.price,
                        quantity: item.quantity,
                        notes: item.notes,
                    }),
                );

                const originalIds = new Set(
                    formattedItems.map((item: any) => item.id),
                );
                setOriginalItemIds(
                    new Set<number>(Array.from(originalIds) as number[]),
                );

                const originalQtys = new Map<number, number>();
                formattedItems.forEach((item: any) => {
                    if (item.id) {
                        originalQtys.set(item.id, item.quantity);
                    }
                });
                setOriginalItemQuantities(originalQtys);

                const formatedOrder = {
                    ...response.data,
                    requestId: response.data.id,
                    items: formattedItems,
                };

                response.data = formatedOrder;

                const existingTipAmount = response.data?.tipAmount;
                if (
                    existingTipAmount !== undefined &&
                    existingTipAmount !== null &&
                    Number(existingTipAmount) > 0
                ) {
                    setIncludeTip(true);
                }
            }
            setOrder(response.data);
        } catch (error: any) {
            console.error('Failed to fetch order:', error);
        }
    }, [orderId, setOrder]);

    useEffect(() => {
        updateTotalAmount({
            subtotal: totalAmount,
            vatAmount,
            total: totalWithVat,
            vatRate: hasVatRate ? vatRate : undefined,
            serviceChargeAmount: hasServiceChargeRate
                ? serviceChargeAmount
                : undefined,
            serviceChargeRate: hasServiceChargeRate
                ? serviceChargeRate
                : undefined,
            tipAmount: hasTipRate && includeTip ? tipAmount : undefined,
            tipRate: hasTipRate && includeTip ? tipRate : undefined,
        });
    }, [
        totalAmount,
        vatAmount,
        totalWithVat,
        vatRate,
        hasVatRate,
        serviceChargeAmount,
        serviceChargeRate,
        hasServiceChargeRate,
        tipAmount,
        tipRate,
        hasTipRate,
        includeTip,
        updateTotalAmount,
    ]);

    useEffect(() => {
        if (
            !initialCategorySet.current &&
            menuCategoriesData?.data &&
            categoryOptions.length > 0
        ) {
            setSelectedCategory(categoryOptions[0].value ?? '');
            initialCategorySet.current = true;
        }
    }, [categoryOptions, menuCategoriesData?.data]);

    useEffect(() => {
        if (orderId) {
            clearOrder();
            fetchOrder();
        }
    }, [orderId, clearOrder, fetchOrder]);

    useEffect(() => {
        const storedReferrer = sessionStorage.getItem('orderReferrer');
        setReferrer(storedReferrer || '/front-of-house/incoming-orders');
    }, []);

    useEffect(() => {
        if (
            isUserLoading ||
            !order?.id ||
            !currentUserId ||
            !order?.createdBy
        ) {
            return;
        }

        const createdById =
            typeof order.createdBy === 'object'
                ? order.createdBy.id
                : order.createdBy;
        const isUserCreator = Number(createdById) === Number(currentUserId);
        const isUserManager =
            currentUserRole === 'administrator' ||
            currentUserRole === 'manager' ||
            currentUserRole === 'general manager';

        if (!isUserCreator && !isUserManager) {
            toast.custom(() => (
                <Toast
                    title="Access Denied"
                    description="Only the staff who created this order or a manager can modify items."
                    type="error"
                />
            ));
            const redirectUrl = referrer || '/front-of-house/incoming-orders';
            router.push(redirectUrl);
        }
    }, [
        isUserLoading,
        order?.id,
        order?.createdBy,
        currentUserId,
        currentUserRole,
        referrer,
        router,
    ]);

    const handleGoBack = useCallback(() => {
        if (referrer) {
            router.push(referrer);
        } else {
            router.back();
        }
        clearOrder();
    }, [referrer, router, clearOrder]);

    const updateOrderItems = useCallback(async () => {
        const mappedOrder = {
            items: order.items.map((item) => ({
                menuItemId: item.menuItem?.id || item.id,
                quantity: item.quantity,
                price: item.price,
                notes: (item.notes ?? '').trim(),
            })),
            totalPrice: totalWithVat,
            subtotal: totalAmount,
            vatAmount: vatAmount,
            vatRateSnapshot: hasVatRate ? vatRate : undefined,
            serviceChargeAmount: hasServiceChargeRate
                ? serviceChargeAmount
                : undefined,
            serviceChargeRateSnapshot: hasServiceChargeRate
                ? serviceChargeRate
                : undefined,
            tipAmount: hasTipRate && includeTip ? tipAmount : 0,
            tipRateSnapshot: hasTipRate && includeTip ? tipRate : 0,
        };
        setLoadingUpdate(true);
        try {
            const orderIdToUpdate = Number(orderId);
            if (!orderIdToUpdate || isNaN(orderIdToUpdate)) {
                toast.custom(() => (
                    <Toast
                        title="Error"
                        description="Invalid order ID. Please try again."
                        type="error"
                    />
                ));
                setLoadingUpdate(false);
                return;
            }
            const response = await updateOrder(orderIdToUpdate, mappedOrder);
            if (response.data) {
                toast.custom(() => (
                    <Toast
                        title="Success!"
                        description={`Order ${orderIdToUpdate} updated successfully!`}
                        type="success"
                    />
                ));

                mutate('/checkedInGuests');
                mutate(
                    (key) =>
                        typeof key === 'string' && key.startsWith('/guests'),
                );
                mutate('/orders/query/all');
                mutate('/orders/query/running');
                mutate('/orders/query/settled');
                mutate('/orders/query/ready');

                setIsSheetOpen(false);
                setLoadingUpdate(false);
                router.back();
            } else {
                toast.custom(() => (
                    <Toast
                        title="Error"
                        description={`Failed to update order. Please try again.`}
                        type="error"
                    />
                ));
            }
        } catch (error: any) {
            console.error('Error:', error);
            toast.custom(() => (
                <Toast
                    title="Error"
                    description={`Failed to process payment. Please try again.`}
                    type="error"
                />
            ));
            setLoadingUpdate(false);
        } finally {
            setLoadingUpdate(false);
        }
    }, [
        order,
        totalWithVat,
        totalAmount,
        vatAmount,
        hasVatRate,
        vatRate,
        serviceChargeAmount,
        hasServiceChargeRate,
        serviceChargeRate,
        tipAmount,
        hasTipRate,
        includeTip,
        tipRate,
        clearOrder,
        handleGoBack,
        orderId,
        router,
    ]);

    const handlePrint = useCallback(() => handlePrintOrder(order), [order]);

    const isReady = categoryOptions.length > 0 && allMenuItems.length > 0;

    const loader = useMemo(() => <OrderSkeleton />, []);

    const MiniCategoryListMemo = useMemo(
        () => (
            <MiniCategoryList
                miniCategories={subCategoryOptions as MiniCategory[]}
                selectedSubCategory={selectedSubCategory}
                onSelect={handleSubCategoryChange}
            />
        ),
        [subCategoryOptions, selectedSubCategory, handleSubCategoryChange],
    );

    const OrderActionButtons = useMemo(
        () =>
            order.items.length > 0 ? (
                <div className="absolute bg-white bottom-0 inset-x-0 flex">
                    <div className="flex w-full border-t p-3 px-4">
                        <div className="ml-auto flex gap-2">
                            <SimplePrintButton
                                orderId={order.id ?? 0}
                                printType="kot"
                                newItemsOnly={true}
                            >
                                Print KOT
                            </SimplePrintButton>

                            <SimplePrintButton
                                orderId={order.id ?? 0}
                                printType="bot"
                                newItemsOnly={true}
                            >
                                Print BOT
                            </SimplePrintButton>

                            <Button
                                variant="outline"
                                size={'sm'}
                                onClick={handleGoBack}
                            >
                                <ArrowLeft size={18} />
                                Back
                            </Button>

                            <Button
                                disabled={loadingUpdate}
                                className="bg-orion-blue text-white shadow-none"
                                size={'sm'}
                                onClick={updateOrderItems}
                            >
                                {loadingUpdate ? (
                                    <LoaderCircle className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Save size={18} />
                                )}
                                {loadingUpdate ? 'updating' : 'Update Order'}
                            </Button>
                        </div>
                    </div>
                </div>
            ) : null,
        [
            order.items.length,
            order.id,
            handlePrint,
            loadingUpdate,
            updateOrderItems,
            handleGoBack,
        ],
    );

    return (
        <PageWrapper className="min-h-screen pb-24">
            <PageHeader>
                <div className="flex items-center">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleGoBack}
                        className="mr-2"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <PageHeadertitle
                        title={`Updating Order #${order.requestId}`}
                    />
                </div>
                <div className="ml-auto flex items-center">
                    <CustomSheet
                        title="View Cart"
                        open={isSheetOpen}
                        setOpen={setIsSheetOpen}
                        trigger={
                            <Button
                                size={'icon'}
                                className="ml-4 hover:bg-white relative hover:rexr-black xl:hidden bg-white rounded-full shadow-none border text-gray-400"
                            >
                                <ShoppingCart size={18} />
                                {order.items.length > 0 && (
                                    <Badge className="absolute rounded-full w-6 h-6 flex items-center justify-center -top-3 -right-2 bg-hexbrand">
                                        {order.items.length}
                                    </Badge>
                                )}
                            </Button>
                        }
                    >
                        {' '}
                        <ItemsTable
                            title="Items Ordered:"
                            columns={ItemOrderColumnsFunc(
                                originalItemIds,
                                originalItemQuantities,
                                canRemoveItems,
                            )}
                            items={mappedOrderItems}
                            totalValue={totalAmount}
                            showTotal
                            emptyMessage="Once you select any food it will show here"
                        />
                        {OrderActionButtons}
                    </CustomSheet>
                    <Button
                        size={'icon'}
                        className="ml-4 bg-white rounded-full border text-gray-400 hidden xl:flex"
                    >
                        <LuBell size={18} />
                    </Button>
                </div>
            </PageHeader>
            <div>
                <SearchInput
                    className="bg-white"
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    placeholder="Search menu items..."
                />
                {searchQuery.trim() && (
                    <div className="py-2 mt-2 text-sm text-gray-600">
                        {Array.isArray(filteredItems) &&
                            (filteredItems.length > 0
                                ? `Found ${filteredItems.length} item${filteredItems.length === 1 ? '' : 's'} matching "${searchQuery}"`
                                : `No items found matching "${searchQuery}"`)}
                    </div>
                )}
            </div>
            <div className="mb-20">
                {!menuCategoriesData?.data &&
                    allMenuItems.length === 0 &&
                    categoryOptions.length === 0 &&
                    subCategoryOptions.length === 0 &&
                    loader}
                {isReady && (
                    <Tabs
                        defaultValue={categoryOptions[0].value ?? ''}
                        value={selectedCategory}
                        onValueChange={setSelectedCategory}
                        className="w-full h-full md:h-[550px] 2xl:h-[1000px]"
                    >
                        <ScrollableTabs categoryOptions={categoryOptions} />
                        <TabsContent
                            className="h-full relative w-full rounded-lg shadow-none border bg-white mt-6"
                            value={selectedCategory}
                        >
                            <div className="h-full w-full flex gap-4 p-4">
                                <div
                                    className="flex flex-col gap-3 w-full
                             md:w-[650px] 2xl:w-[1240px]"
                                >
                                    {selectedCategory && (
                                        <>
                                            <div>
                                                {isLoadingSubcategories ? (
                                                    <div className="h-8 w-full animate-pulse bg-gray-200 rounded" />
                                                ) : (
                                                    MiniCategoryListMemo
                                                )}
                                            </div>
                                            {selectedSubCategory !== '' && (
                                                <hr className="my-2" />
                                            )}
                                        </>
                                    )}
                                    <ScrollArea className="h-[calc(100vh-200px)] mb-10">
                                        <MenuItemGrid
                                            items={
                                                Array.isArray(filteredItems)
                                                    ? filteredItems
                                                    : filteredItems || []
                                            }
                                            addItem={addItem}
                                            handleQuantityChange={
                                                handleQuantityChange
                                            }
                                            order={order}
                                        />
                                    </ScrollArea>
                                </div>
                                <div className="flex-col gap-2 flex-1 hidden xl:flex">
                                    {isRestaurantOrder && hasTipRate && (
                                        <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg mb-2">
                                            <div className="space-y-1">
                                                <label className="text-sm font-medium text-gray-700">
                                                    Include Tip
                                                </label>
                                                <p className="text-xs text-gray-500">
                                                    {includeTip && tipAmount > 0
                                                        ? `Tip: ₦${tipAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                                                        : `Add ${tipRate.toFixed(2)}% tip to the order`}
                                                </p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setIncludeTip(!includeTip)
                                                }
                                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-orion-blue focus:ring-offset-2 ${
                                                    includeTip
                                                        ? 'bg-orion-blue'
                                                        : 'bg-gray-200'
                                                }`}
                                            >
                                                <span
                                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                                        includeTip
                                                            ? 'translate-x-6'
                                                            : 'translate-x-1'
                                                    }`}
                                                />
                                            </button>
                                        </div>
                                    )}
                                    <ScrollArea className="h-[calc(100vh-300px)]">
                                        <ItemsTable
                                            title="Items Ordered:"
                                            columns={ItemOrderColumnsFunc(
                                                originalItemIds,
                                                originalItemQuantities,
                                                canRemoveItems,
                                            )}
                                            items={mappedOrderItems}
                                            totalValue={totalWithVat}
                                            showTotal
                                            currencyPrefix="₦"
                                            breakdownRows={breakdownRows}
                                            emptyMessage="Once you select any food it will show here"
                                        />
                                    </ScrollArea>
                                    {OrderActionButtons}
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                )}
                <div className="flex items-center gap-2">{}</div>
            </div>
        </PageWrapper>
    );
};

export default MenuItemsPage;
