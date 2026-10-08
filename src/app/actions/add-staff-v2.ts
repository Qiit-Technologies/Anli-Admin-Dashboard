'use server';

import api from '@/lib/axios';
import { getAuthToken } from './auth/auth-token';

export interface AddStaffV2Payload {
    fullName: string;
    email: string;
    username: string;
    roleId: number;
    modules: number[];
    permissions: number[];
    pin?: string;
}

export async function addStaffV2(payload: AddStaffV2Payload) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        // 1. Create the staff member using the new V2 endpoint
        // This single call handles creation, modules, permissions, and PINsss
        const response = await api.post('/staff/v2', payload, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        });

        return { message: 'Staff invited successfully', data: response.data };
    } catch (error: any) {
        console.error('AddStaffV2 Error:', error);
        return {
            message:
                error.response?.data?.message ||
                'Failed to invite staff. Please try again.',
            error: error.message,
        };
    }
}
