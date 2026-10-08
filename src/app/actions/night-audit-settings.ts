'use server';

import { BASE_URL } from '@/constants/api';
import { getAuthToken } from './auth/auth-token';
import { safeResponseJson } from '@/lib/api';

export interface NightAuditDefaultStaff {
    id: number;
    fullName: string;
    email: string | null;
    role: string | null;
}

export interface NightAuditEmailSettings {
    nightAuditEmailEnabled: boolean;
    nightAuditEmailTime: string;
    nightAuditEmailStaffIds: number[] | null;

    controlSheetEmailEnabled: boolean;
    controlSheetEmailTime: string;
    controlSheetEmailStaffIds: number[] | null;

    stockMovementEmailEnabled: boolean;
    stockMovementEmailTime: string;
    stockMovementEmailStaffIds: number[] | null;

    defaultRoleBasedStaff: NightAuditDefaultStaff[];
    defaultControlSheetStaff?: NightAuditDefaultStaff[];
    defaultStockMovementStaff?: NightAuditDefaultStaff[];
}

export async function getNightAuditEmailSettings(): Promise<{
    data?: NightAuditEmailSettings;
    error?: string;
}> {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const response = await fetch(
            new URL('/hotels/night-audit-email-settings', BASE_URL).toString(),
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
                    result?.message ||
                    'Failed to fetch automated report email settings.',
            };
        }

        return { data: result };
    } catch {
        return { error: 'An unexpected error occurred.' };
    }
}

export async function updateNightAuditEmailSettings(payload: {
    nightAuditEmailEnabled?: boolean;
    nightAuditEmailTime?: string;
    nightAuditEmailStaffIds?: number[] | null;

    controlSheetEmailEnabled?: boolean;
    controlSheetEmailTime?: string;
    controlSheetEmailStaffIds?: number[] | null;

    stockMovementEmailEnabled?: boolean;
    stockMovementEmailTime?: string;
    stockMovementEmailStaffIds?: number[] | null;
}): Promise<{ data?: NightAuditEmailSettings; error?: string }> {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const response = await fetch(
            new URL('/hotels/night-audit-email-settings', BASE_URL).toString(),
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
                    result?.message ||
                    'Failed to update automated report email settings.',
            };
        }

        return { data: result };
    } catch {
        return { error: 'An unexpected error occurred.' };
    }
}