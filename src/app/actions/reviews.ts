/* eslint-disable @typescript-eslint/no-explicit-any */
'use server';

import api from '@/lib/axios';
import { getAuthToken } from './auth/auth-token';

interface ApiResponse<T> {
    data?: T;
    error?: string;
}

async function authed<T>(
    method: 'get' | 'post',
    path: string,
    body?: any,
    params?: any,
): Promise<ApiResponse<T>> {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }
        const response = await api.request<T>({
            method,
            url: path,
            data: body,
            params,
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        });
        return { data: response.data };
    } catch (e: any) {
        const msg =
            e?.response?.data?.message ||
            'An unexpected error occurred. Please try again.';
        return { error: Array.isArray(msg) ? msg.join('; ') : msg };
    }
}

export interface AdminReview {
    id: number;
    restaurantId: number;
    reviewerName: string;
    rating: number;
    title: string | null;
    body: string;
    status: 'published' | 'hidden';
    response: string | null;
    createdAt: string;
    restaurant?: { id: number; name: string };
}

export async function getAdminReviews(
    status?: string,
): Promise<ApiResponse<{ data: AdminReview[]; total: number }>> {
    return authed('get', '/discovery/admin/reviews', undefined, { status });
}

export async function respondToAdminReview(
    id: number,
    response: string,
): Promise<ApiResponse<AdminReview>> {
    return authed('post', `/discovery/admin/reviews/${id}/respond`, {
        response,
    });
}

export async function hideAdminReview(
    id: number,
): Promise<ApiResponse<AdminReview>> {
    return authed('post', `/discovery/admin/reviews/${id}/hide`);
}

export async function publishAdminReview(
    id: number,
): Promise<ApiResponse<AdminReview>> {
    return authed('post', `/discovery/admin/reviews/${id}/publish`);
}
