import api from '@/lib/axios';
import { getAuthToken } from './auth/auth-token';

export async function getStockMetricsByHotelId() {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const response = await api.get('/items/stock/metrics', {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        });

        if (response.status >= 500) {
            const error = await response.data;
            return {
                error: error.message || 'Failed to fetch stocks. Try again.',
            };
        }

        const data = await response.data;

        return { data };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function getStockAlertsByHotelId() {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const response = await api.get('/items/stock-alerts', {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        });

        if (response.status >= 500) {
            const error = await response.data;
            return {
                error:
                    error.message || 'Failed to fetch stock alert. Try again.',
            };
        }

        const data = await response.data;

        return { data };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function getStockActivityByHotelId() {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const response = await api.get('/items/stock-activity', {
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
                    'Failed to fetch stock activiy. Try again.',
            };
        }

        const data = await response.data;

        return { data };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function getStockRequestMetricsByHotelId() {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const response = await api.get('/items/stock/request/metrics', {
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
                    'Failed to fetch stock request metrics. Try again.',
            };
        }

        const data = await response.data;

        return { data };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function getStockRequestByHotelId() {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const response = await api.get('/items/pending', {
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
                    'Failed to fetch stock request. Try again.',
            };
        }

        const data = await response.data;

        return { data };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function getStockApprovedByHotelId() {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const response = await api.get('/items/approved', {
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
                    'Failed to fetch stock approved. Try again.',
            };
        }

        const data = await response.data;

        return { data };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function getGoodsReceivedMetricsByHotelId() {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const response = await api.get('/items/goods-received-metrics', {
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
                    'Failed to fetch goods received metrics. Try again.',
            };
        }

        const data = await response.data;

        return { data };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function getGoodsReceivedByHotelId() {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const response = await api.get('/items/goods-received', {
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
                    'Failed to fetch goods received. Try again.',
            };
        }

        const data = await response.data;

        return { data };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function getStockMetricsRowOne() {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const response = await api.get('/items/stock-metrics-row-one', {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        });

        if (response.status !== 200) {
            return {
                error:
                    response.data?.message || 'Failed to fetch stock metrics.',
            };
        }

        return response.data;
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function getStockMetricsRowTwo() {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const response = await api.get('/items/stock-metrics-row-two', {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        });

        if (response.status !== 200) {
            return {
                error:
                    response.data?.message || 'Failed to fetch stock metrics.',
            };
        }

        return response.data;
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function getStockMovementByItemId(id: string) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const response = await api.get(`/items/stock-movement/${Number(id)}`, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        });

        if (response.status !== 200) {
            return {
                error:
                    response.data?.message || 'Failed to fetch stock metrics.',
            };
        }

        return response.data;
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function getLowStockByItemId(id: string) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const response = await api.get(`/items/low-stock/${Number(id)}`, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        });

        if (response.status !== 200) {
            return {
                error:
                    response.data?.message || 'Failed to fetch stock metrics.',
            };
        }

        return response.data;
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function getStockUsageReport() {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const response = await api.get(`/items/usage-report`, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        });

        if (response.status !== 200) {
            return {
                error:
                    response.data?.message || 'Failed to fetch stock metrics.',
            };
        }

        return response.data;
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function exportStockItems() {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const response = await api.get('/items/export/stock/excel', {
            headers: {
                Authorization: `Bearer ${authToken}`,
            },
            responseType: 'blob',
        });

        if (response.status !== 200) {
            return {
                error:
                    response.data?.message ||
                    'Failed to export menu items. Please try again.',
            };
        }
        console.log('response.data', response.data);

        const blob = new Blob([response.data]);
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'stock-items.xlsx';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        return { success: true, message: 'File downloaded successfully' };
    } catch (error: any) {
        return {
            error: 'An unexpected error occurred while exporting menu items.',
        };
    }
}

export async function createPurchaseOrder(order: {
    vendorId: number;
    total: number;
    itemGrouping: string;
    status: 'awaiting_grn' | 'pending_payment' | 'pending' | 'completed';
    dateSent: Date;
    items: Array<{ itemId: number; quantity: number; amount: number }>;
}) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }
        const response = await api.post('/accounts/purchase-orders', order, {
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
                    'Failed to create purchase order. Try again.',
            };
        }
        const data = await response.data;
        return { data };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function getPurchaseOrders() {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }
        const response = await api.get('/accounts/purchase-orders', {
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
                    'Failed to fetch purchase orders. Try again.',
            };
        }
        const data = await response.data;
        return { data };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function getPurchaseOrder(id: string | number) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }
        const response = await api.get(`/accounts/purchase-orders/${id}`, {
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
                    'Failed to fetch purchase order. Try again.',
            };
        }
        const data = await response.data;
        return data;
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export const createGoodsReceipt = async (grn: {
    purchaseOrderId: number;
    notes: string;
    items: Array<{ purchaseOrderItemId: number; quantityReceived: number }>;
}) => {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }
        const response = await api.post('/accounts/goods-receipt', grn, {
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
                    'Failed to create goods receipt. Try again.',
            };
        }
        const data = await response.data;
        return { data };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
};

export const getGoodsReceiptNotesByPurchaseOrder = async (
    purchaseOrderId: number,
) => {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }
        const response = await api.get(
            `/accounts/goods-receipt/purchase-order/${purchaseOrderId}`,
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authToken}`,
                },
            },
        );
        if (response.status >= 500) {
            const error = await response.data;
            return {
                error:
                    error.message ||
                    'Failed to fetch goods receipt notes. Try again.',
            };
        }
        const data = await response.data;
        return { data };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
};

export async function updatePurchaseOrder(id: string | number, updates: any) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }
        const response = await api.patch(
            `/accounts/purchase-orders/${id}`,
            updates,
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authToken}`,
                },
            },
        );
        if (response.status >= 500) {
            const error = await response.data;
            return {
                error:
                    error.message ||
                    'Failed to update purchase order. Try again.',
            };
        }
        return { message: 'Purchase order updated successfully' };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

// Requisition Management Actions
export async function updateRequisitionStage(
    id: number,
    stage: string,
    remarks?: string,
) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }
        const response = await api.patch(
            `/items/requisitions/${id}/stage`,
            {
                stage,
                remarks,
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authToken}`,
                },
            },
        );
        if (response.status >= 500) {
            const error = await response.data;
            return {
                error:
                    error.message ||
                    'Failed to update requisition stage. Try again.',
            };
        }
        const data = await response.data;
        return { data };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function approveRequisition(
    id: number,
    approved: boolean,
    remarks?: string,
) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }
        const response = await api.patch(
            `/items/requisitions/${id}/approve`,
            {
                stockRequestId: id,
                approved,
                remarks,
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authToken}`,
                },
            },
        );
        if (response.status >= 500) {
            const error = await response.data;
            return {
                error:
                    error.message ||
                    'Failed to approve/reject requisition. Try again.',
            };
        }
        const data = await response.data;
        return { data };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function confirmRequisition(
    id: number,
    confirmed: boolean,
    remarks?: string,
) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }
        const response = await api.patch(
            `/items/requisitions/${id}/confirm`,
            {
                stockRequestId: id,
                confirmed,
                remarks,
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authToken}`,
                },
            },
        );
        if (response.status >= 500) {
            const error = await response.data;
            return {
                error:
                    error.message ||
                    'Failed to confirm requisition. Try again.',
            };
        }
        const data = await response.data;
        return { data };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function getRequisitionActivities(id: number) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }
        const response = await api.get(`/items/requisitions/${id}/activities`, {
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
                    'Failed to fetch requisition activities. Try again.',
            };
        }
        const data = await response.data;
        return { data };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function getPurchaseLogs() {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }
        const response = await api.get('/items/purchase-logs', {
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
                    'Failed to fetch purchase logs. Try again.',
            };
        }
        const data = await response.data;
        return { data };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function getPurchaseLog(id: string | number) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }
        const response = await api.get(`/items/purchase-logs/${id}`, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        });
        if (response.status >= 500) {
            const error = await response.data;
            return {
                error:
                    error.message || 'Failed to fetch purchase log. Try again.',
            };
        }
        const data = await response.data;
        return { data };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function createPurchaseLog(log: any) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }
        const response = await api.post('/items/purchase-logs', log, {
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
                    'Failed to create purchase log. Try again.',
            };
        }
        const data = await response.data;
        return { data, message: 'Purchase log created successfully!' };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

function toErrorMessage(error: unknown, fallback: string): string {
    if (typeof error === 'string' && error.trim()) return error;
    if (Array.isArray(error)) {
        const joined = error
            .map((part) => toErrorMessage(part, ''))
            .filter(Boolean)
            .join(' ');
        return joined || fallback;
    }
    if (error && typeof error === 'object') {
        const record = error as {
            message?: unknown;
            error?: unknown;
            response?: { data?: { message?: unknown; error?: unknown } };
        };
        const nested =
            record.response?.data?.message ??
            record.response?.data?.error ??
            record.message ??
            record.error;
        if (nested && nested !== error) {
            return toErrorMessage(nested, fallback);
        }
    }
    return fallback;
}

export async function getStockMovements(params: {
    date?: string;
    month?: string;
}) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }
        const search = new URLSearchParams();
        if (params.date) search.set('date', params.date);
        if (params.month) search.set('month', params.month);
        const response = await api.get(
            `/items/stock-movements?${search.toString()}`,
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authToken}`,
                },
            },
        );
        return { data: response.data };
    } catch (error: any) {
        return {
            error: toErrorMessage(error, 'Failed to load stock movements.'),
        };
    }
}

