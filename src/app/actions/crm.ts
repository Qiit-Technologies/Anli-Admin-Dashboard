'use server';

/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    axiosGet,
    axiosPost,
    axiosPatch,
    isRedirectError,
} from '../lib/api';

/**
 * CRM server actions — admin-app half of the Anli CRM module.
 *
 * All routes live under the backend's `/super-admin/crm` namespace guarded by
 * `AuthGuard('super-admin-jwt')`. The super-admin JWT is attached
 * automatically: the axios interceptor in `src/app/lib/api.ts` injects
 * `Authorization: Bearer <token>` from the `access_token` cookie
 * (server-side) or localStorage (client-side). The admin app's own `/login`
 * + middleware own super-admin auth, so the hotel app's separate
 * `super_admin_access_token` cookie / sign-in gate is intentionally not
 * ported here.
 */

/* ------------------------------------------------------------------ types */

export type CrmLeadStatus =
    | 'new'
    | 'contacted'
    | 'qualified'
    | 'proposal'
    | 'negotiation'
    | 'won'
    | 'lost'
    | 'dormant';

export interface CrmLead {
    id: string | number;
    contactName: string;
    companyName: string;
    email?: string;
    phone?: string;
    source?: string;
    status: string;
    statusChangedAt?: string;
    ownerId?: string | number;
    ownerName?: string;
    nextFollowUpAt?: string;
    lastContactedAt?: string;
    estimatedValue?: number;
    currency?: string;
    businessType?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    cacNumber?: string;
    taxId?: string;
    notes?: string;
    convertedHotelId?: string | number;
    convertedAt?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface CrmLeadDetail {
    lead: CrmLead;
    activities: CrmActivity[];
    documents: CrmDocument[];
}

export type CrmActivityType = 'NOTE' | 'CALL' | 'EMAIL' | 'MEETING';

export interface CrmActivity {
    id: string | number;
    type: CrmActivityType | string;
    body: string;
    createdByName?: string;
    createdAt: string;
}

export interface CrmDocument {
    id: string | number;
    kind: 'contract' | 'invoice' | string;
    fileName?: string;
    downloadUrl?: string;
    createdAt?: string;
}

export interface SubscriptionPlan {
    id: string | number;
    name: string;
    price: number | string;
    description?: string;
    features?: {
        maxRooms?: number;
        maxStaff?: number;
        modulesAllowed?: string[];
        supportLevel?: string | null;
    };
}

export interface CreateLeadInput {
    contactName: string;
    companyName: string;
    email?: string;
    phone?: string;
    source?: string;
    ownerId?: string | number;
    nextFollowUpAt?: string;
    estimatedValue?: number;
    currency?: string;
    businessType?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    cacNumber?: string;
    taxId?: string;
    notes?: string;
}

export interface ConvertLeadInput {
    planId: string | number;
    phoneNumber?: string;
    address?: string;
    state?: string;
    country?: string;
}

export interface InvoiceLineItem {
    description: string;
    quantity: number;
    unitPrice: number;
}

export interface GeneratedDocument {
    documentId: string | number;
    downloadUrl?: string;
}

/* ------------------------------------------------------------ internals */

const CRM_PATH = '/dashboard/crm';

/** Turn an axios failure into a display-friendly Error, preserving `missing`. */
function crmError(error: unknown, fallback: string): Error {
    if (isRedirectError(error)) throw error;
    const response = (error as { response?: { data?: any } })?.response;
    const data = response?.data;
    let message = fallback;
    if (data) {
        if (typeof data.message === 'string' && data.message) {
            message = data.message;
        } else if (Array.isArray(data.message) && data.message.length > 0) {
            message = data.message.join(', ');
        }
    } else if (error instanceof Error && error.message) {
        message = error.message;
    }
    const err = new Error(message);
    const missing = (data as Record<string, unknown> | undefined)?.missing;
    if (Array.isArray(missing)) {
        (err as Error & { missing?: string[] }).missing =
            missing as string[];
    }
    return err;
}

function unwrapData<T>(json: unknown): T {
    if (json && typeof json === 'object' && !Array.isArray(json)) {
        const obj = json as Record<string, unknown>;
        // Backend may wrap in { success, data, message } or { data, message }.
        if ('data' in obj && obj.data !== undefined) {
            return obj.data as T;
        }
    }
    return json as T;
}

function normalizeList<T>(json: unknown): { items: T[]; total: number } {
    const data = unwrapData<unknown>(json);
    if (Array.isArray(data)) {
        return { items: data as T[], total: data.length };
    }
    if (data && typeof data === 'object') {
        const obj = data as Record<string, unknown>;
        const items = Array.isArray(obj.items)
            ? (obj.items as T[])
            : Array.isArray(obj.leads)
              ? (obj.leads as T[])
              : Array.isArray(obj.followUps)
                ? (obj.followUps as T[])
                : Array.isArray(obj.data)
                  ? (obj.data as T[])
                  : [];
        const total =
            typeof obj.total === 'number'
                ? obj.total
                : typeof obj.count === 'number'
                  ? obj.count
                  : items.length;
        return { items, total };
    }
    return { items: [], total: 0 };
}

/* ----------------------------------------------------------------- leads */

export async function getLeads(filters?: {
    status?: string;
    search?: string;
    ownerId?: string;
    page?: number;
    limit?: number;
}): Promise<{ leads: CrmLead[]; total: number; page: number; limit: number }> {
    try {
        const params: Record<string, string | number> = {};
        if (filters?.status) params.status = filters.status;
        if (filters?.search) params.search = filters.search;
        if (filters?.ownerId) params.ownerId = filters.ownerId;
        if (filters?.page) params.page = filters.page;
        if (filters?.limit) params.limit = filters.limit;

        const result = await axiosGet<unknown>('/super-admin/crm/leads', {
            params,
            currentPath: CRM_PATH,
        });
        const { items, total } = normalizeList<CrmLead>(result);
        return {
            leads: items,
            total,
            page: filters?.page ?? 1,
            limit: filters?.limit ?? items.length,
        };
    } catch (error: unknown) {
        throw crmError(error, 'Failed to load leads.');
    }
}

export async function getPipelineCounts(): Promise<Record<string, number>> {
    try {
        const result = await axiosGet<unknown>('/super-admin/crm/pipeline', {
            currentPath: CRM_PATH,
        });
        if (result && typeof result === 'object' && !Array.isArray(result)) {
            const obj = result as Record<string, unknown>;
            const counts: Record<string, number> = {};
            for (const [key, value] of Object.entries(obj)) {
                if (typeof value === 'number')
                    counts[key.toLowerCase()] = value;
            }
            return counts;
        }
        if (Array.isArray(result)) {
            const counts: Record<string, number> = {};
            for (const row of result as Array<Record<string, unknown>>) {
                const status = String(
                    row.status ?? row.stage ?? '',
                ).toLowerCase();
                const count = Number(row.count ?? row.total ?? 0);
                if (status) counts[status] = count;
            }
            return counts;
        }
        return {};
    } catch (error: unknown) {
        throw crmError(error, 'Failed to load pipeline counts.');
    }
}

export async function getFollowUpsDue(): Promise<CrmLead[]> {
    try {
        const result = await axiosGet<unknown>(
            '/super-admin/crm/follow-ups-due',
            { currentPath: CRM_PATH },
        );
        return normalizeList<CrmLead>(result).items;
    } catch (error: unknown) {
        throw crmError(error, 'Failed to load follow-ups.');
    }
}

export async function getLead(id: string | number): Promise<CrmLeadDetail> {
    try {
        const result = await axiosGet<unknown>(`/super-admin/crm/leads/${id}`, {
            currentPath: CRM_PATH,
        });
        const data = unwrapData<Record<string, unknown>>(result);
        const activities = Array.isArray(data?.activities)
            ? (data.activities as CrmActivity[])
            : [];
        const documents = Array.isArray(data?.documents)
            ? (data.documents as CrmDocument[])
            : [];
        if (data && typeof data === 'object' && 'lead' in data) {
            return { lead: data.lead as CrmLead, activities, documents };
        }
        return { lead: data as unknown as CrmLead, activities, documents };
    } catch (error: unknown) {
        throw crmError(error, 'Failed to load lead.');
    }
}

export async function createLead(data: CreateLeadInput): Promise<CrmLead> {
    try {
        const result = await axiosPost<unknown>('/super-admin/crm/leads', data, {
            currentPath: CRM_PATH,
        });
        return unwrapData<CrmLead>(result);
    } catch (error: unknown) {
        throw crmError(error, 'Failed to create lead.');
    }
}

export async function updateLead(
    id: string | number,
    data: Omit<Partial<CreateLeadInput>, 'nextFollowUpAt'> & {
        status?: string;
        nextFollowUpAt?: string | null;
        lastContactedAt?: string;
    },
): Promise<CrmLead> {
    try {
        const result = await axiosPatch<unknown>(
            `/super-admin/crm/leads/${id}`,
            data,
            { currentPath: CRM_PATH },
        );
        return unwrapData<CrmLead>(result);
    } catch (error: unknown) {
        throw crmError(error, 'Failed to update lead.');
    }
}

export async function addLeadActivity(
    id: string | number,
    data: { type: CrmActivityType; body: string },
): Promise<CrmActivity> {
    try {
        const result = await axiosPost<unknown>(
            `/super-admin/crm/leads/${id}/activities`,
            data,
            { currentPath: CRM_PATH },
        );
        return unwrapData<CrmActivity>(result);
    } catch (error: unknown) {
        throw crmError(error, 'Failed to log activity.');
    }
}

export async function importDemoRequests(): Promise<{
    imported: number;
    message: string;
}> {
    try {
        const result = await axiosPost<unknown>(
            '/super-admin/crm/leads/import-demo-requests',
            {},
            { currentPath: CRM_PATH },
        );
        const data = unwrapData<Record<string, unknown>>(result);
        const imported =
            typeof data?.imported === 'number'
                ? data.imported
                : typeof data?.count === 'number'
                  ? data.count
                  : 0;
        const message =
            typeof data?.message === 'string'
                ? data.message
                : `Imported ${imported} demo request${imported === 1 ? '' : 's'} as leads.`;
        return { imported, message };
    } catch (error: unknown) {
        throw crmError(error, 'Failed to import demo requests.');
    }
}

/* --------------------------------------------------- plans & convert */

export async function getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    try {
        const result = await axiosGet<unknown>(
            '/super-admin/subscription-plan',
            { currentPath: CRM_PATH },
        );
        const data = unwrapData<Record<string, unknown> | unknown[]>(result);
        if (Array.isArray(data)) return data as SubscriptionPlan[];
        if (data && typeof data === 'object') {
            const obj = data as Record<string, unknown>;
            if (Array.isArray(obj.plans)) return obj.plans as SubscriptionPlan[];
        }
        return [];
    } catch (error: unknown) {
        throw crmError(error, 'Failed to fetch subscription plans.');
    }
}

