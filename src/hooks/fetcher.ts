import {
    getCleaningTaskByStaffAndByHotelId,
    getCleaningTrendsByHotelId,
    getHouseKeepersByHotelId,
    getHouseKeepingReportsByHotelId,
} from '@/app/actions/houseKeeping';
import {
    getInventoryByDepartment,
    getInventoryMetricsByHotelId,
} from '@/app/actions/inventory';
import { fetchItems } from '@/app/actions/items';
import { getWaiterPerformanceStats } from '@/app/actions/order';
import { getRoomByHotelId, getRoomStatsByHotelId } from '@/app/actions/room';
import { getRoomTypesStatByHotelId } from '@/app/actions/roomType';
import {
    getGoodsReceivedByHotelId,
    getGoodsReceivedMetricsByHotelId,
    getStockActivityByHotelId,
    getStockAlertsByHotelId,
    getStockApprovedByHotelId,
    getStockMetricsByHotelId,
    getStockMetricsRowOne,
    getStockMetricsRowTwo,
    getStockMovementByItemId,
    getStockRequestByHotelId,
    getStockRequestMetricsByHotelId,
    getStockUsageReport,
} from '@/app/actions/stock';
import { RoomTypeStats } from '@/components/house-keeping/common/cards/Dashboard';
import { Item, ROOM } from '@/types';

export const fetchRoomTypesStat = async (): Promise<RoomTypeStats[]> => {
    const result = await getRoomTypesStatByHotelId();

    if ('error' in result) {
        throw new Error(result.error || 'Failed to fetch room types.');
    }

    return result.data ?? [];
};

export interface RoomStatProps {
    total: number;
    dirty: number;
    clean: number;
    maintenance: number;
    dueOut: number;
    stayOver: number;
}

export const fetchRoomStats = async (): Promise<RoomStatProps> => {
    const result = await getRoomStatsByHotelId();
    if ('error' in result) {
        throw new Error(result.error || 'Failed to fetch room metrics.');
    }

    return (
        result.data ?? {
            total: 0,
            dirty: 0,
            clean: 0,
            maintenance: 0,
            dueOut: 0,
            stayOver: 0,
        }
    );
};

export type StockMetric = {
    title: string;
    currentValue: number;
    previousValue: number;
    percentageChange: number;
};

export type StockMetricsResponse = StockMetric[];

export const fetchStockMetrics = async (): Promise<StockMetricsResponse> => {
    const result = await getStockMetricsByHotelId();

    if ('error' in result) {
        throw new Error(result.error || 'Failed to fetch stock.');
    }

    return result.data ?? [];
};

export type StockAlertItem = {
    id: number;
    itemName: string;
    currentStock: number;
    minimumStock: number;
    status: string;
};

export const fetchStockAlert = async (): Promise<StockAlertItem[]> => {
    const result = await getStockAlertsByHotelId();

    if ('error' in result) {
        throw new Error(result.error || 'Failed to fetch stock.');
    }

    return result.data ?? [];
};

export type StockActivityLog = {
    id: number;
    itemName: string;
    action: string;
    quantity: number;
    department: string;
    price?: number;
    timestamp: Date;
};

export const fetchStockActivity = async (): Promise<StockActivityLog[]> => {
    const result = await getStockActivityByHotelId();

    if ('error' in result) {
        throw new Error(result.error || 'Failed to fetch stock.');
    }

    return result.data ?? [];
};

export const fetchStockItems = async (
    pageOrKey: number | string = 1,
    pageSize?: number,
): Promise<Item[]> => {
    const parsedPage = Number(pageOrKey);
    const resolvedPage =
        Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;

    const result = await fetchItems(resolvedPage, pageSize);

    if ('error' in result) {
        throw new Error(result.error || 'Failed to fetch stock.');
    }

    return result.data.data ?? [];
};

export const fetchStockRequestMetrics =
    async (): Promise<StockMetricsResponse> => {
        const result = await getStockRequestMetricsByHotelId();

        if ('error' in result) {
            throw new Error(
                result.error || 'Failed to fetch stock request metrics.',
            );
        }

        return result.data ?? [];
    };

export type StockRequest = {
    id: number;
    action: string;
    quantity: number;
    department: string;
    status: string;
    requestedBy: string;
    issuingOfficer?: string;
    date: Date;
    unitOfMeasurement?: string;
    rejectionReason?: string;
    requestNumber?: string;
    itemCount?: number;
};

export const fetchStockRequest = async (): Promise<StockRequest[]> => {
    const result = await getStockRequestByHotelId();

    if ('error' in result) {
        throw new Error(result.error || 'Failed to fetch stock request.');
    }

    return result.data ?? [];
};

