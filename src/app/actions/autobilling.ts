'use server';

import { BASE_URL } from '@/constants/api';
import { getAuthToken } from './auth/auth-token';
import { safeResponseJson, safeResponseJsonOrNull } from '@/lib/api';

export interface AutobillingResponse {
    success?: boolean;
    message?: string;
    postedCharges?: number;
    totalCharges?: number;
    nights?: number;
    roomsAffected?: number;
    totalOutstanding?: number;
    details?: any;
    error?: string;
    status?: string;
    errors?: Record<string, string>;
    skipped?: boolean;
    rooms?: string[] | null;
}

export interface AutoBillingSettings {
    autoBillingEnabled: boolean;
    autoBillingTime: string;
}

export interface AutoBillingLogEntry {
    id: number;
    executionDate: string;
    executedAt: string;
    status: string;
    postedCharges: number;
    totalCharges?: number;
    roomsAffected: number;
    rooms: string[] | null;
    totalOutstanding: number;
    errors: Record<string, string> | null;
    notes: string | null;
}

export async function applyAutobillingToRooms(
    roomIds: number[],
    nights: number = 1,
): Promise<AutobillingResponse> {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const apiUrl = new URL(
            `/guests/apply-auto-billing`,
            BASE_URL,
        ).toString();

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify({ roomIds, nights }),
        });

        const result = await safeResponseJson(response).catch(() => ({}));
        if (!response.ok) {
            return {
                error:
                    result?.message ||
                    'Failed to apply autobilling to selected rooms.',
            };
        }
        return {
            success: true,
            message:
                result?.message ||
                `Autobilling applied to ${roomIds.length} room(s).`,
            postedCharges: result?.postedCharges,
            nights: result?.nights ?? nights,
            roomsAffected: result?.roomsAffected ?? roomIds.length,
            totalOutstanding: result?.totalOutstanding,
            details: result?.details,
        };
    } catch (error: any) {
        return {
            error: 'An unexpected error occurred while applying autobilling.',
        };
    }
}

export async function applyAutobillingToAll(
    nights: number = 1,
): Promise<AutobillingResponse> {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const apiUrl = new URL(
            `/guests/apply-auto-billing`,
            BASE_URL,
        ).toString();

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify({ nights }),
        });

        const result = await safeResponseJson(response).catch(() => ({}));
        if (!response.ok) {
            return {
                error:
                    result?.message ||
                    'Failed to apply autobilling to all rooms.',
            };
        }
        return {
            success: true,
            message: result?.message || 'Autobilling applied to all rooms.',
            postedCharges: result?.postedCharges,
            nights: result?.nights ?? nights,
            roomsAffected: result?.roomsAffected,
            totalOutstanding: result?.totalOutstanding,
            details: result?.details,
        };
    } catch (error: any) {
        return {
            error: 'An unexpected error occurred while applying autobilling.',
        };
    }
}

export async function getAutoBillingSettings(): Promise<{
    data?: AutoBillingSettings;
    error?: string;
}> {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const response = await fetch(
            new URL('/hotels/auto-billing-settings', BASE_URL).toString(),
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authToken}`,
                },
            },
        );

        const result = await safeResponseJson(response).catch(() => ({}));
        if (!response.ok) {
            return {
                error:
                    result?.message || 'Failed to fetch autobilling settings.',
            };
        }

        return { data: result };
    } catch (error: any) {
        return { error: 'An unexpected error occurred.' };
    }
}

export async function updateAutoBillingSettings(payload: {
    autoBillingEnabled?: boolean;
}): Promise<{ data?: AutoBillingSettings; error?: string }> {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const response = await fetch(
            new URL('/hotels/auto-billing-settings', BASE_URL).toString(),
            {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authToken}`,
                },
                body: JSON.stringify(payload),
            },
        );

        const result = await safeResponseJson(response).catch(() => ({}));
        if (!response.ok) {
            return {
                error:
                    result?.message || 'Failed to update autobilling settings.',
            };
        }

        return { data: result };
    } catch (error: any) {
        return { error: 'An unexpected error occurred.' };
    }
}

