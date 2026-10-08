import api from '@/lib/axios';
import { getAuthToken } from './auth/auth-token';

// Apply overstay charges for all guests due today and past threshold
export async function applyOverstayChargesToday(): Promise<
    { data: any } | { error: string }
> {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const response = await api.patch(`/guests/overstay/apply-today`, null, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        });

        if (response.status >= 500) {
            const error = await response.data;
            return {
                error:
                    error.message ||
                    'Failed to apply overstay charges. Try again.',
            };
        }

        return { data: response.data };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

// Adjust a guest’s overstay charge (waive or reduce)
export async function adjustOverstayCharge(
    guestId: number,
    dto: {
        action: 'WAIVE' | 'REDUCE_AMOUNT' | 'REDUCE_PERCENTAGE';
        amount?: number;
        percentage?: number;
        reason?: string;
    },
): Promise<{ data: any } | { error: string }> {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const response = await api.patch(
            `/guests/${guestId}/overstay-adjust`,
            dto,
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authToken}`,
                },
            },
        );

        if (response.status >= 500) {
            const error = await response.data;
            return {
                error:
                    error.message ||
                    'Failed to adjust overstay charge. Try again.',
            };
        }

        return { data: response.data };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}
