import { BASE_URL } from '@/constants/api';
import { getAuthToken } from './auth/auth-token';
import { safeResponseJson, safeResponseJsonOrNull, safeErrorJson } from '@/lib/api';

function parseCheckoutErrorMessage(body: unknown): string {
    if (!body || typeof body !== 'object') {
        return 'Check out failed. Please try again.';
    }
    const message = (body as { message?: unknown }).message;
    if (Array.isArray(message)) {
        return message.map(String).filter(Boolean).join(' ') || 'Check out failed. Please try again.';
    }
    if (typeof message === 'string' && message.trim()) {
        return message;
    }
    return 'Check out failed. Please try again.';
}

export async function checkOutGuest(
    id: number,
    status?: string,
    checkOutNote?: string,
    transferOutstandingToPmFolio?: boolean,
    transferUnusedBalanceToPayable?: boolean,
) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { message: 'Authentication token not found.' };
        }

        const apiUrl = new URL(`/guests/${id}/checkout`, BASE_URL).toString();
        const response = await fetch(apiUrl, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify({
                status,
                checkOutNote,
                ...(transferOutstandingToPmFolio === true
                    ? { transferOutstandingToPmFolio: true }
                    : {}),
                ...(transferUnusedBalanceToPayable === true
                    ? { transferUnusedBalanceToPayable: true }
                    : {}),
            }),
        });

        if (!response.ok) {
            const error = await safeErrorJson(response);
            return {
                message: parseCheckoutErrorMessage(error),
            };
        }

        const data = await safeResponseJson(response);
        return { 
            message: 'Check Out successfully!',
            data 
        };
    } catch (error: any) {
        return { message: 'An unexpected error occurred. Please try again.' };
    }
}
