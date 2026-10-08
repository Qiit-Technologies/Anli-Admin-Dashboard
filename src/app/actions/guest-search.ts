import { BASE_URL } from '@/constants/api';
import { getAuthToken } from './auth/auth-token';
import { safeResponseJson, safeResponseJsonOrNull, safeErrorJson } from '@/lib/api';

interface SearchGuestsParams {
    query: string;
    searchType?: 'name' | 'phone' | 'email';
}

export async function searchGuests(params: SearchGuestsParams) {
    try {
        const authToken = await getAuthToken();

        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const queryParams = new URLSearchParams({
            query: params.query,
            ...(params.searchType && { searchType: params.searchType }),
        });

        const apiUrl = new URL(
            `/guests/search?${queryParams}`,
            BASE_URL,
        ).toString();

        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        });

        if (!response.ok) {
            const error = await safeErrorJson(response);
            return {
                error:
                    error.message ||
                    'Failed to search guests. Please try again.',
            };
        }

        const result = await safeResponseJson(response);
        return {
            success: true,
            data: result,
        };
    } catch (error: any) {
        return {
            error: 'An unexpected error occurred while searching guests.',
        };
    }
}

export async function getGuestStays(profileId: string) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const apiUrl = new URL(
            `/guests/profiles/${profileId}/stays`,
            BASE_URL,
        ).toString();

        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        });

        if (!response.ok) {
            const error = await safeErrorJson(response);
            return {
                error:
                    error.message ||
                    'Failed to fetch guest stays. Please try again.',
            };
        }

        const result = await safeResponseJson(response);
        return {
            success: true,
            data: result,
        };
    } catch (error: any) {
        return {
            error: 'An unexpected error occurred while fetching guest stays.',
        };
    }
}
