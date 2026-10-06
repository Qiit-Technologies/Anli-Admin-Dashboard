'use client';
import { CustomSheet } from '@/components/common/CustomSheet';
import { ItemsTable } from '@/components/common/ItemsTable';
import {
    ItemOrderColumnsNoAction,
    ItemOrderWithUpdateAction,
} from '@/components/common/table/column/ItemOrder';
import { PrintButton } from '@/components/PrintButton';
import useHotel from '@/hooks/useHotel';
import { formatDate } from '@/lib/helpers';
import React from 'react';
import { ScopedOrder } from '../types';
import { splitOrderItemsByType } from '../utils';

interface KOTActionProps {
    order: ScopedOrder;
    module?: 'kitchen' | 'restaurant';
}

export const KOTAction: React.FC<KOTActionProps> = ({
    order,
    module = 'restaurant',
}) => {
    const { organization: hotel } = useHotel();
    const restaurantVatInclusive = hotel?.restaurantVatInclusive ?? false;
    const restaurantServiceChargeInclusive = hotel?.restaurantServiceChargeInclusive ?? false;
    const restaurantTipInclusive = hotel?.restaurantTipInclusive ?? false;
    const restaurantCustomChargesInclusive = hotel?.restaurantCustomChargesInclusive ?? false;
    const fields = [
        { label: 'Order type', value: order.orderType },
        { label: 'Customer name', value: order?.guestName },
        { label: 'Created By', value: order.createdBy?.fullName },
        {
            label: 'Order time',
            value: formatDate(order?.createdAt?.toString() || '') ?? '',
        },
        { label: 'Order amount', value: `₦${order?.totalPrice}` },
    ];

    const { foodItems, drinkItems } = splitOrderItemsByType(order.items as any);
    return (
        <div className="flex items-center gap-4">
            <CustomSheet
                title="Order Details"
                trigger={
                    <button className="text-blue-600 border border-orion-blue text-orion-blue px-3 py-1 rounded-md hover:text-blue-800">
                        View
                    </button>
                }
                noTitle={true}
            >
                <div className="flex items-center mb-4 justify-between">
                    <h1 className="text-xl font-bold">Order ID: {order.id}</h1>
                    {foodItems.length > 0 && (
                        <PrintButton
                            printType="kot"
                            order={{
                                hotel: hotel?.name,
                                email: hotel?.owner.email,
                                phone: hotel?.owner.phoneNumber,
                                hotelId: hotel?.id?.toString(),
                                preparedBy: order.waiter?.fullName,
                                takenBy:
                                    order.waiter?.fullName ||
                                    order.createdBy?.fullName,
                                orderId: order.id?.toString() ?? '',
                                items: foodItems.map((item) => ({
                                    name: item.menuItem?.name ?? '',
                                    quantity: item.quantity,
                                    price: Number(item.price) ?? 0,
                                    specialInstructions: item.notes ?? '',
                                })),
                                total: Number(order.totalPrice) ?? 0,
                                orderDate: order.createdAt ?? '',
                                orderTime: order.createdAt ?? '',
                                billAmount: Number(order.totalPrice) ?? 0,
                                totalTax: '',
                                vat: '',
                                waiter: {
                                    fullName: order.waiter?.fullName ?? '',
                                },
                                table: {
                                    number:
                                        order.table?.number?.toString() ?? '0',
                                },
                                room: order.room?.roomNumber ?? '',
                                paymentMethod: order.paymentMethod ?? undefined,
                            }}
                        />
                    )}
                    {drinkItems.length > 0 && (
                        <PrintButton
                            printType="bot"
                            order={{
                                hotel: hotel?.name,
                                email: hotel?.owner.email,
                                phone: hotel?.owner.phoneNumber,
                                hotelId: hotel?.id?.toString(),
                                preparedBy: order.waiter?.fullName,
                                takenBy:
                                    order.waiter?.fullName ||
                                    order.createdBy?.fullName,
                                orderId: order.id?.toString() ?? '',
                                items: drinkItems.map((item) => ({
                                    name: item.menuItem?.name ?? '',
                                    quantity: item.quantity,
                                    price: Number(item.price) ?? 0,
                                    specialInstructions: item.notes ?? '',
                                })),
                                total: Number(order.totalPrice) ?? 0,
                                orderDate: order.createdAt ?? '',
                                orderTime: order.createdAt ?? '',
                                billAmount: Number(order.totalPrice) ?? 0,
                                totalTax: '',
                                vat: '',
                                waiter: {
                                    fullName: order.waiter?.fullName ?? '',
                                },
                                table: {
                                    number:
                                        order.table?.number?.toString() ?? '0',
                                },
                                room: order.room?.roomNumber ?? '',
                                paymentMethod: order.paymentMethod ?? undefined,
                            }}
                        />
                    )}
                </div>
                <div className="bg-hexbrand/10 p-4 rounded-lg flex flex-col gap-4">
                    {fields
                        .filter((field) => field.label !== 'Notes')
                        .map((field) => (
                            <div
                                className="grid grid-cols-2 text-sm"
                                key={field.label}
                            >
                                <span className="text-gray-500 capitalize">
                                    {field.label}
                                </span>
                                <span className="text-gray-600">
                                    {field.value}
                                </span>
                            </div>
                        ))}
                </div>
                <div className="bg-hexbrand/10 text-sm p-4 mt-4 rounded-lg flex flex-col gap-4">
                    <span className="font-semibold">Special Instructions</span>
                    <div className="flex flex-col gap-3">
                        {order?.items.map((item) => {
                            return (
                                <div key={item.id} className="flex flex-col">
                                    <span className="text-gray-500 capitalize">
                                        {item?.menuItem?.name}
                                    </span>
                                    <span className="text-gray-600">
                                        {item?.notes}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
                <div className="mt-4">
                    <ItemsTable
                        items={(order?.items || []).map((item) => ({
                            id: `${item.id}`,
                            name: item?.menuItem?.name || '',
                            quantity: item?.quantity,
                            price: Number(item.price),
                            isReady: item.isReady,
                        }))}
                        showTotal={true}
                        columns={
                            module !== 'restaurant'
                                ? ItemOrderWithUpdateAction
                                : ItemOrderColumnsNoAction
                        }
                        totalValue={Number(order.totalPrice ?? 0)}
                        currencyPrefix="₦"
                        breakdownRows={[
                            {
                                label: 'Subtotal',
                                value:
                                    order.subtotal ??
                                    Math.max(
                                        Number(order.totalPrice ?? 0) -
                                            Number(order.vatAmount ?? 0) -
                                            Number(
                                                order.serviceChargeAmount ?? 0,
                                            ) -
                                            Number(order.tipAmount ?? 0),
                                        0,
                                    ),
                            },
                            ...(!hotel?.restaurantVatInclusive &&
                                Number(order.vatAmount ?? 0) > 0
                                    ? [
                                          {
                                              label: `VAT (${Number(
                                                  order.vatRateSnapshot ??
                                                      (order?.hotel as any)?.restaurantVatRate ??
                                                      order?.hotel?.vatRate ??
                                                      0,
                                              ).toFixed(2)}%)`,
                                              value: order.vatAmount ?? 0,
                                          },
                                      ]
                                    : []),
                            ...(!restaurantServiceChargeInclusive && Number(order.serviceChargeAmount ?? 0) > 0
                                ? [
                                      {
                                          label: `Service Charge (${Number(
                                              order.serviceChargeRateSnapshot ??
                                                  (order?.hotel as any)?.restaurantServiceChargeRate ??
                                                  order?.hotel?.serviceChargeRate ??
                                                  0,
                                          ).toFixed(2)}%)`,
                                          value: order.serviceChargeAmount ?? 0,
                                      },
                                  ]
                                : []),
                            ...(!restaurantTipInclusive && Number(order.tipAmount ?? 0) > 0
                                ? [
                                      {
                                          label: `Tip (${Number(
                                              order.tipRateSnapshot ??
                                                  (order?.hotel as any)?.restaurantTipRate ??
                                                  order?.hotel?.tipRate ??
                                                  0,
                                          ).toFixed(2)}%)`,
                                          value: order.tipAmount ?? 0,
                                      },
                                  ]
                                : []),
                        ]}
                    />
                </div>
            </CustomSheet>
        </div>
    );
};
