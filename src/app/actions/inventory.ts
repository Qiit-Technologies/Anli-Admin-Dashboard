import { getAuthToken } from '@/app/actions/auth/auth-token';
import { ItemRequest } from '@/components/house-keeping/common/modals/inventory';
import { BASE_URL } from '@/constants/api';
import api from '@/lib/axios';
import { InventoryResponse } from '@/types';
import { safeResponseJson, safeResponseJsonOrNull, safeErrorJson } from '@/lib/api';

export interface updateInventory {
    quantity: number;
    itemId: number;
    minStock: number;
}

export interface updateInventoryInterface extends updateInventory {
    id: number;
    maxQuantity: number;
}

export const fetchInventory = async (page: number = 1) => {
    const token = await getAuthToken();
    const { data } = await api.get('/inventory', {
        params: { page },
        headers: { Authorization: `Bearer ${token}` },
    });
    return data as InventoryResponse;
};

export const updateInventoryItem = async ({
    id,
    quantity,
    itemId,
    minStock,
}: updateInventoryInterface) => {
    try {
        const token = await getAuthToken();
        const { data } = await api.patch(
            `/inventory/${id}`,
            { quantity, itemId, minStock },
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            },
        );
        return data;
    } catch (error: any) {
        console.error('Failed to update inventory item:', error);
        throw error;
    }
};

export const addInventoryItem = async (changes: updateInventory) => {
    const token = await getAuthToken();
    const response = await api.post('/inventory', changes, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (response.status >= 400) {
        const error = await response.data;
        return { message: error.message, success: false };
    }
    return { message: response.data, success: true };
};

// to be determined!
export const deleteInventoryItem = async (id: number) => {
    const token = await getAuthToken();
    const response = await api.delete(`/inventory/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
};

export async function createStockRequestItems(
    items: ItemRequest[],
    department: string,
    createdBy?: string,
    managerPin?: string,
) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { message: 'Authentication token not found.' };
        }

        const apiUrl = new URL(`/items/stock`, BASE_URL).toString();
        const formattedItems = items.map((item) => ({
            itemId: Number(item.itemId),
            quantity: Number(item.quantity),
        }));
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify({
                items: formattedItems,
                department,
                createdBy: Number(createdBy),
                ...(managerPin ? { managerPin } : {}),
            }),
            credentials: 'include',
        });

        if (!response.ok) {
            const error = await safeErrorJson(response);
            return {
                message:
                    error.message ||
                    'Failed to create stock request items. Please try again.',
            };
        }

        return {
            message: managerPin
                ? 'Stock request approved with manager PIN!'
                : 'Stock request items created successfully!',
        };
    } catch (error: any) {
        return { message: 'An unexpected error occurred. Please try again.' };
    }
}

export async function updateStockRequestItems(
    id: string,
    status: string,
    reason?: string,
    issuedQuantity?: number,
    issuingRemarks?: string,
    lines?: Array<{ id: number; issuedQuantity?: number; remove?: boolean }>,
    managerPin?: string,
) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { message: 'Authentication token not found.' };
        }

        const apiUrl = new URL(
            `/items/${Number(id)}/stock`,
            BASE_URL,
        ).toString();
        const response = await fetch(apiUrl, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify({
                status: status,
                rejectionReason: reason,
                issuedQuantity,
                issuingRemarks,
                ...(lines ? { lines } : {}),
                ...(managerPin ? { managerPin } : {}),
            }),
            credentials: 'include',
        });

        if (!response.ok) {
            const error = await safeErrorJson(response);
            return {
                message:
                    error.message ||
                    'Failed to create stock request items. Please try again.',
            };
        }

        return {
            message: managerPin
                ? 'Stock request approved with manager PIN!'
                : 'Stock request items updated successfully!',
        };
    } catch (error: any) {
        return { message: 'An unexpected error occurred. Please try again.' };
    }
}

export async function getInventoryMetricsByHotelId(department: string) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const response = await api.get(
            `/inventory/metrics?department=${department}`,
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
                    'Failed to fetch inventory metrics. Try again.',
            };
        }

        const data = await response.data;

        return { data };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function getRequisitionApprovals() {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const response = await api.get('/items/requisition-approvals', {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        });

        if (response.status !== 200) {
            const error = await response.data;
            return {
                error:
                    error.message ||
                    'Failed to fetch requisition approvals. Try again.',
            };
        }

        const data = await response.data;

        return { data };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function getInventoryByDepartment(department: string) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const response = await api.get(
            `/items/stock?department=${department}`,
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
                error: error.message || 'Failed to fetch inventory. Try again.',
            };
        }

        const data = await response.data;

        return { data };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}
