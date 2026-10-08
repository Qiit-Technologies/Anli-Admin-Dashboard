import * as XLSX from 'xlsx';

/**
 * Downloads a JavaScript object (array of objects) as CSV or Excel
 *
 * @param {Object[]} data - The data array
 * @param {"csv"|"xlsx"} format - Desired format
 * @param {string} filename - File name without extension
 */
export function downloadData(
    data: object,
    format: 'xlsx' | 'csv' = 'xlsx',
    filename: string = 'data',
) {
    if (!data || !Array.isArray(data)) {
        console.error('Data must be an array of objects.');
        return;
    }

    // Convert JSON to worksheet
    const worksheet = XLSX.utils.json_to_sheet(data);

    // Create a new workbook and append worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

    // Choose file type
    const ext = format === 'csv' ? 'csv' : 'xlsx';
    const fileNameWithExt = `${filename}.${ext}`;

    // Write file
    XLSX.writeFile(workbook, fileNameWithExt, { bookType: format });
}
