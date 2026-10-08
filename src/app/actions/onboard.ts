import { getAuthToken } from './auth/auth-token';
import { safeResponseJson, safeResponseJsonOrNull, safeErrorJson } from '@/lib/api';

const BASE_URL = process.env.NEXT_PUBLIC_BE_URL || 'http://localhost:3000';

export async function onBoard(formData: FormData, hotelId: string) {
    const authToken = await getAuthToken();
    if (!authToken) {
        return { error: 'User is not authenticated.' };
    }
    try {
        const apiUrl = new URL(
            `/hotels/onboard/${hotelId}`,
            BASE_URL,
        ).toString();

        const response = await fetch(apiUrl, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify({
                services: formData.get('services'),
                taxId: formData.get('taxId'),
                incorporationCert: formData.get('incorporationCert'),
                boardingToken: formData.get('boardingToken'),
            }),
            credentials: 'include',
        });

        if (!response.ok) {
            const error = await safeErrorJson(response);
            return {
                error: error.message || 'Onboarding failed. Please try again.',
            };
        }
        return true;
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}
