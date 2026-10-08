import { BASE_URL } from '@/constants/api';
import api from '@/lib/axios';
import { getAuthToken } from './auth/auth-token';
import { safeResponseJson, safeResponseJsonOrNull, safeErrorJson } from '@/lib/api';

export interface CheckInPayload {
    creditToApply?: number;
    guestProfileId?: number;
}

export async function checkInGuest(id: number, payload?: CheckInPayload) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { message: 'Authentication token not found.' };
        }

        const apiUrl = new URL(`/guests/${id}/checkin`, BASE_URL).toString();
        const response = await fetch(apiUrl, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify(payload || {}),
        });

        if (!response.ok) {
            const error = await safeErrorJson(response);
            return {
                message: error.message || 'Check In failed. Please try again.',
            };
        }

        return { message: 'Check In successfully!' };
    } catch (error: any) {
        return { message: 'An unexpected error occurred. Please try again.' };
    }
}

export async function getCheckInsByHotelId() {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const response = await api.get('/guests/check-in', {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        });

        if (response.status >= 500) {
            const error = await response.data;
            return {
                error: error.message || 'Failed to fetch check ins. Try again.',
            };
        }

        const data = await response.data;

        return { data };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function getOneCheckInByHotelId(id: number) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const response = await api.get(`/guests/${id}`, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        });

        if (response.status >= 500) {
            const error = await response.data;
            return {
                error: error.message || 'Failed to fetch check ins. Try again.',
            };
        }

        const data = await response.data;

        return { data };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}
