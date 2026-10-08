/**
 * Helpers for detecting and displaying Internal Account settlement on
 * reservations / guests (IA-024, IA-026, IA-031).
 */

export function isInternalAccountPaymentMethod(
    paymentMethod: string | null | undefined,
): boolean {
    if (!paymentMethod) return false;
    const normalized = paymentMethod.toLowerCase().replace(/[\s-]+/g, '_');
    return (
        normalized === 'internal_account' ||
        normalized === 'internalaccount' ||
        normalized.includes('internal_account')
    );
}

/** True when the reservation was (intended to be) settled via an Internal Account. */
export function hasInternalAccountSettlement(reservation: {
    paymentMethod?: string | null;
    receivingAccount?: string | null;
    settlementPaymentMethod?: string | null;
    settlementReceivingAccount?: string | null;
}): boolean {
    const method =
        reservation.settlementPaymentMethod ?? reservation.paymentMethod;
    const account =
        reservation.settlementReceivingAccount ?? reservation.receivingAccount;
    return isInternalAccountPaymentMethod(method) && Boolean(account);
}

export type GuestIaBillStatus =
    | 'Pending'
    | 'Approved'
    | 'Rejected'
    | 'Reversal Requested'
    | 'Reversed'
    | null;

/** IA settlement is complete only after the posted bill is approved. */
export function isInternalAccountSettlementApproved(
    status: GuestIaBillStatus | string | null | undefined,
): boolean {
    return String(status ?? '') === 'Approved';
}

export function isInternalAccountSettlementPending(
    status: GuestIaBillStatus | string | null | undefined,
): boolean {
    return String(status ?? '') === 'Pending';
}

export function isInternalAccountSettlementRejected(
    status: GuestIaBillStatus | string | null | undefined,
): boolean {
    return String(status ?? '') === 'Rejected';
}

export function isInternalAccountSettlementReversed(
    status: GuestIaBillStatus | string | null | undefined,
): boolean {
    return String(status ?? '') === 'Reversed';
}

/**
 * IA-031: Amount still due AFTER treating the original IA-settled reservation
 * as paid. Only unpaid services/orders (post-settlement charges) remain.
 */
export function getAdditionalChargesAfterInternalAccountSettlement(breakdown: {
    totalDue?: number;
    reservationBalance?: number;
    unpaidServices?: Array<{ amountPaid?: number }>;
    unpaidOrders?: Array<{ totalPrice?: number }>;
} | null): number {
    if (!breakdown) return 0;

    const servicesTotal = (breakdown.unpaidServices ?? []).reduce(
        (sum, s) => sum + Number(s.amountPaid || 0),
        0,
    );
    const ordersTotal = (breakdown.unpaidOrders ?? []).reduce(
        (sum, o) => sum + Number(o.totalPrice || 0),
        0,
    );
    const extras = servicesTotal + ordersTotal;
    if (extras > 0) return Math.max(0, extras);

    // Fallback when line items missing: strip reservation balance from totalDue
    const due = Number(breakdown.totalDue ?? 0);
    const reservationBalance = Number(breakdown.reservationBalance ?? 0);
    return Math.max(0, due - reservationBalance);
}

export function getInternalAccountSettlementCode(reservation: {
    receivingAccount?: string | null;
    settlementReceivingAccount?: string | null;
}): string | null {
    const code =
        reservation.settlementReceivingAccount ?? reservation.receivingAccount;
    return code ? String(code) : null;
}

/** Order-level IA settlement (order method or any payment line). */
export function getOrderInternalAccountCode(order: {
    paymentMethod?: string | null;
    receivingAccount?: string | null;
    payments?: Array<{
        paymentMethod?: string | null;
        receivingAccount?: string | null;
    }> | null;
}): string | null {
    if (
        isInternalAccountPaymentMethod(order.paymentMethod) &&
        order.receivingAccount
    ) {
        return String(order.receivingAccount);
    }

    const iaPayment = (order.payments ?? []).find(
        (payment) =>
            isInternalAccountPaymentMethod(payment.paymentMethod) &&
            payment.receivingAccount,
    );

    return iaPayment?.receivingAccount
        ? String(iaPayment.receivingAccount)
        : null;
}

export function hasOrderInternalAccountSettlement(order: {
    paymentMethod?: string | null;
    receivingAccount?: string | null;
    payments?: Array<{
        paymentMethod?: string | null;
        receivingAccount?: string | null;
    }> | null;
}): boolean {
    return Boolean(getOrderInternalAccountCode(order));
}
