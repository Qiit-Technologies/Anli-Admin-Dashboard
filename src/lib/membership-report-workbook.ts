import {
    appendCompactExportSheet,
    downloadMembershipWorkbook,
} from '@/lib/membership-export';
import { getReportDefinition } from '@/lib/membership-report-catalog';
import { resolveExportSections } from '@/lib/membership-report-bundle';
import {
    buildFacilityChartData,
    buildNotificationChartData,
    buildPlanChartData,
    buildPlanSpendChartData,
    buildStatusChartData,
    buildTopSpendChartData,
} from '@/lib/membership-report-rows';
import type { MembershipReportSnapshot } from '@/lib/membership-report-types';
import * as XLSX from 'xlsx';

function contextLine(snapshot: MembershipReportSnapshot) {
    const def = getReportDefinition(snapshot.reportType);
    return `${snapshot.businessName} · ${def.label} · ${snapshot.periodLabel}`;
}

const SHEET_NAMES: Record<string, string> = {
    'Top members by spend': 'Top Members',
    'All members (spend & visits)': 'All Members',
    'Plan revenue summary': 'Plan Revenue',
    'Member directory': 'Member Directory',
    'Expired members': 'Expired',
    'Renewals due within 30 days': 'Renewals Due',
    'Notification log': 'Notifications',
    'Facility usage summary': 'Facility Usage',
    Bookings: 'Bookings',
    'Check-ins today': 'Check-ins',
};

export function buildMembershipReportWorkbook(
    snapshot: MembershipReportSnapshot,
): XLSX.WorkBook {
    const workbook = XLSX.utils.book_new();
    const ctx = contextLine(snapshot);
    const def = getReportDefinition(snapshot.reportType);
    const sections = resolveExportSections(snapshot);

    sections.forEach((section, index) => {
        const sheetName =
            SHEET_NAMES[section.title] ||
            section.title.slice(0, 31);
        appendCompactExportSheet(
            workbook,
            sheetName,
            `${def.label} — ${section.title}`,
            ctx,
            section.rows,
        );
    });

    const chartRows = resolveChartsForExcel(snapshot);
    chartRows.forEach((block) => {
        appendCompactExportSheet(
            workbook,
            block.sheetName,
            `${def.label} — ${block.title}`,
            ctx,
            block.rows,
        );
    });

    return workbook;
}

function resolveChartsForExcel(snapshot: MembershipReportSnapshot) {
    const def = getReportDefinition(snapshot.reportType);
    const blocks: {
        sheetName: string;
        title: string;
        rows: Record<string, unknown>[];
    }[] = [];

    def.charts.forEach((chartId, i) => {
        let rows: Record<string, unknown>[] = [];
        let sheetName = `Chart ${i + 1}`;
        if (chartId === 'statusMix') {
            rows = buildStatusChartData(snapshot.members).map((d) => ({
                Status: d.name,
                Count: d.value,
            }));
            sheetName = 'Chart Status';
        } else if (chartId === 'planHeadcount') {
            rows = buildPlanChartData(snapshot.memberValue.planRevenue).map(
                (d) => ({ Plan: d.name, Members: d.value }),
            );
            sheetName = 'Chart Plan Count';
        } else if (chartId === 'planSpend') {
            rows = buildPlanSpendChartData(
                snapshot.memberValue.planRevenue,
            ).map((d) => ({ Plan: d.name, Spend: d.value }));
            sheetName = 'Chart Plan Spend';
        } else if (chartId === 'topSpend') {
            rows = buildTopSpendChartData(snapshot.members).map((d) => ({
                Member: d.name,
                Spend: d.value,
            }));
            sheetName = 'Chart Top Spend';
        } else if (chartId === 'notificationTypes') {
            rows = buildNotificationChartData(
                snapshot.notificationLogs,
            ).map((d) => ({ Type: d.name, Count: d.value }));
            sheetName = 'Chart Notifications';
        } else if (chartId === 'facilityBookings') {
            rows = buildFacilityChartData(snapshot.facility).map((d) => ({
                Facility: d.name,
                Bookings: d.value,
            }));
            sheetName = 'Chart Facilities';
        }
        if (rows.length) {
            blocks.push({ sheetName, title: chartId, rows });
        }
    });

    return blocks;
}

export function downloadMembershipReportExcel(
    snapshot: MembershipReportSnapshot,
) {
    const workbook = buildMembershipReportWorkbook(snapshot);
    if (workbook.SheetNames.length === 0) {
        throw new Error('No sheets to export');
    }
    downloadMembershipWorkbook(
        workbook,
        `membership-${snapshot.reportType}-${snapshot.filters.startDate}-${snapshot.filters.endDate}`,
    );
}