export async function submitStockMovements(payload: {
    date: string;
    lines: Array<{
        itemId: number;
        inQty: number;
        outQty: number;
        bdQty: number;
        unitCost?: number;
    }>;
}) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }
        const response = await api.post('/items/stock-movements', payload, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        });
        return { data: response.data };
    } catch (error: any) {
        return {
            error: toErrorMessage(error, 'Failed to save stock movements.'),
        };
    }
}

/**
 * Protein Stock ledger — FRD §8. Pieces-and-portions tracking for counted
 * proteins. Backend: GET/POST /items/protein-stock.
 */
export async function getProteinStock(params: { date?: string; month?: string }) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }
        const search = new URLSearchParams();
        if (params.date) search.set('date', params.date);
        if (params.month) search.set('month', params.month);
        const response = await api.get(
            `/items/protein-stock?${search.toString()}`,
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authToken}`,
                },
            },
        );
        return { data: response.data };
    } catch (error: any) {
        return {
            error: toErrorMessage(error, 'Failed to load protein stock.'),
        };
    }
}

export async function submitProteinStock(payload: {
    date: string;
    lines: Array<{
        itemId: number;
        inPtn: number;
        inPcs: number;
        outPtn: number;
        outPcs: number;
        rtnPtn: number;
        rtnPcs: number;
        bdPtn: number;
        bdPcs: number;
        bdReason?: string;
        unitCost?: number;
    }>;
}) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }
        const response = await api.post(
            '/items/protein-stock',
            payload,
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authToken}`,
                },
            },
        );
        return { data: response.data };
    } catch (error: any) {
        return {
            error: toErrorMessage(error, 'Failed to save protein stock.'),
        };
    }
}

