import { getInternalAccounts } from '@/app/actions/internal-accounts';
import { postBillToInternalAccount } from '@/app/actions/internal-accounts-ledger';
import { CreatePostedBillPayload } from '@/types/internal-accounts-ledger';
import { mutate } from 'swr';
import { isInternalAccountPaymentMethod } from './settlement';

/** Spec source modules for Posted Bills / All Transactions. */
export const IA_SOURCE_MODULES = {
    RESERVATIONS: 'Reservations',
    CHECK_INS: 'Check-ins',
    GUEST_BILLING: 'Guest Billing',
    ROOM_UPGRADE: 'Room Upgrade',
    RESTAURANT_ORDERS: 'Restaurant Orders',
    ROOM_SERVICE: 'Room Service',
    TABLE_SERVICE: 'Table Service',
    FAST_FOOD: 'Fast Food',
    HOME_DELIVERY: 'Home Delivery',
} as const;

export type InternalAccountSourceModule =
    (typeof IA_SOURCE_MODULES)[keyof typeof IA_SOURCE_MODULES];

export function resolveSourceModuleFromOrderType(
    orderType?: string | null,
): InternalAccountSourceModule {
    switch (String(orderType ?? '').toUpperCase()) {
        case 'ROOM':
            return IA_SOURCE_MODULES.ROOM_SERVICE;
        case 'FAST_FOOD':
            return IA_SOURCE_MODULES.FAST_FOOD;
        case 'DELIVERY':
            return IA_SOURCE_MODULES.HOME_DELIVERY;
        case 'DINE_IN':
            return IA_SOURCE_MODULES.TABLE_SERVICE;
        case 'TAKE_AWAY':
            return IA_SOURCE_MODULES.RESTAURANT_ORDERS;
        default:
            return IA_SOURCE_MODULES.RESTAURANT_ORDERS;
    }
}

export type PostInternalAccountBillInput = {
    paymentMethod?: string | null;
    receivingAccount?: string | null;
    billAmount: number;
    sourceModule: string;
    guestCustomer: string;
    roomTableNo?: string | null;
    postedBy: string;
    /** Used to build a stable-enough invoice reference. */
    referenceId?: string | number | null;
    billDate?: string | Date;
};

/** Prefer the order guest name; never invent a fake person name. */
export function resolveOrderGuestCustomerName(
    guestName?: string | null,
): string {
    const name = String(guestName ?? '').trim();
    return name || 'Walk-in Customer';
}

export function resolveOrderRoomTableNo(order: {
    room?: { roomNumber?: string | number | null } | null;
    table?: { number?: string | number | null } | null;
}): string | undefined {
    if (order.room?.roomNumber != null && order.room.roomNumber !== '') {
        return `Room ${order.room.roomNumber}`;
    }
    if (order.table?.number != null && order.table.number !== '') {
        return `Table ${order.table.number}`;
    }
    return undefined;
}

export type PendingIaPaymentRequest = {
    orderId: number;
    billId: string;
    accountId: string;
    invoiceNo: string;
    receivingAccount: string;
    payments: Array<{
        paymentMethod: string;
        receivingAccount: string;
        amount: number;
    }>;
};

const pendingIaStorageKey = (orderId: number) =>
    `ia-pending-payment-order-${orderId}`;

export function savePendingIaPaymentRequest(
    payload: PendingIaPaymentRequest,
): void {
    if (typeof window === 'undefined') return;
    sessionStorage.setItem(
        pendingIaStorageKey(payload.orderId),
        JSON.stringify(payload),
    );
}

export function loadPendingIaPaymentRequest(
    orderId: number,
): PendingIaPaymentRequest | null {
    if (typeof window === 'undefined') return null;
    try {
        const raw = sessionStorage.getItem(pendingIaStorageKey(orderId));
        if (!raw) return null;
        const parsed = JSON.parse(raw) as PendingIaPaymentRequest;
        if (!parsed?.billId || !parsed?.accountId) return null;
        return parsed;
    } catch {
        return null;
    }
}

export function clearPendingIaPaymentRequest(orderId: number): void {
    if (typeof window === 'undefined') return;
    sessionStorage.removeItem(pendingIaStorageKey(orderId));
}