export async function getAutoBillingLogs(
    limit = 20,
): Promise<{ data?: AutoBillingLogEntry[]; error?: string }> {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const response = await fetch(
            new URL(
                `/hotels/auto-billing-logs?limit=${limit}`,
                BASE_URL,
            ).toString(),
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authToken}`,
                },
            },
        );

        const result = await safeResponseJson(response).catch(() => ({}));
        if (!response.ok) {
            return {
                error: result?.message || 'Failed to fetch autobilling logs.',
            };
        }

        return { data: result };
    } catch (error: any) {
        return { error: 'An unexpected error occurred.' };
    }
}

export async function runAutomaticAutobilling(): Promise<AutobillingResponse> {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const response = await fetch(
            new URL('/guests/run-automatic-autobilling', BASE_URL).toString(),
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authToken}`,
                },
            },
        );

        const result = await safeResponseJson(response).catch(() => ({}));
        if (!response.ok) {
            return {
                error:
                    result?.message || 'Failed to run automatic autobilling.',
            };
        }

        return {
            success: true,
            message: result?.message || 'Automatic autobilling executed.',
            postedCharges: result?.postedCharges,
            totalCharges: result?.totalCharges,
            roomsAffected: result?.roomsAffected,
            totalOutstanding: result?.totalOutstanding,
            status: result?.status,
            errors: result?.errors,
            skipped: result?.skipped,
            rooms: result?.rooms,
        };
    } catch (error: any) {
        return {
            error: 'An unexpected error occurred while running automatic autobilling.',
        };
    }
}

export async function revertAutobillingForGuest(
    guestId: number | string,
): Promise<{
    success?: boolean;
    message?: string;
    revertedAmount?: number;
    error?: string;
}> {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const response = await fetch(
            new URL(
                `/guests/${guestId}/revert-autobilling`,
                BASE_URL,
            ).toString(),
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authToken}`,
                },
            },
        );

        const result = await safeResponseJson(response).catch(() => ({}));
        if (!response.ok) {
            return {
                error: result?.message || 'Failed to revert auto-billing.',
            };
        }
        return {
            success: true,
            message: result?.message || 'Auto-billing reverted.',
            revertedAmount: result?.revertedAmount,
        };
    } catch (error: any) {
        return {
            error: 'An unexpected error occurred while reverting auto-billing.',
        };
    }
}

export async function revertAutobillingToRooms(
    roomIds: number[],
): Promise<AutobillingResponse> {
    type RevertResult = { roomId: number; success: boolean; error?: string };
    const results: RevertResult[] = [];

    for (const roomId of roomIds) {
        const res = await revertAutobillingForGuest(roomId);
        results.push({ roomId, success: !!res.success, error: res.error });
    }

    const errors = results
        .filter((r) => r.error)
        .reduce(
            (acc, r) => ({ ...acc, [r.roomId]: r.error! }),
            {} as Record<string, string>,
        );

    const successCount = results.filter((r) => r.success).length;

    return {
        success: successCount > 0,
        message:
            successCount > 0
                ? `Auto-billing reverted for ${successCount} room(s).`
                : 'Failed to revert auto-billing for selected rooms.',
        roomsAffected: successCount,
        errors: Object.keys(errors).length > 0 ? errors : undefined,
    };
}

export async function getRevertableAutobillingGuests(): Promise<{
    data?: Array<{
        id: number;
        fullName: string;
        roomNumber: string;
        unrevertedCount: number;
    }>;
    error?: string;
}> {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const response = await fetch(
            new URL(
                '/guests/revertable-autobilling-guests',
                BASE_URL,
            ).toString(),
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authToken}`,
                },
            },
        );

        const result = await safeResponseJsonOrNull(response);
        if (!response.ok || !result) {
            return { error: 'Failed to fetch revertable auto-billing guests.' };
        }

        return { data: Array.isArray(result) ? result : [] };
    } catch {
        return { error: 'An unexpected error occurred.' };
    }
}

export async function revertAutobillingAll(): Promise<AutobillingResponse> {
    try {
        const revertableRes = await getRevertableAutobillingGuests();
        if (revertableRes.error || !revertableRes.data) {
            return {
                error:
                    revertableRes.error || 'Failed to fetch revertable guests.',
            };
        }

        const guestIds: number[] = revertableRes.data.map((g) => g.id);
        if (guestIds.length === 0) {
            return {
                success: false,
                message: 'No auto-billed guests found to revert.',
            };
        }

        const results = await Promise.allSettled(
            guestIds.map((id) => revertAutobillingForGuest(id)),
        );

        const succeeded = results.filter(
            (r) => r.status === 'fulfilled' && (r as any).value?.success,
        ).length;

        return {
            success: succeeded > 0,
            message: `Auto-billing reverted for ${succeeded} of ${guestIds.length} guest(s).`,
            roomsAffected: succeeded,
        };
    } catch (error: any) {
        return {
            error: 'An unexpected error occurred while reverting auto-billing for all rooms.',
        };
    }
}
