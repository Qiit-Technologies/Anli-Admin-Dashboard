import * as XLSX from 'xlsx';

const MAX_COLUMN_WIDTH = 48;
const MIN_COLUMN_WIDTH = 10;

const ISO_DATE_PREFIX = /^\d{4}-\d{2}-\d{2}/;

/** Column titles that should export as date-only (no time). */
const DATE_ONLY_COLUMN_PATTERN =
    /(start date|end date|last visit|visit date|booking date|days to expiry)$/i;

function isParseableDateValue(value: string) {
    const trimmed = value.trim();
    if (!trimmed || !ISO_DATE_PREFIX.test(trimmed)) return false;
    const parsed = new Date(trimmed);
    return !Number.isNaN(parsed.getTime());
}

/** Human-readable dates for exports (Excel/PDF); avoids ISO strings wrapping in cells. */
export function formatExportDateValue(
    value: string | Date,
    columnKey?: string,
): string {
    const date = value instanceof Date ? value : new Date(value.trim());
    if (Number.isNaN(date.getTime())) {
        return typeof value === 'string' ? value : '';
    }

    const useDateOnly =
        value instanceof Date
            ? false
            : !String(value).includes('T') &&
              (columnKey ? DATE_ONLY_COLUMN_PATTERN.test(columnKey) : false);

    if (useDateOnly) {
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    }

    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    });
}

export function flattenExportValue(
    value: unknown,
    columnKey?: string,
): string | number | boolean {
    if (value === null || value === undefined) return '';
    if (value instanceof Date) {
        return formatExportDateValue(value, columnKey);
    }
    if (typeof value === 'boolean' || typeof value === 'number') return value;
    if (typeof value === 'string') {
        if (isParseableDateValue(value)) {
            return formatExportDateValue(value, columnKey);
        }
        return value;
    }
    if (typeof value === 'object') {
        const record = value as Record<string, unknown>;
        if (typeof record.name === 'string') return record.name;
        if (typeof record.label === 'string') return record.label;
        return '';
    }
    return String(value as string | number | bigint | symbol);
}

/** Size columns from header + cell content so Excel exports are readable. */
export function applyWorksheetColumnWidths(
    worksheet: XLSX.WorkSheet,
    rows: Record<string, unknown>[],
    columns: string[],
) {
    worksheet['!cols'] = columns.map((col) => {
        const headerLen = col.length;
        const maxCellLen = rows.reduce((max, row) => {
            const cell = flattenExportValue(row[col], col);
            const len = String(cell).length;
            return Math.max(max, len);
        }, 0);
        return {
            wch: Math.min(
                MAX_COLUMN_WIDTH,
                Math.max(MIN_COLUMN_WIDTH, headerLen + 2, maxCellLen + 1),
            ),
        };
    });
}

export function rowsToExportSheet(
    rows: Record<string, unknown>[],
): XLSX.WorkSheet {
    const formatted = rows.map((row) => {
        const next: Record<string, string | number | boolean> = {};
        Object.keys(row).forEach((key) => {
            next[key] = flattenExportValue(row[key], key);
        });
        return next;
    });
    const worksheet = XLSX.utils.json_to_sheet(formatted);
    const columns =
        formatted.length > 0
            ? Object.keys(formatted[0])
            : Object.keys(rows[0] || {});
    applyWorksheetColumnWidths(worksheet, formatted, columns);
    return worksheet;
}

export function appendExportSheet(
    workbook: XLSX.WorkBook,
    sheetName: string,
    rows: Record<string, unknown>[],
) {
    if (!rows.length) return;
    XLSX.utils.book_append_sheet(workbook, rowsToExportSheet(rows), sheetName);
}
