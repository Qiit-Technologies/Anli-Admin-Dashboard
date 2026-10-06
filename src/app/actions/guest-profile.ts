'use server';

import { BASE_URL } from '@/constants/api';
import { getAuthToken } from './auth/auth-token';
import { safeResponseJson, safeResponseJsonOrNull, safeErrorJson } from '@/lib/api';

export interface GuestProfile {
    id: number;
    fullName?: string;
    email?: string;
    phoneNumber?: string;
    address?: string;
    IDNumber?: string;
    nationality?: string;
    gender?: string;
    dateOfBirth?: string;
    notes?: string;
    guestType?: string;
    creditAccounts?: Array<{
        id: number;
        creditBalance: number;
        totalDeposited: number;
        totalUsed: number;
    }>;
    guestBookings?: Array<{
        id: number;
        bookingCode?: string;
        fullName?: string;
        startDate?: string;
        endDate?: string;
        roomNumber?: string;
        room?: {
            id: number;
            roomNumber: string;
        };
        roomType?: {
            id: number;
            name: string;
        };
        bookingAmount?: number;
        amountPaid?: number;
        outstanding?: number;
        bookingSource?: string;
        bookingStatus?: string;
    }>;
    isProfile?: boolean;
    /** Present on some API responses alongside creditAccounts */
    creditBalance?: number;
    totalDeposited?: number;
    totalUsed?: number;
    createdAt: string;
    updatedAt: string;
}

export interface CreditAccount {
    id: number;
    creditBalance: number;
    totalDeposited: number;
    totalUsed: number;
    transactions?: CreditTransaction[];
}

export interface CreditTransaction {
    id: number;
    transactionType: 'DEPOSIT' | 'USAGE' | 'REFUND' | 'ADJUSTMENT';
    amount: number;
    balanceBefore: number;
    balanceAfter: number;
    description?: string;
    referenceNumber?: string;
    guest?: { id: number; bookingCode?: string };
    order?: { id: number };
    createdAt: string;
}

export interface CreateGuestProfileData {
    fullName?: string;
    email?: string;
    phoneNumber?: string;
    address?: string;
    IDNumber?: string;
    nationality?: string;
    gender?: string;
    dateOfBirth?: string;
    notes?: string;
    guestType?: string;
}

export interface DepositCreditData {
    amount: number;
    referenceNumber?: string;
    description?: string;
    paymentMethod?: string;
    receivingAccount?: string;
}

export interface UseCreditData {
    amount: number;
    guestId?: number;
    orderId?: number;
    description?: string;
}

// Create a new guest profile
export async function createGuestProfile(
    data: CreateGuestProfileData,
): Promise<{ data?: GuestProfile; error?: string }> {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const apiUrl = new URL(`/guest-profiles`, BASE_URL).toString();
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify(data),
            credentials: 'include',
        });

        if (!response.ok) {
            const error = await safeErrorJson(response);
            return {
                error: error.message || 'Failed to create guest profile.',
            };
        }

        const result = await safeResponseJson(response);
        return { data: result };
    } catch (error: any) {
        return { error: 'An unexpected error occurred.' };
    }
}

// Get all guest profiles
export async function getAllGuestProfiles(): Promise<{
    data?: GuestProfile[];
    error?: string;
}> {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const apiUrl = new URL(`/guest-profiles`, BASE_URL).toString();
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
            credentials: 'include',
        });

        if (!response.ok) {
            const error = await safeErrorJson(response);
            return {
                error: error.message || 'Failed to get guest profiles.',
            };
        }

        const result = await safeResponseJson(response);
        return { data: result };
    } catch (error: any) {
        return { error: 'An unexpected error occurred.' };
    }
}

// Search for guest profiles
export async function searchGuestProfiles(query: {
    query?: string;
    name?: string;
    email?: string;
    phoneNumber?: string;
    IDNumber?: string;
    includeUnlinkedStays?: boolean;
}): Promise<{ data?: GuestProfile[]; error?: string }> {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const params = new URLSearchParams();
        if (query.query) params.append('query', query.query);
        if (query.name) params.append('name', query.name);
        if (query.email) params.append('email', query.email);
        if (query.phoneNumber) params.append('phoneNumber', query.phoneNumber);
        if (query.IDNumber) params.append('IDNumber', query.IDNumber);
        if (query.includeUnlinkedStays)
            params.append('includeUnlinkedStays', 'true');

        const apiUrl = new URL(
            `/guest-profiles/search?${params.toString()}`,
            BASE_URL,
        ).toString();
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
            credentials: 'include',
        });

        if (!response.ok) {
            const error = await safeErrorJson(response);
            return {
                error: error.message || 'Failed to search guest profiles.',
            };
        }

        const result = await safeResponseJson(response);
        return { data: result };
    } catch (error: any) {
        return { error: 'An unexpected error occurred.' };
    }
}

