/** Days between start and end (inclusive). Returns empty if invalid. */
export function computeRentalDuration(
    startDate: string,
    endDate: string,
): string {
    if (!startDate || !endDate) return '';

    const start = new Date(`${startDate}T00:00:00`);
    const end = new Date(`${endDate}T00:00:00`);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
        return '';
    }
    if (end < start) return '';

    const diffMs = end.getTime() - start.getTime();
    const days = Math.max(1, Math.round(diffMs / 86_400_000) + 1);

    return `${days} day${days === 1 ? '' : 's'}`;
}

export function formatDateForDisplay(isoDate: string): string {
    if (!isoDate) return '';
    const d = new Date(`${isoDate}T00:00:00`);
    if (Number.isNaN(d.getTime())) return isoDate;
    return d.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
}
