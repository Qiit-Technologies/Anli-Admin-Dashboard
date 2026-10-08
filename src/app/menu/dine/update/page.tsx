'use client';

import { getPublicMenuItems } from '@/app/actions/menu-item';
import { ItemsTable } from '@/components/common/ItemsTable';
import { PageHeader, PageHeadertitle } from '@/components/common/layout/Header';
import PageWrapper from '@/components/common/PageWrapper';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { LoaderCircle, Send, ShoppingCart } from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import useSWR from 'swr';

import {
    createGuestPaidOrder,
    getOrderById,
    updatePublicOrder,
} from '@/app/actions/order';
import { CustomSheet } from '@/components/common/CustomSheet';
import { InputField, SelectField } from '@/components/common/Form';
import { ItemOrderColumns } from '@/components/common/table/column/ItemOrder';
import { MiniCategory } from '@/components/front-of-house/data/miniCategories';
import OrderSkeleton from '@/components/front-of-house/OrderSkeleton';
import { ScrollableTabs } from '@/components/front-of-house/ScrollTab';
import Toast from '@/components/toast';
import { useSteps } from '@/hooks/useSteps';
import { Order } from '@/store/useOrder';
import { useParams, useSearchParams } from 'next/navigation';
import { MenuItemCard } from '../../menu-item-card';
import OrderConfirmation from '../../order-confirmation';
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
    orderId: string;
    order: Order;
    setOrder: (value: React.SetStateAction<Order>) => void;
    hotelId: string;
    onOrderComplete: () => void;
}
const UpdateMenu = ({
    orderId,
    order,
    setOrder,
    hotelId,
    onOrderComplete,
}: MainMenuProps) => {
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [selectedSubCategory, setSelectedSubCategory] = useState<string>('');
    const [isLoadingSave, setIsLoadingSave] = useState(false);
    const [isLoadingPayment, setIsLoadingPayment] = useState(false);
    const [isLoadingSubcategories] = useState(false);
    const [specialInstructions, setSpecialInstructions] = useState<
        Record<number, string>
    >({});

    const {
        data: menuItems,
        error,
        isLoading,
    } = useSWR('/menu/item', () => getPublicMenuItems(hotelId as string));
    const categoryOptions = useMemo(() => {
        if (!menuItems) return [];
        const categories = new Set<string>();
        menuItems?.data.forEach((item: MenuItem) => {
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
        return menuItems?.data.filter((item: MenuItem) => {
            const matchesCategory =
                !selectedCategory || item.category?.name === selectedCategory;
            const matchesSubCategory =
                !selectedSubCategory ||
                item.subCategory?.name === selectedSubCategory;
            return matchesCategory && matchesSubCategory;
        });
    }, [menuItems, selectedCategory, selectedSubCategory]);

    const totalAmount = useMemo(() => {
        return order.items.reduce(
            (acc, item) => acc + (item.price ?? 0) * item.quantity,
            0,
        );
    }, [order.items]);

    useEffect(() => {
        if (categoryOptions.length > 0 && !selectedCategory) {
            setSelectedCategory(categoryOptions[0].value);
        }
    }, [categoryOptions, selectedCategory]);

    useEffect(() => {
        setOrder((prev) => ({
            ...prev,
            totalAmount: totalAmount.toString(),
        }));
    }, [totalAmount]);

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

    const handleUpdateOrder = useCallback(async () => {
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
            id: order.requestId,
            items: order.items.map((item) => ({
                menuItemId: item.menuItem?.id || item.id,
                quantity: item.quantity,
                specialInstructions: item.specialInstructions,
            })),
        };
        try {
            const response = await updatePublicOrder(
                Number(orderId),
                remappedOrder,
            );
            if (response.data) {
                toast.custom(() => (
                    <Toast
                        title="Success!"
                        description={`Order updated successfully. `}
                        type="success"
                    />
                ));
                onOrderComplete();
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
            console.error('Error updating order:', error);
            toast.custom(() => (
                <Toast
                    title="Error!"
                    description="Failed to update order"
                    type="error"
                />
            ));
        } finally {
            setIsLoadingSave(false);
        }
    }, [order]);

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
        const remappedOrder = {
            ...order,
            id: order.requestId,
            items: order.items.map((item) => ({
                menuItemId: item.menuItem?.id || item.id,
                quantity: item.quantity,
                specialInstructions: item.specialInstructions,
            })),
        };
        try {
            const response = await createGuestPaidOrder(
                remappedOrder,
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
                <div className="absolute bg-white bottom-0 inset-x-0 flex">
                    <div className="flex w-full border-t p-3 px-4">
                        <div className="ml-auto flex gap-2">
                            <Button
                                disabled={isLoadingSave}
                                size={'sm'}
                                onClick={handleUpdateOrder}
                                className="bg-hexbrand w-full hover:bg-hexbrand text-white shadow-none"
                            >
                                {isLoadingSave ? (
                                    <LoaderCircle className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Send size={18} />
                                )}
                                {isLoadingSave
                                    ? 'Updating Order...'
                                    : 'Update Order'}
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
            handleUpdateOrder,
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
                <PageHeadertitle
                    title={`${menuItems?.data[0].hotel.name ? menuItems?.data[0].hotel.name : 'Restaurant'} Menu`}
                />
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
                            items={order.items.map((item) => {
                                return {
                                    id: item.id,
                                    name: item.menuItem?.name ?? item.name,
                                    price: item.price,
                                    quantity: item.quantity,
                                };
                            })}
                            totalValue={totalAmount}
                            showTotal
                            emptyMessage="Once you select any food it will show here"
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
    const renderForm = () => {
        switch (order.orderType) {
            case 'DINE_IN':
                return (
                    <>
                        <InputField
                            id="guestName"
                            label="Guest Name"
                            name="guestName"
                            value={order.guestName ?? ''}
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
            case 'TAKE_AWAY':
                return (
                    <>
                        <InputField
                            id="address"
                            label="Address"
                            name="address"
                            value={order.address ?? ''}
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
                            value={order.guestName ?? ''}
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
            case 'DELIVERY':
                return (
                    <>
                        <InputField
                            id="address"
                            label="Address"
                            name="address"
                            value={order.address ?? ''}
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
                            value={order.guestName ?? ''}
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
            case 'ROOM':
                return (
                    <>
                        <InputField
                            id="roomNumber"
                            label="Room Number"
                            name="roomNumber"
                            value={order.room?.roomNumber ?? ''}
                            onChange={(e) =>
                                setOrder({
                                    ...order,
                                    room: {
                                        id: 0,
                                        roomNumber: e.target.value ?? '',
                                    },
                                })
                            }
                            placeholder="Enter room number"
                        />
                        <InputField
                            id="guestName"
                            label="Guest Name"
                            name="guestName"
                            value={order.guestName ?? ''}
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
        <PageWrapper className="flex justify-center absolute inset-0">
            <div className="w-full">
                <div className="flex h-full flex-col gap-4 items-center justify-center">
                    <h1 className="text-xl mb-4">Guest Information</h1>
                    <form className="w-full h-full max-w-96 flex flex-col gap-4">
                        <SelectField
                            id="orderType"
                            label="Order Type"
                            name="orderType"
                            value={order.orderType ?? ''}
                            onValueChange={(value) =>
                                setOrder({
                                    ...order,
                                    orderType: value as Order['orderType'],
                                })
                            }
                            options={[
                                { label: 'Dine In', value: 'DINE_IN' },
                                { label: 'Take Away', value: 'TAKE_AWAY' },
                                { label: 'Delivery', value: 'DELIVERY' },
                                { label: 'Room', value: 'ROOM' },
                            ]}
                        />
                        {renderForm()}
                        <div className="flex flex-col gap-4 mt-4">
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
                                disabled={!order.orderType}
                                className="bg-orion-blue h-12 text-white"
                                onClick={onSubmit}
                            >
                                Next
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </PageWrapper>
    );
};

const UpdateMenuPage = () => {
    const params = useParams();
    const searchParams = useSearchParams();

    const hotelId = params.id as string;
    const orderId = searchParams.get('orderId');
    const orderIdNum = orderId ? Number(orderId) : null;
    const isValidOrderId =
        orderIdNum !== null && !isNaN(orderIdNum) && orderIdNum > 0;

    const { currentStepIndex, next, back } = useSteps();
    const [formData, setFormData] = useState<Partial<Order>>({
        requestId: 0,
        guestName: '',
        phoneNumber: '',
        guestEmail: '',
        address: '',
        orderType: 'DINE_IN',
        specialRequests: '',
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
    const {
        data: orderDetails,
        error,
        isLoading,
    } = useSWR(isValidOrderId ? `/orders/${orderIdNum}` : null, () =>
        getOrderById(orderIdNum!),
    );

    useEffect(() => {
        if (orderDetails) {
            console.log(orderDetails);
            const formattedItems = (orderDetails.data.items as any).map(
                (item: any) => ({
                    ...item,
                    id: item.menuItem?.id,
                    name: item.name || item.menuItem?.name,
                    price: item.price,
                    quantity: item.quantity,
                    notes: item.notes,
                }),
            );
            setFormData({
                requestId: orderDetails.data.id || 0,
                guestName: orderDetails.data.guestName || '',
                phoneNumber: orderDetails.data.guestPhoneNumber || '',
                guestEmail: orderDetails.data.guestEmail || '',
                address: orderDetails.data.address || '',
                orderType: orderDetails.data.orderType || 'DINE_IN',
                specialRequests: orderDetails.data.specialRequests || '',
                items: formattedItems || [],
                room: orderDetails.data.room || {
                    id: 0,
                    roomNumber: '',
                },
                totalAmount: orderDetails.data.totalAmount || '0',
                waiter: orderDetails.data.waiter || null,
                table: orderDetails.data.table || null,
                paymentMethod: orderDetails.data.paymentMethod || '',
                recievingAccount: orderDetails.data.recievingAccount || '',
                remark: orderDetails.data.remark || '',
                timeExpected: orderDetails.data.timeExpected || null,
            });
        }
    }, [orderDetails]);

    const onSubmit = () => {
        next();
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
                    <p>Loading order details...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center text-red-600">
                    <p className="text-lg font-semibold mb-2">
                        Error loading order
                    </p>
                    <p className="text-sm">
                        {error.message || 'Failed to fetch order details'}
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    if (!orderDetails) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <p className="text-lg font-semibold mb-2">
                        Order not found
                    </p>
                    <p className="text-sm text-gray-600">{`The order you're looking for doesn't exist.`}</p>
                </div>
            </div>
        );
    }

    const steps = [
        {
            label: 'Edit Order type',
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
            label: 'Edit Items',
            component: (
                <UpdateMenu
                    orderId={orderId as string}
                    hotelId={hotelId}
                    order={formData as Order}
                    setOrder={
                        setFormData as (
                            value: React.SetStateAction<Order>,
                        ) => void
                    }
                    onOrderComplete={() => next()}
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

export default UpdateMenuPage;
