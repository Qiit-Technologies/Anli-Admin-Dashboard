'use client';

import { getPublicMenuDineItems } from '@/app/actions/menu-item';
import { ItemsTable } from '@/components/common/ItemsTable';
import PageWrapper from '@/components/common/PageWrapper';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { LoaderCircle, Send, ShoppingCart } from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import useSWR from 'swr';

import { createGuestPendingOrder } from '@/app/actions/order';
import { CustomSheet } from '@/components/common/CustomSheet';
import { InputField, SelectField } from '@/components/common/Form';
import { ItemOrderColumns } from '@/components/common/table/column/ItemOrder';
import { MiniCategory } from '@/components/front-of-house/data/miniCategories';
import OrderSkeleton from '@/components/front-of-house/OrderSkeleton';
import { ScrollableTabs } from '@/components/front-of-house/ScrollTab';
import Toast from '@/components/toast';
import { useSteps } from '@/hooks/useSteps';
import { Order } from '@/store/useOrder';
import { useSearchParams } from 'next/navigation';
import { MenuItemCard } from '../menu-item-card';
import OrderConfirmation from '../order-confirmation';
import {
    getAllDineInAreasForPublic,
    getTablesByDineInArea,
} from '@/app/actions/back-of-house';
import { TableProps } from '@/types/back-of-house.type';
import { PageHeader, PageHeadertitle } from '@/components/common/layout/Header';
import { fetchHotelByExternalId, getCustomCharges } from '@/app/actions/hotel';
import { OrganizationDetail } from '@/hooks/useHotel';

interface MenuItem {
    id: number;
    name: string;
    description: string;
    price: number;
    imageUrl: string | null;
    category?: {
        id: number;
        name: string;
    } | null;
    subCategory?: {
        id: number;
        name: string;
    } | null;
    isAvailable: boolean;
    isVisibleOnDigitalMenu?: boolean;
    hotel?: any;
}

interface Category {
    id: number;
    name: string;
    description: string;
    category: string;
    items: MenuItem[];
    subCategories: any[];
}

interface MenuData {
    id: number;
    name: string;
    description: string;
    categories: Category[];
}

const MiniCategoryList = ({
    miniCategories,
    selectedSubCategory,
    onSelect,
}: {
    miniCategories: MiniCategory[];
    selectedSubCategory: string;
    onSelect: (value: string) => void;
}) => {
    return (
        <div className="flex flex-wrap gap-2">
            {miniCategories.map((category) => (
                <button
                    key={category.value}
                    onClick={() => onSelect(category.value)}
                    className={`
                        px-4 py-2 rounded-full shadow-none text-sm font-medium
                        transition-all duration-200 ease-in-out
                        flex items-center gap-2
                        ${
                            selectedSubCategory === category.value
                                ? 'bg-hexbrand text-white shadow-md'
                                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                        }
                    `}
                >
                    {category.label}
                </button>
            ))}
        </div>
    );
};

