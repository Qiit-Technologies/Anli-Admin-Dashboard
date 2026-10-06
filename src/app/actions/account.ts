/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import api from '@/lib/axios';
import { getAuthToken } from './auth/auth-token';
import {
    DashboardSummary,
    CashFlowData,
    RevenueSummary,
    Transaction,
} from '@/types/accounts/dashboard';

interface ApiResponse<T> {
    data?: T;
    error?: string;
}

export interface PettyCashTransaction {
    id: number;
    date: string;
    amount: number;
    purpose: string;
    recipientName: string;
    approvedBy: {
        id: number;
        fullName: string;
    };
    paidBy: {
        id: number;
        fullName: string;
    };
    paymentMethod: string;
    description?: string;
    status: 'pending' | 'approved' | 'rejected' | 'completed';
    department?: {
        id: number;
        name: string;
    };
    createdAt: string;
    createdBy: {
        fullName: string;
    };
}

export interface PettyCashStats {
    openingBalance: number;
    closingBalance: number;
    amountSpentToday: number;
    pendingCount: number;
    completedCount: number;
    todayTotal: number;
    monthTotal: number;
    todayCount: number;
    monthCount: number;
    approvedCount: number;
    yesterdayTotal: number;
    lastMonthTotal: number;
    lastPendingCount: number;
    lastCompletedCount: number;
    todayPercentageChange: number;
    monthPercentageChange: number;
    pendingPercentageChange: number;
    completedPercentageChange: number;
    weekTotal: number;
    yesterdayOpeningBalance: number;
    yesterdayClosingBalance: number;
    yesterdayAmountSpent: number;
    openingBalancePercentageChange: number;
    closingBalancePercentageChange: number;
    amountSpentPercentageChange: number;
}

export interface CreatePettyCashTransactionData {
    amount: number;
    purpose: string;
    recipientName: string;
    paidFromId: number;
    departmentId: number;
    module: string;
    paymentMethod: string;
    description?: string;
    documentUrl?: string;
    status?: string;
}

type DashProps = {
    timeRange?: string;
    type?: 'balance' | 'revenue' | 'expenses';
    start_date?: string;
    end_date?: string;
};

export async function getDashboardSummary({
    type,
    start_date,
    end_date,
}: DashProps): Promise<ApiResponse<DashboardSummary>> {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const params: any = {};
        if (type) params.type = type;
        if (type) params.start_date = start_date;
        if (type) params.end_date = end_date;
        const response = await api.get<DashboardSummary>(
            '/accounts/dashboard/summary',
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authToken}`,
                },
                params,
            },
        );

        if (response.status >= 500) {
            return {
                error: 'Failed to fetch dashboard summary.',
            };
        }
        return { data: response.data };
    } catch (_) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function getCashFlow(): Promise<ApiResponse<CashFlowData[]>> {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const response = await api.get<CashFlowData[]>(
            '/accounts/dashboard/cash-flow',
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authToken}`,
                },
            },
        );

        if (response.status >= 500) {
            return {
                error: 'Failed to fetch cash flow data.',
            };
        }
        return { data: response.data };
    } catch (_) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function getRevenueSummary(
    date?: string,
): Promise<ApiResponse<RevenueSummary>> {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const params = date ? { date } : undefined;
        const response = await api.get<RevenueSummary>(
            '/accounts/dashboard/revenue-summary',
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authToken}`,
                },
                params,
            },
        );

        if (response.status >= 500) {
            return {
                error: 'Failed to fetch revenue summary.',
            };
        }
        return { data: response.data };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function getNetCashFlow(
    timeRange?: string,
): Promise<ApiResponse<any>> {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const params = timeRange ? { timeRange } : undefined;
        const response = await api.get('/accounts/dashboard/net-cash-flow', {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
            params,
        });

        if (response.status >= 500) {
            return {
                error: 'Failed to fetch net cash flow.',
            };
        }
        return { data: response.data };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function getDashboardTransactions(): Promise<
    ApiResponse<Transaction[]>
> {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const response = await api.get<Transaction[]>(
            '/accounts/dashboard/transactions',
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authToken}`,
                },
            },
        );

        if (response.status >= 500) {
            return {
                error: 'Failed to fetch dashboard transactions.',
            };
        }
        return { data: response.data };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function getDailyTransaction(date?: string) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const params: any = {};
        if (date) {
            params.date = date;
        }

        const response = await api.get('/accounts/daily-transactions', {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
            params,
        });

        if (response.status >= 500) {
            return {
                error:
                    response.data?.message ??
                    'Failed to fetch daily transactions. Try again.',
            };
        }
        return { data: response.data };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export const getTransactions = async () => {
    const token = await getAuthToken();
    const { data } = await api.get('/accounts/transactions', {
        headers: { Authorization: `Bearer ${token}` },
    });
    return data;
};

