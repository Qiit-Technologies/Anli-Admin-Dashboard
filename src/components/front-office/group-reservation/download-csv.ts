function escapeCell(value: unknown) {
    const cell = value === null || value === undefined ? '' : String(value);
    return /[",\n]/.test(cell) ? `"${cell.replace(/"/g, '""')}"` : cell;
}

export function downloadCsv(
    fileName: string,
    headers: string[],
    rows: unknown[][],
) {
    const csv = [headers, ...rows]
        .map((row) => row.map(escapeCell).join(','))
        .join('\n');
    const url = URL.createObjectURL(
        new Blob([csv], { type: 'text/csv;charset=utf-8;' }),
    );
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
}
