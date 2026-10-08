import api from '@/lib/axios';
import { getAuthToken } from './auth/auth-token';

export async function getInvoices(grnId?: string) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const response = await api.get(`/accounts/invoices?grnId=${grnId}`, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        });

        if (response.status >= 500) {
            const error = await response.data;
            return {
                error: error.message || 'Failed to fetch invoices. Try again.',
            };
        }
        const data = await response.data;
        return { data };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function getInvoice(id: string | number) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }
        const response = await api.get(`/accounts/invoices/${id}`, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        });
        if (response.status >= 500) {
            const error = await response.data;
            return {
                error: error.message || 'Failed to fetch invoice. Try again.',
            };
        }
        const data = await response.data;
        return data;
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function payInvoice(
    id: string | number,
    paymentData: {
        paymentMethod: string;
        paymentReference: string;
        amount: number;
        paidById: number;
        notes?: string;
    },
) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }
        const response = await api.patch(
            `/accounts/invoices/${id}/pay`,
            paymentData,
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
                error: error.message || 'Failed to pay invoice. Try again.',
            };
        }
        const data = await response.data;
        return { data };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function generateInvoiceFromGRN(grnId: string | number) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }
        const response = await api.post(
            `/accounts/grn/${grnId}/generate-invoice`,
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
                    error.message || 'Failed to generate invoice. Try again.',
            };
        }
        const data = await response.data;
        return { data };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function sendPurchaseOrderToAccount(
    purchaseOrderId: string | number,
) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }
        const response = await api.patch(
            `/accounts/purchase-orders/${purchaseOrderId}/send-to-account`,
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
                    error.message ||
                    'Failed to send purchase order to account. Try again.',
            };
        }
        const data = await response.data;
        return { data };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function getPurchaseOrdersForAccount() {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }
        const response = await api.get('/accounts/purchase-orders/account', {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        });
        if (response.status >= 500) {
            const error = await response.data;
            return {
                error:
                    error.message ||
                    'Failed to fetch purchase orders. Try again.',
            };
        }
        const data = await response.data;
        return { data };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function updatePurchaseOrderStage(
    id: number,
    stage: string,
    remarks?: string,
) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }
        const response = await api.patch(
            `/accounts/purchase-orders/${id}/stage`,
            {
                stage,
                remarks,
            },
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
                    'Failed to update purchase order stage. Try again.',
            };
        }
        const data = await response.data;
        return { data };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function getPurchaseOrderActivities(id: number) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }
        const response = await api.get(
            `/accounts/purchase-orders/${id}/activities`,
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
                    'Failed to fetch purchase order activities. Try again.',
            };
        }
        const data = await response.data;
        return { data };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}