/**
 * Bar Stock balance — FRD §15. Per-department stock balance: opening,
 * received, sold, transferred, wastage, closing per item.
 * Backend: GET /items/bar-stock?date=YYYY-MM-DD&department=bar.
 * Falls back to the daily stock register for the date when the dedicated
 * endpoint isn't deployed yet (register items carry barOpening/barClosing
 * etc. per the existing DailyStockRegisterItem model).
 */
export async function getBarStock(params: {
    date: string;
    department?: string;
}) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }
        const search = new URLSearchParams();
        search.set('date', params.date);
        if (params.department) search.set('department', params.department);
        try {
            const response = await api.get(
                `/items/bar-stock?${search.toString()}`,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${authToken}`,
                    },
                },
            );
            return { data: response.data, source: 'bar-stock' as const };
        } catch (inner: any) {
            // Dedicated endpoint not deployed yet — derive from the daily
            // stock register, which tracks per-department opening/closing.
            const register = await api.get(
                `/items/daily-registers/date/${params.date}`,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${authToken}`,
                    },
                },
            );
            return {
                data: register.data,
                source: 'daily-register' as const,
            };
        }
    } catch (error: any) {
        return {
            error: toErrorMessage(error, 'Failed to load bar stock.'),
        };
    }
}

export async function getSalesLogs() {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }
        const response = await api.get('/items/sales-logs', {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        });
        if (response.status >= 500) {
            const error = await response.data;
            return {
                error:
                    error.message || 'Failed to fetch sales logs. Try again.',
            };
        }
        const data = await response.data;
        return { data };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function getSalesLog(id: string | number) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }
        const response = await api.get(`/items/sales-logs/${id}`, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        });
        if (response.status >= 500) {
            const error = await response.data;
            return {
                error: error.message || 'Failed to fetch sales log. Try again.',
            };
        }
        const data = await response.data;
        return { data };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function getTransfers() {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }
        const response = await api.get('/items/transfers', {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        });
        if (response.status >= 500) {
            const error = await response.data;
            return {
                error: error.message || 'Failed to fetch transfers. Try again.',
            };
        }
        const data = await response.data;
        return { data };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function createTransfer(transfer: any) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }
        const response = await api.post('/items/transfers', transfer, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        });
        if (response.status >= 500) {
            const error = await response.data;
            return {
                error: error.message || 'Failed to create transfer. Try again.',
            };
        }
        const data = await response.data;
        return { data, message: 'Transfer created successfully!' };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function approveTransfer(id: number) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }
        const response = await api.patch(
            `/items/transfers/${id}/approve`,
            { approved: true },
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authToken}`,
                },
            },
        );
        if (response.status >= 500) {
            const error = await response.data;
            return {
                error:
                    error.message || 'Failed to approve transfer. Try again.',
            };
        }
        const data = await response.data;
        return { data, message: 'Transfer approved successfully!' };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function rejectTransfer(id: number, rejectionReason: string) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }
        const response = await api.patch(
            `/items/transfers/${id}/approve`,
            { approved: false, rejectionReason },
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authToken}`,
                },
            },
        );
        if (response.status >= 500) {
            const error = await response.data;
            return {
                error: error.message || 'Failed to reject transfer. Try again.',
            };
        }
        const data = await response.data;
        return { data, message: 'Transfer rejected successfully!' };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

