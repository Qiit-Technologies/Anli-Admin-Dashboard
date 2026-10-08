'use server';

import api from '@/lib/axios';
import { getAuthToken } from '@/app/actions/auth/auth-token';

// Report Types
export interface SalesVsStockData {
    data: {
        date: string;
        item: string;
        category: string;
        qtySold: number;
        salesUoM: string;
        qtyInStock: number;
        stockUoM: string;
        costPerUnit: number;
        sellingPrice: number;
        totalSales: number;
        inventoryValue: number;
        variance: number;
        remarks: string;
    }[];
}

export interface ItemPerformanceData {
    itemName: string;
    category: string;
    totalSold: number;
    revenue: number;
    profit: number;
    performanceScore: number;
}

export interface VarianceData {
    itemName: string;
    expectedSales: number;
    actualSales: number;
    variance: number;
    variancePercent: number;
}

export interface StockMovementData {
    date: string;
    item: string;
    type: 'IN' | 'OUT';
    quantity: number;
    from: string;
    to: string;
    reference: string;
}

export interface StockTransferData {
    id: string;
    date: string;
    from: string;
    to: string;
    items: number;
    totalValue: number;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export interface PurchaseRestockData {
    id: string;
    date: string;
    supplier: string;
    items: number;
    totalCost: number;
    status: 'PENDING' | 'DELIVERED' | 'CANCELLED';
}

export interface WastageSpoilageData {
    item: string;
    category: string;
    quantity: number;
    reason: string;
    value: number;
    date: string;
}

export interface ExpiryPerishablesData {
    name: string;
    category: string;
    quantity: number;
    expiryDate: string;
    daysToExpiry: number;
    value: number;
}

export interface DepartmentUsageData {
    name: string;
    totalUsage: number;
    itemsUsed: number;
    topItem: string;
    topItemQuantity: number;
    efficiency: number;
}

export interface ProfitMarginData {
    name: string;
    category: string;
    revenue: number;
    cost: number;
    profit: number;
    margin: number;
}

export interface SalesSummaryData {
    period: string;
    sales: number;
    orders: number;
    avgOrder: number;
}

export interface StockValueData {
    category: string;
    totalValue: number;
    itemCount: number;
    avgItemValue: number;
}

export interface ReportFilters {
    startDate: string;
    endDate: string;
    department: string;
    category: string;
}

export interface ReportResponse<T> {
    data: T[];
    totalCount: number;
    dateRange: {
        start: string;
        end: string;
    };
}

const getAuthHeaders = async () => {
    const authToken = await getAuthToken();
    if (!authToken) {
        throw new Error('Authentication token not found.');
    }
    return {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
    };
};

// API Actions for each report type
export async function fetchSalesVsStockReport(
    filters?: ReportFilters,
): Promise<ReportResponse<SalesVsStockData>> {
    const headers = await getAuthHeaders();
    const params = filters
        ? {
              startDate: filters.startDate,
              endDate: filters.endDate,
              department: filters.department,
              category: filters.category,
          }
        : {};

    const response = await api.get('/stock/report/sales-vs-stock', {
        headers,
        params,
    });
    return {
        data: response.data,
        totalCount: response.data.length,
        dateRange: {
            start: filters?.startDate || new Date().toISOString().split('T')[0],
            end: filters?.endDate || new Date().toISOString().split('T')[0],
        },
    };
}

export async function fetchItemPerformanceReport(
    filters?: ReportFilters,
): Promise<ReportResponse<ItemPerformanceData>> {
    const headers = await getAuthHeaders();
    const params = filters
        ? {
              startDate: filters.startDate,
              endDate: filters.endDate,
              department: filters.department,
              category: filters.category,
          }
        : {};

    const response = await api.get('/stock/report/item-performance', {
        headers,
        params,
    });
    return {
        data: response.data,
        totalCount: response.data.length,
        dateRange: {
            start: filters?.startDate || new Date().toISOString().split('T')[0],
            end: filters?.endDate || new Date().toISOString().split('T')[0],
        },
    };
}

export async function fetchVarianceReport(
    filters?: ReportFilters,
): Promise<ReportResponse<VarianceData>> {
    const headers = await getAuthHeaders();
    const params = filters
        ? {
              startDate: filters.startDate,
              endDate: filters.endDate,
              department: filters.department,
              category: filters.category,
          }
        : {};

    const response = await api.get('/stock/report/variance', {
        headers,
        params,
    });
    return {
        data: response.data,
        totalCount: response.data.length,
        dateRange: {
            start: filters?.startDate || new Date().toISOString().split('T')[0],
            end: filters?.endDate || new Date().toISOString().split('T')[0],
        },
    };
}

export async function fetchStockMovementHistoryReport(
    filters?: ReportFilters,
): Promise<ReportResponse<StockMovementData>> {
    const headers = await getAuthHeaders();
    const params = filters
        ? {
              startDate: filters.startDate,
              endDate: filters.endDate,
              department: filters.department,
              category: filters.category,
          }
        : {};

    const response = await api.get('/stock/report/stock-movement-history', {
        headers,
        params,
    });
    return {
        data: response.data,
        totalCount: response.data.length,
        dateRange: {
            start: filters?.startDate || new Date().toISOString().split('T')[0],
            end: filters?.endDate || new Date().toISOString().split('T')[0],
        },
    };
}

export async function fetchStockTransferReport(
    filters?: ReportFilters,
): Promise<ReportResponse<StockTransferData>> {
    const headers = await getAuthHeaders();
    const params = filters
        ? {
              startDate: filters.startDate,
              endDate: filters.endDate,
              department: filters.department,
              category: filters.category,
          }
        : {};

    const response = await api.get('/stock/report/stock-transfer', {
        headers,
        params,
    });
    return {
        data: response.data,
        totalCount: response.data.length,
        dateRange: {
            start: filters?.startDate || new Date().toISOString().split('T')[0],
            end: filters?.endDate || new Date().toISOString().split('T')[0],
        },
    };
}

export async function fetchPurchaseRestockReport(
    filters?: ReportFilters,
): Promise<ReportResponse<PurchaseRestockData>> {
    const headers = await getAuthHeaders();
    const params = filters
        ? {
              startDate: filters.startDate,
              endDate: filters.endDate,
              department: filters.department,
              category: filters.category,
          }
        : {};

    const response = await api.get('/stock/report/purchase-restock', {
        headers,
        params,
    });
    return {
        data: response.data,
        totalCount: response.data.length,
        dateRange: {
            start: filters?.startDate || new Date().toISOString().split('T')[0],
            end: filters?.endDate || new Date().toISOString().split('T')[0],
        },
    };
}

export async function fetchWastageSpoilageReport(
    filters?: ReportFilters,
): Promise<ReportResponse<WastageSpoilageData>> {
    const headers = await getAuthHeaders();
    const params = filters
        ? {
              startDate: filters.startDate,
              endDate: filters.endDate,
              department: filters.department,
              category: filters.category,
          }
        : {};

    const response = await api.get('/stock/report/wastage-spoilage', {
        headers,
        params,
    });
    return {
        data: response.data,
        totalCount: response.data.length,
        dateRange: {
            start: filters?.startDate || new Date().toISOString().split('T')[0],
            end: filters?.endDate || new Date().toISOString().split('T')[0],
        },
    };
}

export async function fetchExpiryPerishablesReport(
    filters?: ReportFilters,
): Promise<ReportResponse<ExpiryPerishablesData>> {
    const headers = await getAuthHeaders();
    const params = filters
        ? {
              startDate: filters.startDate,
              endDate: filters.endDate,
              department: filters.department,
              category: filters.category,
          }
        : {};

    const response = await api.get('/stock/report/expiry-perishables', {
        headers,
        params,
    });
    return {
        data: response.data,
        totalCount: response.data.length,
        dateRange: {
            start: filters?.startDate || new Date().toISOString().split('T')[0],
            end: filters?.endDate || new Date().toISOString().split('T')[0],
        },
    };
}

export async function fetchDepartmentUsageReport(
    filters?: ReportFilters,
): Promise<ReportResponse<DepartmentUsageData>> {
    const headers = await getAuthHeaders();
    const params = filters
        ? {
              startDate: filters.startDate,
              endDate: filters.endDate,
              department: filters.department,
              category: filters.category,
          }
        : {};

    const response = await api.get('/stock/report/department-usage', {
        headers,
        params,
    });
    return {
        data: response.data,
        totalCount: response.data.length,
        dateRange: {
            start: filters?.startDate || new Date().toISOString().split('T')[0],
            end: filters?.endDate || new Date().toISOString().split('T')[0],
        },
    };
}

export async function fetchProfitMarginReport(
    filters?: ReportFilters,
): Promise<ReportResponse<ProfitMarginData>> {
    const headers = await getAuthHeaders();
    const params = filters
        ? {
              startDate: filters.startDate,
              endDate: filters.endDate,
              department: filters.department,
              category: filters.category,
          }
        : {};

    const response = await api.get('/stock/report/profit-margin', {
        headers,
        params,
    });
    return {
        data: response.data,
        totalCount: response.data.length,
        dateRange: {
            start: filters?.startDate || new Date().toISOString().split('T')[0],
            end: filters?.endDate || new Date().toISOString().split('T')[0],
        },
    };
}

export async function fetchSalesSummaryReport(
    filters?: ReportFilters,
): Promise<ReportResponse<SalesSummaryData>> {
    const headers = await getAuthHeaders();
    const params = filters
        ? {
              startDate: filters.startDate,
              endDate: filters.endDate,
              department: filters.department,
              category: filters.category,
          }
        : {};

    const response = await api.get('/stock/report/sales-summary', {
        headers,
        params,
    });
    return {
        data: response.data,
        totalCount: response.data.length,
        dateRange: {
            start: filters?.startDate || new Date().toISOString().split('T')[0],
            end: filters?.endDate || new Date().toISOString().split('T')[0],
        },
    };
}

export async function fetchStockValueReport(
    filters?: ReportFilters,
): Promise<ReportResponse<StockValueData>> {
    const headers = await getAuthHeaders();
    const params = filters
        ? {
              startDate: filters.startDate,
              endDate: filters.endDate,
              department: filters.department,
              category: filters.category,
          }
        : {};
    const response = await api.get('/stock/report/stock-value', {
        headers,
        params,
    });

    return {
        data: response.data,
        totalCount: response.data.length,
        dateRange: {
            start: filters?.startDate || new Date().toISOString().split('T')[0],
            end: filters?.endDate || new Date().toISOString().split('T')[0],
        },
    };
}

export async function getManagersFlash(date: string) {
    const headers = await getAuthHeaders();
    try {
        const response = await api.get('/reports/managers-flash', {
            headers,
            params: { date },
        });
        return { data: response.data.data };
    } catch (error: any) {
        console.error('Error fetching manager flash:', error);
        return { error: 'Failed to fetch manager flash report' };
    }
}

export type OwnerDashboardData = {
    asOf: string;
    metrics: {
        occupancyPct: number;
        occupied: number;
        vacant: number;
        totalRooms: number;
        adr: number;
        revpar: number;
        roomRevenue: number;
        fbRevenue: number;
        totalRevenue: number;
        arrivals: number;
        departures: number;
        restaurantOrders: number;
        restaurantCovers: number;
        peakPeriod: string;
        staffOnDuty: number;
        pendingApprovals: number;
        lowStockCount: number;
    };
    events: Array<{
        id: string;
        severity: 'critical' | 'warning' | 'info';
        category: string;
        title: string;
        detail: string;
        at: string;
    }>;
    logs: Array<{
        id: number;
        action: string;
        guestName: string;
        roomNumber: string;
        adminName: string;
        timestamp: string;
        details?: string;
    }>;
    traces: Array<{
        id: string;
        title: string;
        guestName: string;
        roomNumber: string;
        steps: Array<{
            action: string;
            at: string;
            by: string;
            detail?: string;
        }>;
    }>;
};

/** ANLI-011 Owner Dashboard (MELT) */
export async function getOwnerDashboard(date?: string) {
    const headers = await getAuthHeaders();
    try {
        const response = await api.get('/reports/owner-dashboard', {
            headers,
            params: date ? { date } : undefined,
        });
        return { data: response.data.data as OwnerDashboardData };
    } catch (error: any) {
        console.error('Error fetching owner dashboard:', error);
        return { error: 'Failed to fetch owner dashboard' };
    }
}

// ── Budget Actions ────────────────────────────────────────────────────────

export interface BudgetPayload {
    year: number;
    month: number;
    budgetOccupancyPct?: number;
    budgetRoomsOccupied?: number;
    budgetArrivals?: number;
    budgetDepartures?: number;
    budgetRoomRevenue?: number;
    budgetFbRevenue?: number;
    budgetOtherRevenue?: number;
    budgetAdr?: number;
    budgetRevpar?: number;
}

/** Upsert monthly budget targets for the hotel. */
export async function upsertBudget(payload: BudgetPayload) {
    const headers = await getAuthHeaders();
    try {
        const response = await api.post('/reports/budget', payload, { headers });
        return { data: response.data.data };
    } catch (error: any) {
        console.error('Error saving budget:', error);
        return { error: 'Failed to save budget' };
    }
}

/** Fetch the budget record for a specific month. Returns null if not set. */
export async function getBudget(year: number, month: number) {
    const headers = await getAuthHeaders();
    try {
        const response = await api.get('/reports/budget', {
            headers,
            params: { year, month },
        });
        return { data: response.data.data };
    } catch (error: any) {
        console.error('Error fetching budget:', error);
        return { error: 'Failed to fetch budget' };
    }
}

/** Fetch all monthly budgets for a given year (12 records max). */
export async function getBudgetYear(year: number) {
    const headers = await getAuthHeaders();
    try {
        const response = await api.get('/reports/budget/year', {
            headers,
            params: { year },
        });
        return { data: response.data.data };
    } catch (error: any) {
        console.error('Error fetching budget year:', error);
        return { error: 'Failed to fetch budget year' };
    }
}


/* ------------------------------------------------------------------ */
/* Phase 5 — FRD §16: 6 additional reports to reach 18 total          */
/* ------------------------------------------------------------------ */

export interface ProteinStockReportData {
    itemName: string;
    piecesPerPortion: number;
    openingPieces: number;
    inPieces: number;
    outPieces: number;
    closingPieces: number;
    openingDisplay: string;
    closingDisplay: string;
    unitCost: number;
    value: number;
}

export interface ProductionReportData {
    batchNo: string;
    date: string;
    recipe: string;
    outputQuantity: number;
    outputUnit: string;
    totalCost: number;
    costPerUnit: number;
    producedBy: string;
}

export interface BarStockReportData {
    item: string;
    category: string;
    opening: number;
    issued: number;
    returned: number;
    sold: number;
    closing: number;
    unit: string;
    value: number;
}

export interface RecipeCostingData {
    recipeName: string;
    outputItem: string;
    outputQuantity: number;
    ingredientCount: number;
    totalCost: number;
    costPerUnit: number;
}

export interface ReturnVoucherReportData {
    rtvNo: string;
    date: string;
    fromDepartment: string;
    items: number;
    totalValue: number;
    receivedBy: string;
}

export interface StoreIssueReportData {
    sivNo: string;
    date: string;
    department: string;
    receivingOfficer: string;
    items: number;
    totalValue: number;
}

async function fetchFrdReport<T>(
    endpoint: string,
    filters?: ReportFilters,
): Promise<ReportResponse<T>> {
    const headers = await getAuthHeaders();
    const params = filters
        ? {
              startDate: filters.startDate,
              endDate: filters.endDate,
              department: filters.department,
              category: filters.category,
          }
        : {};

    const response = await api.get(endpoint, { headers, params });
    return {
        data: response.data,
        totalCount: response.data.length,
        dateRange: {
            start: filters?.startDate || new Date().toISOString().split('T')[0],
            end: filters?.endDate || new Date().toISOString().split('T')[0],
        },
    };
}

export async function fetchProteinStockReport(
    filters?: ReportFilters,
): Promise<ReportResponse<ProteinStockReportData>> {
    return fetchFrdReport('/stock/report/protein-stock', filters);
}

export async function fetchProductionReport(
    filters?: ReportFilters,
): Promise<ReportResponse<ProductionReportData>> {
    return fetchFrdReport('/stock/report/production', filters);
}

export async function fetchBarStockReport(
    filters?: ReportFilters,
): Promise<ReportResponse<BarStockReportData>> {
    return fetchFrdReport('/stock/report/bar-stock', filters);
}

export async function fetchRecipeCostingReport(
    filters?: ReportFilters,
): Promise<ReportResponse<RecipeCostingData>> {
    return fetchFrdReport('/stock/report/recipe-costing', filters);
}

export async function fetchReturnVoucherReport(
    filters?: ReportFilters,
): Promise<ReportResponse<ReturnVoucherReportData>> {
    return fetchFrdReport('/stock/report/return-voucher', filters);
}

export async function fetchStoreIssueReport(
    filters?: ReportFilters,
): Promise<ReportResponse<StoreIssueReportData>> {
    return fetchFrdReport('/stock/report/store-issue', filters);
}
