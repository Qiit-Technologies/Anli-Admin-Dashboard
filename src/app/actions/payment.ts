'use server';

import { BASE_URL } from '@/constants/api';
import { getAuthToken } from './auth/auth-token';
import { safeResponseJson, safeResponseJsonOrNull, safeErrorJson } from '@/lib/api';

export async function makeGuestPaymentAction(
    guestId: number,
    paymentData: {
        amountPaid: number;
        paymentMethod: string;
        receivingAccount?: string;
    },
) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const apiUrl = new URL(
            `/guests/make-payment?guestId=${guestId}`,
            BASE_URL,
        ).toString();

        const response = await fetch(apiUrl, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify({
                amountPaid: paymentData.amountPaid,
                paymentMethod: paymentData.paymentMethod,
                receivingAccount: paymentData.receivingAccount || '',
            }),
        });

        if (!response.ok) {
            const error = await safeErrorJson(response);
            return {
                error:
                    error.message ||
                    'Failed to make payment. Please try again.',
            };
        }

        const result = await safeResponseJson(response);
        return {
            success: true,
            message: result.message || 'Payment made successfully!',
            amountPaid: result.amountPaid,
            outstanding: result.outstanding,
            totalDue: result.totalDue, // Total due including services and orders
        };
    } catch (error: any) {
        return {
            error: 'An unexpected error occurred while processing payment.',
        };
    }
}
