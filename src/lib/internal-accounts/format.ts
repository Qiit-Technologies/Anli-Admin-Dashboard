export function getOrdinalSuffix(day: number) {
    if (day === 1 || day === 21 || day === 31) return 'st';
    if (day === 2 || day === 22) return 'nd';
    if (day === 3 || day === 23) return 'rd';
    return 'th';
}

export function formatShortTableDate(
    date: Date | string | null | undefined,
): string {
    if (!date) return '—';
    const parsed = typeof date === 'string' ? new Date(date) : date;
    if (!(parsed instanceof Date) || isNaN(parsed.getTime())) return '—';
    return parsed.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
}

export function formatAccountDate(date: Date | string | null | undefined) {
    if (!date) return '—';
    const parsed = typeof date === 'string' ? new Date(date) : date;
    if (!(parsed instanceof Date) || isNaN(parsed.getTime())) return '—';
    const day = parsed.getDate();
    const month = parsed
        .toLocaleDateString('en-GB', { month: 'long' })
        .toLowerCase();
    const year = parsed.getFullYear();

    return `${day}${getOrdinalSuffix(day)}-${month}-${year}`;
}

/** Dropdown option label: "Director's Ledger (IA-0001)" */
export function formatInternalAccountOption(account: {
    accountName: string;
    accountCode: string;
    id: string;
}): { label: string; value: string } {
    return {
        label: `${account.accountName} (${account.accountCode})`,
        value: account.accountCode || account.id,
    };
}

/** Card / checkout indicator: "IA-0001 – Director's Ledger" */
export function formatInternalAccountLabel(account: {
    accountName: string;
    accountCode: string;
}): string {
    return `${account.accountCode} – ${account.accountName}`;
}
