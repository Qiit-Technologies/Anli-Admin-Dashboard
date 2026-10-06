import { BASE_URL } from '@/constants/api';
import { getAuthToken } from './auth/auth-token';
import { RoomTypeStats } from '@/components/house-keeping/common/cards/Dashboard';
import { safeResponseJson, safeResponseJsonOrNull, safeErrorJson } from '@/lib/api';

export async function createRoomType(formData: FormData) {
    const name = formData.get('name');
    const description = formData.get('description');

    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { message: 'Authentication token not found.' };
        }

        const apiUrl = new URL(`/roomtypes`, BASE_URL).toString();
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify({ name, description }),
            credentials: 'include',
        });

        if (!response.ok) {
            const error = await safeErrorJson(response);
            return {
                message:
                    error.message ||
                    'Room type creation failed. Please try again.',
            };
        }

        return { message: 'Room type created successfully!' };
    } catch (error: any) {
        return { message: 'An unexpected error occurred. Please try again.' };
    }
}

export async function getRoomTypesByHotelId(): Promise<
    { error?: string; data?: any[] } | boolean
> {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const apiUrl = new URL(`/roomtypes`, BASE_URL).toString();

        const response = await fetch(apiUrl, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        });

        if (!response.ok) {
            const error = await safeErrorJson(response);
            return {
                error:
                    error.message || 'Failed to fetch room types. Try again.',
            };
        }

        const data = await safeResponseJson(response);

        return { data };
    } catch (error: any) {
        console.error('Error fetching room types:', error);
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function getRoomTypesStatByHotelId(): Promise<
    | { error?: string; data?: RoomTypeStats[] }
    | { data: RoomTypeStats[] }
    | { error: string }
> {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const apiUrl = new URL(`/roomtypes/stat`, BASE_URL).toString();

        const response = await fetch(apiUrl, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        });

        if (!response.ok) {
            const error = await safeErrorJson(response);
            return { error: error.message || 'Failed to fetch room types.' };
        }

        const data = await safeResponseJson(response);
        return { data };
    } catch (error: any) {
        console.log('Error fetching room types:', error);
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function editRoomType(roomTypeId: string, formData: any) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const apiUrl = new URL(
            `/roomtypes/${Number(roomTypeId)}`,
            BASE_URL,
        ).toString();
        const response = await fetch(apiUrl, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify({
                name: formData.name,
                description: formData.description,
            }),
            credentials: 'include',
        });

        if (!response.ok) {
            const error = await safeErrorJson(response);
            return {
                message:
                    error.message ||
                    'Room type update failed. Please try again.',
            };
        }
        return { message: 'Room type updated successfully' };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function deleteRoomType(roomTypeId: string) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const apiUrl = new URL(
            `/roomtypes/${Number(roomTypeId)}`,
            BASE_URL,
        ).toString();
        const response = await fetch(apiUrl, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${authToken}`,
            },
            credentials: 'include',
        });

        if (!response.ok) {
            const error = await safeErrorJson(response);
            return {
                message:
                    error.message ||
                    'Room type deletion failed. Please try again.',
            };
        }
        return { message: 'Room type deleted successfully' };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}
