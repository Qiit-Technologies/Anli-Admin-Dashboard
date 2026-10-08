import { BASE_URL } from '@/constants/api';
import api from '@/lib/axios';
import { getAuthToken } from './auth/auth-token';
import { safeResponseJson, safeResponseJsonOrNull, safeErrorJson } from '@/lib/api';

interface UpdateMenuItemOnMenuPayload {
    menuId: number;
    menuItemId: number;
    price?: number;
    isAvailable?: boolean;
    propagateToMenuIds?: number[];
}

export async function createMenuItem(data: any) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { message: 'Authentication token not found.' };
        }

        const payload = {
            name: data.name,
            description: data.description,
            price: data.price,
            category: data.categoryId,
            subCategory: data.subCategoryId ?? null,
            imageUrl: data.imageUrl ?? '',
            isVisibleOnDigitalMenu: data.isVisibleOnDigitalMenu ?? true,
        };

        const apiUrl = new URL('/menu/item', BASE_URL).toString();
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify(payload),
            credentials: 'include',
        });

        if (!response.ok) {
            const error = await safeErrorJson(response);
            return {
                message:
                    error.message ||
                    'Failed to create menu item. Please try again.',
            };
        }

        return {
            message: 'Menu item created successfully!',
            data: await safeResponseJson(response),
        };
    } catch (error: any) {
        return { message: 'An unexpected error occurred. Please try again.' };
    }
}

export async function getMenuItems() {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const response = await api.get('/menu/item', {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        });

        if (response.status >= 500) {
            return {
                error:
                    response.data?.message ??
                    'Failed to fetch menu item. Try again.',
            };
        }

        return { data: response.data };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function getMenusForMenuItem(menuItemId: number) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const response = await api.get(`/menu/item/${menuItemId}/menus`, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        });

        if (response.status >= 500) {
            return {
                error:
                    response.data?.message ??
                    'Failed to fetch menus for menu item. Try again.',
            };
        }

        return { data: response.data };
    } catch (error: any) {
        return {
            error: 'An unexpected error occurred while fetching menus for menu item. Please try again.',
        };
    }
}

export async function getPublicMenuItems(hotelId: string | number) {
    try {
        if (!hotelId || hotelId === 'NaN' || isNaN(Number(hotelId))) {
            return {
                error: 'Hotel ID is required and must be a valid number.',
            };
        }

        const response = await api.get(`/menu/public/item?hotelId=${hotelId}`, {
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (response.status >= 500) {
            return {
                error:
                    response.data?.message ??
                    'Failed to fetch public menu items. Try again.',
            };
        }
        if (response.status >= 200 && response.status < 300) {
            return { data: response.data };
        }
        return {
            error:
                response.data?.message ??
                'Failed to fetch public menu items. An unknown error occurred.',
        };
    } catch (error: any) {
        if (
            error.response &&
            error.response.data &&
            error.response.data.message
        ) {
            return { error: error.response.data.message };
        }
        return {
            error: 'An unexpected error occurred while fetching public menu items. Please try again.',
        };
    }
}

export async function getPublicMenus(hotelId: string | number) {
    try {
        if (!hotelId || hotelId === 'NaN' || isNaN(Number(hotelId))) {
            return {
                error: 'Hotel ID is required and must be a valid number.',
            };
        }

        const response = await api.get(`/menu/public/menu?hotelId=${hotelId}`, {
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (response.status >= 500) {
            return {
                error:
                    response.data?.message ??
                    'Failed to fetch public menus. Try again.',
            };
        }
        if (response.status >= 200 && response.status < 300) {
            return { data: response.data };
        }
        return {
            error:
                response.data?.message ??
                'Failed to fetch public menus. An unknown error occurred.',
        };
    } catch (error: any) {
        if (
            error.response &&
            error.response.data &&
            error.response.data.message
        ) {
            return { error: error.response.data.message };
        }
        return {
            error: 'An unexpected error occurred while fetching public menus. Please try again.',
        };
    }
}

export async function getPublicMenuDineItems(dineId: string | number) {
    try {
        if (!dineId) {
            return { error: 'Dine ID is required.' };
        }

        const response = await api.get(`/restaurants/dine/${dineId}/menus`, {
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (response.status >= 500) {
            return {
                error:
                    response.data?.message ??
                    'Failed to fetch public menu items. Try again.',
            };
        }
        if (response.status >= 200 && response.status < 300) {
            return { data: response.data };
        }
        return {
            error:
                response.data?.message ??
                'Failed to fetch public menu items. An unknown error occurred.',
        };
    } catch (error: any) {
        if (
            error.response &&
            error.response.data &&
            error.response.data.message
        ) {
            return { error: error.response.data.message };
        }
        return {
            error: 'An unexpected error occurred while fetching public menu items. Please try again.',
        };
    }
}

export async function updateMenuItem(id: number, data: any) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { message: 'Authentication token not found.' };
        }
        if (!id) {
            return { error: 'Menu item ID is required.' };
        }

        const response = await api.patch(`/menu/${id}/item`, data, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        });

        if (response.status >= 500) {
            return {
                error:
                    response.data?.message ??
                    'Failed to update menu item. Try again.',
            };
        }
        if (response.status >= 200 && response.status < 300) {
            return {
                message: 'Menu item updated successfully!',
                data: response.data,
            };
        }
        return {
            error:
                response.data?.message ??
                'Failed to update menu item. An unknown error occurred.',
        };
    } catch (error: any) {
        if (
            error.response &&
            error.response.data &&
            error.response.data.message
        ) {
            return { error: error.response.data.message };
        }
        return {
            error: 'An unexpected error occurred while updating menu item. Please try again.',
        };
    }
}

export async function deleteMenuItem(id: number) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { message: 'Authentication token not found.' };
        }

        const apiUrl = new URL(`/menu/${id}/item`, BASE_URL).toString();
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
                    'Failed to delete menu item. Please try again.',
            };
        }

        return { message: 'Menu item deleted successfully!' };
    } catch (error: any) {
        return { message: 'An unexpected error occurred. Please try again.' };
    }
}

