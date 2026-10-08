'use server';

import api from '@/lib/axios';
import { getApiErrorMessage } from '@/lib/api-error';
import { getAuthToken } from './auth/auth-token';

export async function startWorkPeriod(
    startTime: string,
    areaType: 'FAST_FOOD' | 'DINE_AREA',
    areaId?: number,
) {
    try {
        const authToken = await getAuthToken();
        const { data } = await api.post(
            '/restaurants/work-period/start',
            { startTime, areaType, areaId },
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authToken}`,
                },
            },
        );
        return { data };
    } catch (error: any) {
        return {
            error:
                error?.response?.data?.message || 'Failed to start work period',
        };
    }
}

export async function endWorkPeriod(
    endTime: string,
    settleBills?: boolean,
    areaId?: number,
    areaType?: 'FAST_FOOD' | 'DINE_AREA',
    workPeriodId?: number,
) {
    try {
        const authToken = await getAuthToken();
        const { data } = await api.post(
            '/restaurants/work-period/end',
            { endTime, settleBills, areaId, areaType, workPeriodId },
            {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            },
        );
        return { data };
    } catch (error: unknown) {
        return {
            error: getApiErrorMessage(error, 'Failed to end work period'),
        };
    }
}

export async function getActiveWorkPeriod() {
    try {
        const authToken = await getAuthToken();
        const { data } = await api.get('/restaurants/work-period/active', {
            headers: {
                Authorization: `Bearer ${authToken}`,
            },
        });
        return { data };
    } catch (error: any) {
        return {
            error:
                error?.response?.data?.message ||
                'Failed to get active work period',
        };
    }
}

export async function getWorkPeriods() {
    try {
        const authToken = await getAuthToken();
        const { data } = await api.get('/restaurants/work-period', {
            headers: {
                Authorization: `Bearer ${authToken}`,
            },
        });
        return { data };
    } catch (error: any) {
        return {
            error:
                error?.response?.data?.message || 'Failed to get work periods',
        };
    }
}

export async function batchStartWorkPeriods(
    areas: Array<{ areaType: 'FAST_FOOD' | 'DINE_AREA'; areaId?: number }>,
    startTime: string,
) {
    try {
        const authToken = await getAuthToken();
        const { data } = await api.post(
            '/restaurants/work-period/batch-start',
            { areas, startTime },
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authToken}`,
                },
            },
        );
        return { data };
    } catch (error: any) {
        return {
            error:
                error?.response?.data?.message ||
                'Failed to batch start work periods',
        };
    }
}

export async function getWorkPeriodById(id: number | string) {
    try {
        const authToken = await getAuthToken();
        const { data } = await api.get('/restaurants/work-period', {
            headers: { Authorization: `Bearer ${authToken}` },
        });
        const period = (data?.data || data || []).find(
            (p: any) => String(p.id) === String(id),
        );
        if (!period) {
            return { error: 'Work period not found' };
        }
        return { data: period };
    } catch (error: any) {
        return {
            error:
                error?.response?.data?.message ||
                'Failed to get work period',
        };
    }
}

export async function batchEndWorkPeriods(
    workPeriodIds: number[],
    endTime: string,
    settleBills?: boolean,
) {
    try {
        const authToken = await getAuthToken();
        const { data } = await api.post(
            '/restaurants/work-period/batch-end',
            { workPeriodIds, endTime, settleBills },
            {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            },
        );
        return { data };
    } catch (error: unknown) {
        return {
            error: getApiErrorMessage(
                error,
                'Failed to batch end work periods',
            ),
        };
    }
}
