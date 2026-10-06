import {
    applyWorksheetColumnWidths,
    flattenExportValue,
} from '@/lib/export-utils';
import {
    ANLI_MEMBERSHIP_BRAND,
    formatMembershipExportDateTime,
    type MembershipExportMeta,
} from '@/lib/membership-export-brand';
import jsPDF from 'jspdf';
import autoTable, { type Styles } from 'jspdf-autotable';
import * as XLSX from 'xlsx';

const PDF_MARGIN = 40;

function drawMembershipPdfHeader(
    doc: jsPDF,
    meta: MembershipExportMeta,
): number {
    const pageWidth = doc.internal.pageSize.getWidth();
    const { inkRgb, mutedTextRgb, productName } = ANLI_MEMBERSHIP_BRAND;

    let contentY = PDF_MARGIN;

    doc.setTextColor(...inkRgb);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text(`${productName} — Membership`, PDF_MARGIN, contentY);
    contentY += 22;

    doc.setFontSize(13);
    const businessLines = doc.splitTextToSize(
        meta.businessName,
        pageWidth - PDF_MARGIN * 2 - 140,
    );
    doc.text(businessLines, PDF_MARGIN, contentY);
    contentY += businessLines.length * 16;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...mutedTextRgb);
    const generated = formatMembershipExportDateTime();
    doc.text(generated, pageWidth - PDF_MARGIN, PDF_MARGIN + 4, {
        align: 'right',
    });

    if (meta.recordCount !== undefined) {
        doc.text(
            `${meta.recordCount.toLocaleString()} record${meta.recordCount === 1 ? '' : 's'}`,
            pageWidth - PDF_MARGIN,
            PDF_MARGIN + 16,
            { align: 'right' },
        );
    }

    contentY += 6;
    doc.setTextColor(...inkRgb);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text(meta.reportTitle, PDF_MARGIN, contentY);
    contentY += 18;

    const metaLines: string[] = [];
    if (meta.period) metaLines.push(`Period: ${meta.period}`);
    if (meta.subtitle) metaLines.push(meta.subtitle);
    if (meta.businessAddress) metaLines.push(meta.businessAddress);

    if (metaLines.length) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(...mutedTextRgb);
        metaLines.forEach((line) => {
            doc.text(line, PDF_MARGIN, contentY);
            contentY += 13;
        });
    }

    doc.setDrawColor(...inkRgb);
    doc.setLineWidth(1);
    doc.line(PDF_MARGIN, contentY + 6, pageWidth - PDF_MARGIN, contentY + 6);

    return contentY + 18;
}

function drawMembershipPdfFooter(
    doc: jsPDF,
    meta: MembershipExportMeta,
    pageNumber: number,
    totalPages: number,
) {
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    doc.setFillColor(...ANLI_MEMBERSHIP_BRAND.footerBgRgb);
    doc.rect(0, pageHeight - 22, pageWidth, 22, 'F');

    doc.setFontSize(8);
    doc.setTextColor(...ANLI_MEMBERSHIP_BRAND.mutedTextRgb);
    doc.setFont('helvetica', 'normal');
    doc.text(
        `${meta.businessName} · ${ANLI_MEMBERSHIP_BRAND.productName} Membership`,
        PDF_MARGIN,
        pageHeight - 8,
    );
    doc.text(
        `Page ${pageNumber} of ${totalPages}`,
        pageWidth - PDF_MARGIN,
        pageHeight - 8,
        { align: 'right' },
    );
}

