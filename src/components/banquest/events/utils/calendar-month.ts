export interface MonthDayCell {
    day: number;
    isCurrentMonth: boolean;
    date: Date;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

export { WEEKDAYS };

export function getMonthGridCells(anchor: Date): MonthDayCell[] {
    const year = anchor.getFullYear();
    const month = anchor.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startOffset = firstDay.getDay();

    const cells: MonthDayCell[] = [];

    const prevMonthLast = new Date(year, month, 0).getDate();
    for (let i = startOffset - 1; i >= 0; i--) {
        const d = prevMonthLast - i;
        cells.push({
            day: d,
            isCurrentMonth: false,
            date: new Date(year, month - 1, d),
        });
    }

    for (let d = 1; d <= daysInMonth; d++) {
        cells.push({
            day: d,
            isCurrentMonth: true,
            date: new Date(year, month, d),
        });
    }

    while (cells.length % 7 !== 0 || cells.length < 42) {
        const nextIndex = cells.length - startOffset - daysInMonth + 1;
        cells.push({
            day: nextIndex,
            isCurrentMonth: false,
            date: new Date(year, month + 1, nextIndex),
        });
    }

    return cells.slice(0, 42);
}

export function dateKey(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

export function isSameCalendarDay(a: Date, b: Date): boolean {
    return (
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate()
    );
}
