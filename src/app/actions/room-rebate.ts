'use server';

import { BASE_URL } from '@/constants/api';
import { getAuthToken } from './auth/auth-token';
import { safeResponseJson, safeResponseJsonOrNull, safeErrorJson } from '@/lib/api';

export interface RoomRebatePayload {
    guestId: number;
    newRate: number;
    effectiveDate: string;
    comment: string;
}

export interface RemoveRoomRebatePayload {
    guestId: number;
    reason: string;
}

export interface RoomRebateState {
    hasActiveRebate: boolean;
    rebateRate?: number | string | null;
    rebateEffectiveDate?: string | null;
    rebateComment?: string | null;
    rebateAppliedAt?: string | null;
}

export async function applyRoomRebate(payload: RoomRebatePayload) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const apiUrl = new URL('/guests/room-rebate', BASE_URL).toString();

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const error = await safeErrorJson(response);
            return {
                error:
                    error.message ||
                    'Failed to apply room rebate. Please try again.',
            };
        }

        const result = await safeResponseJson(response);
        return {
            success: true,
            message: result.message || 'Room rebate applied successfully!',
            data: result,
        };
    } catch {
        return {
            error: 'An unexpected error occurred while applying room rebate.',
        };
    }
}

export async function removeRoomRebate(payload: RemoveRoomRebatePayload) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const apiUrl = new URL(
            '/guests/room-rebate/remove',
            BASE_URL,
        ).toString();

        const response = await fetch(apiUrl, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const error = await safeErrorJson(response);
            return {
                error:
                    error.message ||
                    'Failed to remove room rebate. Please try again.',
            };
        }

        const result = await safeResponseJson(response);
        return {
            success: true,
            message: result.message || 'Room rebate removed successfully!',
            data: result,
        };
    } catch {
        return {
            error: 'An unexpected error occurred while removing room rebate.',
        };
    }
}

export async function getRoomRebateState(guestId: number) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const apiUrl = new URL(
            `/guests/${guestId}/room-rebate-state`,
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
                    'Failed to fetch room rebate state. Please try again.',
            };
        }

        const result = await safeResponseJson(response);
        return {
            success: true,
            data: result as RoomRebateState,
        };
    } catch {
        return {
            error: 'An unexpected error occurred while fetching room rebate state.',
        };
    }
}
