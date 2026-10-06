import { flattenExportValue } from '@/lib/export-utils';
import {
    ANLI_MEMBERSHIP_BRAND,
    formatMembershipExportDateTime,
    type MembershipExportMeta,
} from '@/lib/membership-export-brand';
import type { ChartDatum } from '@/lib/membership-report-types';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const PDF_MARGIN = 40;
const FOOTER_RESERVE = 32;
const LABEL_COL_W = 108;
const VALUE_COL_W = 40;
const BAR_ROW_H = 20;
const CHART_BLOCK_GAP = 20;

type PdfChartInput = {
    title: string;
    description?: string;
    data: ChartDatum[];
};

export type PdfTableSection = {
    title: string;
    rows: Record<string, unknown>[];
};

function pageSize(doc: jsPDF) {
    return {
        width: doc.internal.pageSize.getWidth(),
        height: doc.internal.pageSize.getHeight(),
    };
}

function contentWidth(doc: jsPDF) {
    return pageSize(doc).width - PDF_MARGIN * 2;
}

function ensureSpace(doc: jsPDF, y: number, needed: number): number {
    const { height } = pageSize(doc);
    if (y + needed > height - FOOTER_RESERVE) {
        doc.addPage();
        return PDF_MARGIN;
    }
    return y;
}

function drawPdfFooter(doc: jsPDF, meta: MembershipExportMeta) {
    const { width, height } = pageSize(doc);
    doc.setFontSize(8);
    doc.setTextColor(...ANLI_MEMBERSHIP_BRAND.mutedTextRgb);
    doc.setFont('helvetica', 'normal');
    doc.text(
        `${meta.businessName} · ${ANLI_MEMBERSHIP_BRAND.productName} Membership`,
        PDF_MARGIN,
        height - 14,
    );
    doc.text(
        `Page ${doc.getNumberOfPages()}`,
        width - PDF_MARGIN,
        height - 14,
        { align: 'right' },
    );
}

function drawPdfHeader(
    doc: jsPDF,
    meta: MembershipExportMeta,
    insight?: string,
): number {
    const { width } = pageSize(doc);
    const { inkRgb, mutedTextRgb } = ANLI_MEMBERSHIP_BRAND;
    let y = PDF_MARGIN;

    doc.setTextColor(...inkRgb);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text(meta.businessName, PDF_MARGIN, y);
    y += 20;

    doc.setFontSize(13);
    doc.text(meta.reportTitle, PDF_MARGIN, y);
    y += 18;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...mutedTextRgb);

    const metaLines = [
        formatMembershipExportDateTime(),
        meta.period || '',
        meta.subtitle || '',
    ].filter(Boolean);

    metaLines.forEach((line) => {
        doc.text(line, PDF_MARGIN, y);
        y += 12;
    });

    if (meta.recordCount !== undefined) {
        doc.text(
            `${meta.recordCount.toLocaleString()} record${meta.recordCount === 1 ? '' : 's'}`,
            width - PDF_MARGIN,
            PDF_MARGIN + 2,
            { align: 'right' },
        );
    }

    if (insight) {
        y += 4;
        doc.setFontSize(8);
        const insightLines = doc.splitTextToSize(insight, contentWidth(doc));
        insightLines.forEach((line: string) => {
            y = ensureSpace(doc, y, 14);
            doc.text(line, PDF_MARGIN, y);
            y += 11;
        });
    }

    y += 4;
    doc.setDrawColor(...ANLI_MEMBERSHIP_BRAND.borderRgb);
    doc.setLineWidth(0.5);
    doc.line(PDF_MARGIN, y, width - PDF_MARGIN, y);

    return y + 16;
}

function hexToRgb(hex: string): [number, number, number] {
    const h = hex.replace('#', '');
    const n = Number.parseInt(h, 16);
    if (Number.isNaN(n)) return ANLI_MEMBERSHIP_BRAND.tableHeadRgb;
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function estimateChartHeight(doc: jsPDF, chart: PdfChartInput): number {
    const descLines = chart.description
        ? doc.splitTextToSize(chart.description, contentWidth(doc)).length
        : 0;
    const legendRows = Math.max(1, Math.ceil(chart.data.length / 4));
    return (
        16 +
        descLines * 11 +
        legendRows * 13 +
        12 +
        chart.data.length * BAR_ROW_H +
        CHART_BLOCK_GAP
    );
}

function drawLegendRow(doc: jsPDF, y: number, items: ChartDatum[]): number {
    const { width } = pageSize(doc);
    const maxX = width - PDF_MARGIN;
    let x = PDF_MARGIN;
    let rowY = y;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...ANLI_MEMBERSHIP_BRAND.textRgb);

    items.forEach((item) => {
        const label = `${item.name} (${item.value.toLocaleString()})`;
        const chipW = doc.getTextWidth(label) + 16;

        if (x + chipW > maxX && x > PDF_MARGIN) {
            x = PDF_MARGIN;
            rowY += 13;
        }

        const [r, g, b] = item.fill
            ? hexToRgb(item.fill)
            : ANLI_MEMBERSHIP_BRAND.tableHeadRgb;
        doc.setFillColor(r, g, b);
        doc.circle(x + 4, rowY + 2, 2.5, 'F');
        doc.text(label, x + 10, rowY + 5);

        x += chipW + 10;
    });

    return rowY + 14;
}

