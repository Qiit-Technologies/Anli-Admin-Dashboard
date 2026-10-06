'use server';

import api from '@/lib/axios';
import { getAuthToken } from './auth/auth-token';

export interface SubscriptionInfo {
    plan_name: string | null;
    price: number;
    renewal_date: string | null;
    billing_cycle: string | null;
    status: string | null;
    isExpired: boolean;
    hotelActive: boolean;
    warningInfo: {
        isActive: boolean;
        warningStartedAt?: string;
        warningExpiresAt?: string;
        secondsRemaining?: number;
        reason?: string | null;
        setBy?: string | null;
    } | null;
}

export async function getMySubscription(): Promise<
    { data: SubscriptionInfo } | { error: string }
> {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const response = await api.get<SubscriptionInfo>(
            '/hotels/me/subscription',
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authToken}`,
                },
            },
        );

        if (response.status >= 500) {
            const error = response.data as unknown as { message?: string };
            return {
                error:
                    error.message || 'Failed to fetch subscription. Try again.',
            };
        }

        const data = response.data;

        return { data };
    } catch (error: any) {
        console.error('Error fetching subscription:', error);
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}
