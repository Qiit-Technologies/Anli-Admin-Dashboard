import api from '@/lib/axios';
import { getAuthToken } from './auth/auth-token';

export async function getVendors() {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }
        const response = await api.get('/accounts/vendors', {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        });
        if (response.status >= 500) {
            const error = await response.data;
            return {
                error: error.message || 'Failed to fetch vendors. Try again.',
            };
        }
        const data = await response.data;
        return { data };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function createVendor(vendorData: any) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { message: 'Authentication token not found.' };
        }
        const response = await api.post('/accounts/vendors', vendorData, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        });
        if (response.status !== 201) {
            return {
                message: response.data?.message || 'Failed to create vendor.',
            };
        }
        return { message: 'Vendor created successfully.' };
    } catch (error: any) {
        return { message: 'An unexpected error occurred. Please try again.' };
    }
}

export async function getVendorStats() {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }
        const response = await api.get('/accounts/vendors/stats', {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        });
        if (response.status >= 500) {
            const error = await response.data;
            return {
                error: error.message || 'Failed to fetch vendors. Try again.',
            };
        }
        const data = await response.data;
        return { data };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function getVendorDetail(vendorId: string) {
    try {
        console.log(vendorId);
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }
        const response = await api.get(`/accounts/vendor-detail/${vendorId}`, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        });
        if (response.status >= 500) {
            const error = await response.data;
            return {
                error:
                    error.message ||
                    'Failed to fetch vendor detail. Try again.',
            };
        }
        const data = await response.data;
        return { data };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}
