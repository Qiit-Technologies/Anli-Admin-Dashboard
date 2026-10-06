'use server';

import { BASE_URL } from '@/constants/api';
import { getAuthToken } from './auth/auth-token';
import api from '@/lib/axios';
import { safeResponseJson, safeResponseJsonOrNull, safeErrorJson } from '@/lib/api';

export async function transferGuestFunds(params: {
    fromGuestId: number;
    toGuestId: number;
    amount: number;
}) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const apiUrl = new URL('/guests/transfer-funds', BASE_URL).toString();
        const response = await fetch(apiUrl, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify({
                fromGuestId: params.fromGuestId,
                toGuestId: params.toGuestId,
                amount: params.amount,
            }),
        });

        if (!response.ok) {
            const error = await safeErrorJson(response);
            return {
                error:
                    error.message ||
                    'Failed to transfer funds. Please try again.',
            };
        }

        const result = await safeResponseJson(response);
        return {
            message: result.message || 'Funds transferred successfully!',
            ...result,
        };
    } catch (error: any) {
        return {
            error: 'An unexpected error occurred while transferring funds.',
        };
    }
}

export async function getReceivables() {
    try {
        const authToken = await getAuthToken();
        if (!authToken) return { error: 'Authentication token not found.' };

        const res = await api.get('/accounts/receivables', {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        });
        if (res.status !== 200) {
            return {
                error: res.data?.message || 'Failed to fetch receivables.',
            };
        }
        return res.data;
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export type ArSummaryAgingBucket = {
    key: string;
    label: string;
    amount: number;
};

export type ArSummaryRow = {
    guestName: string;
    invoiceNo: string;
    serviceDate: string;
    invoiceDate: string;
    dueDate: string;
    totalInvoiced: number;
    paid: number;
    balance: number;
    agingDays: number;
    remarks: string | null;
};

export type ArSummaryDashboardData = {
    kpis: {
        totalAccountsReceivable: number;
        outstandingInvoices: number;
        totalOverdue: number;
        topDebtorName: string | null;
        topDebtorAmount: number;
    };
    agingBuckets: ArSummaryAgingBucket[];
    rows: ArSummaryRow[];
    generatedAt: string;
    generatedBy: string;
};

export async function getArSummaryDashboard(): Promise<
    ArSummaryDashboardData | { error: string }
> {
    try {
        const authToken = await getAuthToken();
        if (!authToken) return { error: 'Authentication token not found.' };

        const res = await api.get('/accounts/ar-summary', {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        });
        if (res.status !== 200) {
            return {
                error: res.data?.message || 'Failed to load AR summary.',
            };
        }
        return res.data as ArSummaryDashboardData;
    } catch {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function writeOffReceivable(params: {
    guestId: number;
    reason: string;
    amount?: number;
}) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const apiUrl = new URL(
            `/guests/${params.guestId}/writeoff`,
            BASE_URL,
        ).toString();
        const response = await fetch(apiUrl, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify({
                reason: params.reason,
                amount: params.amount ?? undefined,
            }),
        });

        if (!response.ok) {
            const error = await safeErrorJson(response);
            return {
                error:
                    error.message ||
                    'Failed to write off receivable. Please try again.',
            };
        }

        const result = await safeResponseJson(response);
        return {
            message: result.message || 'Receivable written off successfully!',
            ...result,
        };
    } catch (error: any) {
        return {
            error: 'An unexpected error occurred while writing off receivable.',
        };
    }
}

export interface ReceivableSummaryReportParams {
    startDate?: string;
    startTime?: string;
    endDate?: string;
    endTime?: string;
    reservationNo?: string;
    guestName?: string;
    roomNumber?: string;
    roomType?: string;
}

export async function getReceivableSummaryReport(
    params?: ReceivableSummaryReportParams,
) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) return { error: 'Authentication token not found.' };

        const searchParams = new URLSearchParams();
        if (params) {
            const keys: (keyof ReceivableSummaryReportParams)[] = [
                'startDate',
                'startTime',
                'endDate',
                'endTime',
                'reservationNo',
                'guestName',
                'roomNumber',
                'roomType',
            ];
            keys.forEach((key) => {
                const value = params[key];
                if (value !== undefined && value !== '' && value !== 'all') {
                    searchParams.append(key, String(value));
                }
            });
        }

        const url = `/accounts/reports/receivable-summary${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;

        const res = await api.get(url, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        });

        if (res.status !== 200) {
            return {
                error:
                    res.data?.message ||
                    'Failed to fetch receivable summary report.',
            };
        }

        return { data: res.data };
    } catch {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function payReceivableAction(
    accountId: number,
    amountPaid: number,
) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const apiUrl = new URL(
            `/accounts/receivables/${accountId}/payment`,
            BASE_URL,
        ).toString();

        const response = await fetch(apiUrl, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify({ amountPaid }),
        });

        if (!response.ok) {
            const error = await safeErrorJson(response);
            return {
                error:
                    error.message ||
                    'Failed to apply payment. Please try again.',
            };
        }

        const result = await safeResponseJson(response);
        return {
            success: true,
            message: result.message || 'Payment applied successfully!',
            ...result,
        };
    } catch (error: any) {
        return {
            error: 'An unexpected error occurred while processing payment.',
        };
    }
}

