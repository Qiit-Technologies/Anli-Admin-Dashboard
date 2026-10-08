import { BASE_URL } from '@/constants/api';
import api from '@/lib/axios';
import { getAuthToken } from './auth/auth-token';
import { unstable_noStore as noStore } from 'next/cache';
import { safeResponseJson, safeResponseJsonOrNull, safeErrorJson } from '@/lib/api';

export async function getMe(): Promise<{ data?: any } | { error: string }> {
    noStore();
    const authToken = await getAuthToken();
    try {
        const response = await api.get('/users/me', {
            withCredentials: true,
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control':
                    'no-store, no-cache, must-revalidate, proxy-revalidate',
                Pragma: 'no-cache',
                Expires: '0',
                Authorization: `Bearer ${authToken}`,
            },
        });

        if (response.status >= 400) {
            const error = await response.data;
            return {
                error:
                    error.message ||
                    'Failed to fetch user info. Please try again.',
            };
        }

        const data = await response.data;
        return { data };
    } catch (error: any) {
        console.log('Error:', error);
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function updateProfile(formData: FormData) {
    const email = formData.get('email');
    const name = formData.get('name');
    const currentPassword = formData.get('currentPassword');
    const newPassword = formData.get('newPassword');
    const currentPin = formData.get('currentPin');
    const newPin = formData.get('newPin');

    try {
        const apiUrl = new URL(`/users`, BASE_URL).toString();
        const authToken = await getAuthToken();
        const response = await fetch(apiUrl, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify({
                email,
                name,
                currentPassword,
                newPassword,
                currentPin,
                newPin,
            }),
            credentials: 'include',
        });

        if (!response.ok) {
            const error = await safeErrorJson(response);
            return {
                message: error.message || 'Update failed. Please try again.',
            };
        }
        return { message: 'Profile updated successfully' };
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function uploadProfilePicture(formData: FormData) {
    try {
        const response = await api.post('/users/profile-image', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                Authorization: `Bearer ${await getAuthToken()}`,
            },
        });
        return response;
    } catch (error: any) {
        console.error('Error uploading profile picture:', error);
        throw error;
    }
}

export async function createUser(formData: FormData) {
    const email = formData.get('email');
    const name = formData.get('name');
    const currentPassword = formData.get('currentPassword');
    const newPassword = formData.get('newPassword');

    try {
        const url = new URL(window.location.href);
        const pathSegments = url.pathname.split('/');
        const hotelId = pathSegments[pathSegments.length - 1];
        const apiUrl = new URL(`/users`, BASE_URL).toString();
        // const authToken = await getAuthToken();
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify({
                email,
                name,
                currentPassword,
                newPassword,
                hotelId,
            }),
            credentials: 'include',
        });

        if (!response.ok) {
            const error = await safeErrorJson(response);
            return {
                message: error.message || 'Update failed. Please try again.',
            };
        }
        return { message: 'Profile updated successfully' };
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function resetStaffPassword(id: number) {
    try {
        const apiUrl = new URL(
            `/users/${id}/reset-password`,
            BASE_URL,
        ).toString();
        const authToken = await getAuthToken();
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
                message: error.message || 'Reset failed. Please try again.',
            };
        }
        return { message: 'Reset password successfully' };
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}
