'use client';
import { getOrdersByTableId } from '@/app/actions/order';
import { ItemsTable } from '@/components/common/ItemsTable';
import { BaseSheet } from '@/components/common/sheets/BaseSheet';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatDate } from '@/lib/helpers';
import { Banknote, Clock, CreditCard } from 'lucide-react';
import { useEffect, useState } from 'react';
import useHotel from '@/hooks/useHotel';
import { ScopedOrder } from '../types';
import { deriveOrderTotals } from '../utils';

interface ViewOrderSheetProps {
    isOpen: boolean;
    onClose: () => void;
    table: ScopedOrder['table'];
}

export const ViewOrderSheet = ({
    isOpen,
    onClose,
    table,
}: ViewOrderSheetProps) => {
    const [orders, setOrders] = useState<ScopedOrder[]>([]);
    const { organization } = useHotel();
    const restaurantVatInclusive = organization?.restaurantVatInclusive ?? false;
    console.log(orders);
    const fetchTableOrders = async (tableId: number) => {
        try {
            const response = await getOrdersByTableId(tableId);
            if (response.data) {
                // Filter to only show pending orders
                const pendingOrders = response.data.filter(
                    (order: ScopedOrder) =>
                        order.paymentStatus === 'PENDING' ||
                        order.status === 'PENDING' ||
                        order.status === 'IN_KITCHEN',
                );
                setOrders(pendingOrders);
            } else {
                console.error(response.error);
            }
        } catch (err) {
            console.error('Error fetching table order:', err);
        }
    };

    useEffect(() => {
        if (table?.id) {
            fetchTableOrders(table.id);
        }
    }, [table?.id]);

    return (
        <BaseSheet isOpen={isOpen} onClose={onClose} title="">
            <div className="pr-6">
                <div className="flex items-center justify-between">
                    <p className="text-left text-lg font-medium">
                        {`Table ${table?.number}`}
                    </p>
                    <div className="flex items-center gap-2">
                        <Badge
                            variant="outline"
                            className="flex items-center gap-1 rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700"
                        >
                            <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                            {orders.length} Orders
                        </Badge>
                    </div>
                </div>
            </div>
            <div className="space-y-4">
                {orders && orders.length > 0 && (
                    <Tabs
                        defaultValue={orders ? String(orders[0].id) : '1'}
                        className="mt-6"
                    >
                        <TabsList className="w-full overflow-hidden overflow-x-auto px-0 justify-start gap-4 bg-transparent border-b">
                            {orders.map((order) => (
                                <TabsTrigger
                                    key={order.id}
                                    value={String(order.id)}
                                    className="text-base px-0 data-[state=active]:text-hexbrand data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none border-b-2 border-b-transparent data-[state=active]:border-b-hexbrand"
                                >
                                    #ORD-{order.id}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                        {orders.map((order) => {
                            const totals = deriveOrderTotals(order as any);
                            const fields = [
                                {
                                    label: 'Order type',
                                    value: order?.orderType,
                                },
                                {
                                    label: 'Guest name',
                                    value: order?.guestName,
                                },
                                {
                                    label: 'Guest email',
                                    value: order?.guestEmail,
                                },
                                {
                                    label: 'Guest phone number',
                                    value: order?.guestPhoneNumber,
                                },
                                {
                                    label: 'Date Requested',
                                    value: formatDate(order.createdAt),
                                },
                            ];
                            return (
                                <TabsContent
                                    key={order.id}
                                    value={String(order.id)}
                                    className="space-y-4 pt-4"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                            <div className="flex items-center gap-1">
                                                <Clock className="h-3.5 w-3.5" />
                                                <span>
                                                    {formatDate(
                                                        order.createdAt,
                                                    )}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                {order.paymentMethod ===
                                                    'CARD' && (
                                                    <CreditCard className="h-3.5 w-3.5" />
                                                )}
                                                {order.paymentMethod ===
                                                    'CASH' && (
                                                    <Banknote className="h-3.5 w-3.5" />
                                                )}
                                                <span>
                                                    {order.paymentMethod}
                                                </span>
                                            </div>
                                        </div>
                                                <Badge
                                            variant="outline"
                                            className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
                                                order.paymentStatus === 'PAID' ||
                                                order.paymentStatus ===
                                                    'BILL_SETTLED_FROM_FRONT_DESK' ||
                                                order.paymentStatus ===
                                                    'COMPLEMENTED'
                                                    ? 'bg-green-50 text-green-700'
                                                    : order.paymentStatus ===
                                                        'PENDING'
                                                    ? 'bg-yellow-50 text-yellow-700'
                                                    : order.paymentStatus ===
                                                        'ADDED_TO_BILL'
                                                    ? 'bg-amber-50 text-amber-700'
                                                    : 'bg-red-50 text-red-700'
                                            }`}
                                        >
                                            <span
                                                className={`h-1.5 w-1.5 rounded-full ${
                                                    order.paymentStatus ===
                                                    'PAID' ||
                                                    order.paymentStatus ===
                                                        'BILL_SETTLED_FROM_FRONT_DESK' ||
                                                    order.paymentStatus ===
                                                        'COMPLEMENTED'
                                                        ? 'bg-green-500'
                                                        : order.paymentStatus ===
                                                            'PENDING'
                                                        ? 'bg-yellow-500'
                                                        : order.paymentStatus ===
                                                            'ADDED_TO_BILL'
                                                        ? 'bg-amber-500'
                                                        : 'bg-red-500'
                                                }`}
                                            />
                                            {order.paymentStatus === 'PAID'
                                                ? 'paid'
                                                : order.paymentStatus ===
                                                    'BILL_SETTLED_FROM_FRONT_DESK'
                                                ? 'Bill Settled from Front Desk'
                                                : order.paymentStatus ===
                                                    'COMPLEMENTED'
                                                  ? 'Complemented'
                                                  : order.paymentStatus ===
                                                    'PENDING'
                                                  ? 'Pending'
                                                  : order.paymentStatus ===
                                                    'ADDED_TO_BILL'
                                                  ? 'Posted to Room'
                                                  : 'Failed'}
                                        </Badge>
                                    </div>

                                    <div className="bg-hexbrand/10 p-4 rounded-lg flex flex-col gap-4 ">
                                        {fields.map((field, index) => (
                                            <div
                                                className="grid grid-cols-2 text-sm"
                                                key={index}
                                            >
                                                <span className="text-gray-500 capitalize">
                                                    {field?.label}
                                                </span>
                                                <span className="text-gray-600">
                                                    {field?.value}
                                                </span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-4">
                                        <ItemsTable
                                            showTotal
                                            items={order?.items.map((item) => {
                                                return {
                                                    id: item?.id ?? 0,
                                                    name:
                                                        item.menuItem?.name ??
                                                        '',
                                                    price: item?.price ?? 0,
                                                    quantity:
                                                        item?.quantity ?? 0,
                                                    imageUrl:
                                                        item?.menuItem
                                                            ?.imageUrl ?? '',
                                                    isReady: item.isReady,
                                                };
                                            })}
                                            totalLabel="Total"
                                            totalValue={totals.total}
                                            currencyPrefix="₦"
                                            subtotalValue={
                                                totals.vatAmount > 0
                                                    ? totals.subtotal
                                                    : undefined
                                            }
                                            vatRate={
                                                !restaurantVatInclusive &&
                                                totals.vatAmount > 0
                                                    ? totals.vatRate
                                                    : undefined
                                            }
                                            vatValue={
                                                !restaurantVatInclusive &&
                                                totals.vatAmount > 0
                                                    ? totals.vatAmount
                                                    : undefined
                                            }
                                        />
                                    </div>
                                </TabsContent>
                            );
                        })}
                    </Tabs>
                )}
            </div>
        </BaseSheet>
    );
};
