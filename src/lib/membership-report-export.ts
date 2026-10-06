import {
    resolveCharts,
    resolveExportSections,
} from '@/lib/membership-report-bundle';
import { getReportDefinition } from '@/lib/membership-report-catalog';
import {
    exportMembershipReportPdf,
    previewMembershipReportPdf,
} from '@/lib/membership-report-pdf';
import type { MembershipReportSnapshot } from '@/lib/membership-report-types';
import { downloadMembershipReportExcel } from '@/lib/membership-report-workbook';

export function exportSnapshotExcel(snapshot: MembershipReportSnapshot) {
    downloadMembershipReportExcel(snapshot);
}

export function exportSnapshotPdf(snapshot: MembershipReportSnapshot) {
    const sections = resolveExportSections(snapshot);
    const charts = resolveCharts(snapshot).map((c) => ({
        title: c.title,
        description: c.description,
        data: c.data,
    }));
    const totalRows = sections.reduce((n, s) => n + s.rows.length, 0);
    if (totalRows === 0) {
        throw new Error('No data to export for this report');
    }
    const def = getReportDefinition(snapshot.reportType);
    const pdfMeta = buildPdfMeta(snapshot, def.label, totalRows);

    exportMembershipReportPdf(
        pdfMeta,
        sections,
        charts,
        `membership-${snapshot.reportType}-${snapshot.filters.startDate}`,
        def.insight,
    );
}

/** Opens jsPDF output in a new tab (vector PDF, not HTML). */
export function previewSnapshotPdf(snapshot: MembershipReportSnapshot) {
    const sections = resolveExportSections(snapshot);
    const charts = resolveCharts(snapshot).map((c) => ({
        title: c.title,
        description: c.description,
        data: c.data,
    }));
    const totalRows = sections.reduce((n, s) => n + s.rows.length, 0);
    if (totalRows === 0) {
        throw new Error('No data to preview for this report');
    }
    const def = getReportDefinition(snapshot.reportType);
    const pdfMeta = buildPdfMeta(snapshot, def.label, totalRows);

    previewMembershipReportPdf(pdfMeta, sections, charts, def.insight);
}

function buildPdfMeta(
    snapshot: MembershipReportSnapshot,
    reportLabel: string,
    recordCount: number,
) {
    return {
        businessName: snapshot.businessName,
        businessAddress: snapshot.businessAddress,
        reportTitle: reportLabel,
        subtitle: `Plan: ${snapshot.filters.plan} · Status: ${snapshot.filters.status} · Type: ${snapshot.filters.memberType}`,
        period: snapshot.periodLabel,
        recordCount,
    };
}

export {
    getReportDefinition,
    REPORT_CATALOG,
    REPORT_GROUPS,
    showsReportSection,
} from '@/lib/membership-report-catalog';
