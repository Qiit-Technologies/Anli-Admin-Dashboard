'use client';

import { getPublicMenuItems } from '@/app/actions/menu-item';
import { ItemsTable } from '@/components/common/ItemsTable';
import PageWrapper from '@/components/common/PageWrapper';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { LoaderCircle, Send, ShoppingCart } from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import useSWR from 'swr';

import {
    getAllDineInAreasForPublic,
    getTablesByDineInArea,
} from '@/app/actions/back-of-house';
import {
    createGuestPaidOrder,
    createGuestPendingOrder,
} from '@/app/actions/order';
import { getRoomByHotelIdForPublic } from '@/app/actions/room';
import { CustomSheet } from '@/components/common/CustomSheet';
import { InputField, SelectField } from '@/components/common/Form';
import { PageHeader, PageHeadertitle } from '@/components/common/layout/Header';
import { ItemOrderColumns } from '@/components/common/table/column/ItemOrder';
import { MiniCategory } from '@/components/front-of-house/data/miniCategories';
import OrderSkeleton from '@/components/front-of-house/OrderSkeleton';
import { ScrollableTabs } from '@/components/front-of-house/ScrollTab';
import Toast from '@/components/toast';
import useHotel from '@/hooks/useHotel';
import { useSteps } from '@/hooks/useSteps';
import { Order } from '@/store/useOrder';
import { TableProps } from '@/types/back-of-house.type';
import { useParams, useRouter } from 'next/navigation';
import { MenuItemCard } from '../menu-item-card';
import OrderConfirmation from '../order-confirmation';

import { getCustomCharges } from '@/app/actions/hotel';

interface MenuItem {
    id: number;
    name: string;
    description: string;
    price: number;
    imageUrl: string | null;
    category: {
        id: number;
        name: string;
    } | null;
    subCategory: {
        id: number;
        name: string;
    } | null;
    isAvailable: boolean;
    isVisibleOnDigitalMenu?: boolean;
    hotel: any;
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
    const [isLoadingPayment, setIsLoadingPayment] = useState(false);
    const [includeTip, setIncludeTip] = useState(false);
    const [isLoadingSubcategories] = useState(false);
    const [specialInstructions, setSpecialInstructions] = useState<
        Record<number, string>
    >({});
    const { id: hotelId } = useParams();
    const { organization } = useHotel();

    const {
        data: menuItems,
        error,
        isLoading,
    } = useSWR(hotelId ? '/menu/item' : null, () =>
        getPublicMenuItems(hotelId as string),
    );

    const categoryOptions = useMemo(() => {
        if (!menuItems) return [];
        const categories = new Set<string>();
        menuItems?.data?.forEach((item: MenuItem) => {
            if (item.category?.name) {
                categories.add(item.category.name);
            }
        });
        return Array.from(categories).map((category) => ({
            value: category,
            label: category,
        }));
    }, [menuItems]);

    const subCategoryOptions = useMemo(() => {
        if (!menuItems || !selectedCategory) return [];
        const subCategories = new Set<string>();
        menuItems?.data.forEach((item: MenuItem) => {
            if (
                item.category?.name === selectedCategory &&
                item.subCategory?.name
            ) {
                subCategories.add(item.subCategory.name);
            }
        });
        return Array.from(subCategories).map((subCategory) => ({
            value: subCategory,
            label: subCategory,
        }));
    }, [menuItems, selectedCategory]);

    const filteredItems = useMemo(() => {
        if (!menuItems) return [];
        return menuItems?.data?.filter((item: MenuItem) => {
            const matchesCategory =
                !selectedCategory || item.category?.name === selectedCategory;
            const matchesSubCategory =
                !selectedSubCategory ||
                item.subCategory?.name === selectedSubCategory;
            const isVisible = item.isVisibleOnDigitalMenu !== false; // default to true
            return matchesCategory && matchesSubCategory && isVisible;
        });
    }, [menuItems, selectedCategory, selectedSubCategory]);

