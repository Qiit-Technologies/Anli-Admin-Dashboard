import { stockItemProps } from '@/components/stock/tables/columns/items';
import { BASE_URL } from '@/constants/api';
import api from '@/lib/axios';
import { ItemProps, ItemsStats } from '@/types';
import { InventoryReponse } from '@/types/inventory.types';
import { TransactionReponse } from '@/types/transaction.types';
import { getAuthToken } from './auth/auth-token';
import { safeResponseJson, safeResponseJsonOrNull, safeErrorJson } from '@/lib/api';

export async function fetchItems(page: number = 1) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const response = await api.get('/items', {
            params: { page },
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        });

        if (response.status >= 500) {
            return {
                error:
                    response.data?.message ??
                    'Failed to fetch items. Try again.',
            };
        }

        return { data: response.data };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export const getTransactions = async (
    page: number = 1,
): Promise<TransactionReponse> => {
    const token = await getAuthToken();
    const { data } = await api.get<TransactionReponse>('/transactions', {
        params: { page },
        headers: { Authorization: `Bearer ${token}` },
    });
    return data;
};

export const getItemHistory = async (
    id: number,
    page: number = 1,
    limit: number = 5,
): Promise<TransactionReponse> => {
    const token = await getAuthToken();
    const { data } = await api.get<TransactionReponse>(
        `/transactions/items/${id}`,
        {
            params: { page, limit },
            headers: { Authorization: `Bearer ${token}` },
        },
    );
    return data;
};

export const getItemInventory = async (
    id: number,
    page: number = 1,
    limit: number = 5,
): Promise<InventoryReponse> => {
    const token = await getAuthToken();
    const { data } = await api.get<InventoryReponse>(`/inventory/items/${id}`, {
        params: { page, limit },
        headers: { Authorization: `Bearer ${token}` },
    });
    return data;
};

export const getItemsStats = async (): Promise<ItemsStats> => {
    const token = await getAuthToken();
    const { data } = await api.get<ItemsStats>('/items/stats', {
        headers: { Authorization: `Bearer ${token}` },
    });
    return data;
};

export const getSingleItem = async (id: number) => {
    const token = await getAuthToken();
    const { data } = await api.get(`/items/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return data;
};

export async function createItem(item: ItemProps) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { message: 'Authentication token not found.' };
        }

        const apiUrl = new URL('/items', BASE_URL).toString();
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify(item),
            credentials: 'include',
        });

        if (!response.ok) {
            const error = await safeErrorJson(response);
            return {
                message:
                    error.message || 'Failed to create item. Please try again.',
            };
        }

        return {
            message: 'Item created successfully!',
            data: await safeResponseJson(response),
        };
    } catch (error: any) {
        return { message: 'An unexpected error occurred. Please try again.' };
    }
}

export async function updateItem(changes: Partial<stockItemProps>, id: number) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { message: 'Authentication token not found.' };
        }

        const { itemName, unitPrice, unitOfMeasurement, quantity } = changes;
        const formattedChanges = {
            name: itemName,
            price: unitPrice,
            unitOfMeasurement,
            quantity,
        };

        const apiUrl = new URL(`/items/${id}`, BASE_URL).toString();
        const response = await fetch(apiUrl, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify(formattedChanges),
            credentials: 'include',
        });

        if (!response.ok) {
            const error = await safeErrorJson(response);
            return {
                message:
                    error.message || 'Failed to update item. Please try again.',
            };
        }

        return { message: 'Item updated successfully!' };
    } catch (error: any) {
        return { message: 'An unexpected error occurred. Please try again.' };
    }
}

export async function deleteItem(id: number) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { message: 'Authentication token not found.' };
        }

        const apiUrl = new URL(`/items/${id}`, BASE_URL).toString();
        const response = await fetch(apiUrl, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
            credentials: 'include',
        });

        if (!response.ok) {
            const error = await safeErrorJson(response);
            return {
                message:
                    error.message || 'Failed to delete item. Please try again.',
            };
        }

        return { message: 'Item deleted successfully!' };
    } catch (error: any) {
        return { message: 'An unexpected error occurred. Please try again.' };
    }
}

export const uploadItemsCsv = async (file: File | null) => {
    if (file) {
        try {
            const authToken = await getAuthToken();
            if (!authToken) {
                throw new Error('Authentication token not found.');
            }

            const formData = new FormData();
            formData.append('file', file);

            const apiUrl = new URL('/items/csv', BASE_URL).toString();
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
                body: formData,
                credentials: 'include',
            });

            if (!response.ok) {
                const error = await safeErrorJson(response);
                return {
                    message:
                        error.message ||
                        'Failed to delete item. Please try again.',
                };
            }

            return { message: 'Items have been added successfully.' };
        } catch (error: any) {
            console.log('Error uploading file:', error);
            throw error;
        }
    }
};

export const getTransactionStats = async () => {
    const token = await getAuthToken();
    const { data } = await api.get('/daily-transactions/stats', {
        headers: { Authorization: `Bearer ${token}` },
    });
    return data;
};
