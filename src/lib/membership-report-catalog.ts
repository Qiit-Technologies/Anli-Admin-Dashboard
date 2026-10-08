import type { MembershipReportType } from './membership-report-types';

export type ReportGroup =
    | 'Summary'
    | 'Member value'
    | 'Directory & renewals'
    | 'Engagement'
    | 'Facilities';

export type ReportChartId =
    | 'statusMix'
    | 'planHeadcount'
    | 'planSpend'
    | 'topSpend'
    | 'notificationTypes'
    | 'facilityBookings';

export type ReportSectionId =
    | 'memberSpend'
    | 'planRevenue'
    | 'memberDirectory'
    | 'renewalsExpired'
    | 'renewalsDue'
    | 'notifications'
    | 'facilityUsage'
    | 'bookings'
    | 'checkIns';

export type ReportDefinition = {
    value: MembershipReportType;
    label: string;
    group: ReportGroup;
    description: string;
    insight: string;
    charts: ReportChartId[];
    sections: ReportSectionId[];
    /** Member list not gated by activity dates in range */
    skipMemberActivityDateFilter: boolean;
};

export const CHART_META: Record<
    ReportChartId,
    { title: string; description: string; legendTitle: string }
> = {
    statusMix: {
        title: 'Membership status mix',
        description:
            'How filtered members split across statuses. Helps you spot expired or suspended concentration before renewals work.',
        legendTitle: 'Status',
    },
    planHeadcount: {
        title: 'Members per plan',
        description:
            'Headcount by plan for the filtered set. Use when staffing or capacity planning by tier.',
        legendTitle: 'Plan',
    },
    planSpend: {
        title: 'Revenue by plan',
        description:
            'Total recorded spend grouped by plan. Compare which plans drive revenue, not just member count.',
        legendTitle: 'Plan',
    },
    topSpend: {
        title: 'Top spenders',
        description:
            'Highest-spend members in this report. Useful for VIP recognition or retention outreach.',
        legendTitle: 'Member',
    },
    notificationTypes: {
        title: 'Notifications by type',
        description:
            'Email and alert volume by category (birthday, renewal, welcome, etc.) in the selected period.',
        legendTitle: 'Type',
    },
    facilityBookings: {
        title: 'Bookings by facility',
        description:
            'Reservation count per facility. Shows where members actually book, not just check in.',
        legendTitle: 'Facility',
    },
};

export const REPORT_CATALOG: ReportDefinition[] = [
    {
        value: 'overview',
        label: 'Overview',
        group: 'Summary',
        description:
            'High-level snapshot across members, renewals, bookings, and notifications.',
        insight:
            'Use for leadership reviews. Export includes multiple sheets; print shows the main tables only.',
        charts: ['statusMix', 'facilityBookings'],
        sections: [
            'memberDirectory',
            'renewalsExpired',
            'bookings',
            'notifications',
        ],
        skipMemberActivityDateFilter: false,
    },
    {
        value: 'member-spend',
        label: 'Member spend & visits',
        group: 'Member value',
        description:
            'Member-oriented view: who spends the most, visit counts, and inactive-risk members.',
        insight:
            'Print or export this when you need a list for account managers or retention calls — not plan totals.',
        charts: ['topSpend', 'statusMix'],
        sections: ['memberSpend'],
        skipMemberActivityDateFilter: false,
    },
    {
        value: 'plan-revenue',
        label: 'Plan revenue',
        group: 'Member value',
        description:
            'Plan-oriented view: revenue and member count per membership plan.',
        insight:
            'Print or export this when finance or sales needs plan performance — separate from individual member rows.',
        charts: ['planSpend', 'planHeadcount'],
        sections: ['planRevenue'],
        skipMemberActivityDateFilter: false,
    },
    {
        value: 'member-directory',
        label: 'Member directory',
        group: 'Directory & renewals',
        description:
            'Full directory with status, plan, renewal date, and member type (new / old / prospective).',
        insight:
            'Best for front-desk or membership desk daily operations and ID verification.',
        charts: ['statusMix', 'planHeadcount'],
        sections: ['memberDirectory'],
        skipMemberActivityDateFilter: true,
    },
    {
        value: 'renewals-expired',
        label: 'Expired members',
        group: 'Directory & renewals',
        description:
            'Members already past end date or marked expired — win-back list.',
        insight: 'Export and print only expired rows for renewal campaigns.',
        charts: ['statusMix'],
        sections: ['renewalsExpired'],
        skipMemberActivityDateFilter: true,
    },
    {
        value: 'renewals-due',
        label: 'Renewals due (30 days)',
        group: 'Directory & renewals',
        description:
            'Members expiring within the next 30 days — proactive renewal outreach.',
        insight:
            'Export and print only the due-soon list for call-downs before lapse.',
        charts: ['statusMix'],
        sections: ['renewalsDue'],
        skipMemberActivityDateFilter: true,
    },
    {
        value: 'notifications',
        label: 'Notifications',
        group: 'Engagement',
        description:
            'Audit of birthday, renewal, welcome, and other emails sent in the period.',
        insight:
            'Use to verify automations ran and to troubleshoot failed sends.',
        charts: ['notificationTypes'],
        sections: ['notifications'],
        skipMemberActivityDateFilter: false,
    },
    {
        value: 'facility-usage',
        label: 'Facility usage',
        group: 'Facilities',
        description:
            'Aggregated bookings and estimated fees per facility with confirmation counts.',
        insight:
            'Plan-oriented for ops: which facilities are busiest and revenue-like fees.',
        charts: ['facilityBookings'],
        sections: ['facilityUsage'],
        skipMemberActivityDateFilter: false,
    },
    {
        value: 'bookings',
        label: 'Bookings list',
        group: 'Facilities',
        description:
            'Every booking in the period with member, facility, fee, and status.',
        insight:
            'Member-oriented detail: one row per reservation for reconciliation.',
        charts: ['facilityBookings'],
        sections: ['bookings'],
        skipMemberActivityDateFilter: false,
    },
    {
        value: 'check-ins',
        label: "Today's check-ins",
        group: 'Facilities',
        description:
            'Members checked in today with last visit facility and time.',
        insight: 'Front-of-house snapshot for who is on property right now.',
        charts: [],
        sections: ['checkIns'],
        skipMemberActivityDateFilter: false,
    },
];

export function getReportDefinition(
    type: MembershipReportType,
): ReportDefinition {
    return REPORT_CATALOG.find((r) => r.value === type) ?? REPORT_CATALOG[0];
}

const OVERVIEW_SECTIONS: ReportSectionId[] = [
    'memberSpend',
    'planRevenue',
    'memberDirectory',
    'renewalsExpired',
    'renewalsDue',
    'notifications',
    'facilityUsage',
    'bookings',
    'checkIns',
];

export function showsReportSection(
    activeType: MembershipReportType,
    section: ReportSectionId,
): boolean {
    if (activeType === 'overview') {
        return OVERVIEW_SECTIONS.includes(section);
    }
    return getReportDefinition(activeType).sections.includes(section);
}

export const REPORT_GROUPS = [
    'Summary',
    'Member value',
    'Directory & renewals',
    'Engagement',
    'Facilities',
] as const;
