import api from '@/lib/axios';
import { getAuthToken } from './auth/auth-token';

export async function getPrinters() {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }
        const response = await api.get('/printers', {
            headers: {
                Authorization: `Bearer ${authToken}`,
            },
        });
        return { data: response.data };
    } catch (error: any) {
        return { error: 'Failed to fetch printers.' };
    }
}

export async function createPrinter(data: {
    name: string;
    ip: string;
    port: number;
    type?: 'kot' | 'bot' | 'receipt' | 'general';
}) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }
        const response = await api.post('/printers', data, {
            headers: {
                Authorization: `Bearer ${authToken}`,
            },
        });
        return { data: response.data };
    } catch (error: any) {
        return { error: 'Failed to create printer.' };
    }
}

export async function deletePrinter(id: number) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }
        const response = await api.delete(`/printers/${id}`, {
            headers: {
                Authorization: `Bearer ${authToken}`,
            },
        });
        return { data: response.data };
    } catch (error: any) {
        return { error: 'Failed to delete printer.' };
    }
}
