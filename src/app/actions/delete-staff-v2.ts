'use server';

import api from '@/lib/axios';
import { getAuthToken } from './auth/auth-token';

export async function deleteStaffV2(staffId: number) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const response = await api.delete(`/staff/${staffId}`, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        });

        return { message: 'Staff deleted successfully', data: response.data };
    } catch (error: any) {
        console.error('DeleteStaffV2 Error:', error);
        return {
            message:
                error.response?.data?.message ||
                'Failed to delete staff. Please try again.',
            error: error.message,
        };
    }
}
