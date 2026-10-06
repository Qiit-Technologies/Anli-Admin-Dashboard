'use server';

import api from '@/lib/axios';
import { BanquetReportData } from '@/components/banquest/reports/types';
import { getAuthToken } from './auth/auth-token';

export interface BanquetReportParams {
    slug: string;
    startDate?: string;
    endDate?: string;
    startTime?: string;
    endTime?: string;
    [key: string]: string | undefined;
}

export async function getBanquetReport(
    params: BanquetReportParams,
): Promise<{ data?: BanquetReportData; error?: string }> {
    try {
        const token = await getAuthToken();
        if (!token) {
            return { error: 'Authentication token not found.' };
        }

        const { slug, ...filters } = params;
        const searchParams = new URLSearchParams();

        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== '' && value !== 'all') {
                searchParams.append(key, value);
            }
        });

        const query = searchParams.toString();
        const url = `/banquet/reports/${slug}${query ? `?${query}` : ''}`;

        const response = await api.get(url, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (response.status !== 200) {
            return {
                error: response.data?.message || 'Failed to generate report.',
            };
        }

        return { data: response.data as BanquetReportData };
    } catch (error: unknown) {
        const err = error as {
            response?: { data?: { message?: string | string[] } };
        };
        const raw = err?.response?.data?.message;
        const message = Array.isArray(raw)
            ? raw.join(', ')
            : typeof raw === 'string'
              ? raw
              : 'Failed to generate report.';
        return { error: message };
    }
}
