import { BASE_URL } from '@/constants/api';
import api from '@/lib/axios';
import { getAuthToken } from './auth/auth-token';
import { safeResponseJson, safeResponseJsonOrNull, safeErrorJson } from '@/lib/api';

// Modifier Group Types
export interface ModifierGroup {
    id: number;
    name: string;
    description?: string;
    isRequired: boolean;
    allowMultiple: boolean;
    minSelections: number;
    maxSelections: number;
    displayOrder: number;
    options?: ModifierOption[];
    menuItems?: any[];
}

export interface ModifierOption {
    id: number;
    name: string;
    description?: string;
    price: number;
    isAvailable: boolean;
    displayOrder: number;
    modifierGroupId?: number;
}

export interface CreateModifierGroupDto {
    name: string;
    description?: string;
    isRequired?: boolean;
    allowMultiple?: boolean;
    minSelections?: number;
    maxSelections?: number;
    displayOrder?: number;
}

export interface UpdateModifierGroupDto {
    name?: string;
    description?: string;
    isRequired?: boolean;
    allowMultiple?: boolean;
    minSelections?: number;
    maxSelections?: number;
    displayOrder?: number;
}

export interface CreateModifierOptionDto {
    modifierGroupId: number;
    name: string;
    description?: string;
    price?: number;
    isAvailable?: boolean;
    displayOrder?: number;
}

export interface UpdateModifierOptionDto {
    name?: string;
    description?: string;
    price?: number;
    isAvailable?: boolean;
    displayOrder?: number;
}

export interface AttachModifierGroupsDto {
    modifierGroupIds: number[];
}

// ==================== Modifier Group Actions ====================

export async function createModifierGroup(data: CreateModifierGroupDto) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const response = await api.post('/menu/modifier-group', data, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        });

        if (response.status >= 500) {
            return {
                error:
                    response.data?.message ??
                    'Failed to create modifier group. Try again.',
            };
        }

        return { data: response.data };
    } catch (error: any) {
        if (error.response?.data?.message) {
            return { error: error.response.data.message };
        }
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function getModifierGroups() {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const response = await api.get('/menu/modifier-group', {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        });

        if (response.status >= 500) {
            return {
                error:
                    response.data?.message ??
                    'Failed to fetch modifier groups. Try again.',
            };
        }

        return { data: response.data };
    } catch (error: any) {
        if (error.response?.data?.message) {
            return { error: error.response.data.message };
        }
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function getModifierGroup(id: number) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const response = await api.get(`/menu/modifier-group/${id}`, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        });

        if (response.status >= 500) {
            return {
                error:
                    response.data?.message ??
                    'Failed to fetch modifier group. Try again.',
            };
        }

        return { data: response.data };
    } catch (error: any) {
        if (error.response?.data?.message) {
            return { error: error.response.data.message };
        }
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function updateModifierGroup(
    id: number,
    data: UpdateModifierGroupDto,
) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const response = await api.patch(`/menu/modifier-group/${id}`, data, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        });

        if (response.status >= 500) {
            return {
                error:
                    response.data?.message ??
                    'Failed to update modifier group. Try again.',
            };
        }

        return { data: response.data };
    } catch (error: any) {
        if (error.response?.data?.message) {
            return { error: error.response.data.message };
        }
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function deleteModifierGroup(id: number) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { message: 'Authentication token not found.' };
        }

        const apiUrl = new URL(
            `/menu/modifier-group/${id}`,
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
                    error.message ||
                    'Failed to delete modifier group. Please try again.',
            };
        }

        return { message: 'Modifier group deleted successfully!' };
    } catch (error: any) {
        return { message: 'An unexpected error occurred. Please try again.' };
    }
}

// ==================== Modifier Option Actions ====================

export async function createModifierOption(data: CreateModifierOptionDto) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const response = await api.post('/menu/modifier-option', data, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        });

        if (response.status >= 500) {
            return {
                error:
                    response.data?.message ??
                    'Failed to create modifier option. Try again.',
            };
        }

        return { data: response.data };
    } catch (error: any) {
        if (error.response?.data?.message) {
            return { error: error.response.data.message };
        }
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function getModifierOptions(modifierGroupId: number) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const response = await api.get(
            `/menu/modifier-group/${modifierGroupId}/modifier-option`,
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authToken}`,
                },
            },
        );

        if (response.status >= 500) {
            return {
                error:
                    response.data?.message ??
                    'Failed to fetch modifier options. Try again.',
            };
        }

        return { data: response.data };
    } catch (error: any) {
        if (error.response?.data?.message) {
            return { error: error.response.data.message };
        }
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function getModifierOption(id: number) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const response = await api.get(`/menu/modifier-option/${id}`, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        });

        if (response.status >= 500) {
            return {
                error:
                    response.data?.message ??
                    'Failed to fetch modifier option. Try again.',
            };
        }

        return { data: response.data };
    } catch (error: any) {
        if (error.response?.data?.message) {
            return { error: error.response.data.message };
        }
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function updateModifierOption(
    id: number,
    data: UpdateModifierOptionDto,
) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const response = await api.patch(`/menu/modifier-option/${id}`, data, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        });

        if (response.status >= 500) {
            return {
                error:
                    response.data?.message ??
                    'Failed to update modifier option. Try again.',
            };
        }

        return { data: response.data };
    } catch (error: any) {
        if (error.response?.data?.message) {
            return { error: error.response.data.message };
        }
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function deleteModifierOption(id: number) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { message: 'Authentication token not found.' };
        }

        const apiUrl = new URL(
            `/menu/modifier-option/${id}`,
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
                    error.message ||
                    'Failed to delete modifier option. Please try again.',
            };
        }

        return { message: 'Modifier option deleted successfully!' };
    } catch (error: any) {
        return { message: 'An unexpected error occurred. Please try again.' };
    }
}

// ==================== Attach Modifier Groups to Menu Item ====================

export async function attachModifierGroupsToMenuItem(
    menuItemId: number,
    data: AttachModifierGroupsDto,
) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const response = await api.post(
            `/menu/item/${menuItemId}/modifier-groups`,
            data,
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authToken}`,
                },
            },
        );

        if (response.status >= 500) {
            return {
                error:
                    response.data?.message ??
                    'Failed to attach modifier groups. Try again.',
            };
        }

        return { data: response.data };
    } catch (error: any) {
        if (error.response?.data?.message) {
            return { error: error.response.data.message };
        }
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function getMenuItemWithModifiers(menuItemId: number) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const response = await api.get(`/menu/item/${menuItemId}/modifiers`, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        });

        if (response.status >= 500) {
            return {
                error:
                    response.data?.message ??
                    'Failed to fetch menu item with modifiers. Try again.',
            };
        }

        return { data: response.data };
    } catch (error: any) {
        if (error.response?.data?.message) {
            return { error: error.response.data.message };
        }
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}
