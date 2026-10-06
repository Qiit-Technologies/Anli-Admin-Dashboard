'use server';

import api from '@/lib/axios';
import { getAuthToken } from './auth/auth-token';
import {
    InternalAccountTransaction,
    LedgerPageStats,
    PostedBill,
    CreateTransactionPayload,
    CreatePostedBillPayload,
} from '@/types/internal-accounts-ledger';

const BASE = '/city-ledger/internal-accounts';

async function authHeaders() {
    const token = await getAuthToken();
    return {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
}

function mapTransaction(raw: any): InternalAccountTransaction {
    if (!raw) return raw;
    return {
        id: String(raw.id),
        accountId: raw.account?.id
            ? String(raw.account.id)
            : String(raw.accountId ?? ''),
        dateTime: raw.dateTime ?? raw.createdAt ?? '',
        transactionId: raw.transactionId ?? '',
        type: raw.type,
        invoiceNo: raw.invoiceNo ?? '',
        sourceModule: raw.sourceModule ?? '',
        customer: raw.customer ?? '',
        debit:
            raw.debit !== null && raw.debit !== undefined
                ? Number(raw.debit)
                : null,
        credit:
            raw.credit !== null && raw.credit !== undefined
                ? Number(raw.credit)
                : null,
        runningBalance:
            raw.runningBalance !== null && raw.runningBalance !== undefined
                ? Number(raw.runningBalance)
                : null,
        description: raw.description ?? '',
        initiatedBy: raw.initiatedBy ?? '',
        approvedBy: raw.approvedBy ?? '',
        status: raw.status ?? 'Active',
    };
}

function mapPostedBill(raw: any): PostedBill {
    if (!raw) return raw;
    return {
        id: String(raw.id),
        accountId: raw.account?.id
            ? String(raw.account.id)
            : String(raw.accountId ?? ''),
        invoiceNo: raw.invoiceNo ?? '',
        sourceModule: raw.sourceModule ?? '',
        guestCustomer: raw.guestCustomer ?? '',
        roomTableNo: raw.roomTableNo ?? '',
        billDate: raw.billDate ?? '',
        postedDate: raw.postedDate ?? '',
        billAmount: Number(raw.billAmount ?? 0),
        postedBy: raw.postedBy ?? '',
        approvedBy: raw.approvedBy ?? '',
        status: raw.status ?? 'Pending',
    };
}

function mapLedgerPageStats(raw: any): LedgerPageStats {
    if (!raw) return raw;
    return {
        currentBalance: Number(raw.currentBalance ?? 0),
        currentBalanceTrend: Number(raw.currentBalanceTrend ?? 0),
        totalDebits: Number(raw.totalDebits ?? 0),
        totalDebitsTrend: Number(raw.totalDebitsTrend ?? 0),
        totalBillsPosted: Number(raw.totalBillsPosted ?? 0),
        reversedTransactions: Number(raw.reversedTransactions ?? 0),
        reversedTransactionsTrend: Number(raw.reversedTransactionsTrend ?? 0),
    };
}

// ─── Ledger Transactions ─────────────────────────────────────────────────────

export async function getAccountTransactions(
    accountId: string,
): Promise<InternalAccountTransaction[]> {
    try {
        const response = await api.get<any[]>(
            `${BASE}/${accountId}/transactions`,
            { headers: await authHeaders() },
        );
        return (response.data ?? []).map(mapTransaction);
    } catch {
        return [];
    }
}

// ─── Posted Bills ─────────────────────────────────────────────────────────────

export async function getPostedBills(accountId: string): Promise<PostedBill[]> {
    try {
        const response = await api.get<any[]>(
            `${BASE}/${accountId}/posted-bills`,
            { headers: await authHeaders() },
        );
        return (response.data ?? []).map(mapPostedBill);
    } catch {
        return [];
    }
}

// ─── Ledger Page Stats ────────────────────────────────────────────────────────

export async function getLedgerPageStats(
    accountId: string,
): Promise<LedgerPageStats> {
    const empty: LedgerPageStats = {
        currentBalance: 0,
        currentBalanceTrend: 0,
        totalDebits: 0,
        totalDebitsTrend: 0,
        totalBillsPosted: 0,
        reversedTransactions: 0,
        reversedTransactionsTrend: 0,
    };

    try {
        const response = await api.get<any>(
            `${BASE}/${accountId}/ledger-stats`,
            { headers: await authHeaders() },
        );
        return response.data ? mapLedgerPageStats(response.data) : empty;
    } catch {
        return empty;
    }
}

// ─── Request Bill Reversal ────────────────────────────────────────────────────

export async function requestBillReversal(
    billId: string,
    reason: string,
): Promise<{ success?: boolean; error?: string }> {
    try {
        if (!reason.trim()) {
            return { error: 'Reason for reversal is required.' };
        }

        await api.post(
            `${BASE}/posted-bills/${billId}/reversal`,
            { reason },
            { headers: await authHeaders() },
        );

        return { success: true };
    } catch (err: any) {
        const message =
            err?.response?.data?.message ??
            err?.message ??
            'An unexpected error occurred.';
        return { error: message };
    }
}

export async function createLedgerTransaction(
    accountId: string,
    payload: CreateTransactionPayload,
): Promise<{ transaction?: InternalAccountTransaction; error?: string }> {
    try {
        const response = await api.post<InternalAccountTransaction>(
            `${BASE}/${accountId}/transactions`,
            payload,
            { headers: await authHeaders() },
        );
        return { transaction: response.data };
    } catch (err: any) {
        const message =
            err?.response?.data?.message ??
            err?.message ??
            'An unexpected error occurred.';
        return { error: message };
    }
}

export async function postBillToInternalAccount(
    accountId: string,
    payload: CreatePostedBillPayload,
): Promise<{ bill?: PostedBill; error?: string }> {
    try {
        const response = await api.post<PostedBill>(
            `${BASE}/${accountId}/posted-bills`,
            payload,
            { headers: await authHeaders() },
        );
        return { bill: mapPostedBill(response.data) };
    } catch (err: any) {
        const message =
            err?.response?.data?.message ??
            err?.message ??
            'An unexpected error occurred.';
        return { error: message };
    }
}

export type PendingInternalAccountBill = PostedBill & {
    accountId: string;
    accountCode: string;
    accountName: string;
    approvalType?: 'bill' | 'reversal';
};

export async function getPendingInternalAccountBillApprovals(): Promise<
    PendingInternalAccountBill[]
> {
    try {
        const response = await api.get<any[]>(
            `${BASE}/pending-bill-approvals`,
            { headers: await authHeaders() },
        );
        return (response.data ?? []).map((raw) => ({
            ...mapPostedBill(raw),
            accountId: String(raw.accountId ?? raw.account?.id ?? ''),
            accountCode: raw.accountCode ?? raw.account?.accountCode ?? '',
            accountName: raw.accountName ?? raw.account?.accountName ?? '',
            approvalType:
                raw.approvalType === 'reversal' ||
                raw.status === 'Reversal Requested'
                    ? 'reversal'
                    : 'bill',
        }));
    } catch {
        return [];
    }
}

async function mapReferenceBillStatus(raw: any): Promise<{
    status: string | null;
    billId: string | null;
    invoiceNo: string | null;
    billAmount: number;
    accountCode: string | null;
} | null> {
    if (!raw) return null;
    return {
        status: raw.status ?? null,
        billId: raw.billId != null ? String(raw.billId) : null,
        invoiceNo: raw.invoiceNo ?? null,
        billAmount: Number(raw.billAmount ?? 0),
        accountCode: raw.accountCode ?? null,
    };
}

export async function getGuestInternalAccountBillStatus(
    guestId: number,
): Promise<{
    status: string | null;
    billId: string | null;
    invoiceNo: string | null;
    billAmount: number;
    accountCode: string | null;
} | null> {
    try {
        const response = await api.get(
            `${BASE}/guest-bill-status/${guestId}`,
            { headers: await authHeaders() },
        );
        return mapReferenceBillStatus(response.data);
    } catch {
        return null;
    }
}

export async function getOrderInternalAccountBillStatus(
    orderId: number,
): Promise<{
    status: string | null;
    billId: string | null;
    invoiceNo: string | null;
    billAmount: number;
    accountCode: string | null;
} | null> {
    try {
        const response = await api.get(
            `${BASE}/order-bill-status/${orderId}`,
            { headers: await authHeaders() },
        );
        return mapReferenceBillStatus(response.data);
    } catch {
        return null;
    }
}

export async function getPostedBillStatus(
    billId: string,
): Promise<{
    id: string;
    invoiceNo: string;
    status: string;
    billAmount: number;
    accountId: string;
} | null> {
    try {
        const response = await api.get(
            `${BASE}/posted-bills/${billId}/status`,
            { headers: await authHeaders() },
        );
        const raw = response.data;
        if (!raw) return null;
        return {
            id: String(raw.id),
            invoiceNo: raw.invoiceNo ?? '',
            status: raw.status ?? 'Pending',
            billAmount: Number(raw.billAmount ?? 0),
            accountId: String(raw.accountId ?? ''),
        };
    } catch {
        return null;
    }
}

export async function approveInternalAccountBill(
    billId: string,
): Promise<{ bill?: PostedBill; error?: string }> {
    try {
        const response = await api.post(
            `${BASE}/posted-bills/${billId}/approve`,
            {},
            { headers: await authHeaders() },
        );
        return { bill: mapPostedBill(response.data) };
    } catch (err: any) {
        const message =
            err?.response?.data?.message ??
            err?.message ??
            'An unexpected error occurred.';
        return { error: message };
    }
}

export async function rejectInternalAccountBill(
    billId: string,
): Promise<{ bill?: PostedBill; error?: string }> {
    try {
        const response = await api.post(
            `${BASE}/posted-bills/${billId}/reject`,
            {},
            { headers: await authHeaders() },
        );
        return { bill: mapPostedBill(response.data) };
    } catch (err: any) {
        const message =
            err?.response?.data?.message ??
            err?.message ??
            'An unexpected error occurred.';
        return { error: message };
    }
}