    const totalAmount = useMemo(() => {
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
        () => (totalAmount * resolvedVatRate) / 100,
        [totalAmount, resolvedVatRate],
    );

    const serviceChargeAmount = useMemo(
        () => (totalAmount * resolvedServiceChargeRate) / 100,
        [totalAmount, resolvedServiceChargeRate],
    );

    const tipAmount = useMemo(
        () => (includeTip ? (totalAmount * resolvedTipRate) / 100 : 0),
        [totalAmount, resolvedTipRate, includeTip],
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

    // Calculate custom charges
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
            subtotal: totalAmount.toFixed(2),
            vatAmount: vatAmount.toFixed(2),
            serviceChargeAmount: serviceChargeAmount.toFixed(2),
            tipAmount: tipAmount.toFixed(2),
            totalAmount: totalWithVat.toFixed(2),
            vatRate: resolvedVatRate,
            serviceChargeRate: resolvedServiceChargeRate,
            tipRate: includeTip ? resolvedTipRate : 0,
        }));
    }, [
        totalAmount,
        vatAmount,
        serviceChargeAmount,
        tipAmount,
        totalWithVat,
        resolvedVatRate,
        resolvedServiceChargeRate,
        resolvedTipRate,
        includeTip,
        setOrder,
    ]);

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
        [specialInstructions, setOrder],
    );

    const removeItem = useCallback(
        (itemId: number) => {
            setOrder((prev) => ({
                ...prev,
                items: prev.items.filter((item) => item.id !== itemId),
            }));
        },
        [setOrder],
    );

    const increaseItemQuantity = useCallback(
        (itemId: number) => {
            setOrder((prev) => ({
                ...prev,
                items: prev.items.map((i) =>
                    i.id === itemId ? { ...i, quantity: i.quantity + 1 } : i,
                ),
            }));
        },
        [setOrder],
    );

    const decreaseItemQuantity = useCallback(
        (itemId: number) => {
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
        },
        [setOrder],
    );

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
        [setOrder],
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
    }, [order, hotelId, onOrderComplete]);

    const handlePayment = useCallback(async () => {
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

        setIsLoadingPayment(true);
        try {
            const response = await createGuestPaidOrder(
                order,
                hotelId as string,
            );
            if (response.data) {
                window.location.href = response.data.paymentUrl;
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
            setIsLoadingPayment(false);
        }
    }, [order, hotelId]);

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
                <div className="absolute bg-white bottom-0 inset-x-0 flex">
                    <div className="flex w-full border-t p-3 px-4">
                        <div className="ml-auto flex gap-2">
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

                            <Button
                                disabled={isLoadingPayment}
                                onClick={handlePayment}
                                size={'sm'}
                                className="w-full px-4 text-white bg-orion-blue hover:bg-orion-blue/80"
                            >
                                {isLoadingPayment ? (
                                    <LoaderCircle className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Send size={18} />
                                )}
                                {isLoadingPayment
                                    ? 'Making Payment...'
                                    : 'Make Payment'}
                            </Button>
                        </div>
                    </div>
                </div>
            ) : null,
        [
            isLoadingSave,
            isLoadingPayment,
            handlePayment,
            handleSaveOrder,
            order,
        ],
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
                        {isRestaurantOrder && resolvedTipRate > 0 && (
                            <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg mb-4">
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700">
                                        Include Tip
                                    </label>
                                    <p className="text-xs text-gray-500">
                                        Add {resolvedTipRate.toFixed(2)}% tip to
                                        the order
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setIncludeTip(!includeTip)}
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
                        <ItemsTable
                            title="Items Ordered:"
                            columns={ItemOrderColumns}
                            items={order.items}
                            totalValue={totalWithVat}
                            showTotal
                            emptyMessage="Once you select any food it will show here"
                            subtotalValue={totalAmount}
                            vatRate={resolvedVatRate}
                            vatValue={vatAmount}
                            breakdownRows={[
                                ...(resolvedServiceChargeRate > 0
                                    ? [
                                          {
                                              label: `Service Charge (${resolvedServiceChargeRate.toFixed(2)}%)`,
                                              value: serviceChargeAmount,
                                          },
                                      ]
                                    : []),
                                ...(isRestaurantOrder &&
                                resolvedTipRate > 0 &&
                                includeTip
                                    ? [
                                          {
                                              label: `Tip (${resolvedTipRate.toFixed(2)}%)`,
                                              value: tipAmount,
                                          },
                                      ]
                                    : []),
                                ...(customChargesData &&
                                customChargesData.length > 0
                                    ? customChargesData
                                          .map((charge: any) => {
                                              const rate = Math.min(
                                                  Math.max(
                                                      Number(charge.rate ?? 0),
                                                      0,
                                                  ),
                                                  100,
                                              );
                                              const amount =
                                                  (totalAmount * rate) / 100;
                                              if (amount <= 0) return null;
                                              return {
                                                  label: `${charge.name} (${rate.toFixed(2)}%)`,
                                                  value: amount,
                                              };
                                          })
                                          .filter(Boolean)
                                    : []),
                            ]}
                        />
                        <div className="flex-col mt-6 gap-2 flex-1 flex lg:hidden">
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
                                        <div className="grid grid-cols-1 sm:grid-cols-2 mb-14 lg:grid-cols-3 gap-4 p-2">
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
                            <div className="flex-col gap-2 flex-1 hidden md:flex">
                                {isRestaurantOrder && resolvedTipRate > 0 && (
                                    <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg mb-4">
                                        <div className="space-y-1">
                                            <label className="text-sm font-medium text-gray-700">
                                                Include Tip
                                            </label>
                                            <p className="text-xs text-gray-500">
                                                Add {resolvedTipRate.toFixed(2)}
                                                % tip to the order
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
}
const QrOrderStepOne = ({
    order,
    setOrder,
    back,
    onSubmit,
    currentStepIndex,
}: QrStepOneProps) => {
    const { id: hotelId } = useParams();
    const [selectedDineInArea, setSelectedDineInArea] = useState('');
    const [tables, setTables] = useState<TableProps[]>([]);
    const { organization } = useHotel();
    const { data: dineInAreas } = useSWR(
        hotelId ? `/restaurants/${hotelId}/dine-in-areas-for-public` : null,
        () => getAllDineInAreasForPublic(hotelId as string),
    );

    const { data: rooms } = useSWR(
        hotelId ? `/rooms${Number(hotelId)}/public-rooms` : null,
        () => getRoomByHotelIdForPublic(hotelId as string),
    );

    const { data: menuItems } = useSWR(hotelId ? '/menu/item' : null, () =>
        getPublicMenuItems(hotelId as string),
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
        switch (order.orderType) {
            case 'DINE_IN':
                return (
                    <>
                        <SelectField
                            id="dineInArea"
                            label="Dine In Area"
                            name="dineInArea"
                            value={order?.dineInArea?.id?.toString() ?? ''}
                            onValueChange={(value) => {
                                const selectedArea = dineInAreas?.data.find(
                                    (area: any) =>
                                        area?.id?.toString() === value,
                                );
                                setOrder({
                                    ...order,
                                    dineInArea: {
                                        id: Number(value),
                                        name: selectedArea?.name ?? '',
                                    },
                                });
                                setSelectedDineInArea(value);
                            }}
                            placeholder="Select dine in area"
                            options={
                                dineInAreas?.data?.map((area: any) => ({
                                    label: area?.name,
                                    value: area?.id.toString(),
                                })) ?? []
                            }
                        />
                        {selectedDineInArea && (
                            <SelectField
                                id="table"
                                label="Table Number"
                                name="table"
                                value={order?.table?.id?.toString() ?? ''}
                                onValueChange={(value) => {
                                    const selectedTable = tables?.find(
                                        (table: any) =>
                                            table?.id === Number(value),
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
            case 'TAKE_AWAY':
                return (
                    <>
                        <InputField
                            id="address"
                            label="Address"
                            name="address"
                            value={order?.address ?? ''}
                            onChange={(e) =>
                                setOrder({
                                    ...order,
                                    address: e.target.value ?? '',
                                })
                            }
                            placeholder="Enter address"
                        />
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
                            placeholder="Enter phone number" // Corrected: closing quote added
                        />
                    </>
                );
            case 'DELIVERY':
                return (
                    <>
                        <InputField
                            id="address"
                            label="Address"
                            name="address"
                            value={order?.address ?? ''}
                            onChange={(e) =>
                                setOrder({
                                    ...order,
                                    address: e.target.value ?? '',
                                })
                            }
                            placeholder="Enter address"
                        />
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
                            value={order.guestEmail ?? ''}
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
                            value={order.phoneNumber ?? ''}
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
            case 'ROOM':
                return (
                    <>
                        <SelectField
                            id="roomNumber"
                            label="Room Number"
                            name="roomNumber"
                            value={order?.room?.id?.toString() ?? ''}
                            onValueChange={(value) => {
                                const selectedRoom = rooms?.data?.find(
                                    (room: any) =>
                                        room?.id?.toString() === value,
                                );
                                setOrder({
                                    ...order,
                                    room: {
                                        id: Number(value),
                                        roomNumber:
                                            selectedRoom?.roomNumber ?? '',
                                    },
                                });
                            }}
                            placeholder="Select room number"
                            options={
                                rooms?.data?.map((room: any) => ({
                                    label: `${room?.roomtype?.name}-${room?.roomNumber}`,
                                    value: room?.id?.toString(),
                                })) ?? []
                            }
                        />
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
                            value={order.guestEmail ?? ''}
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
                            value={order.phoneNumber ?? ''}
                            onChange={(e) =>
                                setOrder({
                                    ...order,
                                    phoneNumber: e.target.value ?? '',
                                })
                            }
                            placeholder="Enter phone number" // Corrected: closing quote added
                        />
                    </>
                );
            default:
                return null;
        }
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
                            <div className="space-y-4">
                                <SelectField
                                    id="orderType"
                                    label="Order Type"
                                    name="orderType"
                                    value={order.orderType ?? ''}
                                    onValueChange={(value) =>
                                        setOrder({
                                            ...order,
                                            orderType:
                                                value as Order['orderType'],
                                        })
                                    }
                                    options={[
                                        {
                                            label: 'Dine In',
                                            value: 'DINE_IN',
                                        },
                                        {
                                            label: 'Take Away',
                                            value: 'TAKE_AWAY',
                                        },
                                        {
                                            label: 'Delivery',
                                            value: 'DELIVERY',
                                        },
                                        {
                                            label: 'Room Service',
                                            value: 'ROOM',
                                        },
                                    ]}
                                />
                                {renderForm()}
                            </div>

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
    const router = useRouter();
    const { id } = useParams();

    useEffect(() => {
        if (id && id !== 'dine') {
            router.replace(`/custom-menu/${id}`);
        }
    }, [id, router]);
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
    });

    const onSubmit = () => {
        next();
    };

    const steps = [
        {
            label: 'Select Order type',
            component: (
                <QrOrderStepOne
                    currentStepIndex={currentStepIndex}
                    order={formData}
                    setOrder={setFormData}
                    onSubmit={onSubmit}
                    back={back}
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

    if (id) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <p className="text-gray-500">Redirecting to menu…</p>
            </div>
        );
    }
    if (id) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <p className="text-gray-500">Redirecting to menu…</p>
            </div>
        );
    }

    return <>{steps[currentStepIndex].component}</>;
};

export default MenuPage;
