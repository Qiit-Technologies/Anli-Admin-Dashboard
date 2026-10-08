import api from '@/lib/axios';
import { getAuthToken } from './auth/auth-token';

async function withAuth() {
    const authToken = await getAuthToken();
    if (!authToken) {
        throw new Error('Authentication token not found.');
    }
    return {
        Authorization: `Bearer ${authToken}`,
    };
}

export type SystemAnnouncement = {
    id: number;
    title: string;
    body: string;
    type: 'maintenance' | 'release' | 'update';
    status: 'draft' | 'scheduled' | 'active' | 'completed';
    startsAt?: string | null;
    endsAt?: string | null;
    sendEmail?: boolean;
    read?: boolean;
    createdAt?: string;
};

export async function fetchAnnouncementInbox() {
    try {
        const headers = await withAuth();
        const response = await api.get('/system-announcements/inbox', {
            headers,
        });
        return { data: response.data as SystemAnnouncement[] };
    } catch (error: any) {
        return {
            error:
                error.response?.data?.message ||
                'Failed to load notifications.',
        };
    }
}

export async function fetchActiveMaintenance() {
    try {
        const headers = await withAuth();
        const response = await api.get('/system-announcements/maintenance', {
            headers,
        });
        return { data: (response.data || null) as SystemAnnouncement | null };
    } catch {
        return { data: null };
    }
}

export async function markAnnouncementRead(id: number) {
    try {
        const headers = await withAuth();
        await api.patch(`/system-announcements/${id}/read`, {}, { headers });
        return { data: true };
    } catch (error: any) {
        return {
            error:
                error.response?.data?.message ||
                'Failed to mark notification as read.',
        };
    }
}
