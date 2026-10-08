import { BASE_URL } from '@/constants/api';
import { getAuthToken } from './auth/auth-token';
import {
    DineInAreaType,
    KitchenType,
    TableProps,
} from '@/types/back-of-house.type';
import api from '@/lib/axios';
import { safeResponseJson, safeResponseJsonOrNull, safeErrorJson } from '@/lib/api';

export async function createDineInArea(data: DineInAreaType) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { message: 'Authentication token not found.' };
        }

        const apiUrl = new URL(
            '/restaurants/dine-in-areas',
            BASE_URL,
        ).toString();
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify(data),
            credentials: 'include',
        });

        if (!response.ok) {
            const error = await safeErrorJson(response);
            return {
                message:
                    error.message ||
                    'Failed to create dine in area. Please try again.',
            };
        }

        return {
            message: 'Dine in area created successfully!',
            data: await safeResponseJson(response),
        };
    } catch (error: any) {
        return { message: 'An unexpected error occurred. Please try again.' };
    }
}

export async function getDineInAreas() {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const response = await api.get('/restaurants/dine-in-areas', {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        });

        if (response.status >= 500) {
            return {
                error:
                    response.data?.message ??
                    'Failed to fetch dine in areas. Try again.',
            };
        }

        return { data: response.data };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function getAllDineInAreasForPublic(hotelId: string) {
    try {
        const response = await api.get(
            `/restaurants/${hotelId}/dine-in-areas-for-public`,
            {
                headers: {
                    'Content-Type': 'application/json',
                },
            },
        );

        if (response.status >= 500) {
            return {
                error:
                    response.data?.message ??
                    'Failed to fetch dine in areas. Try again.',
            };
        }

        return { data: response.data };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function updateDineInArea(data: DineInAreaType) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { message: 'Authentication token not found.' };
        }

        const apiUrl = new URL(
            `/restaurants/dine-in-areas/${data.id}`,
            BASE_URL,
        ).toString();
        const response = await fetch(apiUrl, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify(data),
            credentials: 'include',
        });

        if (!response.ok) {
            const error = await safeErrorJson(response);
            return {
                message:
                    error.message ||
                    'Failed to update dine in area. Please try again.',
            };
        }

        return {
            message: 'Dine in area updated successfully!',
            data: await safeResponseJson(response),
        };
    } catch (error: any) {
        return { message: 'An unexpected error occurred. Please try again.' };
    }
}

export async function deleteDineInArea(id: number) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { message: 'Authentication token not found.' };
        }

        const apiUrl = new URL(
            `/restaurants/dine-in-areas/${id}`,
            BASE_URL,
        ).toString();
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

        return { message: 'Dine in area deleted successfully!' };
    } catch (error: any) {
        return { message: 'An unexpected error occurred. Please try again.' };
    }
}

export async function updateDineInAreaMenu(
    id: number,
    body: { menuCategoryIds: any[] },
) {
    console.log('body', body);
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { message: 'Authentication token not found.' };
        }

        const apiUrl = new URL(`/restaurants/${id}/menus`, BASE_URL).toString();
        const response = await fetch(apiUrl, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify(body),
            credentials: 'include',
        });

        if (!response.ok) {
            const error = await safeErrorJson(response);
            return {
                message:
                    error.message ||
                    'Failed to update dine in area. Please try again.',
            };
        }

        return {
            message: 'Dine in area updated successfully!',
            data: await safeResponseJson(response),
        };
    } catch (error: any) {
        return { message: 'An unexpected error occurred. Please try again.' };
    }
}

export async function createTable(data: TableProps) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { message: 'Authentication token not found.' };
        }

        const apiUrl = new URL('/restaurants/table', BASE_URL).toString();
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify(data),
            credentials: 'include',
        });

        if (!response.ok) {
            const error = await safeErrorJson(response);
            return {
                message:
                    error.message ||
                    'Failed to create table. Please try again.',
            };
        }

        return {
            message: 'Table created successfully!',
            data: await safeResponseJson(response),
        };
    } catch (error: any) {
        return { message: 'An unexpected error occurred. Please try again.' };
    }
}

