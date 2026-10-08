import { BASE_URL } from '@/constants/api';
import { getAuthToken } from './auth/auth-token';
import api from '@/lib/axios';
import {
    safeResponseJson,
    safeResponseJsonOrNull,
    safeErrorJson,
} from '@/lib/api';

export async function createMenuSubCategory(data: any) {
    try {
        console.log(data);
        const authToken = await getAuthToken();
        if (!authToken) {
            return { message: 'Authentication token not found.' };
        }

        const apiUrl = new URL('/menu/sub-category', BASE_URL).toString();
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
                    'Failed to create menu sub category. Please try again.',
            };
        }

        return {
            message: 'Menu sub category created successfully!',
            data: await safeResponseJson(response),
        };
    } catch (error: any) {
        return { message: 'An unexpected error occurred. Please try again.' };
    }
}

export async function getMenuSubCategories() {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const response = await api.get('/menu/sub-category', {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        });

        if (response.status >= 500) {
            return {
                error:
                    response.data?.message ??
                    'Failed to fetch menu sub categories. Try again.',
            };
        }

        return { data: response.data };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function reorderMenuSubCategories(
    groups: { menuCategoryId: number; ids: number[] }[],
) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) return { message: 'Authentication token not found.' };

        const response = await api.patch(
            '/menu/sub-category/reorder',
            { groups },
            { headers: { Authorization: `Bearer ${authToken}` } },
        );
        return {
            message: response.data?.message ?? 'Sub-category order saved.',
        };
    } catch (error: any) {
        return {
            message:
                error.response?.data?.message ??
                'Failed to save sub-category order.',
        };
    }
}

export async function updateMenuSubCategory(id: number, data: any) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { message: 'Authentication token not found.' };
        }

        const apiUrl = new URL(`/menu/${id}/sub-category`, BASE_URL).toString();
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
                    'Failed to update menu sub category. Please try again.',
            };
        }

        return {
            message: 'Menu sub category updated successfully!',
            data: await safeResponseJson(response),
        };
    } catch (error: any) {
        return { message: 'An unexpected error occurred. Please try again.' };
    }
}

export async function deleteMenuSubCategory(id: number) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { message: 'Authentication token not found.' };
        }

        const apiUrl = new URL(`/menu/${id}/sub-category`, BASE_URL).toString();
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
                    'Failed to delete menu sub category. Please try again.',
            };
        }

        return { message: 'Menu sub category deleted successfully!' };
    } catch (error: any) {
        return { message: 'An unexpected error occurred. Please try again.' };
    }
}

export async function deleteMenuSubCategoryBulk(ids: number[]) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { message: 'Authentication token not found.' };
        }

        const apiUrl = new URL(`/menu/sub-category/bulk`, BASE_URL).toString();
        const response = await fetch(apiUrl, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
            credentials: 'include',
            body: JSON.stringify({ ids }),
        });

        if (!response.ok) {
            const error = await safeErrorJson(response);
            return {
                message:
                    error.message ||
                    'Failed to delete menu sub category. Please try again.',
            };
        }

        return { message: 'Menu sub category deleted successfully!' };
    } catch (error: any) {
        return { message: 'An unexpected error occurred. Please try again.' };
    }
}
