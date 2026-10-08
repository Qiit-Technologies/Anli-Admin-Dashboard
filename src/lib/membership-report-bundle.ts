import {
    CHART_META,
    getReportDefinition,
    type ReportChartId,
} from '@/lib/membership-report-catalog';
import type { PdfTableSection } from '@/lib/membership-report-pdf';
import {
    buildFacilityChartData,
    buildNotificationChartData,
    buildPlanChartData,
    buildPlanSpendChartData,
    buildStatusChartData,
    buildTopSpendChartData,
    mapBookingRows,
    mapCheckInRows,
    mapMemberDirectoryRows,
    mapNotificationRows,
    mapPlanRevenueRows,
    mapRenewalRows,
    mapTopMemberRows,
} from '@/lib/membership-report-rows';
import type {
    ChartDatum,
    MembershipReportSnapshot,
} from '@/lib/membership-report-types';

export type ChartBundleItem = {
    id: ReportChartId;
    title: string;
    description: string;
    legendTitle: string;
    data: ChartDatum[];
};

export function resolveCharts(snapshot: MembershipReportSnapshot): ChartBundleItem[] {
    const def = getReportDefinition(snapshot.reportType);

    const resolvers: Record<ReportChartId, () => ChartDatum[]> = {
        statusMix: () => buildStatusChartData(snapshot.members),
        planHeadcount: () =>
            buildPlanChartData(snapshot.memberValue.planRevenue),
        planSpend: () =>
            buildPlanSpendChartData(snapshot.memberValue.planRevenue),
        topSpend: () => buildTopSpendChartData(snapshot.members),
        notificationTypes: () =>
            buildNotificationChartData(snapshot.notificationLogs),
        facilityBookings: () => buildFacilityChartData(snapshot.facility),
    };

    return def.charts.map((id) => ({
        id,
        ...CHART_META[id],
        data: resolvers[id](),
    }));
}

export function resolveExportSections(
    snapshot: MembershipReportSnapshot,
): PdfTableSection[] {
    const def = getReportDefinition(snapshot.reportType);
    const sections: PdfTableSection[] = [];

    const push = (title: string, rows: Record<string, unknown>[]) => {
        sections.push({ title, rows });
    };

    for (const sectionId of def.sections) {
        switch (sectionId) {
            case 'memberSpend':
                push(
                    'Top members by spend',
                    mapTopMemberRows(snapshot.memberValue.topMembers),
                );
                push('All members (spend & visits)', mapMemberDirectoryRows(snapshot.members));
                break;
            case 'planRevenue':
                push(
                    'Plan revenue summary',
                    mapPlanRevenueRows(snapshot.memberValue.planRevenue),
                );
                break;
            case 'memberDirectory':
                push('Member directory', mapMemberDirectoryRows(snapshot.members));
                break;
            case 'renewalsExpired':
                push(
                    'Expired members',
                    mapRenewalRows(snapshot.renewal.expired),
                );
                break;
            case 'renewalsDue':
                push(
                    'Renewals due within 30 days',
                    mapRenewalRows(snapshot.renewal.dueSoon),
                );
                break;
            case 'notifications':
                push(
                    'Notification log',
                    mapNotificationRows(snapshot.notificationLogs),
                );
                break;
            case 'facilityUsage':
                push(
                    'Facility usage summary',
                    snapshot.facility.map((f) => ({
                        Facility: f.facility,
                        Bookings: f.bookings,
                        'Est. fees': f.revenue,
                        Confirmed: f.confirmed,
                        Cancelled: f.cancelled,
                    })),
                );
                break;
            case 'bookings':
                push('Bookings', mapBookingRows(snapshot.bookings));
                break;
            case 'checkIns':
                push('Check-ins today', mapCheckInRows(snapshot.checkedInMembers));
                break;
            default:
                break;
        }
    }

    return sections;
}

export function kpisForReportType(snapshot: MembershipReportSnapshot) {
    const def = getReportDefinition(snapshot.reportType);
    const base = [
        { label: 'Members in scope', value: snapshot.members.length.toLocaleString() },
    ];

    if (def.sections.includes('memberSpend') || def.sections.includes('planRevenue')) {
        return [
            ...base,
            {
                label: 'Total spend',
                value: snapshot.memberValue.totalSpend.toLocaleString(),
            },
            {
                label: 'Avg spend / member',
                value: Math.round(snapshot.memberValue.avgSpend).toLocaleString(),
            },
            {
                label: 'Inactive risk (30d+)',
                value: snapshot.memberValue.inactiveRisk.length.toLocaleString(),
            },
        ];
    }
    if (def.sections.includes('renewalsExpired')) {
        return [
            ...base,
            {
                label: 'Expired',
                value: snapshot.renewal.expired.length.toLocaleString(),
            },
            {
                label: 'Due in 30 days',
                value: snapshot.renewal.dueSoon.length.toLocaleString(),
            },
        ];
    }
    if (def.sections.includes('renewalsDue')) {
        return [
            ...base,
            {
                label: 'Due in 30 days',
                value: snapshot.renewal.dueSoon.length.toLocaleString(),
            },
        ];
    }
    if (def.sections.includes('notifications')) {
        return [
            {
                label: 'Notifications',
                value: snapshot.notificationLogs.length.toLocaleString(),
            },
            {
                label: 'Successful',
                value: snapshot.notificationLogs
                    .filter((l) => l.success)
                    .length.toLocaleString(),
            },
            {
                label: 'Failed',
                value: snapshot.notificationLogs
                    .filter((l) => !l.success)
                    .length.toLocaleString(),
            },
        ];
    }
    if (
        def.sections.includes('facilityUsage') ||
        def.sections.includes('bookings')
    ) {
        return [
            ...base,
            {
                label: 'Bookings',
                value: snapshot.bookings.length.toLocaleString(),
            },
            {
                label: 'Facilities used',
                value: snapshot.facility.length.toLocaleString(),
            },
            {
                label: 'Check-ins today',
                value: snapshot.checkedInMembers.length.toLocaleString(),
            },
        ];
    }
    if (def.sections.includes('checkIns')) {
        return [
            {
                label: 'Check-ins today',
                value: snapshot.checkedInMembers.length.toLocaleString(),
            },
        ];
    }

    return [
        ...base,
        { label: 'Bookings', value: snapshot.bookings.length.toLocaleString() },
        {
            label: 'Expired',
            value: snapshot.renewal.expired.length.toLocaleString(),
        },
        {
            label: 'Renewals due',
            value: snapshot.renewal.dueSoon.length.toLocaleString(),
        },
    ];
}
