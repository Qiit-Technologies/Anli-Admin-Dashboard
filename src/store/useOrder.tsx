import { ScopedOrder } from '@/components/front-of-house/types';
import { RoomType } from '@/components/front-office/stay-view copy/types';
import { DineInArea, TableForDine } from '@/types/back-of-house.type';
import { create } from 'zustand';

interface Item {
    id: number;
    lineKey?: string;
    name: string;
    price: number;
    quantity: number;
    specialInstructions?: string;
    notes?: string;
    selectedModifiers?: Array<{
        modifierGroupId: number;
        modifierOptionId: number;
    }>;
    menuItem?: {
        id: number;
        name: string;
        price: string;
        description: string;
        isAvailable: boolean;
        imageUrl: string;
        createdAt: string;
        updatedAt: string;
    };
}

export interface Table {
    id: number;
    number: number;
    isOccupied: boolean;
    numberOfSeats: number;
    dineArea: string;
    availableSeats?: number;
}

export type OrderType =
    | 'DINE_IN'
    | 'ROOM'
    | 'NO_CHARGE'
    | 'TAKE_AWAY'
    | 'FAST_FOOD'
    | 'DELIVERY';

export type PaymentStatus =
    | 'PAID'
    | 'ADDED_TO_BILL'
    | 'BILL_SETTLED_FROM_FRONT_DESK'
    | 'PENDING'
    | 'COMPLEMENTED'
    | 'VOIDED';

export interface Order {
    requestId: number;
    requestDate?: Date;
    requestTable?: string;
    room?: {
        id: number;
        roomNumber: string;
        roomType?: RoomType;
    } | null;
    orderType?: OrderType;
    // guest details
    guestName?: string;
    guestEmail?: string;
    phoneNumber?: string;
    numberOfGuests?: number;
    // table details
    table?: Table | TableForDine | null;
    dineInArea?: DineInArea | null;
    specialRequests?: string;
    bookingTime?: string;
    bookingDate?: string;
    status?: ScopedOrder['status'];
    receivedBy?: string;
    createdAt?: Date;
    paymentMethod?: string;
    paymentStatus?:
        | 'Pending'
        | 'Added to bill'
        | 'Paid'
        | 'Cancelled'
        | 'Complemented'
        | 'BILL_SETTLED_FROM_FRONT_DESK';
    recievingAccount?: string;
    totalAmount?: string;
    subtotal?: string | number;
    vatAmount?: string | number;
    vatRate?: number;
    vatRateSnapshot?: number;
    serviceChargeAmount?: string | number;
    serviceChargeRate?: number;
    serviceChargeRateSnapshot?: number;
    tipAmount?: string | number;
    tipRate?: number;
    tipRateSnapshot?: number;
    customCharges?: Array<{
        id: number;
        name: string;
        rate: number;
        amount: number;
    }> | null;
    totalCustomChargesAmount?: string | number;
    totalWithCustomCharges?: string | number;
    isDiscounted?: boolean;
    discountType?: 'PERCENTAGE' | 'FIXED_AMOUNT' | null;
    discountValue?: number | string | null;
    discountAmount?: number | string | null;
    discountReason?: string | null;
    address?: string;
    waiter?: {
        id: number;
        fullName: string;
        email: string;
        roleId: number;
    } | null;
    items: Item[];
    remark?: string;
    timeExpected?: string | null;
    id?: number;
    kitchen?: number;
    createdBy?: {
        id: number;
        fullName: string;
        email?: string;
    } | null;
}

interface OrderStore {
    order: Order;
    setOrder: (order: Order) => void;
    addItem: (item: Item) => void;
    increaseItemQuantity: (itemId: number) => void;
    decreaseItemQuantity: (itemId: number) => void;
    removeItem: (itemId: number) => void;
    updateTotalAmount: (payload: {
        subtotal: number;
        vatAmount: number;
        total: number;
        vatRate?: number;
        serviceChargeAmount?: number;
        serviceChargeRate?: number;
        tipAmount?: number;
        tipRate?: number;
    }) => void;
    clearOrder: () => void;
    addItems: (items: Item[]) => void;
    addSpecialInstructions: (
        itemId: number,
        specialInstructions: string,
    ) => void;
}

