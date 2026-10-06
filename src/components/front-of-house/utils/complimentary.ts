import { ScopedOrder } from '../types';

export type ComplimentaryStatus = 'NONE' | 'FULL' | 'PARTIAL';

function toMoney(value?: number | string | null) {
    const parsed = Number(value ?? 0);
    return Number.isFinite(parsed) ? parsed : 0;
}

export function getItemDisplayUnitPrice(item: {
    price?: number | string | null;
    originalPrice?: number | string | null;
}): number {
    const current = toMoney(item.price);
    const original = toMoney(item.originalPrice);
    return Math.max(original, current);
}

function reconstructItemWaiver(
    order: Pick<ScopedOrder, 'items'>,
): number {
    return (order.items ?? []).reduce((sum, item) => {
        const current = toMoney(item.price);
        const original = toMoney(item.originalPrice);
        const qty = toMoney(item.quantity) || 1;
        if (original > current) {
            return sum + (original - current) * qty;
        }
        return sum;
    }, 0);
}

function reconstructGrossFromOriginalPrices(order: ScopedOrder): {
    subtotal: number;
    vatAmount: number;
    vatRate: number;
    serviceChargeAmount: number;
    serviceChargeRate: number;
    tipAmount: number;
    tipRate: number;
    customCharges: NonNullable<ScopedOrder['customCharges']>;
    total: number;
} | null {
    const items = order.items ?? [];
    const subtotal = items.reduce(
        (sum, item) =>
            sum + getItemDisplayUnitPrice(item) * (toMoney(item.quantity) || 1),
        0,
    );
    if (subtotal <= 0.009) {
        return null;
    }

    const vatRate = toMoney(order.vatRateSnapshot ?? order.vatRate);
    const serviceChargeRate = toMoney(
        order.serviceChargeRateSnapshot ?? order.serviceChargeRate,
    );
    const tipRate = toMoney(order.tipRateSnapshot ?? order.tipRate);
    const vatAmount = (subtotal * vatRate) / 100;
    const serviceChargeAmount = (subtotal * serviceChargeRate) / 100;
    const isRestaurant =
        order.orderType === 'DINE_IN' ||
        order.orderType === 'TAKE_AWAY' ||
        order.orderType === 'DELIVERY' ||
        order.orderType === 'ROOM' ||
        order.orderType === 'FAST_FOOD';
    const tipAmount = isRestaurant ? (subtotal * tipRate) / 100 : 0;
    const customCharges = (order.customCharges ?? []).map((charge) => {
        const rate = toMoney(charge.rate);
        return {
            ...charge,
            rate,
            amount: (subtotal * rate) / 100,
        };
    });
    const customTotal = customCharges.reduce(
        (sum, charge) => sum + toMoney(charge.amount),
        0,
    );

    return {
        subtotal,
        vatAmount,
        vatRate,
        serviceChargeAmount,
        serviceChargeRate,
        tipAmount,
        tipRate,
        customCharges,
        total: subtotal + vatAmount + serviceChargeAmount + tipAmount + customTotal,
    };
}

export function isOrderVoided(order?: {
    isVoided?: boolean | null;
    status?: string | null;
    paymentStatus?: string | null;
} | null): boolean {
    if (!order) return false;
    if (order.isVoided) return true;
    const status = String(order.status ?? '').toUpperCase();
    const payment = String(order.paymentStatus ?? '')
        .toUpperCase()
        .replace(/\s+/g, '_');
    return status === 'VOIDED' || payment === 'VOIDED';
}

export function getComplimentaryStatus(
    order: Pick<ScopedOrder, 'complimentaryStatus' | 'isComplimented'> &
        Partial<Pick<ScopedOrder, 'items' | 'isVoided' | 'status' | 'paymentStatus'>>,
): ComplimentaryStatus | null {
    if (isOrderVoided(order)) {
        return null;
    }
    const status = order.complimentaryStatus;
    if (status && status !== 'NONE') {
        return status;
    }
    if (order.isComplimented) {
        return 'FULL';
    }
    const items = order.items ?? [];
    if (items.length === 0) {
        return null;
    }
    if (items.every((item) => Boolean(item.isComplimentary))) {
        return 'FULL';
    }
    if (
        items.some(
            (item) =>
                Boolean(item.isComplimentary) ||
                toMoney(item.originalPrice) > toMoney(item.price),
        )
    ) {
        return 'PARTIAL';
    }
    return null;
}

function sumCustomerPayments(
    order: Pick<ScopedOrder, 'payments'>,
): number {
    return (order.payments ?? []).reduce(
        (sum, payment) => sum + toMoney(payment.amount),
        0,
    );
}