// Daily Stock Register Actions
export async function getDailyStockRegisters(limit?: number, offset?: number) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }
        const response = await api.get('/items/daily-registers', {
            params: { limit, offset },
            headers: {
                Authorization: `Bearer ${authToken}`,
            },
        });
        return { data: response.data };
    } catch (error: any) {
        return {
            error:
                error?.response?.data?.message ||
                'Failed to fetch daily registers.',
        };
    }
}

export async function getDailyStockRegisterByDate(date: string) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }
        const response = await api.get(`/items/daily-registers/date/${date}`, {
            headers: {
                Authorization: `Bearer ${authToken}`,
            },
        });
        return { data: response.data };
    } catch (error: any) {
        return {
            error:
                error?.response?.data?.message ||
                'Failed to fetch register for this date.',
        };
    }
}

export async function addManualSalesLogItem(id: string | number, data: any) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }
        const response = await api.post(
            `/items/sales-logs/${id}/add-item`,
            data,
            {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            },
        );
        return { data: response.data };
    } catch (error: any) {
        return {
            error: error.response?.data?.message || 'Failed to add manual item',
        };
    }
}

export async function exportSalesLogs() {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const response = await api.get('/items/sales-logs/export/excel', {
            headers: {
                Authorization: `Bearer ${authToken}`,
            },
            responseType: 'blob',
        });

        if (response.status !== 200) {
            return {
                error:
                    response.data?.message ||
                    'Failed to export sales logs. Please try again.',
            };
        }

        const blob = new Blob([response.data]);
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'sales-logs.xlsx';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        return { success: true, message: 'File downloaded successfully' };
    } catch (error: any) {
        return {
            error: 'An unexpected error occurred while exporting sales logs.',
        };
    }
}

