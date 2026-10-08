'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Checkbox } from '@/components/ui/checkbox';
import { mergeOrders, type MergeOrdersData } from '@/app/actions/merged-orders';
import Toast from '@/components/toast';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { Check, Loader2, RotateCcw } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import SearchInput from '../common/SearchInput';
import { ScrollArea, ScrollBar } from '../ui/scroll-area';

interface OrderItem {
    id: number;
    name: string;
    quantity: number;
    price: number;
}

interface Order {
    id: string;
    table: string;
    items: OrderItem[];
    total: number;
    createdAt: string;
    orderType: string;
    orderBy: string;
    status: string;
    paymentStatus: string;
    guestName: string;
    guestEmail: string;
}

interface MergeOrdersProps {
    orders: Order[];
    onConfirmMerge: () => void;
    selectedOrderId?: string | null;
}

export default function MergeOrders({
    orders,
    onConfirmMerge,
    selectedOrderId,
}: Readonly<MergeOrdersProps>) {
    const [selectedOrders, setSelectedOrders] = useState(new Set<string>());
    const [search, setSearch] = useState('');
    const [paymentFilter, setPaymentFilter] = useState<
        'ALL' | 'PAID' | 'PENDING'
    >('ALL');
    const [sortBy, setSortBy] = useState<'LATEST' | 'TOTAL_DESC'>('LATEST');
    console.log('MergeOrders selectedOrderId:', selectedOrderId);
    console.log(
        'Available orders:',
        orders.map((o) => o.id),
    );
    useEffect(() => {
        if (selectedOrderId && orders.length > 0) {
            const orderExists = orders.some(
                (order) => order.id.toString() === selectedOrderId,
            );
            if (orderExists) {
                setSelectedOrders(new Set([selectedOrderId]));
            }
        }
    }, [selectedOrderId, orders]);

    const toggleOrderSelection = (orderId: string) => {
        if (
            selectedOrderId &&
            orderId === selectedOrderId &&
            selectedOrders.has(orderId)
        ) {
            return; // Don't allow deselecting the initiating order
        }

        setSelectedOrders((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(orderId)) {
                newSet.delete(orderId);
            } else {
                newSet.add(orderId);
            }
            return newSet;
        });
    };

    const resetMergeSelection = () => {
        setSelectedOrders(new Set());
    };

    const getMergedOrderPreview = () => {
        const selected = orders.filter((order) =>
            selectedOrders.has(order.id.toString()),
        );

        const mergedItemsMap = new Map<
            string,
            { name: string; quantity: number; price: number }
        >();

        selected
            .flatMap((order) => order.items)
            .forEach((item) => {
                const existingItem = mergedItemsMap.get(item.name);
                if (existingItem) {
                    existingItem.quantity += item.quantity;
                } else {
                    mergedItemsMap.set(item.name, { ...item });
                }
            });

        const allItems = Array.from(mergedItemsMap.values());
        const total = selected.reduce((sum, order) => sum + order.total, 0);
        return { items: allItems, total, orderIds: selected.map((o) => o.id) };
    };

    const [isMerging, setIsMerging] = useState(false);

    const handleConfirmMerge = async () => {
        if (selectedOrders.size < 2) {
            toast.custom(() => (
                <Toast
                    title="Error"
                    description="Please select at least 2 orders to merge"
                    type="error"
                />
            ));
            return;
        }

        const selectedOrderIds = Array.from(selectedOrders).map((id) =>
            parseInt(id),
        );
        const selectedOrderData = orders.filter((order) =>
            selectedOrders.has(order.id.toString()),
        );

        const guestName = selectedOrderData[0]?.guestName || 'Merged Order';
        const guestEmail = selectedOrderData[0]?.guestEmail;

        const mergeData: MergeOrdersData = {
            orderIds: selectedOrderIds,
            guestName,
            guestEmail,
            notes: `Merged from orders: ${selectedOrderIds.join(', ')}`,
        };

        setIsMerging(true);
        try {
            await mergeOrders(mergeData);
            toast.custom(() => (
                <Toast
                    title="Success"
                    description="Orders merged successfully!"
                    type="success"
                />
            ));
            onConfirmMerge();
        } catch (error: any) {
            console.error('Error merging orders:', error);
            toast.custom(() => (
                <Toast
                    title="Error"
                    description={
                        error?.response?.data?.message ||
                        'Failed to merge orders'
                    }
                    type="error"
                />
            ));
        } finally {
            setIsMerging(false);
        }
    };

    const filteredOrders = orders
        .filter((order) => {
           if (selectedOrderId && order.id.toString() === selectedOrderId) {
                return false;
            }
            const matchesSearch =
                order?.guestName
                    ?.toLowerCase()
                    .includes(search.toLowerCase()) ||
                order?.orderBy?.toLowerCase().includes(search.toLowerCase()) ||
                order?.id?.toString().includes(search);
            const matchesPayment =
                paymentFilter === 'ALL' ||
                order?.paymentStatus === paymentFilter;
            return matchesSearch && matchesPayment;
        })
        .slice()
        .sort((a, b) => {
            if (sortBy === 'LATEST') {
                return (
                    new Date(b.createdAt).getTime() -
                    new Date(a.createdAt).getTime()
                );
            }
            return b.total - a.total;
        });

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
            <Card className="max-w-7xl mx-auto shadow-none border bg-white/90 rounded-2xl overflow-hidden">
                <CardHeader className="bg-white pb-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <CardTitle className="flex items-center gap-3 text-xl font-bold">
                            <div className="w-8 h-8 bg-white/25 rounded-lg flex items-center justify-center border">
                                <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                                    />
                                </svg>
                            </div>
                            <span>Merge Orders</span>
                            <Badge
                                variant="secondary"
                                className="text-white border-white/40 px-2 py-0.5 text-xs font-semibold"
                            >
                                {selectedOrders.size} selected
                            </Badge>
                        </CardTitle>
                        {/* Search aligned with header */}
                        <div className="sm:w-72">
                            <SearchInput
                                placeholder="Search orders..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="h-9 bg-white border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 rounded-lg text-sm"
                            />
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="space-y-6 p-6">

                    {/* Main Content Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Orders Selection */}
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-3">
                                    <div className="w-3 h-3 bg-blue-500 rounded-full shadow-sm"></div>
                                    Available Orders
                                </h3>
                                <Badge
                                    variant="outline"
                                    className="bg-blue-50 text-blue-700 border-blue-200 px-3 py-1 font-semibold"
                                >
                                    {filteredOrders.length} orders
                                </Badge>
                            </div>

                            <div className="bg-gradient-to-br from-slate-50 to-blue-50/30 rounded-2xl border border-slate-200 p-8 shadow-sm">
                                {/* Filters & Sorting */}
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                                    <div className="flex items-center gap-2">
                                        <button
                                            className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition-colors ${
                                                paymentFilter === 'ALL'
                                                    ? 'bg-orion-blue text-white border-orion-blue'
                                                    : 'bg-white text-slate-700 border-slate-200 hover:border-orion-blue/30'
                                            }`}
                                            onClick={() =>
                                                setPaymentFilter('ALL')
                                            }
                                        >
                                            All
                                        </button>
                                        <button
                                            className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition-colors ${
                                                paymentFilter === 'PAID'
                                                    ? 'bg-orion-blue text-white border-orion-blue'
                                                    : 'bg-white text-slate-700 border-slate-200 hover:border-orion-blue/30'
                                            }`}
                                            onClick={() =>
                                                setPaymentFilter('PAID')
                                            }
                                        >
                                            Paid
                                        </button>
                                        <button
                                            className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition-colors ${
                                                paymentFilter === 'PENDING'
                                                    ? 'bg-orion-blue text-white border-orion-blue'
                                                    : 'bg-white text-slate-700 border-slate-200 hover:border-orion-blue/30'
                                            }`}
                                            onClick={() =>
                                                setPaymentFilter('PENDING')
                                            }
                                        >
                                            Pending
                                        </button>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-slate-600">
                                            Sort by:
                                        </span>
                                        <select
                                            value={sortBy}
                                            onChange={(e) =>
                                                setSortBy(
                                                    e.target.value as
                                                        | 'LATEST'
                                                        | 'TOTAL_DESC',
                                                )
                                            }
                                            className="text-xs px-2.5 py-1.5 rounded-md border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-300"
                                        >
                                            <option value="LATEST">
                                                Latest
                                            </option>
                                            <option value="TOTAL_DESC">
                                                Highest total
                                            </option>
                                        </select>
                                    </div>
                                </div>
                                <ScrollArea className="h-[400px]">
                                    <div className="space-y-4 pr-6 sm:pr-8 pl-1 py-1">
                                        {filteredOrders.map((order) => {
                                            const isSelected =
                                                selectedOrders.has(
                                                    order.id.toString(),
                                                );
                                            const extraItemCount = Math.max(
                                                order.items.length - 2,
                                                0,
                                            );

                                            return (
                                                <button
                                                    key={order.id}
                                                    className={`relative w-full p-4 rounded-xl border-2 transition-all duration-300 hover:shadow-none group ml-1 mr-3 ${
                                                        isSelected
                                                            ? 'border-orion-blue bg-orion-blue/5 shadow-none scale-[1.02] ring-2 ring-orion-blue/20 ring-offset-2 ring-offset-white'
                                                            : 'border-slate-200 bg-white hover:border-orion-blue/30 hover:bg-orion-blue/5 hover:shadow-md'
                                                    }`}
                                                    onClick={() =>
                                                        toggleOrderSelection(
                                                            order.id.toString(),
                                                        )
                                                    }
                                                >
                                                    {isSelected && (
                                                        <div className="absolute -top-2 -right-2 bg-orion-blue text-white rounded-full w-6 h-6 flex items-center justify-center shadow-none">
                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                viewBox="0 0 24 24"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                strokeWidth="3"
                                                                className="w-4 h-4"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    d="M5 13l4 4L19 7"
                                                                />
                                                            </svg>
                                                        </div>
                                                    )}
                                                    <div className="flex items-start gap-3">
                                                        {/* <div className="relative">
                                            <Checkbox
                                                            className="mt-0.5 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 scale-110 shadow-sm"
                                                checked={selectedOrders.has(
                                                                order.id.toString(),
                                                )}
                                                            onCheckedChange={() => {
                                                    toggleOrderSelection(
                                                                    order.id.toString(),
                                                    );
                                                }}
                                            />
                                                        {selectedOrders.has(
                                                            order.id,
                                                        ) && (
                                                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-600 rounded-full animate-pulse"></div>
                                                        )}
                                                    </div> */}
                                                        <div className="flex-1 text-left">
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <Badge
                                                                    variant="secondary"
                                                                    className="bg-gradient-to-r from-orange-500 to-amber-500 text-white border-0 px-3 py-1 text-xs font-semibold"
                                                                >
                                                                    #
                                                                    {filteredOrders.indexOf(
                                                                        order,
                                                                    ) + 1}
                                                                </Badge>
                                                                <div className="flex items-center gap-1.5">
                                                                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                                                                    <span className="text-xs font-semibold text-gray-700">
                                                                        Table{' '}
                                                                        {
                                                                            order.table
                                                                        }
                                                                    </span>
                                                                </div>
                                                                <Badge
                                                                    variant="outline"
                                                                    className={`text-xs px-1.5 py-0.5 ${
                                                                        order.paymentStatus ===
                                                                        'PAID'
                                                                            ? 'bg-green-100 text-green-700 border-green-300 shadow-sm'
                                                                            : 'bg-amber-100 text-amber-700 border-amber-300 shadow-sm'
                                                                    }`}
                                                                >
                                                                    {
                                                                        order.paymentStatus
                                                                    }
                                                                </Badge>
                                                                <Badge
                                                                    variant="outline"
                                                                    className="text-xs px-1.5 py-0.5 bg-slate-100 text-slate-700 border-slate-300 shadow-sm"
                                                                >
                                                                    {
                                                                        order.orderType
                                                                    }
                                                                </Badge>
                                                            </div>

                                                            <div className="space-y-2">
                                                                <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-2 border border-orange-100">
                                                                    <div className="flex items-center gap-1.5 mb-1">
                                                                        <svg
                                                                            className="w-3 h-3 text-orange-600"
                                                                            fill="none"
                                                                            stroke="currentColor"
                                                                            viewBox="0 0 24 24"
                                                                        >
                                                                            <path
                                                                                strokeLinecap="round"
                                                                                strokeLinejoin="round"
                                                                                strokeWidth={
                                                                                    2
                                                                                }
                                                                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                                                            />
                                                                        </svg>
                                                                        <span className="text-sm font-semibold text-gray-800">
                                                                            {
                                                                                order.guestName
                                                                            }
                                                                        </span>
                                                                    </div>
                                                                    {order.guestEmail && (
                                                                        <div className="text-xs text-gray-600 ml-4.5">
                                                                            {
                                                                                order.guestEmail
                                                                            }
                                                                        </div>
                                                                    )}
                                                                    <div className="flex flex-wrap items-center gap-2 mt-2 ml-4">
                                                                        <Badge
                                                                            variant="outline"
                                                                            className="text-[10px] px-1.5 py-0.5 bg-white text-slate-700 border-slate-200"
                                                                        >
                                                                            Waiter:{' '}
                                                                            {order.orderBy ||
                                                                                '—'}
                                                                        </Badge>
                                                                        {order
                                                                            .items
                                                                            .length >
                                                                            0 && (
                                                                            <div className="flex items-center gap-1 text-[11px] text-slate-700">
                                                                                <span className="font-medium">
                                                                                    Items:
                                                                                </span>
                                                                                <span>
                                                                                    {order.items
                                                                                        .slice(
                                                                                            0,
                                                                                            2,
                                                                                        )
                                                                                        .map(
                                                                                            (
                                                                                                it,
                                                                                            ) =>
                                                                                                `${it.name} ×${it.quantity}`,
                                                                                        )
                                                                                        .join(
                                                                                            ', ',
                                                                                        )}
                                                                                    {extraItemCount >
                                                                                        0 && (
                                                                                        <span className="ml-1 text-slate-500">
                                                                                            +
                                                                                            {
                                                                                                extraItemCount
                                                                                            }{' '}
                                                                                            more
                                                                                        </span>
                                                                                    )}
                                                                                </span>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>

                                                                <div className="grid grid-cols-3 gap-2">
                                                                    <div className="bg-white rounded-lg p-1.5 border border-gray-100 text-center">
                                                                        <div className="flex items-center justify-center gap-1 mb-0.5">
                                                                            <svg
                                                                                className="w-2.5 h-2.5 text-orange-600"
                                                                                fill="none"
                                                                                stroke="currentColor"
                                                                                viewBox="0 0 24 24"
                                                                            >
                                                                                <path
                                                                                    strokeLinecap="round"
                                                                                    strokeLinejoin="round"
                                                                                    strokeWidth={
                                                                                        2
                                                                                    }
                                                                                    d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                                                                                />
                                                                            </svg>
                                                                            <span className="text-xs font-medium text-gray-700">
                                                                                Items
                                                                            </span>
                                                                        </div>
                                                                        <div className="text-xs font-bold text-gray-800">
                                                                            {
                                                                                order
                                                                                    .items
                                                                                    .length
                                                                            }
                                                                        </div>
                                                                    </div>
                                                                    <div className="bg-white rounded-lg p-1.5 border border-gray-100 text-center">
                                                                        <div className="flex items-center justify-center gap-1 mb-0.5">
                                                                            <svg
                                                                                className="w-2.5 h-2.5 text-orange-600"
                                                                                fill="none"
                                                                                stroke="currentColor"
                                                                                viewBox="0 0 24 24"
                                                                            >
                                                                                <path
                                                                                    strokeLinecap="round"
                                                                                    strokeLinejoin="round"
                                                                                    strokeWidth={
                                                                                        2
                                                                                    }
                                                                                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                                                                                />
                                                                            </svg>
                                                                            <span className="text-xs font-medium text-gray-700">
                                                                                Total
                                                                            </span>
                                                                        </div>
                                                                        <div className="text-xs font-bold text-gray-800">
                                                                            {order.total.toLocaleString(
                                                                                'en-NG',
                                                                                {
                                                                                    style: 'currency',
                                                                                    currency:
                                                                                        'NGN',
                                                                                    minimumFractionDigits: 0,
                                                                                    maximumFractionDigits: 0,
                                                                                },
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                    <div className="bg-white rounded-lg p-1.5 border border-gray-100 text-center">
                                                                        <div className="flex items-center justify-center gap-1 mb-0.5">
                                                                            <svg
                                                                                className="w-2.5 h-2.5 text-orange-600"
                                                                                fill="none"
                                                                                stroke="currentColor"
                                                                                viewBox="0 0 24 24"
                                                                            >
                                                                                <path
                                                                                    strokeLinecap="round"
                                                                                    strokeLinejoin="round"
                                                                                    strokeWidth={
                                                                                        2
                                                                                    }
                                                                                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                                                                />
                                                                            </svg>
                                                                            <span className="text-xs font-medium text-gray-700">
                                                                                Date
                                                                            </span>
                                                                        </div>
                                                                        <div className="text-xs font-bold text-gray-800">
                                                                            {new Date(
                                                                                order.createdAt,
                                                                            ).toLocaleDateString(
                                                                                'en-GB',
                                                                                {
                                                                                    day: '2-digit',
                                                                                    month: 'short',
                                                                                    year: 'numeric',
                                                                                },
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                    <ScrollBar orientation="vertical" />
                                </ScrollArea>
                            </div>
                        </div>

                        {/* Merge Preview */}
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-3">
                                    <div className="w-3 h-3 bg-orion-blue rounded-full"></div>
                                    Merge Preview
                                </h3>
                                {selectedOrders.size > 0 && (
                                    <Badge
                                        variant="outline"
                                        className="bg-orion-blue/10 text-orion-blue border-orion-blue/20 px-3 py-1 font-semibold"
                                    >
                                        {getMergedOrderPreview().items.length}{' '}
                                        items
                                    </Badge>
                                )}
                            </div>

                            {selectedOrders.size > 0 ? (
                                <div className="bg-gradient-to-br from-orange-50 to-emerald-50 rounded-xl border border-orange-200 p-6">
                                    <div className="space-y-4">
                                        <div className="bg-white rounded-lg p-4 border border-orange-200">
                                            <div className="flex items-center gap-2 mb-3">
                                                <svg
                                                    className="w-4 h-4 text-orange-600"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                                    />
                                                </svg>
                                                <span className="text-sm font-medium text-orange-700">
                                                    Merging{' '}
                                                    {selectedOrders.size} orders
                                                </span>
                                            </div>
                                            <div className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded">
                                                Orders:{' '}
                                                {getMergedOrderPreview().orderIds.join(
                                                    ', ',
                                                )}
                                            </div>
                                        </div>

                                        <div className="bg-white rounded-lg p-4 border border-orange-200">
                                            <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                                                <svg
                                                    className="w-4 h-4 text-gray-600"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                                                    />
                                                </svg>
                                                Merged Items
                                            </h4>
                                            <div className="space-y-2 max-h-48 overflow-y-auto">
                                                {getMergedOrderPreview().items.map(
                                                    (item, index) => (
                                                        <div
                                                            key={index}
                                                            className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0"
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-sm font-medium text-gray-700">
                                                                    {item.name}
                                                                </span>
                                                                <Badge
                                                                    variant="outline"
                                                                    className="text-xs bg-blue-50 text-blue-700 border-blue-200"
                                                                >
                                                                    ×
                                                                    {
                                                                        item.quantity
                                                                    }
                                                                </Badge>
                                                            </div>
                                                            <span className="text-sm font-medium text-gray-700">
                                                                {(
                                                                    item.price *
                                                                    item.quantity
                                                                ).toLocaleString(
                                                                    'en-NG',
                                                                    {
                                                                        style: 'currency',
                                                                        currency:
                                                                            'NGN',
                                                                        minimumFractionDigits: 0,
                                                                        maximumFractionDigits: 0,
                                                                    },
                                                                )}
                                                            </span>
                                                        </div>
                                                    ),
                                                )}
                                            </div>
                                        </div>

                                        <div className="bg-gradient-to-r from-orange-300 to-orange-600 rounded-lg p-4 text-white">
                                            <div className="flex justify-between items-center">
                                                <span className="font-semibold">
                                                    Total Amount:
                                                </span>
                                                <span className="text-xl font-bold">
                                                    {getMergedOrderPreview().total.toLocaleString(
                                                        'en-NG',
                                                        {
                                                            style: 'currency',
                                                            currency: 'NGN',
                                                            minimumFractionDigits: 0,
                                                            maximumFractionDigits: 0,
                                                        },
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-200 p-8">
                                    <div className="text-center space-y-3">
                                        <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto">
                                            <ExclamationTriangleIcon className="w-8 h-8 text-amber-600" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-amber-800 mb-1">
                                                No Orders Selected
                                            </h4>
                                            <p className="text-sm text-amber-700">
                                                Please select at least two
                                                orders to merge them together.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="bg-gradient-to-r from-slate-50 to-blue-50/50 rounded-xl p-6 border border-slate-200">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 text-sm text-slate-600">
                                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <svg
                                        className="w-4 h-4 text-blue-600"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                </div>
                                <span className="font-medium">
                                    Selected {selectedOrders.size} orders
                                </span>
                            </div>
                            <div className="flex gap-4">
                                <Button
                                    onClick={resetMergeSelection}
                                    variant="outline"
                                    className="border-slate-300 text-slate-700 hover:bg-slate-50 px-6 py-2 font-medium"
                                    disabled={selectedOrders.size === 0}
                                >
                                    <RotateCcw className="w-4 h-4 mr-2" />
                                    Reset
                                </Button>
                                <Button
                                    onClick={handleConfirmMerge}
                                    disabled={
                                        selectedOrders.size < 2 || isMerging
                                    }
                                    className="bg-gradient-to-r from-orange-600 to-orange-600 hover:from-orange-700 hover:to-orange-700 text-white shadow-none hover:shadow-xl transition-all duration-200 px-8 py-2 font-semibold"
                                >
                                    {isMerging ? (
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    ) : (
                                        <Check className="w-4 h-4 mr-2" />
                                    )}
                                    {isMerging ? 'Merging...' : 'Confirm Merge'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
