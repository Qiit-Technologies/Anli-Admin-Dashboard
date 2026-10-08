'use server';

import { getAuthToken } from './auth/auth-token';
import { BASE_URL } from '@/constants/api';
import { safeResponseJson, safeResponseJsonOrNull, safeErrorJson } from '@/lib/api';

export async function createFeedback(data: {
    category: string;
    priority: string;
    message: string;
    department?: string;
    isAnonymous?: boolean;
}) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { message: 'Authentication token not found.' };
        }

        const response = await fetch(`${BASE_URL}/feedback`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const error = await safeErrorJson(response);
            throw new Error(error.message || 'Failed to submit feedback');
        }

        return await safeResponseJson(response);
    } catch (error: unknown) {
        const errorMessage =
            error instanceof Error
                ? error.message
                : 'Failed to submit feedback';
        throw new Error(errorMessage);
    }
}

export async function getFeedback(filters?: {
    category?: string;
    priority?: string;
    status?: string;
    page?: number;
    limit?: number;
    submittedById?: number;
}) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { message: 'Authentication token not found.' };
        }

        const queryParams = new URLSearchParams();
        if (filters?.category) queryParams.append('category', filters.category);
        if (filters?.priority) queryParams.append('priority', filters.priority);
        if (filters?.status) queryParams.append('status', filters.status);
        if (filters?.page) queryParams.append('page', filters.page.toString());
        if (filters?.limit)
            queryParams.append('limit', filters.limit.toString());
        if (filters?.submittedById)
            queryParams.append('submittedById', filters.submittedById.toString());

        const response = await fetch(
            `${BASE_URL}/feedback?${queryParams.toString()}`,
            {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            },
        );

        if (!response.ok) {
            throw new Error('Failed to fetch feedback');
        }

        return await safeResponseJson(response);
    } catch (error: unknown) {
        const errorMessage =
            error instanceof Error ? error.message : 'Failed to fetch feedback';
        throw new Error(errorMessage);
    }
}

export async function updateFeedback(
    id: number,
    data: {
        status?: string;
        adminResponse?: string;
    },
) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { message: 'Authentication token not found.' };
        }

        const response = await fetch(`${BASE_URL}/feedback/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const error = await safeErrorJson(response);
            throw new Error(error.message || 'Failed to update feedback');
        }

        return await safeResponseJson(response);
    } catch (error: unknown) {
        const errorMessage =
            error instanceof Error
                ? error.message
                : 'Failed to update feedback';
        throw new Error(errorMessage);
    }
}

export async function getFeedbackStats() {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { message: 'Authentication token not found.' };
        }

        const response = await fetch(`${BASE_URL}/feedback/stats`, {
            headers: {
                Authorization: `Bearer ${authToken}`,
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch feedback stats');
        }

        return await safeResponseJson(response);
    } catch (error: unknown) {
        const errorMessage =
            error instanceof Error
                ? error.message
                : 'Failed to fetch feedback stats';
        throw new Error(errorMessage);
    }
}