export async function createDailyStockRegister(registerData: {
    registerDate: string;
}) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }
        const response = await api.post(
            '/items/daily-registers',
            registerData,
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authToken}`,
                },
            },
        );
        return {
            data: response.data,
            message: 'Daily register created successfully!',
        };
    } catch (error: any) {
        return {
            error:
                error?.response?.data?.message ||
                'Failed to create daily register.',
        };
    }
}

export async function closeDailyStockRegister(id: number) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }
        const response = await api.post(
            `/items/daily-registers/${id}/close`,
            {},
            {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            },
        );
        return {
            data: response.data,
            message: 'Daily register closed successfully!',
        };
    } catch (error: any) {
        return {
            error:
                error?.response?.data?.message ||
                'Failed to close daily register.',
        };
    }
}

// Bad & Perishable Stock Actions
export async function getBadStockRecords(
    status?: string,
    startDate?: string,
    endDate?: string,
) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }
        const response = await api.get('/items/bad-stock', {
            params: { status, startDate, endDate },
            headers: {
                Authorization: `Bearer ${authToken}`,
            },
        });
        return { data: response.data };
    } catch (error: any) {
        return {
            error:
                error?.response?.data?.message ||
                'Failed to fetch bad stock records.',
        };
    }
}

export async function createBadStockRecord(record: {
    date: string;
    department: string;
    reason: string;
    reasonOther?: string;
    remarks?: string;
    discoveredBy?: number;
    managerPin?: string;
    /** Preferred multi-item payload */
    items?: Array<{ itemId: number; quantityAffected: number }>;
    /** Legacy single-item fields */
    itemId?: number;
    quantityAffected?: number;
}) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }
        const response = await api.post('/items/bad-stock', record, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        });
        return {
            data: response.data,
            message: 'Spoilage transaction created successfully!',
        };
    } catch (error: any) {
        return {
            error:
                error?.response?.data?.message ||
                'Failed to create bad stock record.',
        };
    }
}

export async function approveBadStockRecord(
    id: number,
    approvalData: {
        approved: boolean;
        rejectionReason?: string;
        managerPin?: string;
    },
) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }
        const response = await api.patch(
            `/items/bad-stock/${id}/approve`,
            approvalData,
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authToken}`,
                },
            },
        );
        return {
            data: response.data,
            message: approvalData.approved
                ? 'Bad stock record approved and inventory updated!'
                : 'Bad stock record rejected successfully.',
        };
    } catch (error: any) {
        return {
            error:
                error?.response?.data?.message || 'Failed to process approval.',
        };
    }
}

export async function getBadStockRecord(id: number) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }
        const response = await api.get(`/items/bad-stock/${id}`, {
            headers: {
                Authorization: `Bearer ${authToken}`,
            },
        });
        return { data: response.data };
    } catch (error: any) {
        return {
            error:
                error?.response?.data?.message ||
                'Failed to fetch record details.',
        };
    }
}

export async function addPurchaseLogItem(logId: string | number, data: any) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }
        const response = await api.post(
            `/items/purchase-logs/${logId}/add-item`,
            data,
            {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            },
        );
        return { data: response.data, message: 'Item added successfully!' };
    } catch (error: any) {
        return {
            error:
                error.response?.data?.message ||
                'Failed to add item to purchase log.',
        };
    }
}

export async function updatePurchaseLogItem(
    itemId: string | number,
    data: any,
) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }
        const response = await api.patch(
            `/items/purchase-log-items/${itemId}`,
            data,
            {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            },
        );
        return { data: response.data, message: 'Item updated successfully!' };
    } catch (error: any) {
        return {
            error:
                error.response?.data?.message ||
                'Failed to update purchase log item.',
        };
    }
}

export async function deletePurchaseLogItem(itemId: string | number) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }
        const response = await api.delete(
            `/items/purchase-log-items/${itemId}`,
            {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            },
        );
        return { data: response.data, message: 'Item deleted successfully!' };
    } catch (error: any) {
        return {
            error:
                error.response?.data?.message ||
                'Failed to delete purchase log item.',
        };
    }
}

/* ------------------------------------------------------------------ */
/* Phase 2 — SIV / B&D / Transfer send-receive (FRD §10/§11/§12/§17)    */
/* ------------------------------------------------------------------ */

/**
 * Fetch a single Store Issue Voucher (SIV) by id.
 * Tries the dedicated SIV endpoint first; falls back to the approved
 * requisition endpoints when the SIV backend isn't ready yet.
 */
export async function getIssuedStockDetail(id: string | number) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }
        const headers = { Authorization: `Bearer ${authToken}` };
        // Primary: dedicated SIV endpoint
        try {
            const res = await api.get(`/items/siv/${id}`, { headers });
            return { data: res.data?.data ?? res.data };
        } catch {
            // Fallback: approved requisition detail
            const res = await api.get(`/items/approved/${id}`, { headers });
            return { data: res.data?.data ?? res.data };
        }
    } catch (error: any) {
        return {
            error:
                error.response?.data?.message ||
                'Failed to fetch issue voucher details.',
        };
    }
}

/**
 * Fetch a single stock transfer by id.
 */
export async function getTransfer(id: string | number) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }
        const response = await api.get(`/items/transfers/${id}`, {
            headers: { Authorization: `Bearer ${authToken}` },
        });
        return { data: response.data?.data ?? response.data };
    } catch (error: any) {
        return {
            error:
                error.response?.data?.message ||
                'Failed to fetch transfer details.',
        };
    }
}

