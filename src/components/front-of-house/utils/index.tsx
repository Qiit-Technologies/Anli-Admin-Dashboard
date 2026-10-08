import { OrganizationDetail } from '@/hooks/useHotel';
import { getPrintStation } from '@/lib/print-item-type';
import { Order } from '@/store/useOrder';
import { ScopedOrder } from '../types';

/** Normalizes API payment status (e.g. ADDED_TO_BILL, Added to bill). */
export function isPaymentStatusAddedToBill(
    status: string | undefined | null,
): boolean {
    if (status == null || status === '') return false;
    const n = String(status)
        .toUpperCase()
        .replace(/\s+/g, '_')
        .replace(/-/g, '_');
    return n === 'ADDED_TO_BILL';
}

/** True when an order's bill was settled from the Front Office folio. */
export function isPaymentStatusBillSettledFromFrontDesk(
    status: string | undefined | null,
): boolean {
    if (status == null || status === '') return false;
    const n = String(status)
        .toUpperCase()
        .replace(/\s+/g, '_')
        .replace(/-/g, '_');
    return n === 'BILL_SETTLED_FROM_FRONT_DESK';
}

/** True when an order is fully settled (paid at restaurant, complemented,
 * or settled from the Front Office guest folio). */
export function isPaymentStatusPaidOrSettled(
    status: string | undefined | null,
): boolean {
    return (
        isPaymentStatusAddedToBill(status) === false &&
        (isPaymentStatusBillSettledFromFrontDesk(status) ||
            ['PAID', 'COMPLEMENTED'].includes(
                String(status ?? '')
                    .toUpperCase()
                    .replace(/\s+/g, '_')
                    .replace(/-/g, '_'),
            ))
    );
}

// export const handlePrintOrder = (order: Order, hotel?: OrganizationDetail) => {
//     const printWindow = window.open('', '_blank');
//     if (!printWindow) return;

//     const receiptContent = thermalOrderTemplate(order, hotel).toString();

//     printWindow.document.write(receiptContent);
//     printWindow.document.close();
//     printWindow.focus();

//     printWindow.onload = function () {
//         printWindow.print();
//         printWindow.onafterprint = function () {
//             printWindow.close();
//         };
//     };

//     setTimeout(() => {
//         if (printWindow) {
//             printWindow.print();
//             setTimeout(() => printWindow.close(), 500);
//         }
//     }, 1000);
// };

export const handlePrintOrder = (order: Order, hotel?: OrganizationDetail) => {
    const receiptData = encodeURIComponent(
        JSON.stringify({
            orderId: order.id,
            items: order.items,
            total: order.totalAmount,
            hotel: hotel?.name,
        }),
    );

    window.location.href = `print://receipt?data=${receiptData}`;
};

export const getFilteredItems = (
    items: any[],
    selectedCategory: string,
    selectedSubCategory: string,
) => {
    if (!items || !items.length) return [];

    const categoryItems = items.filter(
        (item) => item.category && item.category.id === selectedCategory,
    );

    if (!selectedSubCategory) {
        return categoryItems;
    }

    const subcategoryItems = categoryItems.filter(
        (item) =>
            item.subCategory && item.subCategory.id === selectedSubCategory,
    );

    const noSubcategoryItems = categoryItems.filter(
        (item) =>
            !item.subCategory ||
            item.subCategory === null ||
            item.subCategory === undefined,
    );

    return [...subcategoryItems, ...noSubcategoryItems];
};

type OrderItemsByType = {
    foodItems: ScopedOrder['items'][0][];
    drinkItems: ScopedOrder['items'][0][];
};

export function splitOrderItemsByType(
    items: ScopedOrder['items'],
): OrderItemsByType {
    const foodItems: ScopedOrder['items'][0][] = [];
    const drinkItems: ScopedOrder['items'][0][] = [];

    items.forEach((item) => {
        const station = getPrintStation(item as any);
        if (station === 'kot') {
            foodItems.push(item);
        } else if (station === 'bot') {
            drinkItems.push(item);
        }
    });

    return { foodItems, drinkItems };
}

const toNumber = (value?: number | string | null) => {
    if (typeof value === 'string') {
        const sanitized = value.replace(/,/g, '');
        const parsed = Number(sanitized);
        return Number.isFinite(parsed) ? parsed : 0;
    }
    const parsed = Number(value ?? 0);
    return Number.isFinite(parsed) ? parsed : 0;
};

type OrderLikeTotals = {
    subtotal?: number | string | null;
    totalPrice?: number | string | null;
    totalAmount?: number | string | null;
    vatAmount?: number | string | null;
    vatRateSnapshot?: number | string | null;
    vatRate?: number | string | null;
    serviceChargeAmount?: number | string | null;
    serviceChargeRateSnapshot?: number | string | null;
    serviceChargeRate?: number | string | null;
    tipAmount?: number | string | null;
    tipRateSnapshot?: number | string | null;
    tipRate?: number | string | null;
    customCharges?: Array<{
        id: number;
        name: string;
        rate: number;
        amount: number;
    }> | null;
    totalCustomChargesAmount?: number | string | null;
    totalWithCustomCharges?: number | string | null;
    orderType?: string;
    isVoided?: boolean;
    status?: string;
    paymentStatus?: string;
    hotel?: {
        restaurantVatRate?: number | string | null;
        vatRate?: number | string | null;
        restaurantServiceChargeRate?: number | string | null;
        serviceChargeRate?: number | string | null;
        restaurantTipRate?: number | string | null;
        tipRate?: number | string | null;
        restaurantVatInclusive?: boolean;
    };
};

