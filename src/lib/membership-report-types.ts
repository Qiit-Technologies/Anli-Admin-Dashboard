import type { Member, MemberBooking } from '@/types/membership/membership';

export type ReportStatus = 'all' | 'active' | 'inactive' | 'expired' | 'suspended';
export type ReportMemberType = 'all' | 'new' | 'old' | 'prospective';
export type MembershipReportType =
    | 'overview'
    | 'member-spend'
    | 'plan-revenue'
    | 'member-directory'
    | 'renewals-expired'
    | 'renewals-due'
    | 'notifications'
    | 'facility-usage'
    | 'bookings'
    | 'check-ins';

export interface ReportFilters {
    startDate: string;
    endDate: string;
    plan: string;
    status: ReportStatus;
    memberType: ReportMemberType;
    search: string;
}

export interface CheckedInMemberRow {
    id: string;
    firstName: string;
    lastName: string;
    latestVisit?: {
        facility?: string;
        visitDate?: string;
        visitTime?: string;
    };
}

export interface MembershipNotificationLogRow {
    id: number;
    type: string;
    email: string;
    subject?: string;
    notificationDate: string;
    success: boolean;
    errorMessage?: string | null;
    member?: Partial<Member>;
    createdAt: string;
}

export interface MembershipReportSnapshot {
    reportType: MembershipReportType;
    reportLabel: string;
    filters: ReportFilters;
    businessName: string;
    businessAddress?: string;
    periodLabel: string;
    members: Member[];
    bookings: MemberBooking[];
    checkedInMembers: CheckedInMemberRow[];
    notificationLogs: MembershipNotificationLogRow[];
    renewal: {
        expired: Member[];
        dueSoon: Member[];
    };
    memberValue: {
        totalSpend: number;
        totalVisits: number;
        avgSpend: number;
        inactiveRisk: Member[];
        topMembers: Member[];
        planRevenue: { plan: string; members: number; spend: number }[];
    };
    facility: {
        facility: string;
        bookings: number;
        revenue: number;
        confirmed: number;
        cancelled: number;
    }[];
}

export type ChartDatum = { name: string; value: number; fill?: string };
