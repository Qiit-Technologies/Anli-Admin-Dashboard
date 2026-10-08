/** Strip formatting and keep a single optional decimal point. */
export function parseAmountRaw(value: string): string {
    const cleaned = value.replace(/[^\d.]/g, '');
    const dot = cleaned.indexOf('.');
    if (dot === -1) return cleaned;
    const intPart = cleaned.slice(0, dot);
    const decPart = cleaned.slice(dot + 1).replace(/\./g, '');
    return decPart.length ? `${intPart}.${decPart}` : intPart;
}

export function amountRawToNumber(value: string): number {
    const n = Number(parseAmountRaw(value));
    return Number.isFinite(n) ? n : 0;
}

/** Format numeric string for display with grouping (no currency symbol). */
export function formatAmountDisplay(
    value: string | number,
    options?: { decimals?: number; locale?: string },
): string {
    const raw = parseAmountRaw(String(value));
    if (!raw) return '';
    const num = Number(raw);
    if (!Number.isFinite(num)) return raw;
    const decimals = options?.decimals ?? 2;
    return num.toLocaleString(options?.locale ?? 'en-NG', {
        minimumFractionDigits: 0,
        maximumFractionDigits: decimals,
    });
}
