/* eslint-disable @typescript-eslint/no-explicit-any */
import api from '@/lib/axios';
import { getAuthToken } from './auth/auth-token';

export interface SplitBillItem {
    orderItemId: number;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
}

export interface SplitBillPayment {
    amount: number;
    paymentMethod: string;
    receivingAccount: string;
}

export interface CreateSplitBillData {
    originalOrderId: number;
    items: SplitBillItem[];
    payments?: SplitBillPayment[];
    customerName?: string;
    customerPhone?: string;
    customerEmail?: string;
    paymentMethod?: string;
    percentage?: number;
    customAmount?: number;
    splitMethod?: 'EQUAL' | 'ITEM_BASED' | 'PERCENTAGE' | 'AMOUNT';
}

export async function createSplitBill(splitBillData: CreateSplitBillData) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const response = await api.post('/orders/split-bill', splitBillData, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        });

        if (response.status >= 500) {
            const error = await response.data;
            return {
                error:
                    error.response.data.message ||
                    'Failed to create split bill. Try again.',
            };
        }

        const data = await response.data;
        return { data };
    } catch (error: any) {
        console.error('Error:', error);
        return {
            error: error
                ? (error as any)?.response.data.message
                : 'An unexpected error occurred. Please try again.',
        };
    }
}

export async function getSplitBillsByOrder(orderId: number) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const response = await api.get(
            `/orders/split-bills/${orderId}?_t=${Date.now()}`,
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authToken}`,
                },
            },
        );

        if (response.status >= 500) {
            const error = await response.data;
            return {
                error: error.message || 'Failed to get split bills. Try again.',
            };
        }

        const data = await response.data;
        return { data };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function addPaymentToSplitBill(
    splitBillId: number,
    payment: SplitBillPayment,
) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const response = await api.post(
            `/orders/split-bill/${splitBillId}/payment`,
            payment,
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authToken}`,
                },
            },
        );

        if (response.status >= 500) {
            const error = await response.data;
            return {
                error: error.message || 'Failed to add payment. Try again.',
            };
        }

        const data = await response.data;
        return { data };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function cancelSplitBill(splitBillId: number) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const response = await api.post(
            `/orders/split-bill/${splitBillId}/cancel`,
            {},
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authToken}`,
                },
            },
        );

        if (response.status >= 500) {
            const error = await response.data;
            return {
                error:
                    error.message || 'Failed to cancel split bill. Try again.',
            };
        }

        const data = await response.data;
        return { data };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}