function buildInvoiceNo(referenceId?: string | number | null): string {
    const ref = referenceId != null && referenceId !== '' ? String(referenceId) : 'X';
    return `IA-${ref}-${Date.now()}`;
}

async function resolveAccountId(
    accountCodeOrId: string,
): Promise<string | null> {
    const accounts = await getInternalAccounts();
    if (!Array.isArray(accounts)) return null;

    const match = accounts.find(
        (account) =>
            account.accountCode === accountCodeOrId ||
            account.id === accountCodeOrId ||
            String(account.id) === accountCodeOrId,
    );

    return match?.id ?? null;
}

export async function revalidateInternalAccountLedger(
    accountId: string,
): Promise<void> {
    await Promise.all([
        mutate('/internal-accounts'),
        mutate('/internal-accounts/stats'),
        mutate(`/internal-accounts/${accountId}`),
        mutate(`/internal-accounts/${accountId}/posted-bills`),
        mutate(`/internal-accounts/${accountId}/transactions`),
        mutate(`/internal-accounts/${accountId}/ledger-stats`),
    ]);
}

/**
 * Posts a bill to an Internal Account when paymentMethod is internal_account.
 * Creates Posted Bill + ledger debit + balance update (IA-021 / 022 / 023).
 * No-ops for non-IA payments.
 */
export async function maybePostBillToInternalAccount(
    input: PostInternalAccountBillInput,
): Promise<{
    error?: string;
    skipped?: boolean;
    pendingApproval?: boolean;
    billId?: string;
    accountId?: string;
    invoiceNo?: string;
}> {
    if (!isInternalAccountPaymentMethod(input.paymentMethod)) {
        return { skipped: true };
    }

    const accountCode = input.receivingAccount?.trim();
    if (!accountCode) {
        return { error: 'Internal account is required for this payment.' };
    }

    const billAmount = Number(input.billAmount);
    if (!Number.isFinite(billAmount) || billAmount <= 0) {
        return { skipped: true };
    }

    const accountId = await resolveAccountId(accountCode);
    if (!accountId) {
        return { error: `Internal account "${accountCode}" was not found.` };
    }

    const billDate =
        input.billDate instanceof Date
            ? input.billDate.toISOString()
            : input.billDate || new Date().toISOString();

    const invoiceNo = buildInvoiceNo(input.referenceId ?? accountCode);
    const payload: CreatePostedBillPayload = {
        invoiceNo,
        sourceModule: input.sourceModule,
        guestCustomer: resolveOrderGuestCustomerName(input.guestCustomer),
        roomTableNo: input.roomTableNo?.trim() || undefined,
        billDate,
        billAmount,
        postedBy: input.postedBy.trim() || 'Staff',
    };

    const result = await postBillToInternalAccount(accountId, payload);
    if (result.error) {
        return { error: result.error };
    }

    await revalidateInternalAccountLedger(accountId);
    return {
        pendingApproval: true,
        billId: result.bill?.id,
        accountId,
        invoiceNo: result.bill?.invoiceNo || invoiceNo,
    };
}

/**
 * Posts each Internal Account line from a split payment.
 */
export async function maybePostSplitBillsToInternalAccount(params: {
    payments: Array<{
        paymentMethod?: string | null;
        receivingAccount?: string | null;
        amount: number;
    }>;
    sourceModule: string;
    guestCustomer: string;
    roomTableNo?: string | null;
    postedBy: string;
    referenceId?: string | number | null;
}): Promise<{
    error?: string;
    bills?: Array<{ billId?: string; accountId?: string; invoiceNo?: string }>;
}> {
    const bills: Array<{
        billId?: string;
        accountId?: string;
        invoiceNo?: string;
    }> = [];

    for (const payment of params.payments) {
        const result = await maybePostBillToInternalAccount({
            paymentMethod: payment.paymentMethod,
            receivingAccount: payment.receivingAccount,
            billAmount: payment.amount,
            sourceModule: params.sourceModule,
            guestCustomer: params.guestCustomer,
            roomTableNo: params.roomTableNo,
            postedBy: params.postedBy,
            referenceId: params.referenceId,
        });

        if (result.error) {
            return { error: result.error, bills };
        }

        if (!result.skipped) {
            bills.push({
                billId: result.billId,
                accountId: result.accountId,
                invoiceNo: result.invoiceNo,
            });
        }
    }

    return { bills };
}
