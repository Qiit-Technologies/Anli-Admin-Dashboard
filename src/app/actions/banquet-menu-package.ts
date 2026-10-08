'use server';

import api from '@/lib/axios';
import { getAuthToken } from './auth/auth-token';

export interface BanquetMenuPackageItem {
    id: number;
    menuItemId: number;
    menuItemName: string;
    menuItemDescription: string | null;
    quantity: number;
    unitPrice: number;
}

export interface BanquetMenuPackage {
    id: number;
    name: string;
    description: string | null;
    category: string;
    mealType: string;
    serviceStyle: string | null;
    status: 'active' | 'unavailable';
    guestMin: number | null;
    guestMax: number | null;
    pricePerGuest: number;
    priceMin: number;
    priceMax: number;
    serviceChargePercent: number;
    vatPercent: number;
    serviceChargeEnabled: boolean;
    vatEnabled: boolean;
    kidMenuEnabled: boolean;
    eventSuitable: string | null;
    specialAddOns: string[] | null;
    portionConfig: Record<string, string> | null;
    imageUrl: string | null;
    createdAt: string;
    updatedAt: string;
    items: BanquetMenuPackageItem[];
}

export interface BanquetMenuPackageStats {
    totalPackages: number;
    activePackages: number;
    totalMealItems: number;
    categories: number;
}

export interface MenuPackageItemInput {
    menuItemId: number;
    menuItemName: string;
    menuItemDescription?: string;
    quantity?: number;
    unitPrice: number;
}

export interface CreateBanquetMenuPackageInput {
    name: string;
    description?: string;
    category?: string;
    mealType: string;
    serviceStyle?: string;
    status?: 'active' | 'unavailable';
    guestMin?: number;
    guestMax?: number;
    pricePerGuest?: number;
    priceMin: number;
    priceMax: number;
    serviceChargePercent?: number;
    vatPercent?: number;
    serviceChargeEnabled?: boolean;
    vatEnabled?: boolean;
    kidMenuEnabled?: boolean;
    eventSuitable?: string;
    specialAddOns?: string[];
    portionConfig?: Record<string, string>;
    imageUrl?: string;
    items?: MenuPackageItemInput[];
}

export type UpdateBanquetMenuPackageInput = Partial<CreateBanquetMenuPackageInput>;

function parseError(error: unknown): string {
    const err = error as {
        response?: { data?: { message?: string | string[] } };
    };
    const raw = err?.response?.data?.message;
    if (Array.isArray(raw)) return raw.join(', ');
    if (typeof raw === 'string') return raw;
    return 'Request failed. Please try again.';
}

export async function getBanquetMenuPackages() {
    try {
        const token = await getAuthToken();
        if (!token) return { error: 'Authentication token not found.' };

        const response = await api.get<BanquetMenuPackage[]>(
            '/banquet/menu-packages',
            { headers: { Authorization: `Bearer ${token}` } },
        );
        return { data: response.data };
    } catch (error: unknown) {
        return { error: parseError(error) };
    }
}

export async function getBanquetMenuPackageStats() {
    try {
        const token = await getAuthToken();
        if (!token) return { error: 'Authentication token not found.' };

        const response = await api.get<BanquetMenuPackageStats>(
            '/banquet/menu-packages/stats',
            { headers: { Authorization: `Bearer ${token}` } },
        );
        return { data: response.data };
    } catch (error: unknown) {
        return { error: parseError(error) };
    }
}

export async function getBanquetMenuPackage(id: number) {
    try {
        const token = await getAuthToken();
        if (!token) return { error: 'Authentication token not found.' };

        const response = await api.get<BanquetMenuPackage>(
            `/banquet/menu-packages/${id}`,
            { headers: { Authorization: `Bearer ${token}` } },
        );
        return { data: response.data };
    } catch (error: unknown) {
        return { error: parseError(error) };
    }
}

export async function createBanquetMenuPackage(
    payload: CreateBanquetMenuPackageInput,
) {
    try {
        const token = await getAuthToken();
        if (!token) return { error: 'Authentication token not found.' };

        const response = await api.post<BanquetMenuPackage>(
            '/banquet/menu-packages',
            payload,
            { headers: { Authorization: `Bearer ${token}` } },
        );
        return { data: response.data };
    } catch (error: unknown) {
        return { error: parseError(error) };
    }
}

export async function updateBanquetMenuPackage(
    id: number,
    payload: UpdateBanquetMenuPackageInput,
) {
    try {
        const token = await getAuthToken();
        if (!token) return { error: 'Authentication token not found.' };

        const response = await api.put<BanquetMenuPackage>(
            `/banquet/menu-packages/${id}`,
            payload,
            { headers: { Authorization: `Bearer ${token}` } },
        );
        return { data: response.data };
    } catch (error: unknown) {
        return { error: parseError(error) };
    }
}

export async function duplicateBanquetMenuPackage(id: number) {
    try {
        const token = await getAuthToken();
        if (!token) return { error: 'Authentication token not found.' };

        const response = await api.post<BanquetMenuPackage>(
            `/banquet/menu-packages/${id}/duplicate`,
            {},
            { headers: { Authorization: `Bearer ${token}` } },
        );
        return { data: response.data };
    } catch (error: unknown) {
        return { error: parseError(error) };
    }
}

export async function deleteBanquetMenuPackage(id: number) {
    try {
        const token = await getAuthToken();
        if (!token) return { error: 'Authentication token not found.' };

        await api.delete(`/banquet/menu-packages/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return { success: true };
    } catch (error: unknown) {
        return { error: parseError(error) };
    }
}