export function exportMembershipPdf(
    meta: MembershipExportMeta,
    rows: Record<string, unknown>[],
    filename: string,
    options?: { orientation?: 'portrait' | 'landscape'; pdfFormat?: string },
) {
    if (!rows.length) return;

    const columns = Object.keys(rows[0]);
    const orientation = options?.orientation ?? 'landscape';
    const doc = new jsPDF({
        orientation,
        unit: 'pt',
        format: options?.pdfFormat ?? 'a4',
    });

    const tableStartY = drawMembershipPdfHeader(doc, {
        ...meta,
        recordCount: meta.recordCount ?? rows.length,
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const dynamicColumnWidth = Math.max(
        36,
        Math.floor((pageWidth - PDF_MARGIN * 2) / Math.max(columns.length, 1)),
    );

    const columnStyles: Record<string, Partial<Styles>> = {};
    columns.forEach((_, index) => {
        columnStyles[index.toString()] = {
            cellWidth: dynamicColumnWidth,
            overflow: 'linebreak',
        };
    });

    autoTable(doc, {
        startY: tableStartY,
        head: [columns],
        body: rows.map((row) =>
            columns.map((col) => flattenExportValue(row[col], col)),
        ),
        theme: 'grid',
        styles: {
            fontSize: 8,
            cellPadding: 4,
            valign: 'middle',
            halign: 'left',
            overflow: 'linebreak',
            lineColor: ANLI_MEMBERSHIP_BRAND.borderRgb,
            lineWidth: 0.5,
            textColor: ANLI_MEMBERSHIP_BRAND.textRgb,
            fillColor: [255, 255, 255],
        },
        headStyles: {
            fillColor: ANLI_MEMBERSHIP_BRAND.tableHeadRgb,
            textColor: ANLI_MEMBERSHIP_BRAND.tableHeadTextRgb,
            fontStyle: 'bold',
            halign: 'left',
        },
        alternateRowStyles: {
            fillColor: ANLI_MEMBERSHIP_BRAND.tableStripeRgb,
        },
        columnStyles,
        margin: {
            top: tableStartY,
            right: PDF_MARGIN,
            bottom: 28,
            left: PDF_MARGIN,
        },
        tableWidth: 'auto',
        didDrawPage: (pageData) => {
            drawMembershipPdfFooter(
                doc,
                meta,
                pageData.pageNumber,
                doc.getNumberOfPages(),
            );
        },
    });

    doc.save(`${filename}.pdf`);
}

function padBrandingRow(
    text: string,
    colCount: number,
): (string | number | boolean)[] {
    const row: (string | number | boolean)[] = [text];
    while (row.length < colCount) {
        row.push('');
    }
    return row;
}

/** Compact export sheet: 2-line context + data table (primary export format). */
export function createCompactDataSheet(
    sectionTitle: string,
    contextLine: string,
    rows: Record<string, unknown>[],
) {
    const columns = rows.length > 0 ? Object.keys(rows[0]) : ['Message'];
    const formattedRows =
        rows.length > 0
            ? rows.map((row) => {
                  const next: Record<string, string | number | boolean> = {};
                  columns.forEach((col) => {
                      next[col] = flattenExportValue(row[col], col);
                  });
                  return next;
              })
            : [
                  {
                      Message:
                          'No records match the selected filters for this section.',
                  },
              ];

    const colCount = Math.max(columns.length, 1);
    const headerRows: (string | number | boolean)[][] = [
        padBrandingRow(sectionTitle, colCount),
        padBrandingRow(contextLine, colCount),
        new Array<string>(colCount).fill(''),
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(headerRows);
    XLSX.utils.sheet_add_json(worksheet, formattedRows, {
        origin: headerRows.length,
    });
    applyWorksheetColumnWidths(worksheet, formattedRows, columns);
    return worksheet;
}

export function appendCompactExportSheet(
    workbook: XLSX.WorkBook,
    sheetName: string,
    sectionTitle: string,
    contextLine: string,
    rows: Record<string, unknown>[],
) {
    XLSX.utils.book_append_sheet(
        workbook,
        createCompactDataSheet(sectionTitle, contextLine, rows),
        sheetName.slice(0, 31),
    );
}

export function createMembershipBrandedSheet(
    meta: MembershipExportMeta,
    rows: Record<string, unknown>[],
) {
    const columns = rows.length > 0 ? Object.keys(rows[0]) : ['Message'];
    const formattedRows =
        rows.length > 0
            ? rows.map((row) => {
                  const next: Record<string, string | number | boolean> = {};
                  columns.forEach((col) => {
                      next[col] = flattenExportValue(row[col], col);
                  });
                  return next;
              })
            : [
                  {
                      Message:
                          'No records match the selected filters for this sheet.',
                  },
              ];

    const colCount = Math.max(columns.length, 1);

    const infoParts = [
        `Generated: ${formatMembershipExportDateTime()}`,
        meta.period ? `Period: ${meta.period}` : '',
        meta.recordCount !== undefined
            ? `Records: ${meta.recordCount}`
            : `Records: ${rows.length}`,
    ].filter(Boolean);

    const brandingRows: (string | number | boolean)[][] = [
        padBrandingRow(
            `${ANLI_MEMBERSHIP_BRAND.productName} — Membership`,
            colCount,
        ),
        padBrandingRow(meta.businessName, colCount),
        padBrandingRow(meta.reportTitle, colCount),
        padBrandingRow(infoParts.join('   ·   '), colCount),
    ];

    if (meta.subtitle) {
        brandingRows.push(padBrandingRow(meta.subtitle, colCount));
    }
    if (meta.businessAddress) {
        brandingRows.push(padBrandingRow(meta.businessAddress, colCount));
    }

    // Spacer before the data table (avoid empty [] rows — they confuse some readers)
    brandingRows.push(Array(colCount).fill(''));

    const worksheet = XLSX.utils.aoa_to_sheet(brandingRows);
    XLSX.utils.sheet_add_json(worksheet, formattedRows, {
        origin: brandingRows.length,
    });

    applyWorksheetColumnWidths(worksheet, formattedRows, columns);

    return worksheet;
}

export function appendMembershipExportSheet(
    workbook: XLSX.WorkBook,
    sheetName: string,
    rows: Record<string, unknown>[],
    meta: MembershipExportMeta,
) {
    const sheetMeta: MembershipExportMeta = {
        ...meta,
        recordCount: rows.length,
    };
    XLSX.utils.book_append_sheet(
        workbook,
        createMembershipBrandedSheet(sheetMeta, rows),
        sheetName.slice(0, 31),
    );
}

export function exportMembershipExcel(
    meta: MembershipExportMeta,
    rows: Record<string, unknown>[],
    filename: string,
    sheetName = 'Export',
) {
    if (!rows.length) return;

    const workbook = XLSX.utils.book_new();
    appendMembershipExportSheet(workbook, sheetName, rows, {
        ...meta,
        recordCount: rows.length,
    });
    XLSX.writeFile(workbook, `${filename}.xlsx`);
}

export function downloadMembershipWorkbook(
    workbook: XLSX.WorkBook,
    filename: string,
) {
    const safeName = filename.replace(/[^\w.-]+/g, '_');
    XLSX.writeFile(workbook, `${safeName}.xlsx`, { bookType: 'xlsx' });
}
