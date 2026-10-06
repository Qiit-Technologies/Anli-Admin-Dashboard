'use server';

import api from '@/lib/axios';
import { getAuthToken } from './auth/auth-token';

export interface Module {
    id: number;
    name: string;
    description?: string;
}

export interface Permission {
    id: number;
    name: string;
    description?: string;
    module?: Module;
}

export async function getPermissions() {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }
        const response = await api.get('/permissions/public-permissions', {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        });
        return { data: response.data };
    } catch (error: any) {
        return { error: error.message || 'Failed to fetch permissions.' };
    }
}
