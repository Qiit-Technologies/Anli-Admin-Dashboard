import api from '@/lib/axios';
import { getAuthToken } from './auth/auth-token';

export interface PayableRow {
    id: number;
    guestId?: number;
    roomId?: number;
    guestName?: string;
    accountNumber?: string;
    roomNumber?: string;
    balance: number;
    isCheckedIn?: boolean;
    isCheckedOut?: boolean;
    createdAt?: string;
}

export interface CreatePayablePayload {
    title: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    gender: string;
    guestType: string;
    address: string;
    paymentMethod: string;
    accountPaidInto: string; // bank account number
    balance: number;
    roomId?: number;
    guestId?: number;
}

export interface RefundPayablePayload {
    amount: number;
    paymentMethod: string; // 'cash' | 'transfer' | 'bank'
    hotelAccount: string; // bank account number
    date: string; // YYYY-MM-DD
    reason: string;
    /** Optional when profile has no stay room on file */
    roomId?: number;
}

export interface TransferPayablePayload {
    amount: number;
    fromGuestProfileId?: number;
    toGuestProfileId?: number;
    date: string; // YYYY-MM-DD
}

export interface DeletePayablePayload {
    reason?: string;
}

export async function getPayables() {
    try {
        const authToken = await getAuthToken();
        if (!authToken) return { error: 'Authentication token not found.' };

        const res = await api.get('/accounts/payables', {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        });
        if (res.status !== 200) {
            return { error: res.data?.message || 'Failed to fetch payables.' };
        }
        return res.data;
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function createPayable(payload: CreatePayablePayload) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) return { error: 'Authentication token not found.' };

        const res = await api.post('/accounts/payables', payload, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        });
        if (res.status !== 201) {
            return { error: res.data?.message || 'Failed to create payable.' };
        }
        return res.data;
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function refundPayable(id: number, payload: RefundPayablePayload) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) return { error: 'Authentication token not found.' };

        const res = await api.patch(
            `/accounts/payables/${id}/refund`,
            payload,
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authToken}`,
                },
            },
        );
        if (res.status !== 200) {
            return { error: res.data?.message || 'Failed to refund payable.' };
        }
        return res.data;
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function transferPayable(
    id: number,
    payload: TransferPayablePayload,
) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) return { error: 'Authentication token not found.' };

        const res = await api.patch(
            `/accounts/payables/${id}/transfer`,
            payload,
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authToken}`,
                },
            },
        );
        if (res.status !== 200) {
            return {
                error: res.data?.message || 'Failed to transfer payable.',
            };
        }
        return res.data;
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function deletePayable(id: number, payload: DeletePayablePayload) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) return { error: 'Authentication token not found.' };

        const res = await api.delete(`/accounts/payables/${id}`, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
            data: payload,
        });
        if (res.status !== 200) {
            return { error: res.data?.message || 'Failed to delete payable.' };
        }
        return res.data;
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export type ApSummaryAgingBucket = {
    key: string;
    label: string;
    amount: number;
};

export type ApSummaryRow = {
    refNo: string;
    vendorName: string;
    serviceDate: string;
    recordDate: string;
    dueDate: string;
    totalPayable: number;
    paid: number;
    balance: number;
    agingDays: number;
    remarks: string | null;
};

export type ApSummaryDashboardData = {
    kpis: {
        totalAccountsPayable: number;
        outstandingPayables: number;
        totalOverdue: number;
        topCreditorName: string | null;
        topCreditorAmount: number;
    };
    agingBuckets: ApSummaryAgingBucket[];
    rows: ApSummaryRow[];
    generatedAt: string;
    generatedBy: string;
};

export async function getApSummaryDashboard(): Promise<
    ApSummaryDashboardData | { error: string }
> {
    try {
        const authToken = await getAuthToken();
        if (!authToken) return { error: 'Authentication token not found.' };

        const res = await api.get('/accounts/ap-summary', {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        });
        if (res.status !== 200) {
            return {
                error: res.data?.message || 'Failed to load AP summary.',
            };
        }
        return res.data as ApSummaryDashboardData;
    } catch {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}
