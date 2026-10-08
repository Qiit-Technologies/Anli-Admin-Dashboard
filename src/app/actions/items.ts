import { stockItemProps } from '@/components/stock/tables/columns/items';
import { BASE_URL } from '@/constants/api';
import api from '@/lib/axios';
import { ItemProps, ItemsStats } from '@/types';
import { InventoryReponse } from '@/types/inventory.types';
import { TransactionReponse } from '@/types/transaction.types';
import { getAuthToken } from './auth/auth-token';
import { safeResponseJson, safeResponseJsonOrNull, safeErrorJson } from '@/lib/api';

const withOptionalAuthHeader = (token: string | null) => ({
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
});

const toPositiveIntString = (value: unknown, fallback: number): string => {
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed <= 0) {
        return String(fallback);
    }
    return String(Math.trunc(parsed));
};

export async function fetchItems(page: number | string = 1, pageSize?: number) {
    try {
        const authToken = await getAuthToken();
        const safePage = toPositiveIntString(page, 1);
        const safeLimit =
            pageSize === undefined ? undefined : toPositiveIntString(pageSize, 100);
        const response = await api.get('/items', {
            params: {
                page: safePage,
                ...(safeLimit !== undefined && { limit: safeLimit }),
            },
            headers: {
                'Content-Type': 'application/json',
                ...withOptionalAuthHeader(authToken),
            },
        });

        if (response.status >= 500) {
            return {
                error:
                    response.data?.message ??
                    'Failed to fetch items. Try again.',
            };
        }

        return { data: response.data };
    } catch (error: any) {
        const message =
            error?.response?.data?.message ||
            error?.message ||
            'An unexpected error occurred. Please try again.';
        return { error: String(message) };
    }
}

export const getTransactions = async (
    page: number = 1,
): Promise<TransactionReponse> => {
    const token = await getAuthToken();
    const { data } = await api.get<TransactionReponse>('/transactions', {
        params: { page },
        headers: withOptionalAuthHeader(token),
    });
    return data;
};

export const getItemHistory = async (
    id: number,
    page: number = 1,
    limit: number = 5,
): Promise<TransactionReponse> => {
    const token = await getAuthToken();
    const { data } = await api.get<TransactionReponse>(
        `/transactions/items/${id}`,
        {
            params: { page, limit },
            headers: withOptionalAuthHeader(token),
        },
    );
    return data;
};

export const getItemInventory = async (
    id: number,
    page: number = 1,
    limit: number = 5,
): Promise<InventoryReponse> => {
    const token = await getAuthToken();
    const { data } = await api.get<InventoryReponse>(`/inventory/items/${id}`, {
        params: { page, limit },
        headers: withOptionalAuthHeader(token),
    });
    return data;
};

export const getItemsStats = async (): Promise<ItemsStats> => {
    const token = await getAuthToken();
    const { data } = await api.get<ItemsStats>('/items/stats', {
        headers: withOptionalAuthHeader(token),
    });
    return data;
};

export const getSingleItem = async (id: number) => {
    const token = await getAuthToken();
    const { data } = await api.get(`/items/${id}`, {
        headers: withOptionalAuthHeader(token),
    });
    return data;
};

export async function createItem(item: ItemProps) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { message: 'Authentication token not found.' };
        }

        const apiUrl = new URL('/items', BASE_URL).toString();
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify(item),
            credentials: 'include',
        });

        if (!response.ok) {
            const error = await safeErrorJson(response);
            return {
                message:
                    error.message || 'Failed to create item. Please try again.',
            };
        }

        return {
            message: 'Item created successfully!',
            data: await safeResponseJson(response),
        };
    } catch (error: any) {
        return { message: 'An unexpected error occurred. Please try again.' };
    }
}

export type ItemMetaOption = { id: number; name: string };

export async function fetchItemLocations(): Promise<ItemMetaOption[]> {
    try {
        const authToken = await getAuthToken();
        const { data } = await api.get<ItemMetaOption[]>('/items/locations', {
            headers: withOptionalAuthHeader(authToken),
        });
        return Array.isArray(data) ? data : [];
    } catch {
        return [];
    }
}

export async function createItemLocation(
    name: string,
): Promise<ItemMetaOption | null> {
    try {
        const authToken = await getAuthToken();
        const { data } = await api.post<ItemMetaOption>(
            '/items/locations',
            { name },
            { headers: withOptionalAuthHeader(authToken) },
        );
        return data ?? null;
    } catch {
        return null;
    }
}

export async function fetchItemCategories(): Promise<ItemMetaOption[]> {
    try {
        const authToken = await getAuthToken();
        const { data } = await api.get<ItemMetaOption[]>('/items/categories', {
            headers: withOptionalAuthHeader(authToken),
        });
        return Array.isArray(data) ? data : [];
    } catch {
        return [];
    }
}

