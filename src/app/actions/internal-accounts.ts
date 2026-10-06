'use server';

import api from '@/lib/axios';
import { getAuthToken } from './auth/auth-token';
import {
    CreateInternalAccountPayload,
    InternalAccount,
    InternalAccountStats,
} from '@/types/internal-accounts';

const BASE = '/city-ledger/internal-accounts';

async function authHeaders() {
    const token = await getAuthToken();
    return {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
}

function mapAccount(raw: any): InternalAccount | null {
    if (!raw || raw.id === undefined || raw.id === null) {
        return null;
    }

    return {
        id: String(raw.id),
        accountCode: raw.accountCode ?? '',
        accountName: raw.accountName ?? '',
        accountType: raw.accountType ?? '',
        owner: raw.owner ?? '',
        contactEmail: raw.contactEmail ?? '',
        contactPhone: raw.contactPhone ?? '',
        approvalRequired: Boolean(raw.approvalRequired),
        referenceNumber: raw.referenceNumber ?? undefined,
        description: raw.description ?? undefined,
        fundingSourceNote: raw.fundingSourceNote ?? undefined,
        status: raw.status ?? 'Active',
        dateCreated: raw.dateCreated ?? raw.createdAt ?? '',
        lastTransaction: raw.lastTransaction ?? raw.lastTransactionAt ?? null,
        responsiblePerson: raw.responsiblePerson ?? undefined,
        defaultApprover: raw.defaultApprover ?? undefined,
        openingBalance: Number(raw.openingBalance ?? 0),
        currentBalance: Number(raw.currentBalance ?? 0),
        totalFundingAdded: Number(raw.totalFundingAdded ?? 0),
        totalBillsPosted: Number(raw.totalBillsPosted ?? 0),
        reversedTransactions: Number(raw.reversedTransactions ?? 0),
        pendingApproval: Number(raw.pendingApproval ?? 0),
    };
}

// ─── List ───────────────────────────────────────────────────────────────────

export async function getInternalAccounts(): Promise<InternalAccount[]> {
    // Full list first so the admin/FO table gets balances, owner, and
    // last transaction. Cashiers without list access fall through to the
    // lightweight payment-options endpoint (id/code/name only).
    try {
        const response = await api.get<any[]>(BASE, {
            headers: await authHeaders(),
        });
        if (Array.isArray(response.data)) {
            return response.data
                .map(mapAccount)
                .filter(
                    (account): account is InternalAccount => account !== null,
                );
        }
    } catch {
        // cashiers / payment dropdowns
    }

    try {
        const response = await api.get<any[]>(`${BASE}/payment-options`, {
            headers: await authHeaders(),
        });
        return (response.data ?? [])
            .map(mapAccount)
            .filter((account): account is InternalAccount => account !== null);
    } catch {
        return [];
    }
}

// ─── Stats ──────────────────────────────────────────────────────────────────

export async function getInternalAccountStats(): Promise<InternalAccountStats> {
    try {
        const response = await api.get<InternalAccountStats>(`${BASE}/stats`, {
            headers: await authHeaders(),
        });
        return (
            response.data ?? {
                totalAccounts: 0,
                active: 0,
                positiveBalance: 0,
                negativeBalance: 0,
            }
        );
    } catch {
        return {
            totalAccounts: 0,
            active: 0,
            positiveBalance: 0,
            negativeBalance: 0,
        };
    }
}

// ─── Single ─────────────────────────────────────────────────────────────────

export async function getInternalAccountById(
    id: string,
): Promise<InternalAccount | null> {
    try {
        const response = await api.get<any>(`${BASE}/${id}`, {
            headers: await authHeaders(),
        });
        return response.data ? mapAccount(response.data) : null;
    } catch {
        return null;
    }
}

// ─── Next Code ───────────────────────────────────────────────────────────────

export async function getNextAccountCode(): Promise<string> {
    try {
        const response = await api.get<{ accountCode: string }>(
            `${BASE}/next-code`,
            { headers: await authHeaders() },
        );
        return response.data?.accountCode ?? 'IA-0001';
    } catch {
        return 'IA-0001';
    }
}

// ─── Create ──────────────────────────────────────────────────────────────────

export async function createInternalAccount(
    payload: CreateInternalAccountPayload,
): Promise<{ account?: InternalAccount; error?: string }> {
    try {
        const response = await api.post<any>(BASE, payload, {
            headers: await authHeaders(),
        });

        if (response.status !== 200 && response.status !== 201) {
            return {
                error:
                    (response.data as any)?.message ??
                    'Failed to create internal account.',
            };
        }

        return { account: mapAccount(response.data) };
    } catch (err: any) {
        const message =
            err?.response?.data?.message ??
            err?.message ??
            'An unexpected error occurred.';
        return { error: message };
    }
}

// ─── Close ───────────────────────────────────────────────────────────────────

export async function closeInternalAccount(
    id: string,
): Promise<{ account?: InternalAccount; error?: string }> {
    try {
        const response = await api.patch<any>(
            `${BASE}/${id}/close`,
            {},
            { headers: await authHeaders() },
        );

        if (response.status !== 200) {
            return {
                error:
                    (response.data as any)?.message ??
                    'Failed to close account.',
            };
        }

        return { account: mapAccount(response.data) };
    } catch (err: any) {
        const message =
            err?.response?.data?.message ??
            err?.message ??
            'An unexpected error occurred.';
        return { error: message };
    }
}

export async function updateInternalAccount(
    id: string,
    payload: Partial<CreateInternalAccountPayload>,
): Promise<{ account?: InternalAccount; error?: string }> {
    try {
        const response = await api.patch<any>(`${BASE}/${id}`, payload, {
            headers: await authHeaders(),
        });

        if (response.status !== 200) {
            return {
                error:
                    (response.data as any)?.message ??
                    'Failed to update internal account.',
            };
        }

        return { account: mapAccount(response.data) };
    } catch (err: any) {
        const message =
            err?.response?.data?.message ??
            err?.message ??
            'An unexpected error occurred.';
        return { error: message };
    }
}
