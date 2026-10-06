'use server';

import api from '@/lib/axios';
import { getAuthToken } from './auth/auth-token';

export interface DailyStockSummaryItemRow {
    itemId: number;
    itemName: string;
    category: string;
    unit: string;
    unitCost: number;
    opening: number;
    stockIn: number;
    stockOut: number;
    bdQty: number;
    closing: number;
    openingValue: number;
    stockInValue: number;
    stockOutValue: number;
    bdValue: number;
    closingValue: number;
    status: 'STOCK AVAILABLE' | 'REORDER';
    minStock: number;
}

export interface DailyStockSummaryReport {
    hotelId: number;
    hotelName: string;
    businessDate: string;
    generatedAt: string;
    generatedBy: string;
    items: DailyStockSummaryItemRow[];
    totals: {
        openingValue: number;
        stockInValue: number;
        stockOutValue: number;
        bdValue: number;
        closingValue: number;
        totalItems: number;
        movedItems: number;
        reorderItems: number;
    };
}

export async function getDailyStockSummary(date?: string): Promise<{
    data?: DailyStockSummaryReport;
    error?: string;
}> {
    try {
        const authToken = await getAuthToken();
        if (!authToken) return { error: 'Authentication token not found.' };

        const params = date ? `?date=${date}` : '';
        const response = await api.get(`/stock/report/daily-stock-summary${params}`, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        });
        return { data: response.data };
    } catch (error: any) {
        return {
            error:
                error.response?.data?.message ||
                'Failed to load daily stock summary.',
        };
    }
}

export async function emailDailyStockSummary(
    date?: string,
    recipients?: string[],
): Promise<{ success?: boolean; error?: string }> {
    try {
        const authToken = await getAuthToken();
        if (!authToken) return { error: 'Authentication token not found.' };

        const response = await api.post(
            '/stock/report/daily-stock-summary/email',
            { date, recipients },
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authToken}`,
                },
            },
        );
        return { success: response.data?.success ?? true };
    } catch (error: any) {
        return {
            error:
                error.response?.data?.message ||
                'Failed to send stock summary email.',
        };
    }
}

export async function downloadDailyStockSummaryPdf(date?: string): Promise<{
    data?: string;
    filename?: string;
    error?: string;
}> {
    try {
        const authToken = await getAuthToken();
        if (!authToken) return { error: 'Authentication token not found.' };

        const params = date ? `?date=${date}` : '';
        const response = await api.get(`/stock/report/daily-stock-summary/pdf${params}`, {
            headers: {
                Authorization: `Bearer ${authToken}`,
            },
            responseType: 'arraybuffer',
        });

        const base64 = Buffer.from(response.data).toString('base64');
        const filename = `Daily-Stock-Summary-${date || 'today'}.pdf`;
        return { data: base64, filename };
    } catch (error: any) {
        let errorMessage = 'Failed to download stock summary PDF.';
        if (error.response?.data) {
            try {
                const text = Buffer.from(error.response.data).toString('utf-8');
                const parsed = JSON.parse(text);
                if (parsed.message) {
                    errorMessage = Array.isArray(parsed.message)
                        ? parsed.message.join(', ')
                        : parsed.message;
                }
            } catch {
                if (typeof error.response.data === 'string') {
                    errorMessage = error.response.data;
                }
            }
        } else if (error.message) {
            errorMessage = error.message;
        }
        return { error: errorMessage };
    }
}