/**
 * Complementary money breakdown for CMP-014 / CMP-015:
 * - orderValue: original bill (pre-waiver), including tax/charges when recoverable
 * - complimentary: granted waiver (items, and tax when the payable total is 0)
 * - customerPayment: sum of recorded payments
 * - balance: outstanding payable (remainingBalance, or total − payments)
 */
export function getComplimentaryAmounts(order: ScopedOrder) {
    const status = getComplimentaryStatus(order);
    if (!status) {
        return null;
    }

    const payableTotal = toMoney(order.totalPrice);
    const fromStore = toMoney(order.complimentaryAmount);
    const fromItems = reconstructItemWaiver(order);
    const gross = reconstructGrossFromOriginalPrices(order);
    const complimentaryBase = Math.max(fromStore, fromItems);
    const orderValue = Math.max(
        gross?.total ?? 0,
        complimentaryBase + payableTotal,
    );
    const complimentary = Math.max(
        complimentaryBase,
        orderValue - payableTotal,
    );
    const customerPayment = sumCustomerPayments(order);
    const balance =
        order.remainingBalance !== undefined && order.remainingBalance !== null
            ? toMoney(order.remainingBalance)
            : Math.max(payableTotal - customerPayment, 0);

    return {
        status,
        orderValue,
        complimentary,
        balance,
        customerPayment,
        payableTotal,
        bill: gross,
    };
}

/**
 * Incoming Orders Amount column:
 * - Still owing → show outstanding balance
 * - Paid after partial complimentary → show customer payment
 * - Fully complimentary → show the original order value
 */
export function getIncomingOrderDisplayAmount(order: ScopedOrder): number {
    const comp = getComplimentaryAmounts(order);
    if (!comp) {
        return toMoney(
            (order as { totalWithCustomCharges?: number }).totalWithCustomCharges ??
                order.totalPrice,
        );
    }

    // Still unpaid after complementary grant
    if (comp.balance > 0.009) {
        return comp.balance;
    }

    if (comp.status === 'FULL') {
        return comp.orderValue;
    }

    // Settled: prefer recorded payments, else post-waiver payable total
    if (comp.customerPayment > 0.009) {
        return comp.customerPayment;
    }

    if (comp.payableTotal > 0.009) {
        return comp.payableTotal;
    }

    return comp.orderValue;
}

/**
 * Fully complimentary with nothing left to collect.
 * Make Payment / split / merge should not be offered in this state.
 * If more items are added later and balance > 0, payment returns.
 */
export function isFullyComplimentaryOrder(
    order: Pick<
        ScopedOrder,
        | 'complimentaryStatus'
        | 'isComplimented'
        | 'complimentaryAmount'
        | 'remainingBalance'
        | 'totalPrice'
        | 'payments'
        | 'items'
    >,
): boolean {
    if (isOrderVoided(order)) {
        return false;
    }
    const amounts = getComplimentaryAmounts(order as ScopedOrder);
    if (amounts?.status === 'FULL' && amounts.balance <= 0) {
        return true;
    }

    const items = order.items ?? [];
    if (
        items.length > 0 &&
        items.every((item) => Boolean(item.isComplimentary))
    ) {
        const payable = Number(
            order.remainingBalance ?? order.totalPrice ?? 0,
        );
        return payable <= 0;
    }

    return false;
}

/** Whether staff should be able to open Make Payment for this order. */
export function canCollectOrderPayment(
    order: Parameters<typeof isFullyComplimentaryOrder>[0] & {
        paymentStatus?: string | null;
    },
): boolean {
    if (isFullyComplimentaryOrder(order)) {
        return false;
    }

    const status = String(order.paymentStatus ?? '')
        .toUpperCase()
        .replace(/\s+/g, '_');
    if (status === 'PAID' || status === 'COMPLEMENTED' || status === 'VOIDED') {
        return false;
    }

    return true;
}

export const complimentaryBadgeConfig = {
    FULL: {
        bg: 'bg-purple-100',
        text: 'text-purple-700',
        dot: 'bg-purple-500',
        label: 'COMPLIMENTARY',
        shortLabel: 'COMP',
    },
    PARTIAL: {
        bg: 'bg-orange-100',
        text: 'text-orange-700',
        dot: 'bg-orange-500',
        label: 'PARTIAL COMPLIMENTARY',
        shortLabel: 'PARTIAL',
    },
} as const;

export function formatOrderMoney(value: number) {
    return `₦${value.toLocaleString('en-NG', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
}
