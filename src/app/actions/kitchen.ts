import api from '@/lib/axios';
import { getAuthToken } from './auth/auth-token';
import { BASE_URL } from '@/constants/api';
import { safeResponseJson, safeResponseJsonOrNull, safeErrorJson } from '@/lib/api';

export async function sendOrderToKitchen(id: number) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }
        const apiUrl = new URL(`/orders/send-to-kitchen`, BASE_URL).toString();
        const response = await fetch(apiUrl, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify({ id }),
            credentials: 'include',
        });

        if (!response.ok) {
            const errorData = await safeErrorJson(response);
            return {
                error:
                    errorData.message ||
                    'Failed to send order to kitchen. Try again.',
            };
        }

        return { message: 'Order sent to kitchen successfully!' };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function getKitchenOrders(id?: string) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }
        const kitchenId =
            id && !id.startsWith('/') && id !== 'undefined' ? id : '';
        const response = await api.get(
            `/orders/kitchen-orders?kitchen=${kitchenId}`, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        });
        if (response.status >= 500) {
            const error = await response.data;
            return {
                error:
                    error.message || 'Failed to get kitchen orders. Try again.',
            };
        }
        const data = await response.data;
        return { data };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function getKitchenOrderStats(id?: string | null) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }
        const kitchenId =
            id && !String(id).startsWith('/') && id !== 'undefined' ? id : '';
        const response = await api.get(
            `/orders/kitchen-stats?kitchen=${kitchenId}`,
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
                    error.message ||
                    'Failed to get kitchen order stats. Try again.',
            };
        }
        const data = await response.data;
        return { data };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function getKitchenOrderHistory(id?: string) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }
        const response = await api.get(
            `/orders/kitchen-history?kitchen=${id}`,
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
                    error.message ||
                    'Failed to get kitchen order history. Try again.',
            };
        }
        const data = await response.data;
        return { data };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}
