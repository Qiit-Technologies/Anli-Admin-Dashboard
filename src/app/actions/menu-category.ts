import { BASE_URL } from '@/constants/api';
import { getAuthToken } from './auth/auth-token';
import api from '@/lib/axios';
import {
    safeResponseJson,
    safeResponseJsonOrNull,
    safeErrorJson,
} from '@/lib/api';

export async function createMenuCategory(data: any) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { message: 'Authentication token not found.' };
        }

        const apiUrl = new URL('/menu/category', BASE_URL).toString();
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
                    'Failed to create menu category. Please try again.',
            };
        }

        return {
            message: 'Menu category created successfully!',
            data: await safeResponseJson(response),
        };
    } catch (error: any) {
        return { message: 'An unexpected error occurred. Please try again.' };
    }
}

export async function getMenuCategories() {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const response = await api.get('/menu/category', {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        });

        if (response.status >= 500) {
            return {
                error:
                    response.data?.message ??
                    'Failed to fetch menu categories. Try again.',
            };
        }

        return { data: response.data };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function reorderMenuCategories(
    groups: { parentCategoryId: number | null; ids: number[] }[],
) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) return { message: 'Authentication token not found.' };

        const response = await api.patch(
            '/menu/category/reorder',
            { groups },
            { headers: { Authorization: `Bearer ${authToken}` } },
        );
        return { message: response.data?.message ?? 'Category order saved.' };
    } catch (error: any) {
        return {
            message:
                error.response?.data?.message ??
                'Failed to save category order.',
        };
    }
}

export async function getMenuCategoriesByDine(dineId: string) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        // Now we fetch menus by dine area, then extract categories from those menus
        const response = await api.get(`/menu/menu/dine-area/${dineId}`, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        });

        if (response.status >= 500) {
            return {
                error:
                    response.data?.message ??
                    'Failed to fetch menu categories. Try again.',
            };
        }

        // Extract all categories from all menus and flatten them
        const menus = response.data || [];
        const allCategories = menus.flatMap(
            (menu: any) => menu.categories || [],
        );

        return { data: allCategories };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function updateMenuCategory(id: number, data: any) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { message: 'Authentication token not found.' };
        }

        const apiUrl = new URL(`/menu/${id}/category`, BASE_URL).toString();
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
                    'Failed to update menu category. Please try again.',
            };
        }

        return {
            message: 'Menu category updated successfully!',
            data: await safeResponseJson(response),
        };
    } catch (error: any) {
        return { message: 'An unexpected error occurred. Please try again.' };
    }
}

export async function deleteMenuCategory(id: number) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { message: 'Authentication token not found.' };
        }

        const apiUrl = new URL(`/menu/${id}/category`, BASE_URL).toString();
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
                    'Failed to delete menu category. Please try again.',
            };
        }

        return { message: 'Menu category deleted successfully!' };
    } catch (error: any) {
        return { message: 'An unexpected error occurred. Please try again.' };
    }
}

export async function deleteMenuCategoryBulk(ids: number[]) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { message: 'Authentication token not found.' };
        }

        const apiUrl = new URL(`/menu/category/bulk`, BASE_URL).toString();
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
                    'Failed to delete menu category. Please try again.',
            };
        }

        return { message: 'Menu categories deleted successfully!' };
    } catch (error: any) {
        return { message: 'An unexpected error occurred. Please try again.' };
    }
}

export async function getOneMenuCategories(id: string) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const response = await api.get(`/menu/category/${id}`, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        });

        if (response.status >= 500) {
            return {
                error:
                    response.data?.message ??
                    'Failed to fetch menu category. Try again.',
            };
        }

        return { data: response.data };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}
