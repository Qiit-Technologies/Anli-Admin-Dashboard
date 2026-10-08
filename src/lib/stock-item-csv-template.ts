/** Column headers mirror the Add Item form (ANLI-INV-001). No backend IDs. */
export const STOCK_ITEM_CSV_HEADERS = [
    'Item Name',
    'Item Location',
    'Category',
    'Outer Unit of Measure',
    'Qty in Stock (Outer)',
    'Conversion Rate',
    'Base Unit',
    'Cost per Outer',
    'Min Stock Level',
    'Reorder Quantity',
    'Stock Date',
    'Expiry Date',
    'Vendor Name',
    'Vendor Contact',
] as const;

const EXAMPLE_ROW = [
    'Chicken Breast',
    'dry-store',
    'meat',
    'Crate',
    '10',
    '12',
    'Kg',
    '45000',
    '5',
    '20',
    '2026-07-26',
    '2026-08-26',
    'Fresh Farms',
    '08012345678',
] as const;

function escapeCsvCell(value: string): string {
    if (/[",\n\r]/.test(value)) {
        return `"${value.replaceAll('"', '""')}"`;
    }
    return value;
}

/** Downloads a UTF-8 CSV template with friendly headers + one sample row. */
export function downloadStockItemCsvTemplate(): void {
    const lines = [STOCK_ITEM_CSV_HEADERS, EXAMPLE_ROW].map((row) =>
        row.map((cell) => escapeCsvCell(cell)).join(','),
    );
    const csv = `\uFEFF${lines.join('\n')}\n`;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'inventory-items-template.csv';
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
}
