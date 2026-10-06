/* eslint-disable @typescript-eslint/no-explicit-any */
'use server';

import api from '@/lib/axios';
import { getAuthToken } from './auth/auth-token';

interface ApiResponse<T> {
    data?: T;
    error?: string;
}

async function authed<T>(
    method: 'get' | 'post' | 'put' | 'patch' | 'delete',
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

export interface LoyaltyOverview {
    members: number;
    pointsIssued: number;
    pointsRedeemed: number;
    recent: any[];
}

export interface LoyaltyMember {
    customerId: string;
    balance: number;
    lastActivity: string;
    customer: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
    } | null;
    tier: { id: number; name: string; minPoints: number } | null;
}

export interface LoyaltyTier {
    id: number;
    name: string;
    minPoints: number;
    benefits?: string;
    isActive: boolean;
}

export interface LoyaltyRule {
    id: number;
    key: string;
    label: string;
    points: number;
    isActive: boolean;
}

export async function getLoyaltyOverview(): Promise<ApiResponse<LoyaltyOverview>> {
    return authed('get', '/loyalty/admin/overview');
}

export async function getLoyaltyMembers(
    q?: string,
    page = 1,
): Promise<ApiResponse<{ data: LoyaltyMember[]; total: number }>> {
    return authed('get', '/loyalty/admin/members', undefined, { q, page });
}

export async function getLoyaltyTransactions(
    customerId?: string,
    page = 1,
): Promise<ApiResponse<{ data: any[]; total: number }>> {
    return authed('get', '/loyalty/admin/transactions', undefined, {
        customerId,
        page,
    });
}

export async function adjustLoyaltyPoints(
    customerId: string,
    points: number,
    reason: string,
): Promise<ApiResponse<{ balance: number }>> {
    return authed('post', '/loyalty/admin/adjust', {
        customerId,
        points,
        reason,
    });
}

export async function getLoyaltyTiers(): Promise<ApiResponse<LoyaltyTier[]>> {
    return authed('get', '/loyalty/admin/tiers');
}

export async function upsertLoyaltyTier(
    tier: Partial<LoyaltyTier> & { name: string; minPoints: number },
): Promise<ApiResponse<LoyaltyTier>> {
    return authed('post', '/loyalty/admin/tiers', tier);
}

export async function deleteLoyaltyTier(
    id: number,
): Promise<ApiResponse<{ deleted: boolean }>> {
    return authed('delete', `/loyalty/admin/tiers/${id}`);
}

export async function getLoyaltyRules(): Promise<ApiResponse<LoyaltyRule[]>> {
    return authed('get', '/loyalty/admin/rules');
}

export async function updateLoyaltyRules(
    rules: Array<{ key: string; points: number; isActive?: boolean }>,
): Promise<ApiResponse<LoyaltyRule[]>> {
    return authed('put', '/loyalty/admin/rules', { rules });
}