export const getTransactionDetails = async (transactionId: string) => {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const response = await api.get(
            `/accounts/daily-transaction/${transactionId}`,
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authToken}`,
                },
            },
        );

        if (response.status >= 500) {
            return {
                error:
                    response.data?.message ??
                    'Failed to fetch daily transactions. Try again.',
            };
        }
        return { data: response.data };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
};

export async function getTransactionStats(date?: string) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const params: any = {};
        if (date) {
            params.date = date;
        }

        const response = await api.get('/accounts/daily-transactions/stats', {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
            params,
        });

        if (response.status >= 500) {
            return {
                error:
                    response.data?.message ??
                    'Failed to fetch daily transactions stats. Try again.',
            };
        }
        return { data: response.data };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function createPettyCashTransaction(
    data: CreatePettyCashTransactionData,
): Promise<ApiResponse<PettyCashTransaction>> {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        console.log('data', data);
        const response = await api.post<PettyCashTransaction>(
            '/accounts/petty-cash',
            {
                ...data,
                amount: parseFloat(data.amount.toString()),
                status: data.status || 'pending',
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authToken}`,
                },
            },
        );

        if (response.status >= 500) {
            return {
                error: 'Failed to create petty cash transaction.',
            };
        }
        return { data: response.data };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function getPettyCashTransactions(filters?: {
    status?: string;
    paymentMethod?: string;
    date?: string;
    search?: string;
}): Promise<ApiResponse<PettyCashTransaction[]>> {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const params = new URLSearchParams();
        if (filters?.status) params.append('status', filters.status);
        if (filters?.paymentMethod)
            params.append('paymentMethod', filters.paymentMethod);
        if (filters?.date) params.append('date', filters.date);
        if (filters?.search) params.append('search', filters.search);

        const response = await api.get<PettyCashTransaction[]>(
            `/accounts/petty-cash?${params}`,
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authToken}`,
                },
            },
        );

        if (response.status >= 500) {
            return {
                error: 'Failed to fetch petty cash transactions.',
            };
        }
        return { data: response.data || [] };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function getPettyCashStats(): Promise<
    ApiResponse<PettyCashStats>
> {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const response = await api.get<PettyCashStats>(
            '/accounts/petty-cash/stats',
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authToken}`,
                },
            },
        );

        if (response.status >= 500) {
            return {
                error: 'Failed to fetch petty cash stats.',
            };
        }
        return {
            data: response.data || {
                openingBalance: 0,
                closingBalance: 0,
                amountSpentToday: 0,
                pendingCount: 0,
                completedCount: 0,
                todayTotal: 0,
                monthTotal: 0,
                todayCount: 0,
                monthCount: 0,
                approvedCount: 0,
                yesterdayTotal: 0,
                lastMonthTotal: 0,
                lastPendingCount: 0,
                lastCompletedCount: 0,
                todayPercentageChange: 0,
                monthPercentageChange: 0,
                pendingPercentageChange: 0,
                completedPercentageChange: 0,
                weekTotal: 0,
                yesterdayOpeningBalance: 0,
                yesterdayClosingBalance: 0,
                yesterdayAmountSpent: 0,
                openingBalancePercentageChange: 0,
                closingBalancePercentageChange: 0,
                amountSpentPercentageChange: 0,
            },
        };
    } catch (error: any) {
        return {
            error: 'An unexpected error occurred. Please try again.',
            data: {
                openingBalance: 0,
                closingBalance: 0,
                amountSpentToday: 0,
                pendingCount: 0,
                completedCount: 0,
                todayTotal: 0,
                monthTotal: 0,
                todayCount: 0,
                monthCount: 0,
                approvedCount: 0,
                yesterdayTotal: 0,
                lastMonthTotal: 0,
                lastPendingCount: 0,
                lastCompletedCount: 0,
                todayPercentageChange: 0,
                monthPercentageChange: 0,
                pendingPercentageChange: 0,
                completedPercentageChange: 0,
                weekTotal: 0,
                yesterdayOpeningBalance: 0,
                yesterdayClosingBalance: 0,
                yesterdayAmountSpent: 0,
                openingBalancePercentageChange: 0,
                closingBalancePercentageChange: 0,
                amountSpentPercentageChange: 0,
            },
        };
    }
}

export async function importTransactions(file: File) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const formData = new FormData();
        formData.append('file', file);

        const response = await api.post(
            '/accounts/import-transactions',
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${authToken}`,
                },
            },
        );

        if (response.status >= 500) {
            return {
                error:
                    response.data?.message ??
                    'Failed to import transactions. Try again.',
            };
        }
        return { data: response.data };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function updatePettyCash(data: any, id: string | number) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const response = await api.patch(`/accounts/petty-cash/${id}`, data, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        });

        if (response.status >= 500) {
            return {
                error:
                    response.data?.message ??
                    'Failed to import transactions. Try again.',
            };
        }
        return { data: response.data };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}
