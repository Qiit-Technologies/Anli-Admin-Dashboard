'use server';

import api from '@/lib/axios';
import { getAuthToken } from './auth/auth-token';

export interface InventorySpecification {
    label: string;
    value: string;
}

export interface BanquetInventoryItem {
    id: number;
    type: string;
    description: string | null;
    subtitle: string | null;
    category: string;
    condition: string;
    environment: string | null;
    images: string[] | null;
    specifications: InventorySpecification[] | null;
    quantity: number;
    remaining: number;
    unitCost: number;
    status: 'available' | 'not available';
    createdAt: string;
    updatedAt: string;
}

export interface BanquetInventoryStats {
    totalAmenities: number;
    totalRented: number;
    totalReturned: number;
    totalStock: number;
}

export interface CreateBanquetInventoryInput {
    type: string;
    quantity: number;
    unitCost: number;
    description?: string;
    subtitle?: string;
    category?: string;
    condition?: string;
    environment?: string;
    images?: string[];
    specifications?: InventorySpecification[];
}

export type UpdateBanquetInventoryInput = Partial<CreateBanquetInventoryInput>;

function parseError(error: unknown): string {
    const err = error as {
        response?: { data?: { message?: string | string[] } };
    };
    const raw = err?.response?.data?.message;
    if (Array.isArray(raw)) return raw.join(', ');
    if (typeof raw === 'string') return raw;
    return 'Request failed. Please try again.';
}

export async function getBanquetInventory() {
    try {
        const token = await getAuthToken();
        if (!token) return { error: 'Authentication token not found.' };

        const response = await api.get<BanquetInventoryItem[]>(
            '/banquet/inventory',
            { headers: { Authorization: `Bearer ${token}` } },
        );

        return { data: response.data };
    } catch (error: unknown) {
        return { error: parseError(error) };
    }
}

export async function getBanquetInventoryAvailability(
    id: number,
    year: number,
    month: number,
) {
    try {
        const token = await getAuthToken();
        if (!token) return { error: 'Authentication token not found.' };

        const response = await api.get<
            Record<number, 'available' | 'booked' | 'fully-booked'>
        >(`/banquet/inventory/${id}/availability`, {
            params: { year, month },
            headers: { Authorization: `Bearer ${token}` },
        });

        return { data: response.data };
    } catch (error: unknown) {
        return { error: parseError(error) };
    }
}

export async function getBanquetInventoryItem(id: number) {
    try {
        const token = await getAuthToken();
        if (!token) return { error: 'Authentication token not found.' };

        const response = await api.get<BanquetInventoryItem>(
            `/banquet/inventory/${id}`,
            { headers: { Authorization: `Bearer ${token}` } },
        );

        return { data: response.data };
    } catch (error: unknown) {
        return { error: parseError(error) };
    }
}

export async function getBanquetInventoryStats() {
    try {
        const token = await getAuthToken();
        if (!token) return { error: 'Authentication token not found.' };

        const response = await api.get<BanquetInventoryStats>(
            '/banquet/inventory/stats',
            { headers: { Authorization: `Bearer ${token}` } },
        );

        return { data: response.data };
    } catch (error: unknown) {
        return { error: parseError(error) };
    }
}

export async function createBanquetInventoryItem(
    payload: CreateBanquetInventoryInput,
) {
    try {
        const token = await getAuthToken();
        if (!token) return { error: 'Authentication token not found.' };

        const response = await api.post<BanquetInventoryItem>(
            '/banquet/inventory',
            payload,
            { headers: { Authorization: `Bearer ${token}` } },
        );

        return { data: response.data };
    } catch (error: unknown) {
        return { error: parseError(error) };
    }
}

export async function updateBanquetInventoryItem(
    id: number,
    payload: UpdateBanquetInventoryInput,
) {
    try {
        const token = await getAuthToken();
        if (!token) return { error: 'Authentication token not found.' };

        const response = await api.put<BanquetInventoryItem>(
            `/banquet/inventory/${id}`,
            payload,
            { headers: { Authorization: `Bearer ${token}` } },
        );

        return { data: response.data };
    } catch (error: unknown) {
        return { error: parseError(error) };
    }
}

export async function deleteBanquetInventoryItem(id: number) {
    try {
        const token = await getAuthToken();
        if (!token) return { error: 'Authentication token not found.' };

        await api.delete(`/banquet/inventory/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        return { message: 'Amenity deleted successfully.' };
    } catch (error: unknown) {
        return { error: parseError(error) };
    }
}