export const deriveOrderTotals = (order: OrderLikeTotals = {}) => {
    const isVoided =
        Boolean(order.isVoided) ||
        String(order.status ?? '').toUpperCase() === 'VOIDED' ||
        String(order.paymentStatus ?? '')
            .toUpperCase()
            .replace(/\s+/g, '_') === 'VOIDED';

    if (isVoided) {
        return {
            subtotal: 0,
            vatAmount: 0,
            serviceChargeAmount: 0,
            tipAmount: 0,
            customChargesAmount: 0,
            total: 0,
            vatRate: 0,
            serviceChargeRate: 0,
            tipRate: 0,
        };
    }

    const explicitSubtotal =
        order.subtotal !== undefined && order.subtotal !== null
            ? toNumber(order.subtotal)
            : undefined;
    const explicitVat =
        order.vatAmount !== undefined && order.vatAmount !== null
            ? toNumber(order.vatAmount)
            : undefined;
    const explicitServiceCharge =
        order.serviceChargeAmount !== undefined &&
        order.serviceChargeAmount !== null
            ? toNumber(order.serviceChargeAmount)
            : undefined;
    const explicitTip =
        order.tipAmount !== undefined && order.tipAmount !== null
            ? toNumber(order.tipAmount)
            : undefined;
    const explicitCustomCharges =
        order.totalCustomChargesAmount !== undefined &&
        order.totalCustomChargesAmount !== null
            ? toNumber(order.totalCustomChargesAmount)
            : undefined;

    // Use totalWithCustomCharges if available, otherwise fall back to totalPrice
    let total = toNumber(
        (order as any).totalWithCustomCharges ??
            order.totalPrice ??
            order.totalAmount,
    );
    let subtotal = explicitSubtotal;
    let vatAmount = explicitVat;
    let serviceChargeAmount = explicitServiceCharge;
    let tipAmount = explicitTip;
    let customChargesAmount = explicitCustomCharges;

    if (
        total === 0 &&
        subtotal !== undefined &&
        vatAmount !== undefined &&
        serviceChargeAmount !== undefined &&
        tipAmount !== undefined
    ) {
        const baseTotal = toNumber(
            subtotal + vatAmount + serviceChargeAmount + tipAmount,
        );
        total = toNumber(baseTotal + (customChargesAmount ?? 0));
    }

    if (subtotal === undefined) {
        const chargesTotal =
            (vatAmount ?? 0) +
            (serviceChargeAmount ?? 0) +
            (tipAmount ?? 0) +
            (customChargesAmount ?? 0);
        if (chargesTotal > 0) {
            subtotal = Math.max(total - chargesTotal, 0);
        } else if (vatAmount !== undefined) {
            subtotal = Math.max(total - vatAmount, 0);
        } else {
            subtotal = total;
        }
    }

    if (vatAmount === undefined) {
        const otherCharges =
            (serviceChargeAmount ?? 0) +
            (tipAmount ?? 0) +
            (customChargesAmount ?? 0);
        if (otherCharges > 0) {
            vatAmount = Math.max(total - subtotal - otherCharges, 0);
        } else {
            vatAmount = Math.max(total - subtotal, 0);
        }
    }

    if (serviceChargeAmount === undefined) {
        const otherCharges = (tipAmount ?? 0) + (customChargesAmount ?? 0);
        if (otherCharges > 0) {
            serviceChargeAmount = Math.max(
                total - subtotal - vatAmount - otherCharges,
                0,
            );
        } else {
            serviceChargeAmount = Math.max(total - subtotal - vatAmount, 0);
        }
    }

    if (tipAmount === undefined) {
        const customCharges = customChargesAmount ?? 0;
        tipAmount = Math.max(
            total - subtotal - vatAmount - serviceChargeAmount - customCharges,
            0,
        );
    }

    if (customChargesAmount === undefined) {
        customChargesAmount = Math.max(
            total - subtotal - vatAmount - serviceChargeAmount - tipAmount,
            0,
        );
    }

    const vatRate = toNumber(
        order.vatRateSnapshot ?? order.vatRate ?? order.hotel?.restaurantVatRate ?? order.hotel?.vatRate ?? 0,
    );
    const serviceChargeRate = toNumber(
        order.serviceChargeRateSnapshot ??
            order.serviceChargeRate ??
            order.hotel?.restaurantServiceChargeRate ??
            order.hotel?.serviceChargeRate ??
            0,
    );
    const tipRate = toNumber(
        order.tipRateSnapshot ?? order.tipRate ?? order.hotel?.restaurantTipRate ?? order.hotel?.tipRate ?? 0,
    );

    const isRestaurantOrder =
        order.orderType === 'DINE_IN' ||
        order.orderType === 'TAKE_AWAY' ||
        order.orderType === 'DELIVERY';

    return {
        subtotal: toNumber(subtotal),
        vatAmount: toNumber(vatAmount),
        serviceChargeAmount: toNumber(serviceChargeAmount),
        tipAmount: isRestaurantOrder ? toNumber(tipAmount) : 0,
        customChargesAmount: toNumber(customChargesAmount ?? 0),
        total: Math.max(total, 0),
        vatRate,
        serviceChargeRate,
        tipRate: isRestaurantOrder ? tipRate : 0,
    };
};