export async function deleteMenuItemBulk(ids: number[]) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { message: 'Authentication token not found.' };
        }

        const apiUrl = new URL(`/menu/item/bulk`, BASE_URL).toString();
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
                    'Failed to delete menu item. Please try again.',
            };
        }

        return { message: 'Menu items deleted successfully!' };
    } catch (error: any) {
        return { message: 'An unexpected error occurred. Please try again.' };
    }
}

export async function updateMenuItemStatus(id: number, isAvailable: boolean) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { message: 'Authentication token not found.' };
        }

        const apiUrl = new URL(`/menu/${id}/item-status`, BASE_URL).toString();
        const response = await fetch(apiUrl, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify({ isAvailable }),
            credentials: 'include',
        });

        if (!response.ok) {
            const error = await safeErrorJson(response);
            return {
                message:
                    error.message ||
                    'Failed to update menu item status. Please try again.',
            };
        }

        return {
            message: 'Menu item status updated successfully!',
            data: await safeResponseJson(response),
        };
    } catch (error: any) {
        return { message: 'An unexpected error occurred. Please try again.' };
    }
}

export async function updateMenuItemOnMenus(
    payload: UpdateMenuItemOnMenuPayload,
) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { message: 'Authentication token not found.' };
        }

        const apiUrl = new URL('/menu/menu/item-on-menu', BASE_URL).toString();

        const response = await fetch(apiUrl, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify(payload),
            credentials: 'include',
        });

        if (!response.ok) {
            const error = await safeErrorJson(response);
            return {
                message:
                    error.message ||
                    'Failed to update menu item on menus. Please try again.',
            };
        }

        return {
            message: 'Menu item updated on menus successfully!',
            data: await safeResponseJson(response),
        };
    } catch (error: any) {
        return {
            message:
                'An unexpected error occurred while updating menu item on menus. Please try again.',
        };
    }
}

export async function verifyGuestOrderPayment(
    reference: string,
    orderId: string,
) {
    try {
        const response = await api.get(
            `/paystack/verify?reference=${reference}&orderId=${Number(orderId)}`,
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
                    'Failed to verified payment. Try again.',
            };
        }

        return { data: response.data };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export const bulkUploadFBItemsCsv = async (file: File | null) => {
    if (file) {
        try {
            const authToken = await getAuthToken();
            if (!authToken) {
                throw new Error('Authentication token not found.');
            }

            const formData = new FormData();
            formData.append('file', file);

            const apiUrl = new URL('/menu/csv', BASE_URL).toString();
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

export async function exportMenuCategories() {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const apiUrl = new URL(
            '/menu/export/categories/excel',
            BASE_URL,
        ).toString();

        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${authToken}`,
            },
            credentials: 'include',
        });

        if (!response.ok) {
            const error = await safeErrorJson(response);
            return {
                error:
                    error.message ||
                    'Failed to export menu categories. Please try again.',
            };
        }

        const blob = await response.blob();

        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'categories.xlsx';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        return { success: true, message: 'File downloaded successfully' };
    } catch (error: any) {
        return {
            error: 'An unexpected error occurred while exporting menu categories.',
        };
    }
}

export async function exportMenuSubCategories() {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const apiUrl = new URL(
            '/menu/export/sub-categories/excel',
            BASE_URL,
        ).toString();

        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${authToken}`,
            },
            credentials: 'include',
        });

        if (!response.ok) {
            const error = await safeErrorJson(response);
            return {
                error:
                    error.message ||
                    'Failed to export menu sub-categories. Please try again.',
            };
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'sub-categories.xlsx';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        return { success: true, message: 'File downloaded successfully' };
    } catch (error: any) {
        return {
            error: 'An unexpected error occurred while exporting menu sub-categories.',
        };
    }
}

export async function exportMenuItems() {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const apiUrl = new URL('/menu/export/items/excel', BASE_URL).toString();

        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${authToken}`,
            },
            credentials: 'include',
        });

        if (!response.ok) {
            const error = await safeErrorJson(response);
            return {
                error:
                    error.message ||
                    'Failed to export menu items. Please try again.',
            };
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'menu-items.xlsx';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        return { success: true, message: 'File downloaded successfully' };
    } catch (error: any) {
        return {
            error: 'An unexpected error occurred while exporting menu items.',
        };
    }
}