export const fetchStockApproved = async (): Promise<StockRequest[]> => {
    const result = await getStockApprovedByHotelId();

    if ('error' in result) {
        throw new Error(result.error || 'Failed to fetch stock approved.');
    }

    return result.data ?? [];
};

export const fetchGoodsReceivedMetrics =
    async (): Promise<StockMetricsResponse> => {
        const result = await getGoodsReceivedMetricsByHotelId();

        if ('error' in result) {
            throw new Error(
                result.error || 'Failed to fetch goods received metrics.',
            );
        }

        return result.data ?? [];
    };

export type GoodReceivedProps = {
    id: number;
    itemName: string;
    currentStock: number;
    status: string;
    minimumStock: number;
};

export const fetchGoodsReceived = async (): Promise<GoodReceivedProps[]> => {
    const result = await getGoodsReceivedByHotelId();

    if ('error' in result) {
        throw new Error(result.error || 'Failed to fetch goods received.');
    }

    return result.data ?? [];
};

export const fetchRooms = async (): Promise<ROOM[]> => {
    const result = await getRoomByHotelId();
    if ('error' in result) {
        return [];
    }

    return Array.isArray(result.data) ? result.data : [];
};

export const fetchScopednventory = async () => {
    const result = await fetchItems();
    if ('error' in result) {
        throw new Error(
            result.error?.toString() || 'Failed to fetch room metrics.',
        );
    }

    return result.data;
};

export const fetchInventoryItemsMetrics = async (
    department: string,
): Promise<any[]> => {
    const result = await getInventoryMetricsByHotelId(department);

    if ('error' in result) {
        throw new Error(result.error || 'Failed to fetch inventory metrics.');
    }

    return result.data ?? [];
};

export const fetchInventoryItems = async (
    department: string,
): Promise<any[]> => {
    const result = await getInventoryByDepartment(department);

    if ('error' in result) {
        throw new Error(result.error || 'Failed to fetch inventory.');
    }

    return result.data ?? [];
};

export const fetchHousekeepers = async () => {
    const result = await getHouseKeepersByHotelId();
    if ('error' in result) {
        throw new Error(
            result.error?.toString() || 'Failed to fetch house keepers.',
        );
    }
    return result ?? [];
};

/** Housekeeping server actions return `{ message }` on failure instead of `{ error }`. */
function throwIfHousekeepingActionFailed(
    result: unknown,
    fallback: string,
): void {
    if (
        result &&
        typeof result === 'object' &&
        'message' in result &&
        !Array.isArray(result) &&
        !('month' in result) &&
        !('label' in result)
    ) {
        const msg = String((result as { message: string }).message || fallback);
        throw new Error(msg);
    }
}

function asArray<T>(result: unknown): T[] {
    return Array.isArray(result) ? (result as T[]) : [];
}

export const fetchHousekeepingReports = async () => {
    const result = await getHouseKeepingReportsByHotelId();
    throwIfHousekeepingActionFailed(
        result,
        'Failed to fetch house keeping reports.',
    );
    return result ?? [];
};

export const fetchHousekeepingCleaningTrends = async (range: string) => {
    const result = await getCleaningTrendsByHotelId(range);
    throwIfHousekeepingActionFailed(result, 'Failed to fetch cleaning trends.');
    return asArray<{ label: string; desktop: number }>(result);
};

export const fetchWaiterPerformanceStat = async (waiterId: number | null) => {
    const result = await getWaiterPerformanceStats(waiterId);
    if ('error' in result) {
        throw new Error(
            result.error?.toString() ||
                'Failed to fetch waiter performance stat.',
        );
    }
    return result ?? [];
};

export const fetchHousekeepingCleaningTaskByStaff = async () => {
    const result = await getCleaningTaskByStaffAndByHotelId();
    throwIfHousekeepingActionFailed(
        result,
        'Failed to fetch cleaning task by staff.',
    );
    return asArray<{
        staff: string;
        cleaningTasks: number;
        fill?: string;
    }>(result);
};

export const fetchStockMetricsRowOne = async () => {
    const result = await getStockMetricsRowOne();
    if ('error' in result) {
        throw new Error(result.error || 'Failed to fetch stock metrics one.');
    }
    return result ?? [];
};

export const fetchStockMetricsRowTwo = async () => {
    const result = await getStockMetricsRowTwo();
    if ('error' in result) {
        throw new Error(result.error || 'Failed to fetch stock metrics two.');
    }
    return result ?? [];
};

export const fetchStockMovement = async (id: string): Promise<any[]> => {
    const result = await getStockMovementByItemId(id);

    if ('error' in result) {
        throw new Error(result.error || 'Failed to fetch inventory.');
    }

    return result.data ?? [];
};

export const fetchUsageReport = async () => {
    const result = await getStockUsageReport();
    if ('error' in result) {
        throw new Error(result.error || 'Failed to fetch inventory.');
    }

    return result ?? [];
};