export async function getTables() {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const response = await api.get('/restaurants/table', {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        });

        if (response.status >= 500) {
            return {
                error:
                    response.data?.message ??
                    'Failed to fetch tables. Try again.',
            };
        }

        return { data: response.data };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function updateTable(id: number, data: TableProps) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { message: 'Authentication token not found.' };
        }

        const apiUrl = new URL(`/restaurants/${id}/table`, BASE_URL).toString();
        const response = await fetch(apiUrl, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify(data),
            credentials: 'include',
        });

        if (!response.ok) {
            const error = await safeErrorJson(response);
            return {
                message:
                    error.message ||
                    'Failed to update table. Please try again.',
            };
        }

        return {
            message: 'Table updated successfully!',
            data: await safeResponseJson(response),
        };
    } catch (error: any) {
        return { message: 'An unexpected error occurred. Please try again.' };
    }
}

export async function deleteTable(id: number) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { message: 'Authentication token not found.' };
        }

        const apiUrl = new URL(`/restaurants/${id}/table`, BASE_URL).toString();
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
                    error.message ||
                    'Failed to delete table. Please try again.',
            };
        }

        return { message: 'Table deleted successfully!' };
    } catch (error: any) {
        return { message: 'An unexpected error occurred. Please try again.' };
    }
}

export async function getTablesByDineInArea(id: number) {
    try {
        const response = await api.get(`/restaurants/dine/${id}/tables`, {
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (response.status >= 500) {
            return {
                error:
                    response.data?.message ??
                    'Failed to fetch tables. Try again.',
            };
        }

        return { data: response.data };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function resetTable(id: number) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { message: 'Authentication token not found.' };
        }

        const apiUrl = new URL(
            `/restaurants/table/${id}/reset`,
            BASE_URL,
        ).toString();
        const response = await fetch(apiUrl, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        });

        if (!response.ok) {
            const error = await safeErrorJson(response);
            return {
                message:
                    error.message || 'Failed to reset table. Please try again.',
            };
        }

        return {
            message: 'Reset table successfully!',
            data: await safeResponseJson(response),
        };
    } catch (error: any) {
        return { message: 'An unexpected error occurred. Please try again.' };
    }
}

export async function getKitchens() {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const response = await api.get('/kitchen', {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        });

        if (response.status >= 500) {
            return {
                error:
                    response.data?.message ??
                    'Failed to fetch dine in areas. Try again.',
            };
        }

        return { data: response.data };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function createKitchen(data: KitchenType) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { message: 'Authentication token not found.' };
        }

        const apiUrl = new URL('/kitchen', BASE_URL).toString();
        console.log('apiUrl', apiUrl);
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify(data),
            credentials: 'include',
        });

        if (!response.ok) {
            const error = await safeErrorJson(response);
            return {
                message:
                    error.message ||
                    'Failed to create dine in area. Please try again.',
            };
        }

        return {
            message: 'Kitchen created successfully!',
            data: await safeResponseJson(response),
        };
    } catch (error: any) {
        return { message: 'An unexpected error occurred. Please try again.' };
    }
}

export async function updateKitchen(data: KitchenType) {
    console.log('data', data);
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { message: 'Authentication token not found.' };
        }

        const apiUrl = new URL(`/kitchen/${data.id}`, BASE_URL).toString();
        const response = await fetch(apiUrl, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify(data),
            credentials: 'include',
        });

        if (!response.ok) {
            const error = await safeErrorJson(response);
            return {
                message:
                    error.message ||
                    'Failed to update dine in area. Please try again.',
            };
        }

        return {
            message: 'Kitchen updated successfully!',
            data: await safeResponseJson(response),
        };
    } catch (error: any) {
        return { message: 'An unexpected error occurred. Please try again.' };
    }
}

export async function deleteKitchen(id: number) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { message: 'Authentication token not found.' };
        }

        const apiUrl = new URL(`/kitchen/${id}`, BASE_URL).toString();
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

        return { message: 'Kitchen deleted successfully!' };
    } catch (error: any) {
        return { message: 'An unexpected error occurred. Please try again.' };
    }
}