interface MainMenuProps {
    order: Order;
    setOrder: (value: React.SetStateAction<Order>) => void;
    onOrderComplete?: () => void;
}
const MainMenu = ({ order, setOrder, onOrderComplete }: MainMenuProps) => {
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [selectedSubCategory, setSelectedSubCategory] = useState<string>('');
    const [isLoadingSave, setIsLoadingSave] = useState(false);

    const [isLoadingSubcategories] = useState(false);
    const [includeTip, setIncludeTip] = useState(false);
    const [specialInstructions, setSpecialInstructions] = useState<
        Record<number, string>
    >({});
    const searchParams = useSearchParams();
    const currencyFormatter = useMemo(
        () =>
            new Intl.NumberFormat('en-NG', {
                style: 'currency',
                currency: 'NGN',
                maximumFractionDigits: 2,
            }),
        [],
    );
    const formatCurrency = useCallback(
        (value: number) => currencyFormatter.format(value ?? 0),
        [currencyFormatter],
    );

    const hotelId = searchParams.get('hotel');
    const dineId = searchParams.get('dine');

    const { data: organization } = useSWR(
        hotelId ? ['public-hotel', hotelId] : null,
        async () => {
            const res = await fetchHotelByExternalId(hotelId as string);
            return res.data as OrganizationDetail;
        },
    );

    const {
        data: menuItems,
        error,
        isLoading,
    } = useSWR(dineId ? '/restaurants/item' : null, () =>
        getPublicMenuDineItems(dineId as string),
    );
    console.log(menuItems);
    const categoryOptions = useMemo(() => {
        const menu = menuItems?.data?.[0] as MenuData | undefined;
        if (!menu?.categories) return [];
        return menu.categories.map((cat) => ({
            value: cat.name,
            label: cat.name,
        }));
    }, [menuItems]);

    const subCategoryOptions = useMemo(() => {
        const menu = menuItems?.data?.[0] as MenuData | undefined;
        if (!menu?.categories || !selectedCategory) return [];
        const category = menu.categories.find(
            (cat) => cat.name === selectedCategory,
        );
        if (!category?.subCategories) return [];
        return category.subCategories.map((sub: any) => ({
            value: sub.name,
            label: sub.name,
        }));
    }, [menuItems, selectedCategory]);

    const filteredItems = useMemo(() => {
        const menu = menuItems?.data?.[0] as MenuData | undefined;
        if (!menu?.categories || !selectedCategory) return [];
        const category = menu.categories.find(
            (cat) => cat.name === selectedCategory,
        );
        if (!category) return [];

        // Collect items from category directly AND from all subcategories!
        let items: MenuItem[] = [...(category.items || [])];
        if (category.subCategories && category.subCategories.length > 0) {
            category.subCategories.forEach((subCat) => {
                items = items.concat(subCat.items || []);
            });
        }

        // Ensure item has category name for visual identification (Martini vs Utensils)
        items = items.map((item) => ({
            ...item,
            category: { id: 0, name: category.category || 'Food' },
        }));

        if (selectedSubCategory) {
            items = items.filter(
                (item) => item.subCategory?.name === selectedSubCategory,
            );
        }
        // Only show visible items
        return items.filter((item) => item.isVisibleOnDigitalMenu !== false);
    }, [menuItems, selectedCategory, selectedSubCategory]);

    const itemsSubtotal = useMemo(() => {
        return order.items.reduce(
            (acc, item) => acc + (item.price ?? 0) * item.quantity,
            0,
        );
    }, [order.items]);
    const resolvedVatRate = useMemo(() => {
        if (organization?.restaurantVatRate !== undefined) {
            return Number(
                organization.restaurantVatRate ?? organization.vatRate ?? 0,
            );
        }
        const hotel = menuItems?.data?.[0]?.hotel;
        return Number(hotel?.restaurantVatRate ?? hotel?.vatRate ?? 0);
    }, [organization?.restaurantVatRate, organization?.vatRate, menuItems]);

    const resolvedServiceChargeRate = useMemo(() => {
        if (organization?.restaurantServiceChargeRate !== undefined) {
            return Number(
                organization.restaurantServiceChargeRate ??
                    organization.serviceChargeRate ??
                    0,
            );
        }
        const hotel = menuItems?.data?.[0]?.hotel;
        return Number(
            hotel?.restaurantServiceChargeRate ?? hotel?.serviceChargeRate ?? 0,
        );
    }, [
        organization?.restaurantServiceChargeRate,
        organization?.serviceChargeRate,
        menuItems,
    ]);

    const resolvedTipRate = useMemo(() => {
        if (organization?.restaurantTipRate !== undefined) {
            return Number(
                organization.restaurantTipRate ?? organization.tipRate ?? 0,
            );
        }
        const hotel = menuItems?.data?.[0]?.hotel;
        return Number(hotel?.restaurantTipRate ?? hotel?.tipRate ?? 0);
    }, [organization?.restaurantTipRate, organization?.tipRate, menuItems]);

    const vatAmount = useMemo(
        () => (itemsSubtotal * resolvedVatRate) / 100,
        [itemsSubtotal, resolvedVatRate],
    );

    const serviceChargeAmount = useMemo(
        () => (itemsSubtotal * resolvedServiceChargeRate) / 100,
        [itemsSubtotal, resolvedServiceChargeRate],
    );

    const tipAmount = useMemo(
        () => (includeTip ? (itemsSubtotal * resolvedTipRate) / 100 : 0),
        [itemsSubtotal, resolvedTipRate, includeTip],
    );

    const totalWithVat = useMemo(
        () => itemsSubtotal + vatAmount + serviceChargeAmount + tipAmount,
        [itemsSubtotal, vatAmount, serviceChargeAmount, tipAmount],
    );

    // Fetch custom charges
    const { data: customChargesData } = useSWR(
        'custom-charges-menu',
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

    const isRestaurantOrder = useMemo(() => {
        return (
            order.orderType === 'DINE_IN' ||
            order.orderType === 'TAKE_AWAY' ||
            order.orderType === 'DELIVERY'
        );
    }, [order.orderType]);

    useEffect(() => {
        if (categoryOptions.length > 0 && !selectedCategory) {
            setSelectedCategory(categoryOptions[0].value);
        }
    }, [categoryOptions, selectedCategory]);

    useEffect(() => {
        setOrder((prev) => ({
            ...prev,
            subtotal: itemsSubtotal.toFixed(2),
            vatAmount: vatAmount.toFixed(2),
            totalAmount: totalWithVat.toFixed(2),
            vatRate: resolvedVatRate,
        }));
    }, [itemsSubtotal, vatAmount, totalWithVat, resolvedVatRate]);

    const handleSubCategoryChange = useCallback((subCategory: string) => {
        setSelectedSubCategory(subCategory);
    }, []);

    const addItem = useCallback(
        (item: MenuItem) => {
            setOrder((prev) => {
                const existingItem = prev.items.find((i) => i.id === item.id);
                if (existingItem) {
                    return {
                        ...prev,
                        items: prev.items.map((i) =>
                            i.id === item.id
                                ? { ...i, quantity: i.quantity + 1 }
                                : i,
                        ),
                    };
                }
                return {
                    ...prev,
                    items: [
                        ...prev.items,
                        {
                            id: item.id,
                            name: item.name,
                            price: item.price,
                            quantity: 1,
                            specialInstructions:
                                specialInstructions[item.id] || '',
                        },
                    ],
                };
            });
        },
        [specialInstructions],
    );

    const removeItem = useCallback((itemId: number) => {
        setOrder((prev) => ({
            ...prev,
            items: prev.items.filter((item) => item.id !== itemId),
        }));
    }, []);

    const increaseItemQuantity = useCallback((itemId: number) => {
        setOrder((prev) => ({
            ...prev,
            items: prev.items.map((i) =>
                i.id === itemId ? { ...i, quantity: i.quantity + 1 } : i,
            ),
        }));
    }, []);

    const decreaseItemQuantity = useCallback((itemId: number) => {
        setOrder((prev) => ({
            ...prev,
            items: prev.items
                .map((i) =>
                    i.id === itemId && i.quantity > 1
                        ? { ...i, quantity: i.quantity - 1 }
                        : i,
                )
                .filter((i) => i.quantity > 0),
        }));
    }, []);

    const updateSpecialInstructions = useCallback(
        (itemId: number, instructions: string) => {
            setSpecialInstructions((prev) => ({
                ...prev,
                [itemId]: instructions,
            }));
            setOrder((prev) => ({
                ...prev,
                items: prev.items.map((item) =>
                    item.id === itemId
                        ? { ...item, specialInstructions: instructions }
                        : item,
                ),
            }));
        },
        [],
    );

    const handleSaveOrder = useCallback(async () => {
        if (order.items.length === 0) {
            toast.custom(() => (
                <Toast
                    title="Error"
                    description="Please add items to the order"
                    type="error"
                />
            ));
            return;
        }

        setIsLoadingSave(true);
        const remappedOrder = {
            ...order,
            items: order.items.map((item) => ({
                menuItemId: item.id,
                quantity: item.quantity,
                notes: item.specialInstructions,
            })),
        };
        try {
            const response = await createGuestPendingOrder(
                remappedOrder,
                hotelId as string,
            );
            if (response.data) {
                toast.custom(() => (
                    <Toast
                        title="Success!"
                        description={`Order saved successfully!`}
                        type="success"
                    />
                ));
                onOrderComplete?.();
            } else {
                toast.custom(() => (
                    <Toast
                        title="Error"
                        description={`Failed to save order. Please try again.`}
                        type="error"
                    />
                ));
            }
        } catch (error: any) {
            console.error('Error saving order:', error);
            toast.custom(() => (
                <Toast
                    title="Error!"
                    description="Failed to save order"
                    type="error"
                />
            ));
        } finally {
            setIsLoadingSave(false);
        }
    }, [order]);

    const isReady = categoryOptions.length > 0 && menuItems?.data.length > 0;

    const MiniCategoryListMemo = useMemo(
        () => (
            <MiniCategoryList
                miniCategories={subCategoryOptions ?? []}
                selectedSubCategory={selectedSubCategory}
                onSelect={handleSubCategoryChange}
            />
        ),
        [subCategoryOptions, selectedSubCategory, handleSubCategoryChange],
    );
    const OrderActionButtons = useMemo(
        () =>
            order.items.length > 0 ? (
                <div className="w-full bg-white border-t p-3 px-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                    <div className="flex w-full flex-col gap-4 md:flex-row md:items-center justify-end">
                        <div className="ml-auto flex w-full gap-2 md:w-auto">
                            <Button
                                disabled={isLoadingSave}
                                size={'sm'}
                                onClick={handleSaveOrder}
                                className="bg-hexbrand w-full hover:bg-hexbrand text-white shadow-none"
                            >
                                {isLoadingSave ? (
                                    <LoaderCircle className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Send size={18} />
                                )}
                                {isLoadingSave
                                    ? 'Placing Order...'
                                    : 'Place Order'}
                            </Button>
                        </div>
                    </div>
                </div>
            ) : null,
        [isLoadingSave, handleSaveOrder, order.items.length],
    );

    if (isLoading) {
        return (
            <div className="w-full h-full mt-10 flex items-center justify-center">
                <OrderSkeleton />
            </div>
        );
    }
    if (error)
        return <div className="text-center mt-10">Failed to load menu</div>;

    if (!menuItems?.data || menuItems?.data.length === 0) {
        return <p>No menu items available.</p>;
    }
    return (
        <div className="p-4 md:p-6 flex flex-col gap-4">
            <PageHeader>
                <div className="flex items-center space-x-4">
                    {/* Hotel Logo/Cover Image */}
                    {organization?.coverImage ? (
                        <div className="w-12 h-12 rounded-lg overflow-hidden shadow-md">
                            <img
                                src={organization.coverImage}
                                alt={`${organization.name} logo`}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    ) : (
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
                            <span className="text-xl font-bold text-white">
                                {organization?.name?.charAt(0) || 'H'}
                            </span>
                        </div>
                    )}
                    <PageHeadertitle
                        title={`${organization?.name || menuItems?.data?.[0]?.hotel?.name || 'Restaurant'} Menu`}
                    />
                </div>
                <div className="ml-auto flex items-center">
                    <CustomSheet
                        title="Order"
                        trigger={
                            <Button
                                size={'icon'}
                                className="bg-white relative shadow-none rounded-full border text-gray-400 hover:bg-white"
                            >
                                <ShoppingCart size={20} />
                                {order.items.length > 0 && (
                                    <span className="absolute -top-3 -right-2 flex items-center justify-center text-xs text-white w-6 h-6 rounded-full bg-red-500">
                                        {order.items.length}
                                    </span>
                                )}
                            </Button>
                        }
                    >
                        <ItemsTable
                            title="Items Ordered:"
                            columns={ItemOrderColumns}
                            items={order.items}
                            totalValue={totalWithVat}
                            showTotal
                            currencyPrefix="₦"
                            breakdownRows={[
                                { label: 'Subtotal', value: itemsSubtotal },
                                {
                                    label: `VAT (${resolvedVatRate.toFixed(2)}%)`,
                                    value: vatAmount,
                                },
                            ]}
                            emptyMessage="Once you select any food it will show here"
                        />
                        <div className="flex-col mt-6 gap-2 flex-1 flex lg:hidden sticky bottom-0 bg-white z-50 -mx-6 px-6 pb-6 pt-2">
                            {OrderActionButtons}
                        </div>
                    </CustomSheet>
                </div>
            </PageHeader>
            <div>
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
                                <div className="flex flex-col gap-3 w-full">
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
                                    <ScrollArea className="h-[calc(100vh-200px)]">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 mb-28 lg:grid-cols-3 gap-4 p-2 pb-8">
                                            {filteredItems.map(
                                                (item: MenuItem) => (
                                                    <MenuItemCard
                                                        key={item.id}
                                                        item={item}
                                                        orderItems={order.items}
                                                        onAdd={() =>
                                                            addItem(item)
                                                        }
                                                        onRemove={() =>
                                                            removeItem(item.id)
                                                        }
                                                        onIncrease={() =>
                                                            increaseItemQuantity(
                                                                item.id,
                                                            )
                                                        }
                                                        onDecrease={() =>
                                                            decreaseItemQuantity(
                                                                item.id,
                                                            )
                                                        }
                                                        onSpecialInstructionsChange={(
                                                            instructions,
                                                        ) =>
                                                            updateSpecialInstructions(
                                                                item.id,
                                                                instructions,
                                                            )
                                                        }
                                                    />
                                                ),
                                            )}
                                        </div>
                                    </ScrollArea>
                                </div>
                            </div>
                            <div className="fixed bottom-0 left-0 right-0 z-50 hidden md:block">
                                {OrderActionButtons}
                            </div>
                        </TabsContent>
                    </Tabs>
                )}
            </div>
        </div>
    );
};

