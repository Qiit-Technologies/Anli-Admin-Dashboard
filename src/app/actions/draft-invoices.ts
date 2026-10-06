'use server';

import api from '@/lib/axios';
import type {
    DraftInvoice,
    DraftInvoiceAuditAction,
    DraftInvoiceAuditEntry,
    DraftInvoiceLineItem,
    DraftInvoiceListResponse,
    DraftInvoicePricing,
} from '@/types/draft-invoice';
import { getAuthToken } from './auth/auth-token';

export interface CreateDraftInvoiceInput {
    guestName: string;
    guestEmail?: string;
    guestPhone?: string;
    checkInDate: string;
    checkOutDate: string;
    lineItems: DraftInvoiceLineItem[];
    pricing: DraftInvoicePricing;
    payload: Record<string, unknown>;
    bankAccountId?: number;
}

export type UpdateDraftInvoiceInput = Partial<CreateDraftInvoiceInput>;

async function authHeaders() {
    const authToken = await getAuthToken();
    if (!authToken) {
        throw new Error('Authentication token not found.');
    }
    return {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
    };
}

function extractApiError(error: unknown, fallback: string): string {
    const response = (
        error as {
            response?: {
                status?: number;
                data?: { message?: string | string[] };
            };
        }
    )?.response;
    const message = response?.data?.message;

    if (Array.isArray(message) && message.length > 0) {
        return message.join(', ');
    }
    if (typeof message === 'string' && message.trim()) {
        return message;
    }
    if (response?.status === 500) {
        return 'Server error while saving the invoice. If this persists on production, confirm draft-invoice database migrations have been applied.';
    }
    return fallback;
}

export async function createDraftInvoice(
    input: CreateDraftInvoiceInput,
): Promise<{ data?: DraftInvoice; error?: string }> {
    try {
        const response = await api.post('/draft-invoices', input, {
            headers: await authHeaders(),
        });
        return { data: response.data };
    } catch (error: unknown) {
        return {
            error: extractApiError(error, 'Failed to create draft invoice.'),
        };
    }
}

export async function createDraftInvoiceBatch(
    inputs: CreateDraftInvoiceInput[],
): Promise<{ data?: DraftInvoice[]; error?: string }> {
    try {
        const response = await api.post(
            '/draft-invoices/batch',
            { drafts: inputs },
            { headers: await authHeaders() },
        );
        return { data: response.data };
    } catch (error: unknown) {
        return {
            error: extractApiError(error, 'Failed to create draft invoices.'),
        };
    }
}

export async function getDraftInvoices(params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
}): Promise<{ data?: DraftInvoiceListResponse; error?: string }> {
    try {
        const response = await api.get('/draft-invoices', {
            headers: await authHeaders(),
            params,
        });
        return { data: response.data };
    } catch (error: unknown) {
        const message =
            (error as { response?: { data?: { message?: string } } })?.response
                ?.data?.message ?? 'Failed to fetch draft invoices.';
        return { error: message };
    }
}

export async function getDraftInvoicesByBatch(
    batchId: string,
): Promise<{ data?: DraftInvoice[]; error?: string }> {
    try {
        const response = await api.get(
            `/draft-invoices/batch/${encodeURIComponent(batchId)}`,
            { headers: await authHeaders() },
        );
        return { data: response.data };
    } catch (error: unknown) {
        const message =
            (error as { response?: { data?: { message?: string } } })?.response
                ?.data?.message ?? 'Failed to fetch invoice batch.';
        return { error: message };
    }
}

export async function getDraftInvoice(
    id: number,
): Promise<{ data?: DraftInvoice; error?: string }> {
    try {
        const response = await api.get(`/draft-invoices/${id}`, {
            headers: await authHeaders(),
        });
        return { data: response.data };
    } catch (error: unknown) {
        const message =
            (error as { response?: { data?: { message?: string } } })?.response
                ?.data?.message ?? 'Failed to fetch draft invoice.';
        return { error: message };
    }
}

export async function updateDraftInvoice(
    id: number,
    input: UpdateDraftInvoiceInput,
): Promise<{ data?: DraftInvoice; error?: string }> {
    try {
        const response = await api.patch(`/draft-invoices/${id}`, input, {
            headers: await authHeaders(),
        });
        return { data: response.data };
    } catch (error: unknown) {
        return {
            error: extractApiError(error, 'Failed to update draft invoice.'),
        };
    }
}

export async function deleteDraftInvoice(
    id: number,
): Promise<{ success?: boolean; error?: string }> {
    try {
        await api.delete(`/draft-invoices/${id}`, {
            headers: await authHeaders(),
        });
        return { success: true };
    } catch (error: unknown) {
        const message =
            (error as { response?: { data?: { message?: string } } })?.response
                ?.data?.message ?? 'Failed to delete draft invoice.';
        return { error: message };
    }
}

export async function convertDraftInvoice(id: number): Promise<{
    data?: { draft: DraftInvoice; guest: unknown; guests?: unknown[] };
    error?: string;
}> {
    try {
        const response = await api.post(
            `/draft-invoices/${id}/convert`,
            {},
            {
                headers: await authHeaders(),
            },
        );
        return { data: response.data };
    } catch (error: unknown) {
        const message =
            (error as { response?: { data?: { message?: string } } })?.response
                ?.data?.message ?? 'Failed to convert draft invoice.';
        return { error: message };
    }
}

export async function completeDraftInvoiceConversion(
    id: number,
    guestId: number,
): Promise<{ data?: DraftInvoice; error?: string }> {
    try {
        const response = await api.post(
            `/draft-invoices/${id}/complete-conversion`,
            { guestId },
            { headers: await authHeaders() },
        );
        return { data: response.data };
    } catch (error: unknown) {
        const message =
            (error as { response?: { data?: { message?: string } } })?.response
                ?.data?.message ?? 'Failed to mark draft invoice as converted.';
        return { error: message };
    }
}

export async function getDraftInvoiceAuditTrail(
    id: number,
): Promise<{ data?: DraftInvoiceAuditEntry[]; error?: string }> {
    try {
        const response = await api.get(`/draft-invoices/${id}/audit`, {
            headers: await authHeaders(),
        });
        return { data: response.data };
    } catch (error: unknown) {
        const message =
            (error as { response?: { data?: { message?: string } } })?.response
                ?.data?.message ?? 'Failed to fetch draft invoice audit log.';
        return { error: message };
    }
}

export async function recordDraftInvoiceAction(
    id: number,
    action: Extract<
        DraftInvoiceAuditAction,
        'viewed' | 'printed' | 'downloaded'
    >,
): Promise<void> {
    try {
        await api.post(
            `/draft-invoices/${id}/actions`,
            { action },
            { headers: await authHeaders() },
        );
    } catch {
        // Non-blocking audit
    }
}