/**
 * Mark a transfer as SENT (moves it to In Transit).
 * FRD §17: send → receive flow.
 */
export async function sendTransfer(id: string | number) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }
        const response = await api.patch(
            `/items/transfers/${id}/send`,
            {},
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authToken}`,
                },
            },
        );
        return {
            data: response.data?.data ?? response.data,
            message: 'Transfer marked as sent.',
        };
    } catch (error: any) {
        return {
            error:
                error.response?.data?.message ||
                'Failed to mark transfer as sent.',
        };
    }
}

export interface TransferReceiveLine {
    itemId: string | number;
    sentQuantity: number;
    receivedQuantity: number;
    discrepancyReason?: string;
}

/**
 * Confirm receipt of a transfer.
 * The receiving user confirms received quantities per line; when received
 * differs from sent, a discrepancy reason is required.
 * FRD §17: the receiving user confirms received quantities per line.
 */
export async function receiveTransfer(
    id: string | number,
    payload: {
        receivedById?: number;
        lines: TransferReceiveLine[];
        remarks?: string;
    },
) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }
        const response = await api.patch(
            `/items/transfers/${id}/receive`,
            payload,
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authToken}`,
                },
            },
        );
        return {
            data: response.data?.data ?? response.data,
            message: 'Transfer received successfully.',
        };
    } catch (error: any) {
        return {
            error:
                error.response?.data?.message ||
                'Failed to confirm transfer receipt.',
        };
    }
}

/* ------------------------------------------------------------------ */
/* Recipes — FRD §14. Backend: /items/recipes                          */
/* ------------------------------------------------------------------ */

export interface RecipeIngredientInput {
    itemId: number;
    quantity: number;
    unit?: string;
}

export interface RecipeInput {
    name: string;
    description?: string;
    outputItemId: number;
    outputQuantity: number;
    outputUnit?: string;
    instructions?: string;
    isActive?: boolean;
    ingredients: RecipeIngredientInput[];
}

export async function getRecipes() {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }
        const response = await api.get('/items/recipes', {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        });
        return { data: response.data?.data ?? response.data };
    } catch (error: any) {
        return {
            error: toErrorMessage(error, 'Failed to load recipes.'),
        };
    }
}

export async function getRecipe(id: string | number) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }
        const response = await api.get(`/items/recipes/${id}`, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        });
        return { data: response.data?.data ?? response.data };
    } catch (error: any) {
        return {
            error: toErrorMessage(error, 'Failed to load recipe.'),
        };
    }
}

export async function createRecipe(payload: RecipeInput) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }
        const response = await api.post('/items/recipes', payload, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        });
        return {
            data: response.data?.data ?? response.data,
            message: 'Recipe created successfully.',
        };
    } catch (error: any) {
        return {
            error: toErrorMessage(error, 'Failed to create recipe.'),
        };
    }
}

export async function updateRecipe(id: string | number, payload: Partial<RecipeInput>) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }
        const response = await api.patch(`/items/recipes/${id}`, payload, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        });
        return {
            data: response.data?.data ?? response.data,
            message: 'Recipe updated successfully.',
        };
    } catch (error: any) {
        return {
            error: toErrorMessage(error, 'Failed to update recipe.'),
        };
    }
}

/* ------------------------------------------------------------------ */
/* Kitchen Production — FRD §9. Backend: /items/production             */
/* ------------------------------------------------------------------ */

export interface ProductionBatchInput {
    recipeId: number;
    outputQuantity: number;
    productionDate?: string;
    notes?: string;
}

export async function getProductionBatches(params?: { from?: string; to?: string }) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }
        const search = new URLSearchParams();
        if (params?.from) search.set('from', params.from);
        if (params?.to) search.set('to', params.to);
        const qs = search.toString();
        const response = await api.get(
            `/items/production${qs ? `?${qs}` : ''}`,
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authToken}`,
                },
            },
        );
        return { data: response.data?.data ?? response.data };
    } catch (error: any) {
        return {
            error: toErrorMessage(error, 'Failed to load production batches.'),
        };
    }
}

export async function createProductionBatch(payload: ProductionBatchInput) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }
        const response = await api.post('/items/production', payload, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        });
        return {
            data: response.data?.data ?? response.data,
            message: 'Production batch posted successfully.',
        };
    } catch (error: any) {
        return {
            error: toErrorMessage(error, 'Failed to post production batch.'),
        };
    }
}
