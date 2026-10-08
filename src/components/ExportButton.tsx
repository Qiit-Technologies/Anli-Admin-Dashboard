'use client';

import {
    applyWorksheetColumnWidths,
    flattenExportValue,
} from '@/lib/export-utils';
import autoTable, { Styles } from 'jspdf-autotable';
import jsPDF from 'jspdf';
import { useState } from 'react';
import { CgExport } from 'react-icons/cg';
import * as XLSX from 'xlsx';

interface ExportButtonProps {
    data: Record<string, unknown>[];
    filename?: string;
    /** @deprecated Use pdfFormat instead */
    format?: string;
    pdfFormat?: string;
    orientation?: 'portrait' | 'landscape';
}

export default function ExportButton({
    data,
    filename = 'export',
    format,
    pdfFormat = 'a4',
    orientation = 'landscape',
}: ExportButtonProps) {
    const [isOpen, setIsOpen] = useState(false);
    const resolvedPdfFormat = format ?? pdfFormat;

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    const closeDropdown = () => {
        setIsOpen(false);
    };

    const columns = data.length > 0 ? Object.keys(data[0]) : [];

    const exportToPDF = () => {
        if (!data.length) return;

        const doc = new jsPDF({
            orientation,
            unit: 'pt',
            format: resolvedPdfFormat,
        });

        doc.setFontSize(12);
        doc.text(`${filename.replace(/-/g, ' ').toUpperCase()}`, 40, 40);

        const pageWidth = doc.internal.pageSize.width - 30;
        const dynamicColumnWidth = Math.max(
            40,
            Math.floor(pageWidth / Math.max(columns.length, 1)),
        );

        const columnStyles: Record<string, Partial<Styles>> = {};
        columns.forEach((_, index) => {
            columnStyles[index.toString()] = {
                cellWidth: dynamicColumnWidth,
                overflow: 'linebreak',
            };
        });

        autoTable(doc, {
            startY: 50,
            head: [columns.map((col) => col.toUpperCase())],
            body: data.map((row) =>
                columns.map((col) => flattenExportValue(row[col], col)),
            ),
            theme: 'grid',
            styles: {
                fontSize: 8,
                cellPadding: 3,
                valign: 'middle',
                halign: 'left',
                overflow: 'linebreak',
                lineWidth: 0.1,
                lineColor: [150, 150, 150],
            },
            headStyles: {
                fillColor: [22, 160, 133],
                textColor: 255,
                fontStyle: 'bold',
                halign: 'center',
            },
            columnStyles,
            margin: { top: 50, right: 15, bottom: 15, left: 15 },
            tableWidth: 'auto',
            didDrawPage: (pageData) => {
                doc.setFontSize(8);
                doc.text(
                    `Page ${pageData.pageNumber} of ${doc.getNumberOfPages()}`,
                    15,
                    doc.internal.pageSize.height - 10,
                );
            },
        });

        doc.save(`${filename}.pdf`);
        closeDropdown();
    };

    const exportToExcel = () => {
        if (!data.length) return;

        const formattedData = data.map((row) => {
            const newRow: Record<string, string | number | boolean> = {};
            columns.forEach((col) => {
                newRow[col] = flattenExportValue(row[col], col);
            });
            return newRow;
        });

        const worksheet = XLSX.utils.json_to_sheet(formattedData);
        applyWorksheetColumnWidths(worksheet, formattedData, columns);

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Export');
        XLSX.writeFile(workbook, `${filename}.xlsx`);
        closeDropdown();
    };

    return (
        <div className="relative">
            <button
                type="button"
                onClick={toggleDropdown}
                disabled={!data.length}
                className="px-3 py-1 bg-orion-blue border border-orion-blue text-white rounded-md flex items-center gap-2 hover:bg-orion-blue/90 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
            >
                <CgExport className="h-5 w-5 text-white mb-1" />
                <span className="text-sm font-medium">Export</span>
            </button>

            {isOpen && data.length > 0 && (
                <div className="absolute right-0 mt-2 w-36 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                    <button
                        type="button"
                        onClick={exportToPDF}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                        Export as PDF
                    </button>
                    <button
                        type="button"
                        onClick={exportToExcel}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                        Export as XLSX
                    </button>
                </div>
            )}
        </div>
    );
}
