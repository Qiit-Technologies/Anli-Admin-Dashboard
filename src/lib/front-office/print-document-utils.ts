import { format } from 'date-fns';

export function escapeHtml(value: string | number | null | undefined): string {
    if (value === null || value === undefined) return '';
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

export function toMoneyNumber(value: unknown): number {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
}

export function formatPrintMoney(amount: number): string {
    const safe = toMoneyNumber(amount);
    try {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(safe);
    } catch {
        return `₦${Math.round(safe).toLocaleString('en-NG')}`;
    }
}

export function formatPrintDate(d: string | Date | null | undefined): string {
    if (!d) return '';
    try {
        return format(new Date(d), 'do MMMM yyyy').toUpperCase();
    } catch {
        return '';
    }
}

export function formatPrintDateTime(
    date?: string | null,
    time?: string | null,
): string {
    const dateLabel = formatPrintDate(date || undefined);
    if (!dateLabel) return '';
    const trimmedTime = time?.trim();
    return trimmedTime ? `${dateLabel} ${trimmedTime}` : dateLabel;
}
