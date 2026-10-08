import { getAuthToken } from './auth/auth-token';
import { BASE_URL } from '@/constants/api';
import { safeResponseJson, safeResponseJsonOrNull, safeErrorJson } from '@/lib/api';

type RecognitionPayload = {
    recipientId: number;
    type: string;
    message: string;
    isPublic?: boolean;
    points?: number;
};

export async function createRecognition(data: RecognitionPayload) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { message: 'Authentication token not found.' };
        }

        const response = await fetch(`${BASE_URL}/recognition`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const error = await safeErrorJson(response);
            throw new Error(error.message || 'Failed to create recognition');
        }

        return await safeResponseJson(response);
    } catch (error: unknown) {
        const errorMessage =
            error instanceof Error
                ? error.message
                : 'Failed to create recognition';
        throw new Error(errorMessage);
    }
}

export async function getRecognitions(filters?: {
    recipientId?: number;
    givenById?: number;
    type?: string;
    page?: number;
    limit?: number;
}) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { message: 'Authentication token not found.' };
        }

        const queryParams = new URLSearchParams();
        if (filters?.recipientId)
            queryParams.append('recipientId', filters.recipientId.toString());
        if (filters?.givenById)
            queryParams.append('givenById', filters.givenById.toString());
        if (filters?.type) queryParams.append('type', filters.type);
        if (filters?.page) queryParams.append('page', filters.page.toString());
        if (filters?.limit)
            queryParams.append('limit', filters.limit.toString());

        const response = await fetch(
            `${BASE_URL}/recognition?${queryParams.toString()}`,
            {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            },
        );

        if (!response.ok) {
            throw new Error('Failed to fetch recognitions');
        }

        return await safeResponseJson(response);
    } catch (error: unknown) {
        const errorMessage =
            error instanceof Error
                ? error.message
                : 'Failed to fetch recognitions';
        throw new Error(errorMessage);
    }
}

export async function getLeaderboard(limit: number = 10) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { message: 'Authentication token not found.' };
        }

        const response = await fetch(
            `${BASE_URL}/recognition/leaderboard?limit=${limit}`,
            {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            },
        );

        if (!response.ok) {
            throw new Error('Failed to fetch leaderboard');
        }

        return await safeResponseJson(response);
    } catch (error: unknown) {
        const errorMessage =
            error instanceof Error
                ? error.message
                : 'Failed to fetch leaderboard';
        throw new Error(errorMessage);
    }
}

export async function getStaffStats(staffId: number) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { message: 'Authentication token not found.' };
        }

        const response = await fetch(
            `${BASE_URL}/recognition/staff/${staffId}/stats`,
            {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            },
        );

        if (!response.ok) {
            throw new Error('Failed to fetch staff stats');
        }

        return await safeResponseJson(response);
    } catch (error: unknown) {
        const errorMessage =
            error instanceof Error
                ? error.message
                : 'Failed to fetch staff stats';
        throw new Error(errorMessage);
    }
}

export async function deleteRecognition(id: number) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { message: 'Authentication token not found.' };
        }

        const response = await fetch(`${BASE_URL}/recognition/${id}`, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${authToken}`,
            },
        });

        if (!response.ok) {
            const error = await safeErrorJson(response);
            throw new Error(error.message || 'Failed to delete recognition');
        }
    } catch (error: unknown) {
        const errorMessage =
            error instanceof Error
                ? error.message
                : 'Failed to delete recognition';
        throw new Error(errorMessage);
    }
}

export async function updateRecognition(
    id: number,
    data: Partial<RecognitionPayload>,
) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { message: 'Authentication token not found.' };
        }

        const response = await fetch(`${BASE_URL}/recognition/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const error = await safeErrorJson(response);
            throw new Error(error.message || 'Failed to update recognition');
        }

        return await safeResponseJson(response);
    } catch (error: unknown) {
        const errorMessage =
            error instanceof Error
                ? error.message
                : 'Failed to update recognition';
        throw new Error(errorMessage);
    }
}