export async function convertLead(
    id: string | number,
    data: ConvertLeadInput,
): Promise<{ hotelId: string | number; requiresPasswordReset: boolean }> {
    try {
        const result = await axiosPost<unknown>(
            `/super-admin/crm/leads/${id}/convert`,
            data,
            { currentPath: CRM_PATH },
        );
        return unwrapData<{
            hotelId: string | number;
            requiresPasswordReset: boolean;
        }>(result);
    } catch (error: unknown) {
        // `missing` is carried on the Error for the convert dialog's
        // field-level hints.
        throw crmError(error, 'Failed to convert lead.');
    }
}

/* ------------------------------------------------------- documents */

export async function generateContract(
    id: string | number,
): Promise<GeneratedDocument> {
    try {
        const result = await axiosPost<unknown>(
            `/super-admin/crm/leads/${id}/contract`,
            {},
            { currentPath: CRM_PATH },
        );
        return unwrapData<GeneratedDocument>(result);
    } catch (error: unknown) {
        throw crmError(error, 'Failed to generate contract.');
    }
}

export async function generateInvoice(
    id: string | number,
    items?: InvoiceLineItem[],
): Promise<GeneratedDocument> {
    try {
        const result = await axiosPost<unknown>(
            `/super-admin/crm/leads/${id}/invoice`,
            items ? { items } : {},
            { currentPath: CRM_PATH },
        );
        return unwrapData<GeneratedDocument>(result);
    } catch (error: unknown) {
        throw crmError(error, 'Failed to generate invoice.');
    }
}