function drawChartBlock(
    doc: jsPDF,
    startY: number,
    chart: PdfChartInput,
): number {
    if (!chart.data.length) return startY;

    const { width } = pageSize(doc);
    const barStartX = PDF_MARGIN + LABEL_COL_W;
    const barMaxW = contentWidth(doc) - LABEL_COL_W - VALUE_COL_W - 12;
    const maxVal = Math.max(...chart.data.map((d) => d.value), 1);

    let y = ensureSpace(doc, startY, estimateChartHeight(doc, chart));

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...ANLI_MEMBERSHIP_BRAND.inkRgb);
    doc.text(chart.title, PDF_MARGIN, y);
    y += 16;

    if (chart.description) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(...ANLI_MEMBERSHIP_BRAND.mutedTextRgb);
        const descLines = doc.splitTextToSize(
            chart.description,
            contentWidth(doc),
        );
        descLines.forEach((line: string) => {
            y = ensureSpace(doc, y, 12);
            doc.text(line, PDF_MARGIN, y);
            y += 11;
        });
        y += 4;
    }

    y = drawLegendRow(doc, y, chart.data);

    y = ensureSpace(doc, y, 8);
    doc.setDrawColor(...ANLI_MEMBERSHIP_BRAND.borderRgb);
    doc.setLineWidth(0.25);
    doc.line(PDF_MARGIN, y, width - PDF_MARGIN, y);
    y += 10;

    chart.data.forEach((item) => {
        y = ensureSpace(doc, y, BAR_ROW_H);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(...ANLI_MEMBERSHIP_BRAND.textRgb);
        const label =
            item.name.length > 22 ? `${item.name.slice(0, 20)}…` : item.name;
        doc.text(label, PDF_MARGIN, y + 4);

        const barW = Math.max(6, (item.value / maxVal) * barMaxW);
        const [r, g, b] = item.fill
            ? hexToRgb(item.fill)
            : ANLI_MEMBERSHIP_BRAND.tableHeadRgb;
        doc.setFillColor(r, g, b);
        doc.roundedRect(barStartX, y - 2, barW, 10, 1, 1, 'F');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.text(item.value.toLocaleString(), barStartX + barMaxW + 8, y + 4, {
            align: 'left',
        });

        y += BAR_ROW_H;
    });

    return y + CHART_BLOCK_GAP;
}

function buildMembershipReportPdfDocument(
    meta: MembershipExportMeta,
    sections: PdfTableSection[],
    charts: PdfChartInput[],
    insight?: string,
): jsPDF {
    const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'pt',
        format: 'a4',
    });

    let y = drawPdfHeader(doc, meta, insight);

    if (charts.length) {
        y = ensureSpace(doc, y, 24);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(...ANLI_MEMBERSHIP_BRAND.inkRgb);
        doc.text('Visual summary', PDF_MARGIN, y);
        y += 14;

        charts.forEach((chart) => {
            y = drawChartBlock(doc, y, chart);
        });
    }

    sections.forEach((section) => {
        if (!section.rows.length) return;

        y = ensureSpace(doc, y, 40);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(...ANLI_MEMBERSHIP_BRAND.inkRgb);
        doc.text(section.title, PDF_MARGIN, y);
        y += 14;

        const columns = Object.keys(section.rows[0]);

        autoTable(doc, {
            startY: y,
            head: [columns],
            body: section.rows.map((row) =>
                columns.map((col) => flattenExportValue(row[col], col)),
            ),
            theme: 'grid',
            styles: {
                fontSize: 7,
                cellPadding: 4,
                overflow: 'linebreak',
                textColor: ANLI_MEMBERSHIP_BRAND.textRgb,
            },
            headStyles: {
                fillColor: ANLI_MEMBERSHIP_BRAND.tableHeadRgb,
                textColor: ANLI_MEMBERSHIP_BRAND.tableHeadTextRgb,
                fontStyle: 'bold',
            },
            alternateRowStyles: {
                fillColor: ANLI_MEMBERSHIP_BRAND.tableStripeRgb,
            },
            margin: {
                left: PDF_MARGIN,
                right: PDF_MARGIN,
                bottom: FOOTER_RESERVE,
            },
            didDrawPage: () => drawPdfFooter(doc, meta),
        });

        const finalY =
            (doc as jsPDF & { lastAutoTable?: { finalY: number } })
                .lastAutoTable?.finalY ?? y + 40;
        y = finalY + 20;
    });

    const totalPages = doc.getNumberOfPages();
    for (let page = 1; page <= totalPages; page += 1) {
        doc.setPage(page);
        drawPdfFooter(doc, meta);
    }

    return doc;
}

export function exportMembershipReportPdf(
    meta: MembershipExportMeta,
    sections: PdfTableSection[],
    charts: PdfChartInput[],
    filename: string,
    insight?: string,
) {
    const doc = buildMembershipReportPdfDocument(
        meta,
        sections,
        charts,
        insight,
    );
    doc.save(`${filename.replace(/[^\w.-]+/g, '_')}.pdf`);
}

/** Opens a native PDF in the browser (jsPDF blob) — not HTML. */
export function previewMembershipReportPdf(
    meta: MembershipExportMeta,
    sections: PdfTableSection[],
    charts: PdfChartInput[],
    insight?: string,
) {
    const doc = buildMembershipReportPdfDocument(
        meta,
        sections,
        charts,
        insight,
    );
    const blob = doc.output('blob');
    const url = URL.createObjectURL(blob);
    const opened = window.open(url, '_blank', 'noopener,noreferrer');
    if (!opened) {
        URL.revokeObjectURL(url);
        throw new Error(
            'Pop-up blocked. Allow pop-ups to view the PDF preview.',
        );
    }
    window.setTimeout(() => URL.revokeObjectURL(url), 120_000);
}
