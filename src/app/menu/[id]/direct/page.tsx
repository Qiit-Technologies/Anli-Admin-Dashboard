'use client';

import { useParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';

import { getPublicMenuItems } from '@/app/actions/menu-item';
import { PageHeader, PageHeadertitle } from '@/components/common/layout/Header';
import OrderSkeleton from '@/components/front-of-house/OrderSkeleton';
import { ScrollableTabs } from '@/components/front-of-house/ScrollTab';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import useHotel from '@/hooks/useHotel';
import { Order } from '@/store/useOrder';

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

function DirectMenuPage() {
    const { id: hotelId } = useParams();
    const { organization } = useHotel();

    const {
        data: menuItems,
        error,
        isLoading,
    } = useSWR(hotelId ? '/menu/item' : null, () =>
        getPublicMenuItems(hotelId as string),
    );

    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [selectedSubCategory, setSelectedSubCategory] = useState<string>('');

    const [order, setOrder] = useState<Order>({
        requestId: 0,
        items: [],
        orderType: 'DINE_IN',
        guestName: '',
        guestEmail: '',
        phoneNumber: '',
        totalAmount: '0',
        requestDate: new Date(),
        requestTable: '',
        address: '',
        numberOfGuests: 0,
        specialRequests: '',
        bookingTime: '',
        bookingDate: '',
        remark: '',
        timeExpected: '',
        table: null,
        status: 'PENDING',
        receivedBy: '',
        createdAt: new Date(),
        paymentMethod: '',
        paymentStatus: 'Pending',
        recievingAccount: '',
        waiter: null,
        room: {
            id: 0,
            roomNumber: '',
        },
    });

    const categoryOptions = useMemo(() => {
        if (!menuItems) return [];
        const categories = new Set<string>();
        menuItems?.data?.forEach((item: MenuItem) => {
            if (item.category?.name) {
                categories.add(item.category.name);
            }
        });
        const ordered = Array.from(categories).reverse();
        return ordered.map((category) => ({
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
            const isVisible = item.isVisibleOnDigitalMenu !== false;
            return matchesCategory && matchesSubCategory && isVisible;
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

    const isReady = categoryOptions.length > 0 && menuItems?.data.length > 0;

    const MiniCategoryListMemo = useMemo(
        () => (
            <div className="flex flex-wrap gap-2">
                {(subCategoryOptions ?? []).map((category) => (
                    <button
                        key={category.value}
                        onClick={() => setSelectedSubCategory(category.value)}
                        className={`px-4 py-2 rounded-full shadow-none text-sm font-medium transition-all duration-200 ease-in-out flex items-center gap-2 ${
                            selectedSubCategory === category.value
                                ? 'bg-hexbrand text-white shadow-md'
                                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                        }`}
                    >
                        {category.label}
                    </button>
                ))}
            </div>
        ),
        [subCategoryOptions, selectedSubCategory],
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
        <div className="p-4 md:p-8 flex flex-col gap-6 bg-gradient-to-b from-white to-gray-50 min-h-screen">
            <PageHeader>
                <div className="flex items-center space-x-4">
                    {organization?.coverImage ? (
                        <div className="w-14 h-14 rounded-xl overflow-hidden shadow-md ring-2 ring-gray-100">
                            <img
                                src={
                                    organization.coverImage ||
                                    '/placeholder.svg'
                                }
                                alt={`${organization.name} logo`}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    ) : (
                        <div className="w-14 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
                            <span className="text-2xl font-bold text-white">
                                {organization?.name?.charAt(0) || 'H'}
                            </span>
                        </div>
                    )}
                    <div className="flex-1">
                        <PageHeadertitle
                            title={`${organization?.name || menuItems?.data?.[0]?.hotel?.name || 'Restaurant'} Menu`}
                        />
                        <p className="text-sm text-gray-500 mt-1">
                            Browse our delicious selection
                        </p>
                    </div>
                </div>
            </PageHeader>

            <div>
                {isReady && (
                    <Tabs
                        defaultValue={categoryOptions[0].value ?? ''}
                        value={selectedCategory}
                        onValueChange={setSelectedCategory}
                        className="w-full"
                    >
                        <ScrollableTabs categoryOptions={categoryOptions} />

                        <TabsContent
                            className="w-full rounded-2xl border border-gray-200 bg-white mt-8 shadow-sm hover:shadow-md transition-shadow duration-300"
                            value={selectedCategory}
                        >
                            <div className="w-full flex flex-col gap-6 p-6 md:p-8">
                                {selectedCategory && (
                                    <>
                                        <div className="space-y-3">
                                            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                                                Filter
                                            </h3>
                                            {MiniCategoryListMemo}
                                        </div>
                                        {selectedSubCategory !== '' && (
                                            <hr className="border-gray-200" />
                                        )}
                                    </>
                                )}

                                <ScrollArea className="h-[calc(100vh-280px)]">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-16 pr-4">
                                        {filteredItems.map((item: any) => (
                                            <div
                                                key={item.id}
                                                className={`group flex flex-col rounded-xl border border-gray-200 overflow-hidden bg-white transition-all duration-300 ${
                                                    !item.isAvailable
                                                        ? 'opacity-60 cursor-not-allowed'
                                                        : 'hover:shadow-xl hover:border-gray-300 hover:-translate-y-1'
                                                }`}
                                            >
                                                <div className="relative w-full h-48 overflow-hidden bg-gray-100">
                                                    {item.imageUrl ? (
                                                        <>
                                                            <img
                                                                src={
                                                                    item.imageUrl ||
                                                                    '/placeholder.svg'
                                                                }
                                                                alt={item.name}
                                                                className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
                                                            />
                                                            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                                        </>
                                                    ) : (
                                                        <div className="flex items-center justify-center h-full text-gray-400 text-sm font-medium">
                                                            No Image
                                                        </div>
                                                    )}
                                                    {!item.isAvailable && (
                                                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                                                            <span className="text-white font-semibold text-sm">
                                                                Sold Out
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex flex-col flex-grow p-4 md:p-5">
                                                    <div className="flex justify-between items-start gap-3 mb-3">
                                                        <div className="flex-1 min-w-0">
                                                            <h3 className="font-semibold text-base md:text-lg text-gray-900 leading-tight line-clamp-2">
                                                                {item?.name}
                                                            </h3>
                                                        </div>
                                                        <span className="font-bold text-base md:text-lg text-hexbrand whitespace-nowrap ml-2">
                                                            ₦
                                                            {Number(
                                                                item?.price ??
                                                                    0,
                                                            ).toLocaleString()}
                                                        </span>
                                                    </div>
                                                    {item?.description && (
                                                        <p className="text-gray-600 text-sm leading-relaxed line-clamp-2 flex-grow">
                                                            {item?.description}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </ScrollArea>
                            </div>
                        </TabsContent>
                    </Tabs>
                )}
            </div>
        </div>
    );
}

export default DirectMenuPage;
