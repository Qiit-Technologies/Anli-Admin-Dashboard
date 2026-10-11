'use client';

import { format } from 'date-fns';

/* ---------------------------------------------------------- stages */

export const CRM_STAGES = [
    { value: 'new', label: 'New' },
    { value: 'contacted', label: 'Contacted' },
    { value: 'qualified', label: 'Qualified' },
    { value: 'proposal', label: 'Proposal' },
    { value: 'negotiation', label: 'Negotiation' },
    { value: 'won', label: 'Won' },
    { value: 'lost', label: 'Lost' },
    { value: 'dormant', label: 'Dormant' },
] as const;

/* ------------------------------------------- lead form options */
/*
 * Option values MUST match the backend enums exactly (UPPERCASE).
 * The API validates with @IsEnum and rejects anything else, including ''.
 *  - LeadSource: DEMO_REQUEST/FREE_TRIAL/NEWSLETTER/WEBSITE/REFERRAL/COLD_OUTREACH/OTHER
 *  - HotelBusinessType: HOTEL/RESORT/RESTAURANT
 */
export const LEAD_SOURCE_OPTIONS = [
    { value: 'WEBSITE', label: 'Website' },
    { value: 'DEMO_REQUEST', label: 'Demo request' },
    { value: 'NEWSLETTER', label: 'Newsletter' },
    { value: 'REFERRAL', label: 'Referral' },
    { value: 'COLD_OUTREACH', label: 'Cold outreach' },
    { value: 'FREE_TRIAL', label: 'Free trial' },
    { value: 'OTHER', label: 'Other' },
];

export const BUSINESS_TYPE_OPTIONS = [
    { value: 'HOTEL', label: 'Hotel' },
    { value: 'RESORT', label: 'Resort' },
    { value: 'RESTAURANT', label: 'Restaurant' },
];

export function normalizeStatus(status?: string): string {
    return (status ?? 'new').toLowerCase().replace(/\s+/g, '_');
}

export function stageLabel(status?: string): string {
    const value = normalizeStatus(status);
    return (
        CRM_STAGES.find((s) => s.value === value)?.label ??
        value.charAt(0).toUpperCase() + value.slice(1)
    );
}

export const STAGE_BADGE: Record<string, string> = {
    new: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    contacted:
        'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300',
    qualified:
        'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
    proposal:
        'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
    negotiation:
        'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    won: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
    lost: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
    dormant:
        'bg-gray-200 text-gray-700 dark:bg-gray-700/40 dark:text-gray-300',
};

export function stageBadgeClass(status?: string): string {
    return (
        STAGE_BADGE[normalizeStatus(status)] ??
        'bg-gray-100 text-gray-700 dark:bg-gray-700/40 dark:text-gray-300'
    );
}

export const ACTIVITY_BADGE: Record<string, string> = {
    NOTE: 'bg-gray-100 text-gray-700 dark:bg-gray-700/40 dark:text-gray-300',
    CALL: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    EMAIL: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
    MEETING:
        'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
};

/* ---------------------------------------------------------- format */

export function formatMoney(
    value?: number | string | null,
    currency?: string,
): string {
    if (value === undefined || value === null || value === '') return '—';
    const amount = typeof value === 'string' ? Number(value) : value;
    if (Number.isNaN(amount)) return '—';
    try {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: currency || 'NGN',
            maximumFractionDigits: 0,
        }).format(amount);
    } catch {
        return `${currency || 'NGN'} ${amount.toLocaleString()}`;
    }
}

export function formatDateTime(value?: string): string {
    if (!value) return '—';
    try {
        return format(new Date(value), 'MMM d, yyyy • h:mm a');
    } catch {
        return '—';
    }
}

export function formatDate(value?: string): string {
    if (!value) return '—';
    try {
        return format(new Date(value), 'MMM d, yyyy');
    } catch {
        return '—';
    }
}

export function isOverdue(value?: string): boolean {
    if (!value) return false;
    try {
        return new Date(value).getTime() < Date.now();
    } catch {
        return false;
    }
}
