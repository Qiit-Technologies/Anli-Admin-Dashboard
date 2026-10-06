'use server';

import api from '@/lib/axios';
import { BASE_URL } from '@/constants/api';
import { setAccessTokenCookie } from '@/lib/set-access-token-cookie';
import { safeResponseJson, safeResponseJsonOrNull, safeErrorJson } from '@/lib/api';

export interface StaffLoginResponse {
    message: string;
    data?: {
        token?: string;
        staff?: {
            id: number;
            fullName: string;
            email: string;
            roles: {
                name: string;
                id: number;
            };
            modules?: Array<{ id: number; name: string }>;
            hotel?: {
                id: number;
            };
        };
        user?: {
            id: number;
            fullName: string;
            email: string;
            roles: {
                name: string;
                id: number;
            };
            modules?: Array<{ id: number; name: string }>;
            hotel?: {
                id: number;
            };
        };
    };
}

/**
 * Login as a staff member by ID and PIN
 * This allows staff to login using their staff ID and 4-digit PIN
 */
export async function staffLogin(
    staffId: number,
    pin: string,
): Promise<StaffLoginResponse> {
    try {
        const response = await api.post('/auth/staff-login', { staffId, pin });
        if (response.status !== 200) {
            const error = await response.data;
            return {
                message: error.message || 'Staff login failed',
            };
        }

        const payload = response?.data;
        const accessToken = payload?.data?.token;
        if (accessToken) {
            await setAccessTokenCookie(accessToken);
        }

        const staffPayload = payload?.data?.staff || payload?.data?.user;

        return {
            message: 'Staff login successful!',
            data: {
                ...payload?.data,
                staff: staffPayload,
            },
        };
    } catch (error: any) {
        return {
            message:
                (
                    error as unknown as {
                        response?: { data?: { message?: string } };
                    }
                )?.response?.data?.message ||
                'An unexpected error occurred. Please try again.',
        };
    }
}

/**
 * Get staff members scheduled for today's shift
 * @param hotelId - Optional hotel ID to filter staff by hotel
 */
export async function getScheduledStaffForToday(hotelId?: number | string) {
    try {
        const params: Record<string, string> = {};
        if (hotelId) {
            params.hotelId = hotelId.toString();
        }

        const response = await api.get('/staff/scheduled/today', { params });
        if (response.status !== 200) {
            const error = await response.data;
            return {
                error: error.message || 'Failed to fetch scheduled staff',
            };
        }
        const data = await response.data;
        return { data: data.data || [] };
    } catch (error: any) {
        return {
            error: 'An unexpected error occurred. Please try again.',
        };
    }
}

/**
 * Get currently logged in staff members
 * @param hotelId - Optional hotel ID to filter staff by hotel
 */
export async function getCurrentlyLoggedInStaff(hotelId?: number | string) {
    try {
        const params: Record<string, string> = {};
        if (hotelId) {
            params.hotelId = hotelId.toString();
        }

        const response = await api.get('/staff/logged-in', { params });
        if (response.status !== 200) {
            const error = await response.data;
            return {
                error: error.message || 'Failed to fetch logged in staff',
            };
        }
        const data = await response.data;
        return { data: data.data || [] };
    } catch (error: any) {
        return {
            error: 'An unexpected error occurred. Please try again.',
        };
    }
}

/**
 * Get all staff members (for public staff login page)
 * This endpoint doesn't require authentication
 * @param hotelId - Optional hotel ID to filter staff by hotel
 */
export async function getPublicStaffList(hotelId?: number | string) {
    try {
        const apiUrl = new URL('/staff/public', BASE_URL);

        // Add hotelId as query parameter if provided
        if (hotelId) {
            apiUrl.searchParams.append('hotelId', hotelId.toString());
        }

        const response = await fetch(apiUrl.toString(), {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        });

        if (!response.ok) {
            const error = await safeErrorJson(response);
            return {
                error: error.message || 'Failed to fetch staff list',
            };
        }

        const data = await safeResponseJson(response);
        return { data: data.data || [] };
    } catch (error: any) {
        return {
            error: 'An unexpected error occurred. Please try again.',
        };
    }
}
