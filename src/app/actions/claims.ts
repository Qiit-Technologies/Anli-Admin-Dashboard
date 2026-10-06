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

export interface ClaimRequest {
    id: number;
    restaurantId: number;
    claimantName: string;
    claimantPhone: string;
    claimantEmail: string;
    role: string;
    message: string | null;
    status: 'pending' | 'approved' | 'rejected';
    otpVerified: boolean;
    reviewedBy: string | null;
    reviewedAt: string | null;
    reviewNote: string | null;
    createdAt: string;
    restaurant?: {
        id: number;
        name: string;
        city: string;
        area: string;
        cuisine: string;
        phone: string | null;
    };
}

export async function getClaimRequests(
    status?: string,
): Promise<ApiResponse<ClaimRequest[]>> {
    return authed('get', '/discovery/admin/claim-requests', undefined, {
        status,
    });
}

export async function approveClaimRequest(
    id: number,
    note?: string,
    hotelId?: number,
): Promise<ApiResponse<ClaimRequest>> {
    return authed('post', `/discovery/admin/claim-requests/${id}/approve`, {
        note,
        hotelId,
    });
}

export async function rejectClaimRequest(
    id: number,
    note?: string,
): Promise<ApiResponse<ClaimRequest>> {
    return authed('post', `/discovery/admin/claim-requests/${id}/reject`, {
        note,
    });
}
