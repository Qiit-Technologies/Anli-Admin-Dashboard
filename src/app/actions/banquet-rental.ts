'use server';

import api from '@/lib/axios';
import { getAuthToken } from './auth/auth-token';

export interface BanquetRentalContact {
    title: string;
    firstName: string;
    lastName: string;
    email: string;
    address: string;
    phone: string;
}

export interface BanquetRentalLineItem {
    id: number;
    rentalId: number;
    inventoryItemId: number;
    amenityName: string;
    amenitySubtitle: string;
    imageUrl: string | null;
    category: string;
    description: string;
    quantity: number;
    unitPrice: number;
    condition: string;
    status: 'rented' | 'returned' | 'over-due';
    eventType: string;
    rentedDate: string;
    rentedTime: string;
    dueDate: string;
    dueTime: string;
    returnedDate?: string;
    returnedTime?: string;
    amountPaid: number;
    renterName: string;
    renterPhone: string;
    contact: BanquetRentalContact;
    createdBy?: string;
    dateCreated?: string;
}

export interface BanquetRentalStats {
    totalRented: number;
    currentlyRented: number;
    returnedThisMonth: number;
    overdue: number;
}

export interface RentalItemInput {
    inventoryItemId: number;
    quantity: number;
    unitPrice?: number;
}

export interface CreateBanquetRentalInput {
    eventType?: string;
    startDate?: string;
    endDate?: string;
    duration?: string;
    deliveryOption?: string;
    pickupDate?: string;
    pickupTime?: string;
    returnDate?: string;
    returnTime?: string;
    contactName?: string;
    contactPhone?: string;
    contactEmail?: string;
    subtotal?: number;
    serviceCharge?: number;
    vat?: number;
    amountPaid?: number;
    items: RentalItemInput[];
}

function parseError(error: unknown): string {
    const err = error as {
        response?: { data?: { message?: string | string[] } };
    };
    const raw = err?.response?.data?.message;
    if (Array.isArray(raw)) return raw.join(', ');
    if (typeof raw === 'string') return raw;
    return 'Request failed. Please try again.';
}

export async function getBanquetRentals() {
    try {
        const token = await getAuthToken();
        if (!token) return { error: 'Authentication token not found.' };

        const response = await api.get<BanquetRentalLineItem[]>(
            '/banquet/rentals',
            { headers: { Authorization: `Bearer ${token}` } },
        );
        return { data: response.data };
    } catch (error: unknown) {
        return { error: parseError(error) };
    }
}

export async function getBanquetRentalStats() {
    try {
        const token = await getAuthToken();
        if (!token) return { error: 'Authentication token not found.' };

        const response = await api.get<BanquetRentalStats>(
            '/banquet/rentals/stats',
            { headers: { Authorization: `Bearer ${token}` } },
        );
        return { data: response.data };
    } catch (error: unknown) {
        return { error: parseError(error) };
    }
}

export async function getBanquetRentalLineItem(id: number) {
    try {
        const token = await getAuthToken();
        if (!token) return { error: 'Authentication token not found.' };

        const response = await api.get<BanquetRentalLineItem>(
            `/banquet/rentals/${id}`,
            { headers: { Authorization: `Bearer ${token}` } },
        );
        return { data: response.data };
    } catch (error: unknown) {
        return { error: parseError(error) };
    }
}

export async function createBanquetRental(payload: CreateBanquetRentalInput) {
    try {
        const token = await getAuthToken();
        if (!token) return { error: 'Authentication token not found.' };

        const response = await api.post<BanquetRentalLineItem[]>(
            '/banquet/rentals',
            payload,
            { headers: { Authorization: `Bearer ${token}` } },
        );
        return { data: response.data };
    } catch (error: unknown) {
        return { error: parseError(error) };
    }
}

export async function returnBanquetRentalItem(id: number) {
    try {
        const token = await getAuthToken();
        if (!token) return { error: 'Authentication token not found.' };

        const response = await api.post<BanquetRentalLineItem>(
            `/banquet/rentals/${id}/return`,
            {},
            { headers: { Authorization: `Bearer ${token}` } },
        );
        return { data: response.data };
    } catch (error: unknown) {
        return { error: parseError(error) };
    }
}