export async function createItemCategory(
    name: string,
): Promise<ItemMetaOption | null> {
    try {
        const authToken = await getAuthToken();
        const { data } = await api.post<ItemMetaOption>(
            '/items/categories',
            { name },
            { headers: withOptionalAuthHeader(authToken) },
        );
        return data ?? null;
    } catch {
        return null;
    }
}

export async function updateItem(changes: any, id: number) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { message: 'Authentication token not found.' };
        }

        // Map frontend field names to backend DTO names if they differ
        const fieldMapping: Record<string, string> = {
            itemName: 'name',
            unitPrice: 'price',
            baseUoM: 'unitOfMeasurement',
            qtyInStockBase: 'quantity',
            costInBaseAuto: 'price',
            outerUoM: 'outerUnit',
            conversionRate: 'portionRate',
            costPerUnitOuter: 'costPriceOuter',
            expiringDate: 'expiryDate',
            vendorPointOfContact: 'vendorName', // Adjust based on backend DTO
        };

        const formattedChanges: Record<string, any> = {};
        Object.entries(changes).forEach(([key, value]) => {
            const backendKey = fieldMapping[key] || key;
            formattedChanges[backendKey] = value;
        });

        // Ensure numeric fields are numbers
        const numericFields = [
            'price',
            'quantity',
            'portionRate',
            'costPriceOuter',
            'minStock',
        ];
        numericFields.forEach((field) => {
            if (formattedChanges[field] !== undefined) {
                formattedChanges[field] = Number(formattedChanges[field]);
            }
        });

        const apiUrl = new URL(`/items/${id}`, BASE_URL).toString();
        const response = await fetch(apiUrl, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify(formattedChanges),
            credentials: 'include',
        });

        if (!response.ok) {
            const error = await safeErrorJson(response);
            return {
                message:
                    error.message || 'Failed to update item. Please try again.',
            };
        }

        return { message: 'Item updated successfully!' };
    } catch (error: any) {
        return { message: 'An unexpected error occurred. Please try again.' };
    }
}

export async function deleteItem(id: number) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { message: 'Authentication token not found.' };
        }

        const apiUrl = new URL(`/items/${id}`, BASE_URL).toString();
        const response = await fetch(apiUrl, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
            credentials: 'include',
        });

        if (!response.ok) {
            const error = await safeErrorJson(response);
            return {
                message:
                    error.message || 'Failed to delete item. Please try again.',
            };
        }

        return { message: 'Item deleted successfully!' };
    } catch (error: any) {
        return { message: 'An unexpected error occurred. Please try again.' };
    }
}

function coerceCount(value: unknown): number {
    if (typeof value === 'number' && !Number.isNaN(value)) {
        return value;
    }
    if (typeof value === 'string' && value.trim() !== '') {
        const n = Number(value);
        return Number.isNaN(n) ? 0 : n;
    }
    return 0;
}

type HarvestedCsvStats = {
    message: string;
    created: number;
    updated: number;
    skipped: number;
    totalRows: number;
    linesDetected?: number;
    fileBytes?: number;
};

/** Map any key variant (any depth) to our field names. */
function canonicalImportStatKey(key: string): keyof HarvestedCsvStats | null {
    const collapsed = key
        .replace(/^\uFEFF/g, '')
        .trim()
        .toLowerCase()
        .replace(/_/g, '');
    if (collapsed === 'created') return 'created';
    if (collapsed === 'updated') return 'updated';
    if (collapsed === 'skipped') return 'skipped';
    if (collapsed === 'totalrows') return 'totalRows';
    if (collapsed === 'linesdetected') return 'linesDetected';
    if (collapsed === 'filebytes') return 'fileBytes';
    return null;
}

/**
 * Collect created/updated/skipped/totalRows/etc. from every object in the tree.
 * Does not rely on one "stats-shaped" object — fixes proxies and odd nesting.
 */
