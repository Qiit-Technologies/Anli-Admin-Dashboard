import type { Member, MemberBooking } from '@/types/membership/membership';
import type {
    CheckedInMemberRow,
    MembershipNotificationLogRow,
    ReportMemberType,
} from './membership-report-types';

export const toNumber = (value?: number | string | null) => Number(value || 0);

export const getMemberType = (member?: Member | null): ReportMemberType => {
    if (!member) return 'old';
    if (member.status === 'pending') return 'prospective';
    const createdAt = new Date(member.createdAt).getTime();
    if (Number.isNaN(createdAt)) return 'old';
    const daysSinceCreated = (Date.now() - createdAt) / (1000 * 60 * 60 * 24);
    return daysSinceCreated <= 30 ? 'new' : 'old';
};

export const daysUntil = (value?: string | null) => {
    if (!value) return null;
    const target = new Date(value).getTime();
    if (Number.isNaN(target)) return null;
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);
    return Math.ceil((target - todayDate.getTime()) / (1000 * 60 * 60 * 24));
};

export function mapMemberDirectoryRows(members: Member[]) {
    return members.map((member) => ({
        'Membership ID': member.membershipId || member.id,
        'First name': member.firstName,
        'Last name': member.lastName,
        Email: member.email,
        Phone: member.phone,
        Plan: member.plan?.name || 'No plan',
        Status: member.status,
        'Member type': getMemberType(member),
        'Start date': member.startDate || '',
        'End date': member.endDate || '',
        'Days to expiry': daysUntil(member.endDate) ?? '',
        'Total visits': toNumber(member.totalVisits),
        'Total spend': toNumber(member.totalSpend),
        'Last visit': member.lastVisitDate || '',
        'Created at': member.createdAt || '',
    }));
}

export function mapRenewalRows(members: Member[]) {
    return members.map((member) => ({
        Member: `${member.firstName} ${member.lastName}`,
        Email: member.email,
        Phone: member.phone,
        Plan: member.plan?.name || 'No plan',
        Status: member.status,
        'End date': member.endDate || '',
        'Days to expiry': daysUntil(member.endDate) ?? '',
    }));
}

export function mapBookingRows(bookings: MemberBooking[]) {
    return bookings.map((booking) => ({
        'Booking ID': booking.id,
        Member: `${booking.member?.firstName || ''} ${booking.member?.lastName || ''}`.trim(),
        'Membership ID': booking.member?.membershipId || booking.member?.id,
        Facility: booking.facility?.name || 'Unknown facility',
        Fee: toNumber(booking.facility?.fee),
        Status: booking.status,
        'Start time': booking.startTime,
        'End time': booking.endTime,
        'Created at': booking.createdAt,
    }));
}

export function mapCheckInRows(members: CheckedInMemberRow[]) {
    return members.map((member) => ({
        Member: `${member.firstName} ${member.lastName}`,
        Facility: member.latestVisit?.facility || 'Facility not recorded',
        'Visit date': member.latestVisit?.visitDate || '',
        'Visit time': member.latestVisit?.visitTime || '',
    }));
}

export function mapNotificationRows(logs: MembershipNotificationLogRow[]) {
    return logs.map((log) => ({
        Type: log.type,
        Member: `${log.member?.firstName || ''} ${log.member?.lastName || ''}`.trim(),
        Email: log.email,
        Subject: log.subject || '',
        Date: log.notificationDate,
        Success: log.success ? 'Yes' : 'No',
        Error: log.errorMessage || '',
        'Created at': log.createdAt,
    }));
}

export function mapPlanRevenueRows(
    planRevenue: { plan: string; members: number; spend: number }[],
) {
    return planRevenue.map((plan) => ({
        Plan: plan.plan,
        Members: plan.members,
        Spend: plan.spend,
    }));
}

export function mapTopMemberRows(members: Member[]) {
    return members.map((member) => ({
        Member: `${member.firstName} ${member.lastName}`,
        Plan: member.plan?.name || 'No plan',
        Spend: toNumber(member.totalSpend),
        Visits: toNumber(member.totalVisits),
        'Last visit': member.lastVisitDate || '',
    }));
}

export function buildStatusChartData(members: Member[]) {
    const counts = new Map<string, number>();
    members.forEach((m) => {
        const key = m.status || 'unknown';
        counts.set(key, (counts.get(key) || 0) + 1);
    });
    const colors: Record<string, string> = {
        active: '#16a34a',
        expired: '#dc2626',
        suspended: '#d97706',
        inactive: '#6b7280',
        pending: '#2563eb',
    };
    return Array.from(counts.entries()).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value,
        fill: colors[name] || '#4f46e5',
    }));
}

export function buildPlanChartData(
    planRevenue: { plan: string; members: number; spend: number }[],
) {
    return planRevenue.slice(0, 8).map((p) => ({
        name: p.plan.length > 18 ? `${p.plan.slice(0, 16)}…` : p.plan,
        value: p.members,
        fill: '#2563eb',
    }));
}

export function buildPlanSpendChartData(
    planRevenue: { plan: string; members: number; spend: number }[],
) {
    return planRevenue.slice(0, 8).map((p) => ({
        name: p.plan.length > 18 ? `${p.plan.slice(0, 16)}…` : p.plan,
        value: p.spend,
        fill: '#059669',
    }));
}

export function buildTopSpendChartData(members: Member[]) {
    return [...members]
        .sort((a, b) => toNumber(b.totalSpend) - toNumber(a.totalSpend))
        .slice(0, 8)
        .map((m) => ({
            name: `${m.firstName} ${m.lastName}`.trim().slice(0, 20),
            value: toNumber(m.totalSpend),
            fill: '#4f46e5',
        }));
}

export function buildNotificationChartData(
    logs: MembershipNotificationLogRow[],
) {
    const counts = new Map<string, number>();
    logs.forEach((log) => {
        const key = log.type || 'other';
        counts.set(key, (counts.get(key) || 0) + 1);
    });
    return Array.from(counts.entries()).map(([name, value]) => ({
        name,
        value,
        fill: '#7c3aed',
    }));
}

export function buildFacilityChartData(
    facility: {
        facility: string;
        bookings: number;
    }[],
) {
    return facility.slice(0, 8).map((f) => ({
        name:
            f.facility.length > 20 ? `${f.facility.slice(0, 18)}…` : f.facility,
        value: f.bookings,
        fill: '#0891b2',
    }));
}