interface QrStepOneProps {
    order: Partial<Order>;
    setOrder: (order: Partial<Order>) => void;
    onSubmit: () => void;
    back: () => void;
    currentStepIndex: number;
    selectedDineInArea?: string;
    dineName?: string;
}
const QrOrderStepOne = ({
    order,
    setOrder,
    back,
    onSubmit,
    currentStepIndex,
    selectedDineInArea,
    dineName,
}: QrStepOneProps) => {
    const searchParams = useSearchParams();
    const hotelId = searchParams.get('hotel');
    const dineId = searchParams.get('dine');

    const [tables, setTables] = useState<TableProps[]>([]);
    const { data: organization } = useSWR(
        hotelId ? ['public-hotel', hotelId] : null,
        async () => {
            const res = await fetchHotelByExternalId(hotelId as string);
            return res.data as OrganizationDetail;
        },
    );

    const { data: menuItems } = useSWR(
        dineId ? '/restaurants/item' : null,
        () => getPublicMenuDineItems(dineId as string),
    );

    useEffect(() => {
        const fetchTables = async () => {
            if (!selectedDineInArea || isNaN(Number(selectedDineInArea)))
                return;

            try {
                const response = await getTablesByDineInArea(
                    Number(selectedDineInArea),
                );
                setTables(response?.data ?? []);
            } catch (error: any) {
                console.error('Failed to fetch tables:', error);
                setTables([]);
            }
        };

        fetchTables();
    }, [selectedDineInArea]);

    const renderForm = () => {
        return (
            <>
                {selectedDineInArea && (
                    <SelectField
                        id="table"
                        label="Table Number"
                        name="table"
                        value={order?.table?.id?.toString() ?? ''}
                        onValueChange={(value) => {
                            const selectedTable = tables?.find(
                                (table: any) => table?.id === Number(value),
                            );
                            setOrder({
                                ...order,
                                table: {
                                    id: Number(value),
                                    number: selectedTable?.number ?? 0,
                                },
                            });
                        }}
                        placeholder="Select table number"
                        options={
                            tables?.map((table) => ({
                                label: `Table ${table?.number}`,
                                value: String(table?.id),
                            })) ?? []
                        }
                    />
                )}
                <InputField
                    id="guestName"
                    label="Guest Name"
                    name="guestName"
                    value={order?.guestName ?? ''}
                    onChange={(e) =>
                        setOrder({
                            ...order,
                            guestName: e.target.value ?? '',
                        })
                    }
                    placeholder="Enter guest name"
                />

                <InputField
                    id="email"
                    label="email"
                    name="email"
                    value={order?.guestEmail ?? ''}
                    onChange={(e) =>
                        setOrder({
                            ...order,
                            guestEmail: e.target.value ?? '',
                        })
                    }
                    placeholder="Enter email"
                />
                <InputField
                    id="phone"
                    label="phone"
                    name="phone"
                    value={order?.phoneNumber ?? ''}
                    onChange={(e) =>
                        setOrder({
                            ...order,
                            phoneNumber: e.target.value ?? '',
                        })
                    }
                    placeholder="Enter phone number"
                />
            </>
        );
    };
    return (
        <PageWrapper className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            <div className="w-full max-w-md mx-4">
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    {/* Header with Hotel Logo and Name */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-8 text-center">
                        <div className="flex flex-col items-center space-y-4">
                            {/* Hotel Logo/Cover Image */}
                            {organization?.coverImage ? (
                                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg overflow-hidden">
                                    <img
                                        src={organization.coverImage}
                                        alt={`${organization.name} logo`}
                                        className="w-full h-full object-cover rounded-full"
                                    />
                                </div>
                            ) : (
                                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg">
                                    <span className="text-2xl font-bold">
                                        {organization?.name?.charAt(0) ||
                                            menuItems?.data?.[0]?.hotel?.name?.charAt(
                                                0,
                                            ) ||
                                            'H'}
                                    </span>
                                </div>
                            )}
                            <div>
                                <h1 className="text-2xl font-bold">
                                    {organization?.name ||
                                        menuItems?.data?.[0]?.hotel?.name ||
                                        'Restaurant'}
                                </h1>
                            </div>

                            <div>
                                <h1 className="text-xl font-bold">
                                    {dineName}
                                </h1>
                            </div>
                        </div>
                    </div>

                    {/* Form Content */}
                    <div className="px-6">
                        <div className="text-center mb-6">
                            <h2 className="text-xl font-semibold text-gray-800 mb-2">
                                Guest Information
                            </h2>
                            <p className="text-gray-600 text-sm">
                                Please provide your details to continue
                            </p>
                        </div>

                        <form className="space-y-6">
                            <div className="space-y-4">{renderForm()}</div>

                            <div className="flex flex-col gap-4 mt-4 pb-6">
                                {currentStepIndex !== 0 && (
                                    <Button
                                        variant={'outline'}
                                        className="border-orion-blue h-12 text-orion-blue"
                                        onClick={back}
                                    >
                                        Back
                                    </Button>
                                )}
                                <Button
                                    disabled={
                                        !order.orderType ||
                                        !order.guestEmail ||
                                        !order.guestName ||
                                        !order.phoneNumber
                                    }
                                    className="bg-orion-blue h-12 text-white"
                                    onClick={onSubmit}
                                >
                                    Next
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </PageWrapper>
    );
};

const MenuPage = () => {
    const searchParams = useSearchParams();

    const hotelId = searchParams.get('hotel');
    const dineId = searchParams.get('dine');

    const { data: dineInAreas } = useSWR(
        hotelId ? `/restaurants/${hotelId}/dine-in-areas-for-public` : null,
        () => getAllDineInAreasForPublic(hotelId as string),
    );
    const selectedArea = dineInAreas?.data?.find(
        (area: any) => area?.id?.toString() === dineId,
    );

    const { currentStepIndex, next, back } = useSteps();
    const [formData, setFormData] = useState<Partial<Order>>({
        requestId: 0,
        guestName: '',
        phoneNumber: '',
        guestEmail: '',
        address: '',
        orderType: 'DINE_IN',
        items: [],
        room: {
            id: 0,
            roomNumber: '',
        },
        totalAmount: '0',
        waiter: null,
        table: null,
        paymentMethod: '',
        recievingAccount: '',
        remark: '',
        timeExpected: null,
        dineInArea: {
            id: Number(dineId),
            name: selectedArea?.name ?? '',
        },
    });

    useEffect(() => {
        if (selectedArea?.kitchen?.id) {
            setFormData({
                ...formData,
                kitchen: selectedArea?.kitchen?.id,
            });
        }
    }, [selectedArea]);

    const onSubmit = () => {
        next();
    };

    const steps = [
        {
            label: 'Select Order type',
            component: (
                <QrOrderStepOne
                    selectedDineInArea={dineId?.toString()}
                    currentStepIndex={currentStepIndex}
                    order={formData}
                    setOrder={setFormData}
                    onSubmit={onSubmit}
                    back={back}
                    dineName={selectedArea?.name || ''}
                />
            ),
        },
        {
            label: 'Select Items',
            component: (
                <MainMenu
                    onOrderComplete={() => next()}
                    order={formData as Order}
                    setOrder={
                        setFormData as (
                            value: React.SetStateAction<Order>,
                        ) => void
                    }
                />
            ),
        },
        {
            label: 'Order Confirmation',
            component: <OrderConfirmation order={formData} />,
        },
    ];

    return <>{steps[currentStepIndex].component}</>;
};

export default MenuPage;