function harvestImportStatsFromJson(root: unknown): HarvestedCsvStats | null {
    const nums: Partial<HarvestedCsvStats> = {};
    let message = '';

    const visit = (x: unknown) => {
        if (x === null || x === undefined) return;
        if (typeof x === 'string') {
            const t = x.trim();
            if (
                (t.startsWith('{') && t.endsWith('}')) ||
                (t.startsWith('[') && t.endsWith(']'))
            ) {
                try {
                    visit(JSON.parse(t) as unknown);
                } catch {
                    /* ignore */
                }
            }
            return;
        }
        if (typeof x !== 'object') return;
        if (Array.isArray(x)) {
            for (const el of x) visit(el);
            return;
        }

        const o = x as Record<string, unknown>;
        for (const [key, val] of Object.entries(o)) {
            const canon = canonicalImportStatKey(key);
            if (canon) {
                (nums as Record<string, number>)[canon] = coerceCount(val);
            }
            const kl = key.toLowerCase();
            if (
                (kl === 'message' || kl === 'detail') &&
                typeof val === 'string' &&
                val.length > message.length
            ) {
                message = val;
            }
            visit(val);
        }
    };

    visit(root);

    const sawNumberField =
        nums.created !== undefined ||
        nums.updated !== undefined ||
        nums.skipped !== undefined ||
        nums.totalRows !== undefined ||
        nums.linesDetected !== undefined ||
        nums.fileBytes !== undefined;

    if (!sawNumberField) {
        return null;
    }

    const resolvedMessage =
        message || 'CSV processed successfully. Items created or updated.';
    return {
        message: resolvedMessage,
        created: nums.created ?? 0,
        updated: nums.updated ?? 0,
        skipped: nums.skipped ?? 0,
        totalRows: nums.totalRows ?? 0,
        linesDetected: nums.linesDetected,
        fileBytes: nums.fileBytes,
    };
}

function harvestMessageFromJson(root: unknown): string {
    let best = '';
    const visit = (x: unknown) => {
        if (x === null || x === undefined) return;
        if (typeof x === 'string') {
            const t = x.trim();
            if (
                (t.startsWith('{') && t.endsWith('}')) ||
                (t.startsWith('[') && t.endsWith(']'))
            ) {
                try {
                    visit(JSON.parse(t) as unknown);
                } catch {
                    /* ignore */
                }
            }
            return;
        }
        if (typeof x !== 'object') return;
        if (Array.isArray(x)) {
            for (const el of x) visit(el);
            return;
        }
        const o = x as Record<string, unknown>;
        for (const [k, v] of Object.entries(o)) {
            const kl = k.toLowerCase();
            if (
                (kl === 'message' || kl === 'detail') &&
                typeof v === 'string' &&
                v.length > best.length
            ) {
                best = v;
            }
            visit(v);
        }
    };
    visit(root);
    return best;
}

export type UploadItemsCsvSuccess = {
    success: true;
    message: string;
    created: number;
    updated: number;
    skipped: number;
    totalRows: number;
    /** Non-empty lines in the uploaded file (from server; includes header). */
    linesDetected?: number;
    fileBytes?: number;
};

export type UploadItemsCsvFailure = {
    success: false;
    message: string;
};

export type UploadItemsCsvResult =
    | UploadItemsCsvSuccess
    | UploadItemsCsvFailure;

export const uploadItemsCsv = async (
    file: File | null,
): Promise<UploadItemsCsvResult | null> => {
    if (!file) {
        return null;
    }
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return {
                success: false,
                message: 'Authentication token not found.',
            };
        }

        const formData = new FormData();
        formData.append('file', file);

        const apiUrl = new URL('/items/csv', BASE_URL).toString();
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${authToken}`,
            },
            body: formData,
            credentials: 'include',
        });

        if (!response.ok) {
            const error = await safeErrorJson(response).catch(() => ({}));
            return {
                success: false,
                message:
                    (error as { message?: string }).message ||
                    'Failed to upload CSV. Please try again.',
            };
        }

        const textBody = await response.text();
        const trimmed = textBody.replace(/^\uFEFF/, '').trim();
        if (!trimmed) {
            return {
                success: false,
                message:
                    'Upload succeeded but the server returned an empty body.',
            };
        }

        let raw: unknown;
        try {
            raw = JSON.parse(trimmed) as unknown;
        } catch {
            return {
                success: false,
                message:
                    'Upload succeeded but the response was not valid JSON.',
            };
        }

        let stats = harvestImportStatsFromJson(raw);
        if (!stats) {
            const msg = harvestMessageFromJson(raw);
            if (msg) {
                stats = {
                    message: msg,
                    created: 0,
                    updated: 0,
                    skipped: 0,
                    totalRows: 0,
                };
            }
        }

        if (!stats) {
            return {
                success: false,
                message:
                    'Could not read the upload response. Open DevTools → Network → POST /items/csv and inspect the response body.',
            };
        }

        return {
            success: true,
            message:
                stats.message ||
                'CSV processed successfully. Items created or updated.',
            created: stats.created,
            updated: stats.updated,
            skipped: stats.skipped,
            totalRows: stats.totalRows,
            linesDetected: stats.linesDetected,
            fileBytes: stats.fileBytes,
        };
    } catch (error: any) {
        console.log('Error uploading file:', error);
        return {
            success: false,
            message: 'An unexpected error occurred. Please try again.',
        };
    }
};
