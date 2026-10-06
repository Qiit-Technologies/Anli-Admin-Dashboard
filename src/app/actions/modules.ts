import api from '@/lib/axios';
import { getAuthToken } from './auth/auth-token';

export interface Module {
    id: number;
    name: string;
    description?: string;
    createdAt: Date;
    deletedAt?: Date;
}

export async function getModules() {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }
        const response = await api.get('/modules/public-modules', {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        });
        return { data: response.data };
    } catch (error: any) {
        return { error: error.message || 'Failed to fetch modules.' };
    }
}