// Get a specific guest profile
export async function getGuestProfile(
    profileId: number,
): Promise<{ data?: GuestProfile; error?: string }> {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const apiUrl = new URL(
            `/guest-profiles/${profileId}`,
            BASE_URL,
        ).toString();
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
            credentials: 'include',
        });

        if (!response.ok) {
            const error = await safeErrorJson(response);
            return {
                error: error.message || 'Failed to get guest profile.',
            };
        }

        const result = await safeResponseJson(response);
        return { data: result };
    } catch (error: any) {
        return { error: 'An unexpected error occurred.' };
    }
}

// Get credit account for a profile
export async function getCreditAccount(
    profileId: number,
): Promise<{ data?: CreditAccount; error?: string }> {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const apiUrl = new URL(
            `/guest-profiles/${profileId}/credit-account`,
            BASE_URL,
        ).toString();
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
            credentials: 'include',
        });

        if (!response.ok) {
            const error = await safeErrorJson(response);
            return {
                error: error.message || 'Failed to get credit account.',
            };
        }

        const result = await safeResponseJson(response);
        return { data: result };
    } catch (error: any) {
        return { error: 'An unexpected error occurred.' };
    }
}

// Deposit credit to a profile
export async function depositCredit(
    profileId: number,
    data: DepositCreditData,
): Promise<{ data?: CreditAccount; error?: string }> {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const apiUrl = new URL(
            `/guest-profiles/${profileId}/credit/deposit`,
            BASE_URL,
        ).toString();
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify(data),
            credentials: 'include',
        });

        if (!response.ok) {
            const error = await safeErrorJson(response);
            return {
                error: error.message || 'Failed to deposit credit.',
            };
        }

        const result = await safeResponseJson(response);
        return { data: result };
    } catch (error: any) {
        return { error: 'An unexpected error occurred.' };
    }
}

// Use credit from a profile
export async function useCredit(
    profileId: number,
    data: UseCreditData,
): Promise<{ data?: CreditAccount; error?: string }> {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const apiUrl = new URL(
            `/guest-profiles/${profileId}/credit/use`,
            BASE_URL,
        ).toString();
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify(data),
            credentials: 'include',
        });

        if (!response.ok) {
            const error = await safeErrorJson(response);
            return {
                error: error.message || 'Failed to use credit.',
            };
        }

        const result = await safeResponseJson(response);
        return { data: result };
    } catch (error: any) {
        return { error: 'An unexpected error occurred.' };
    }
}

// Get transaction history
export async function getCreditTransactions(
    profileId: number,
    limit: number = 50,
): Promise<{ data?: CreditTransaction[]; error?: string }> {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const apiUrl = new URL(
            `/guest-profiles/${profileId}/transactions?limit=${limit}`,
            BASE_URL,
        ).toString();
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
            credentials: 'include',
        });

        if (!response.ok) {
            const error = await safeErrorJson(response);
            return {
                error: error.message || 'Failed to get transactions.',
            };
        }

        const result = await safeResponseJson(response);
        return { data: result };
    } catch (error: any) {
        return { error: 'An unexpected error occurred.' };
    }
}

// Link a guest booking to a profile
export async function linkGuestToProfile(
    guestId: number,
    profileId: number,
): Promise<{ data?: any; error?: string }> {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const apiUrl = new URL(
            `/guest-profiles/link-guest`,
            BASE_URL,
        ).toString();
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify({ guestId, guestProfileId: profileId }),
            credentials: 'include',
        });

        if (!response.ok) {
            const error = await safeErrorJson(response);
            return {
                error: error.message || 'Failed to link guest to profile.',
            };
        }

        const result = await safeResponseJson(response);
        return { data: result };
    } catch (error: any) {
        return { error: 'An unexpected error occurred.' };
    }
}
// Merge two guest profiles
export async function mergeProfiles(
    sourceProfileId: number,
    targetProfileId: number,
    sourceType: 'PROFILE' | 'GUEST' = 'PROFILE',
    targetType: 'PROFILE' | 'GUEST' = 'PROFILE',
): Promise<{ data?: GuestProfile; error?: string }> {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const apiUrl = new URL(`/guest-profiles/merge`, BASE_URL).toString();
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify({
                sourceProfileId,
                targetProfileId,
                sourceType,
                targetType,
            }),
            credentials: 'include',
        });

        if (!response.ok) {
            const error = await safeErrorJson(response);
            return {
                error: error.message || 'Failed to merge guest profiles.',
            };
        }

        const result = await safeResponseJson(response);
        return { data: result };
    } catch (error: any) {
        return { error: 'An unexpected error occurred.' };
    }
}