const initialOrder: Order = {
    requestId: 0,
    requestDate: new Date(),
    requestTable: '',
    room: {
        id: 0,
        roomNumber: '',
    },
    orderType: 'NO_CHARGE',
    guestName: '',
    guestEmail: '',
    phoneNumber: '',
    address: '',
    numberOfGuests: 0,
    specialRequests: '',
    bookingTime: '',
    bookingDate: '',
    remark: '',
    timeExpected: '',
    table: {
        id: 0,
        number: 0,
        isOccupied: false,
        numberOfSeats: 0,
        dineArea: '',
    },
    status: 'PENDING',
    receivedBy: '',
    createdAt: new Date(),
    paymentMethod: '',
    paymentStatus: 'Pending',
    recievingAccount: '',
    totalAmount: '0',
    subtotal: '0',
    vatAmount: '0',
    vatRate: 0,
    vatRateSnapshot: 0,
    serviceChargeAmount: '0',
    serviceChargeRate: 0,
    serviceChargeRateSnapshot: 0,
    tipAmount: '0',
    tipRate: 0,
    tipRateSnapshot: 0,
    waiter: {
        id: 0,
        fullName: '',
        email: '',
        roleId: 0,
    },
    items: [],
    kitchen: 0,
};

import { devtools } from 'zustand/middleware';

const useOrderStore = create<OrderStore>()(
    devtools(
        (set) => ({
            order: initialOrder,
            setOrder: (order: Order) => set({ order: order }),
            increaseItemQuantity: (itemId: number) => {
                set((state) => ({
                    order: {
                        ...state.order,
                        items: state.order.items.map((item) =>
                            item.id === itemId
                                ? { ...item, quantity: item.quantity + 1 }
                                : item,
                        ),
                    },
                }));
            },
            decreaseItemQuantity: (itemId: number) => {
                set((state) => ({
                    order: {
                        ...state.order,
                        items: state.order.items.map((item) =>
                            item.id === itemId
                                ? { ...item, quantity: item.quantity - 1 }
                                : item,
                        ),
                    },
                }));
            },
            removeItem: (itemId: number) => {
                set((state) => ({
                    order: {
                        ...state.order,
                        items: state.order.items.filter(
                            (item) => item.id !== itemId,
                        ),
                    },
                }));
            },
            updateTotalAmount: ({
                subtotal,
                vatAmount,
                total,
                vatRate,
                serviceChargeAmount,
                serviceChargeRate,
                tipAmount,
                tipRate,
            }) => {
                set((state) => {
                    const normalize = (value: number) =>
                        Number(Number(value ?? 0).toFixed(2)).toString();
                    const resolvedVatRate =
                        vatRate ??
                        state.order.vatRate ??
                        state.order.vatRateSnapshot ??
                        0;
                    const resolvedServiceChargeRate =
                        serviceChargeRate ??
                        state.order.serviceChargeRate ??
                        state.order.serviceChargeRateSnapshot ??
                        0;
                    const resolvedTipRate =
                        tipRate ??
                        state.order.tipRate ??
                        state.order.tipRateSnapshot ??
                        0;
                    return {
                        order: {
                            ...state.order,
                            subtotal: normalize(subtotal),
                            vatAmount: normalize(vatAmount),
                            totalAmount: normalize(total),
                            vatRate: resolvedVatRate,
                            serviceChargeAmount: serviceChargeAmount
                                ? normalize(serviceChargeAmount)
                                : state.order.serviceChargeAmount,
                            serviceChargeRate: resolvedServiceChargeRate,
                            serviceChargeRateSnapshot:
                                resolvedServiceChargeRate,
                            tipAmount: tipAmount
                                ? normalize(tipAmount)
                                : state.order.tipAmount,
                            tipRate: resolvedTipRate,
                            tipRateSnapshot: resolvedTipRate,
                            vatRateSnapshot: resolvedVatRate,
                        },
                    };
                });
            },
            clearOrder: () => set({ order: initialOrder }),
            addItem: (item: Item) => {
                set((state) => ({
                    order: {
                        ...state.order,
                        items: [...state.order.items, item],
                    },
                }));
            },
            addItems: (items: Item[]) => {
                set((state) => ({
                    order: {
                        ...state.order,
                        items: [...state.order.items, ...items],
                    },
                }));
            },
            addSpecialInstructions: (
                itemId: number,
                specialInstructions: string,
            ) => {
                set((state) => ({
                    order: {
                        ...state.order,
                        items: state.order.items.map((item) =>
                            item.id === itemId
                                ? {
                                      ...item,
                                      notes: specialInstructions,
                                  }
                                : item,
                        ),
                    },
                }));
            },
        }),
        { name: 'OrderStore', enabled: true },
    ),
);

export default useOrderStore;
