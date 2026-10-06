'use client';

import {
    getAllMembersForBooking,
    getBookings,
    getCheckedInMembers,
    getMembershipNotificationLogs,
} from '@/app/actions/membership';
import { PageHeader, PageHeadertitle } from '@/components/common/layout/Header';
import PageWrapper from '@/components/common/PageWrapper';
import { PERMISSIONS } from '@/components/permission/data/permissions';
import Header from '@/components/membership/layout/header';
import MembershipReportCharts from '@/components/membership/reports/MembershipReportCharts';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import useHotel from '@/hooks/useHotel';
import {
    resolveMembershipBusinessAddress,
    resolveMembershipBusinessName,
} from '@/lib/membership-export-brand';
import { resolveCharts } from '@/lib/membership-report-bundle';
import {
    REPORT_CATALOG,
    REPORT_GROUPS,
    showsReportSection,
} from '@/lib/membership-report-catalog';
import {
    exportSnapshotExcel,
    exportSnapshotPdf,
    getReportDefinition,
    previewSnapshotPdf,
} from '@/lib/membership-report-export';
import {
    daysUntil,
    getMemberType,
    toNumber,
} from '@/lib/membership-report-rows';
import type {
    CheckedInMemberRow,
    MembershipNotificationLogRow,
    MembershipReportSnapshot,
    MembershipReportType,
    ReportMemberType,
    ReportStatus,
} from '@/lib/membership-report-types';
import { formatCurrency } from '@/lib/utils';
import { Member, MemberBooking } from '@/types/membership/membership';
import {
    BarChart3,
    ChevronDown,
    FileSpreadsheet,
    FileText,
    Filter,
    Loader2,
    Search,
    TrendingUp,
    Users,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';

const today = new Date().toISOString().slice(0, 10);
const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);
const defaultReportFilters = {
    startDate: thirtyDaysAgo,
    endDate: today,
    plan: 'all',
    status: 'all' as ReportStatus,
    memberType: 'all' as ReportMemberType,
    search: '',
};

const formatDate = (value?: string | null) => {
    if (!value) return 'N/A';
    return new Date(value).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};

const isWithinDateRange = (
    value: string | null | undefined,
    startDate: string,
    endDate: string,
) => {
    if (!value) return false;
    const time = new Date(value).getTime();
    const start = new Date(`${startDate}T00:00:00`).getTime();
    const end = new Date(`${endDate}T23:59:59`).getTime();
    return time >= start && time <= end;
};

const ReportKpi = ({
    label,
    value,
    isCurrency,
}: {
    label: string;
    value: number;
    isCurrency?: boolean;
}) => (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <p className="text-xs font-medium text-gray-500 mb-1">{label}</p>
        <p className="text-lg font-semibold text-gray-900 tabular-nums">
            {isCurrency ? formatCurrency(value) : value.toLocaleString()}
        </p>
    </div>
);

const EmptyRows = ({ label }: { label: string }) => (
    <tr>
        <td colSpan={6} className="py-10 text-center text-sm text-gray-500">
            {label}
        </td>
    </tr>
);

export default function MembershipReportsPage() {
    const { organization } = useHotel();
    const [menuOpen, setMenuOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [members, setMembers] = useState<Member[]>([]);
    const [bookings, setBookings] = useState<MemberBooking[]>([]);
    const [checkedInMembers, setCheckedInMembers] = useState<
        CheckedInMemberRow[]
    >([]);
    const [notificationLogs, setNotificationLogs] = useState<
        MembershipNotificationLogRow[]
    >([]);
    const [draftFilters, setDraftFilters] = useState(defaultReportFilters);
    const [appliedFilters, setAppliedFilters] = useState<
        typeof defaultReportFilters | null
    >(null);
    const [activeReportType, setActiveReportType] =
        useState<MembershipReportType>('overview');

    useEffect(() => {
        const loadReports = async () => {
            try {
                setLoading(true);
                const [
                    membersResponse,
                    bookingsResponse,
                    checkedInResponse,
                    notificationLogsResponse,
                ] = await Promise.all([
                    getAllMembersForBooking({ page: 1, limit: 1000 }),
                    getBookings({ page: 1, limit: 1000 }),
                    getCheckedInMembers({ page: 1, limit: 1000 }),
                    getMembershipNotificationLogs(),
                ]);

                setMembers((membersResponse?.data?.members || []) as Member[]);
                setBookings(
                    (bookingsResponse?.data?.bookings || []) as MemberBooking[],
                );
                setCheckedInMembers(
                    (checkedInResponse?.data?.data ||
                        checkedInResponse?.data ||
                        []) as CheckedInMemberRow[],
                );
                setNotificationLogs(
                    (notificationLogsResponse?.data?.logs ||
                        []) as MembershipNotificationLogRow[],
                );
            } catch {
                toast.error('Failed to load membership reports');
            } finally {
                setLoading(false);
            }
        };

        loadReports();
    }, []);

    const planOptions = useMemo(() => {
        const plans = new Map<number, string>();
        members.forEach((member) => {
            if (member.plan?.id && member.plan?.name) {
                plans.set(member.plan.id, member.plan.name);
            }
        });
        return Array.from(plans.entries()).map(([id, name]) => ({
            value: id.toString(),
            label: name,
        }));
    }, [members]);

    const filteredMembers = useMemo(() => {
        if (!appliedFilters) return [];

        return members.filter((member) => {
            const planMatches =
                appliedFilters.plan === 'all' ||
                member.plan?.id?.toString() === appliedFilters.plan;
            const statusMatches =
                appliedFilters.status === 'all' ||
                member.status === appliedFilters.status;
            const memberTypeMatches =
                appliedFilters.memberType === 'all' ||
                getMemberType(member) === appliedFilters.memberType;
            const search = appliedFilters.search.trim().toLowerCase();
            const searchMatches =
                !search ||
                [
                    member.firstName,
                    member.lastName,
                    member.email,
                    member.phone,
                    member.membershipId,
                    member.plan?.name,
                ]
                    .filter(Boolean)
                    .some((value) =>
                        String(value).toLowerCase().includes(search),
                    );
            const reportDef = getReportDefinition(activeReportType);
            const dateMatches = reportDef.skipMemberActivityDateFilter
                ? true
                : isWithinDateRange(
                      member.createdAt,
                      appliedFilters.startDate,
                      appliedFilters.endDate,
                  ) ||
                  isWithinDateRange(
                      member.lastVisitDate,
                      appliedFilters.startDate,
                      appliedFilters.endDate,
                  ) ||
                  isWithinDateRange(
                      member.startDate,
                      appliedFilters.startDate,
                      appliedFilters.endDate,
                  ) ||
                  isWithinDateRange(
                      member.endDate,
                      appliedFilters.startDate,
                      appliedFilters.endDate,
                  );

            return (
                planMatches &&
                statusMatches &&
                memberTypeMatches &&
                searchMatches &&
                dateMatches
            );
        });
    }, [activeReportType, appliedFilters, members]);

    const filteredBookings = useMemo(() => {
        if (!appliedFilters) return [];

        return bookings.filter((booking) => {
            const planMatches =
                appliedFilters.plan === 'all' ||
                booking.member?.plan?.id?.toString() === appliedFilters.plan;
            const statusMatches =
                appliedFilters.status === 'all' ||
                booking.member?.status === appliedFilters.status;
            const memberTypeMatches =
                appliedFilters.memberType === 'all' ||
                getMemberType(booking.member) === appliedFilters.memberType;
            const search = appliedFilters.search.trim().toLowerCase();
            const memberName =
                `${booking.member?.firstName || ''} ${booking.member?.lastName || ''}`.trim();
            const searchMatches =
                !search ||
                [
                    memberName,
                    booking.member?.email,
                    booking.member?.phone,
                    booking.member?.membershipId,
                    booking.facility?.name,
                ]
                    .filter(Boolean)
                    .some((value) =>
                        String(value).toLowerCase().includes(search),
                    );
            const bookingDate = booking.startTime || booking.createdAt;
            const dateMatches = isWithinDateRange(
                bookingDate,
                appliedFilters.startDate,
                appliedFilters.endDate,
            );
            return (
                planMatches &&
                statusMatches &&
                memberTypeMatches &&
                searchMatches &&
                dateMatches
            );
        });
    }, [appliedFilters, bookings]);

    const renewalReport = useMemo(() => {
        const expired = filteredMembers.filter((member) => {
            const days = daysUntil(member.endDate);
            return member.status === 'expired' || (days !== null && days < 0);
        });
        const dueSoon = filteredMembers.filter((member) => {
            const days = daysUntil(member.endDate);
            return days !== null && days >= 0 && days <= 30;
        });

        return {
            expired,
            dueSoon,
        };
    }, [filteredMembers]);

    const filteredNotificationLogs = useMemo(() => {
        if (!appliedFilters) return [];

        const search = appliedFilters.search.trim().toLowerCase();

        return notificationLogs.filter((log) => {
            const dateMatches = isWithinDateRange(
                log.notificationDate || log.createdAt,
                appliedFilters.startDate,
                appliedFilters.endDate,
            );
            const searchMatches =
                !search ||
                [
                    log.email,
                    log.subject,
                    log.type,
                    log.member?.firstName,
                    log.member?.lastName,
                    log.member?.phone,
                ]
                    .filter(Boolean)
                    .some((value) =>
                        String(value).toLowerCase().includes(search),
                    );
            return dateMatches && searchMatches;
        });
    }, [appliedFilters, notificationLogs]);

    const memberValueReport = useMemo(() => {
        const totalSpend = filteredMembers.reduce(
            (sum, member) => sum + toNumber(member.totalSpend),
            0,
        );
        const totalVisits = filteredMembers.reduce(
            (sum, member) => sum + toNumber(member.totalVisits),
            0,
        );
        const topMembers = [...filteredMembers]
            .sort((a, b) => toNumber(b.totalSpend) - toNumber(a.totalSpend))
            .slice(0, 10);
        const inactiveRisk = filteredMembers.filter((member) => {
            if (!member.lastVisitDate) return true;
            const daysSinceVisit =
                (Date.now() - new Date(member.lastVisitDate).getTime()) /
                (1000 * 60 * 60 * 24);
            return daysSinceVisit > 30;
        });
        const planRevenue = new Map<
            string,
            { members: number; spend: number }
        >();

        filteredMembers.forEach((member) => {
            const planName = member.plan?.name || 'No plan';
            const current = planRevenue.get(planName) || {
                members: 0,
                spend: 0,
            };
            current.members += 1;
            current.spend += toNumber(member.totalSpend);
            planRevenue.set(planName, current);
        });

        return {
            totalSpend,
            totalVisits,
            avgSpend:
                filteredMembers.length > 0
                    ? totalSpend / filteredMembers.length
                    : 0,
            inactiveRisk,
            topMembers,
            planRevenue: Array.from(planRevenue.entries())
                .map(([plan, value]) => ({ plan, ...value }))
                .sort((a, b) => b.spend - a.spend),
        };
    }, [filteredMembers]);

    const facilityReport = useMemo(() => {
        const facilityMap = new Map<
            string,
            {
                facility: string;
                bookings: number;
                revenue: number;
                confirmed: number;
                cancelled: number;
            }
        >();

        filteredBookings.forEach((booking) => {
            const facilityName = booking.facility?.name || 'Unknown facility';
            const current = facilityMap.get(facilityName) || {
                facility: facilityName,
                bookings: 0,
                revenue: 0,
                confirmed: 0,
                cancelled: 0,
            };
            current.bookings += 1;
            current.revenue += toNumber(booking.facility?.fee);
            if (booking.status === 'confirmed') current.confirmed += 1;
            if (booking.status === 'cancelled') current.cancelled += 1;
            facilityMap.set(facilityName, current);
        });

        return Array.from(facilityMap.values()).sort(
            (a, b) => b.bookings - a.bookings,
        );
    }, [filteredBookings]);

    const hasGeneratedReport = Boolean(appliedFilters);
    const hasPendingFilterChanges =
        hasGeneratedReport &&
        JSON.stringify(draftFilters) !== JSON.stringify(appliedFilters);
    const activeReport = getReportDefinition(activeReportType);

    const reportSnapshot = useMemo((): MembershipReportSnapshot | null => {
        if (!appliedFilters) return null;
        return {
            reportType: activeReportType,
            reportLabel: activeReport.label,
            filters: appliedFilters,
            businessName: resolveMembershipBusinessName(organization),
            businessAddress: resolveMembershipBusinessAddress(organization),
            periodLabel: `${formatDate(appliedFilters.startDate)} – ${formatDate(appliedFilters.endDate)}`,
            members: filteredMembers,
            bookings: filteredBookings,
            checkedInMembers,
            notificationLogs: filteredNotificationLogs,
            renewal: renewalReport,
            memberValue: memberValueReport,
            facility: facilityReport,
        };
    }, [
        activeReport.label,
        activeReportType,
        appliedFilters,
        checkedInMembers,
        facilityReport,
        filteredBookings,
        filteredMembers,
        filteredNotificationLogs,
        memberValueReport,
        organization,
        renewalReport,
    ]);

    const chartBundle = useMemo(() => {
        if (!reportSnapshot) return [];
        return resolveCharts(reportSnapshot);
    }, [reportSnapshot]);

    const handleGenerateReport = () => {
        if (!draftFilters.startDate || !draftFilters.endDate) {
            toast.error('Select both start and end dates');
            return;
        }

        if (
            new Date(`${draftFilters.startDate}T00:00:00`) >
            new Date(`${draftFilters.endDate}T23:59:59`)
        ) {
            toast.error('Start date cannot be after end date');
            return;
        }

        setAppliedFilters(draftFilters);
    };

    const handleExportExcel = useCallback(() => {
        if (!reportSnapshot) return;
        try {
            exportSnapshotExcel(reportSnapshot);
            toast.success(
                `Excel exported for “${reportSnapshot.reportLabel}” — each sheet matches this report only.`,
            );
        } catch {
            toast.error('Export failed');
        }
    }, [reportSnapshot]);

    const handleExportPdf = useCallback(() => {
        if (!reportSnapshot) return;
        try {
            exportSnapshotPdf(reportSnapshot);
            toast.success('PDF downloaded with charts and tables');
        } catch (error) {
            const message =
                error instanceof Error ? error.message : 'Export failed';
            toast.error(message);
        }
    }, [reportSnapshot]);

    const handlePdfPreview = useCallback(() => {
        if (!reportSnapshot) return;
        try {
            previewSnapshotPdf(reportSnapshot);
            toast.success('PDF opened in a new tab');
        } catch (error) {
            const message =
                error instanceof Error ? error.message : 'Could not open PDF';
            toast.error(message);
        }
    }, [reportSnapshot]);

    return (
        <PageWrapper className="print-report-root lg:px-0 lg:py-0" permissions={[PERMISSIONS.VIEW_MEMBERSHIP_REPORTS]}>
            <style>{`
                @media print {
                    .no-print {
                        display: none !important;
                    }

                    .print-only {
                        display: block !important;
                    }

                    html,
                    body {
                        background: #fff !important;
                        margin: 0 !important;
                        padding: 0 !important;
                    }

                    .print-report-root .sticky {
                        position: static !important;
                        top: auto !important;
                    }

                    .print-report-root button,
                    .print-report-root input,
                    .print-report-root select,
                    .print-report-root textarea,
                    .print-report-root [class*='debug'],
                    .print-report-root [data-radix-popper-content-wrapper],
                    .print-report-root .lucide {
                        display: none !important;
                    }

                    nextjs-portal,
                    [data-nextjs-dev-tools-button],
                    [data-nextjs-toast],
                    [data-nextjs-dialog-overlay],
                    [data-next-badge-root] {
                        display: none !important;
                    }

                    .print-report-root main {
                        min-height: auto !important;
                    }

                    .print-report-root .overflow-x-auto {
                        overflow: visible !important;
                        max-width: none !important;
                    }

                    .print-report-root table {
                        width: 100% !important;
                        min-width: 0 !important;
                        table-layout: auto !important;
                    }

                    .print-report-root th,
                    .print-report-root td {
                        white-space: normal !important;
                        word-break: break-word !important;
                    }

                    .print-report-root section {
                        break-inside: auto;
                        page-break-inside: auto;
                    }

                    .print-report-root tr {
                        break-inside: avoid;
                        page-break-inside: avoid;
                    }

                    @page {
                        margin: 12mm;
                    }
                }
            `}</style>
            <div className="no-print">
                <Header isOpen={menuOpen} setIsOpen={setMenuOpen} />
            </div>
            <main className="min-h-screen bg-gray-50 print:bg-white">
                <div className="no-print">
                    <PageHeader>
                        <PageHeadertitle
                            title="Membership Reports"
                            subtitle={
                                activeReport
                                    ? activeReport.description
                                    : 'Choose a report type and generate filtered results.'
                            }
                        />
                        <div className="ml-auto flex items-center gap-2">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="outline"
                                        disabled={
                                            loading || !hasGeneratedReport
                                        }
                                    >
                                        <FileSpreadsheet className="h-4 w-4" />
                                        Export
                                        <ChevronDown className="h-4 w-4 opacity-60" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                        onClick={handleExportExcel}
                                    >
                                        <FileSpreadsheet className="h-4 w-4" />
                                        Excel (.xlsx) — {activeReport?.label}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={handleExportPdf}>
                                        <FileText className="h-4 w-4" />
                                        Download PDF
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={handlePdfPreview}
                                    >
                                        <FileText className="h-4 w-4" />
                                        Open PDF preview
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </PageHeader>
                </div>

                <div className="print-only hidden px-6 pt-4">
                    <h1 className="text-xl font-semibold text-black">
                        Membership Reports
                    </h1>
                    <p className="text-sm text-gray-600">
                        {hasGeneratedReport && appliedFilters
                            ? `${formatDate(appliedFilters.startDate)} - ${formatDate(appliedFilters.endDate)}`
                            : 'Generated report'}
                    </p>
                </div>

                <div className="p-4 lg:p-8 space-y-6">
                    <section className="no-print rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
                        <div className="mb-5">
                            <div className="mb-3 flex items-center gap-2 text-base font-semibold text-[#667085]">
                                <BarChart3 className="h-4 w-4" />
                                Report type
                            </div>
                            <Select
                                value={activeReportType}
                                onValueChange={(value) =>
                                    setActiveReportType(
                                        value as MembershipReportType,
                                    )
                                }
                            >
                                <SelectTrigger className="w-full max-w-md">
                                    <SelectValue placeholder="Choose report" />
                                </SelectTrigger>
                                <SelectContent>
                                    {REPORT_GROUPS.map((group) => (
                                        <div key={group}>
                                            <div className="px-2 py-1.5 text-xs font-semibold text-gray-500">
                                                {group}
                                            </div>
                                            {REPORT_CATALOG.filter(
                                                (r) => r.group === group,
                                            ).map((report) => (
                                                <SelectItem
                                                    key={report.value}
                                                    value={report.value}
                                                >
                                                    {report.label}
                                                </SelectItem>
                                            ))}
                                        </div>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="mt-2 text-sm text-gray-600">
                                {activeReport.description}
                            </p>
                            <p className="mt-2 rounded-md border border-sky-100 bg-sky-50 px-3 py-2 text-xs text-sky-900">
                                <span className="font-semibold">
                                    Best for:{' '}
                                </span>
                                {activeReport.insight}
                            </p>
                        </div>

                        <div className="mb-4 flex items-center gap-2 text-base font-semibold text-[#667085]">
                            <Filter className="h-4 w-4" />
                            Filters for {activeReport?.label || 'Report'}
                        </div>
                        <div className="flex flex-wrap items-center gap-4">
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-[#1F0702]">
                                    Start date
                                </span>
                                <Input
                                    type="date"
                                    value={draftFilters.startDate}
                                    onChange={(event) =>
                                        setDraftFilters((prev) => ({
                                            ...prev,
                                            startDate: event.target.value,
                                        }))
                                    }
                                    className="w-[160px]"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-[#1F0702]">
                                    End date
                                </span>
                                <Input
                                    type="date"
                                    value={draftFilters.endDate}
                                    onChange={(event) =>
                                        setDraftFilters((prev) => ({
                                            ...prev,
                                            endDate: event.target.value,
                                        }))
                                    }
                                    className="w-[160px]"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-[#1F0702]">
                                    Plan
                                </span>
                                <Select
                                    value={draftFilters.plan}
                                    onValueChange={(value) =>
                                        setDraftFilters((prev) => ({
                                            ...prev,
                                            plan: value,
                                        }))
                                    }
                                >
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="All plans" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            All plans
                                        </SelectItem>
                                        {planOptions.map((plan) => (
                                            <SelectItem
                                                key={plan.value}
                                                value={plan.value}
                                            >
                                                {plan.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-[#1F0702]">
                                    Status
                                </span>
                                <Select
                                    value={draftFilters.status}
                                    onValueChange={(value) =>
                                        setDraftFilters((prev) => ({
                                            ...prev,
                                            status: value as ReportStatus,
                                        }))
                                    }
                                >
                                    <SelectTrigger className="w-[170px]">
                                        <SelectValue placeholder="All statuses" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All</SelectItem>
                                        <SelectItem value="active">
                                            Active
                                        </SelectItem>
                                        <SelectItem value="expired">
                                            Expired
                                        </SelectItem>
                                        <SelectItem value="suspended">
                                            Suspended
                                        </SelectItem>
                                        <SelectItem value="inactive">
                                            Inactive
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-[#1F0702]">
                                    Member type
                                </span>
                                <Select
                                    value={draftFilters.memberType}
                                    onValueChange={(value) =>
                                        setDraftFilters((prev) => ({
                                            ...prev,
                                            memberType:
                                                value as ReportMemberType,
                                        }))
                                    }
                                >
                                    <SelectTrigger className="w-[170px]">
                                        <SelectValue placeholder="All members" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            All members
                                        </SelectItem>
                                        <SelectItem value="new">
                                            New members
                                        </SelectItem>
                                        <SelectItem value="old">
                                            Old members
                                        </SelectItem>
                                        <SelectItem value="prospective">
                                            Prospective
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-[#1F0702]">
                                    Search
                                </span>
                                <Input
                                    value={draftFilters.search}
                                    onChange={(event) =>
                                        setDraftFilters((prev) => ({
                                            ...prev,
                                            search: event.target.value,
                                        }))
                                    }
                                    placeholder="Name, phone, ID"
                                    className="w-[200px]"
                                />
                            </div>
                            <Button
                                onClick={handleGenerateReport}
                                disabled={loading}
                                className="bg-orion-blue hover:bg-orion-blue"
                            >
                                <Search className="h-4 w-4" />
                                Generate Report
                            </Button>
                        </div>
                        {hasPendingFilterChanges && (
                            <p className="mt-3 text-xs font-medium text-orange-600">
                                Filters changed. Generate report to refresh the
                                results.
                            </p>
                        )}
                    </section>

                    {loading ? (
                        <div className="flex justify-center rounded-lg border border-gray-200 bg-white py-16 text-gray-500">
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Preparing reports...
                        </div>
                    ) : !hasGeneratedReport ? (
                        <div className="rounded-lg border border-dashed border-gray-300 bg-white py-16 text-center">
                            <BarChart3 className="mx-auto mb-3 h-10 w-10 text-gray-300" />
                            <p className="text-sm font-medium text-gray-900">
                                Generate {activeReport?.label || 'a'} report
                            </p>
                            <p className="mt-1 text-xs text-gray-500">
                                Choose the report type and filters, then click
                                Generate Report.
                            </p>
                        </div>
                    ) : (
                        <>
                            <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm print:break-inside-avoid">
                                <h2 className="text-base font-semibold text-gray-900 mb-1">
                                    Visual summary
                                </h2>
                                <p className="text-xs text-gray-500 mb-4">
                                    Charts reflect your current filters. Use
                                    Download PDF or Open PDF preview for a
                                    native PDF (not a browser HTML printout).
                                </p>
                                <MembershipReportCharts charts={chartBundle} />
                            </section>

                            {showsReportSection(
                                activeReportType,
                                'memberSpend',
                            ) && (
                                <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm print:shadow-none print:break-inside-avoid">
                                    <div className="mb-6 flex flex-col gap-1">
                                        <div className="flex items-center gap-2">
                                            <TrendingUp className="h-5 w-5 text-orion-blue" />
                                            <h2 className="text-lg font-semibold text-gray-900">
                                                Member spend & visits
                                            </h2>
                                        </div>
                                        <p className="text-sm text-gray-500">
                                            Per-member spend and visit depth —
                                            export/print this view for account
                                            managers, not plan totals.
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                        <ReportKpi
                                            label="Members in report"
                                            value={filteredMembers.length}
                                        />
                                        <ReportKpi
                                            label="Total member spend"
                                            value={memberValueReport.totalSpend}
                                            isCurrency
                                        />
                                        <ReportKpi
                                            label="Average spend/member"
                                            value={memberValueReport.avgSpend}
                                            isCurrency
                                        />
                                        <ReportKpi
                                            label="Inactive-risk members"
                                            value={
                                                memberValueReport.inactiveRisk
                                                    .length
                                            }
                                        />
                                    </div>

                                    <div className="overflow-x-auto rounded-lg border border-gray-100">
                                        <table className="w-full min-w-[720px] border-collapse">
                                            <thead>
                                                <tr className="bg-[#F4F4F4]">
                                                    <th className="text-left py-3 px-3 text-sm font-semibold text-[#0A0A0A]">
                                                        Member
                                                    </th>
                                                    <th className="text-left py-3 px-3 text-sm font-semibold text-[#0A0A0A]">
                                                        Plan
                                                    </th>
                                                    <th className="text-right py-3 px-3 text-sm font-semibold text-[#0A0A0A]">
                                                        Spend
                                                    </th>
                                                    <th className="text-right py-3 px-3 text-sm font-semibold text-[#0A0A0A]">
                                                        Visits
                                                    </th>
                                                    <th className="text-left py-3 px-3 text-sm font-semibold text-[#0A0A0A]">
                                                        Last visit
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {memberValueReport.topMembers
                                                    .length === 0 ? (
                                                    <EmptyRows label="No member spend data for the selected filters." />
                                                ) : (
                                                    memberValueReport.topMembers.map(
                                                        (member) => (
                                                            <tr
                                                                key={member.id}
                                                                className="border-b border-gray-100 hover:bg-gray-50"
                                                            >
                                                                <td className="py-3 px-3 text-sm text-[#7B7878]">
                                                                    {
                                                                        member.firstName
                                                                    }{' '}
                                                                    {
                                                                        member.lastName
                                                                    }
                                                                </td>
                                                                <td className="py-3 px-3 text-sm text-[#7B7878]">
                                                                    {member.plan
                                                                        ?.name ||
                                                                        'No plan'}
                                                                </td>
                                                                <td className="py-3 px-3 text-right text-sm text-[#7B7878]">
                                                                    {formatCurrency(
                                                                        toNumber(
                                                                            member.totalSpend,
                                                                        ),
                                                                    )}
                                                                </td>
                                                                <td className="py-3 px-3 text-right text-sm text-[#7B7878]">
                                                                    {toNumber(
                                                                        member.totalVisits,
                                                                    ).toLocaleString()}
                                                                </td>
                                                                <td className="py-3 px-3 text-sm text-[#7B7878]">
                                                                    {formatDate(
                                                                        member.lastVisitDate,
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        ),
                                                    )
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </section>
                            )}

                            {showsReportSection(
                                activeReportType,
                                'planRevenue',
                            ) && (
                                <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm print:shadow-none print:break-inside-avoid">
                                    <div className="mb-6 flex flex-col gap-1">
                                        <div className="flex items-center gap-2">
                                            <BarChart3 className="h-5 w-5 text-orion-blue" />
                                            <h2 className="text-lg font-semibold text-gray-900">
                                                Plan revenue
                                            </h2>
                                        </div>
                                        <p className="text-sm text-gray-500">
                                            Plan-level totals — print or export
                                            this when you need finance or sales
                                            insight, not individual member rows.
                                        </p>
                                    </div>
                                    <div className="overflow-x-auto rounded-lg border border-gray-100">
                                        <table className="w-full min-w-[520px] border-collapse">
                                            <thead>
                                                <tr className="bg-[#F4F4F4]">
                                                    <th className="text-left py-3 px-3 text-sm font-semibold text-[#0A0A0A]">
                                                        Plan
                                                    </th>
                                                    <th className="text-right py-3 px-3 text-sm font-semibold text-[#0A0A0A]">
                                                        Members
                                                    </th>
                                                    <th className="text-right py-3 px-3 text-sm font-semibold text-[#0A0A0A]">
                                                        Spend
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {memberValueReport.planRevenue
                                                    .length === 0 ? (
                                                    <EmptyRows label="No plan revenue data for the selected filters." />
                                                ) : (
                                                    memberValueReport.planRevenue.map(
                                                        (plan) => (
                                                            <tr
                                                                key={plan.plan}
                                                                className="border-b border-gray-100 hover:bg-gray-50"
                                                            >
                                                                <td className="py-3 px-3 text-sm text-[#7B7878]">
                                                                    {plan.plan}
                                                                </td>
                                                                <td className="py-3 px-3 text-right text-sm text-[#7B7878]">
                                                                    {plan.members.toLocaleString()}
                                                                </td>
                                                                <td className="py-3 px-3 text-right text-sm text-[#7B7878]">
                                                                    {formatCurrency(
                                                                        plan.spend,
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        ),
                                                    )
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </section>
                            )}

                            {showsReportSection(
                                activeReportType,
                                'memberDirectory',
                            ) && (
                                <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm print:shadow-none print:break-inside-avoid">
                                    <div className="mb-6 flex flex-col gap-1">
                                        <div className="flex items-center gap-2">
                                            <Users className="h-5 w-5 text-orion-blue" />
                                            <h2 className="text-lg font-semibold text-gray-900">
                                                Member Directory & Renewal
                                                Report
                                            </h2>
                                        </div>
                                        <p className="text-sm text-gray-500">
                                            Export-ready member status, renewal
                                            dates, and prospective/new/old
                                            member classification.
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                        <ReportKpi
                                            label="All filtered members"
                                            value={filteredMembers.length}
                                        />
                                        <ReportKpi
                                            label="Expired members"
                                            value={renewalReport.expired.length}
                                        />
                                        <ReportKpi
                                            label="Renewals due 30 days"
                                            value={renewalReport.dueSoon.length}
                                        />
                                        <ReportKpi
                                            label="Prospective members"
                                            value={
                                                filteredMembers.filter(
                                                    (member) =>
                                                        getMemberType(
                                                            member,
                                                        ) === 'prospective',
                                                ).length
                                            }
                                        />
                                    </div>

                                    <div className="overflow-x-auto rounded-lg border border-gray-100">
                                        <table className="w-full min-w-[980px] border-collapse">
                                            <thead>
                                                <tr className="bg-[#F4F4F4]">
                                                    <th className="text-left py-3 px-3 text-sm font-semibold text-[#0A0A0A]">
                                                        Member
                                                    </th>
                                                    <th className="text-left py-3 px-3 text-sm font-semibold text-[#0A0A0A]">
                                                        Membership ID
                                                    </th>
                                                    <th className="text-left py-3 px-3 text-sm font-semibold text-[#0A0A0A]">
                                                        Plan
                                                    </th>
                                                    <th className="text-left py-3 px-3 text-sm font-semibold text-[#0A0A0A]">
                                                        Status
                                                    </th>
                                                    <th className="text-left py-3 px-3 text-sm font-semibold text-[#0A0A0A]">
                                                        Type
                                                    </th>
                                                    <th className="text-left py-3 px-3 text-sm font-semibold text-[#0A0A0A]">
                                                        Renewal date
                                                    </th>
                                                    <th className="text-right py-3 px-3 text-sm font-semibold text-[#0A0A0A]">
                                                        Days left
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredMembers.length ===
                                                0 ? (
                                                    <EmptyRows label="No member directory data for the selected filters." />
                                                ) : (
                                                    filteredMembers
                                                        .slice(0, 50)
                                                        .map((member) => (
                                                            <tr
                                                                key={member.id}
                                                                className="border-b border-gray-100 hover:bg-gray-50"
                                                            >
                                                                <td className="py-3 px-3 text-sm text-[#7B7878]">
                                                                    {
                                                                        member.firstName
                                                                    }{' '}
                                                                    {
                                                                        member.lastName
                                                                    }
                                                                </td>
                                                                <td className="py-3 px-3 text-sm text-[#7B7878]">
                                                                    {member.membershipId ||
                                                                        member.id}
                                                                </td>
                                                                <td className="py-3 px-3 text-sm text-[#7B7878]">
                                                                    {member.plan
                                                                        ?.name ||
                                                                        'No plan'}
                                                                </td>
                                                                <td className="py-3 px-3 text-sm text-[#7B7878]">
                                                                    {
                                                                        member.status
                                                                    }
                                                                </td>
                                                                <td className="py-3 px-3 text-sm text-[#7B7878]">
                                                                    {getMemberType(
                                                                        member,
                                                                    )}
                                                                </td>
                                                                <td className="py-3 px-3 text-sm text-[#7B7878]">
                                                                    {formatDate(
                                                                        member.endDate,
                                                                    )}
                                                                </td>
                                                                <td className="py-3 px-3 text-right text-sm text-[#7B7878]">
                                                                    {daysUntil(
                                                                        member.endDate,
                                                                    ) ?? 'N/A'}
                                                                </td>
                                                            </tr>
                                                        ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                    {filteredMembers.length > 50 && (
                                        <p className="mt-3 text-xs text-gray-500">
                                            Showing first 50 rows here. Excel
                                            export includes all filtered member
                                            rows.
                                        </p>
                                    )}
                                </section>
                            )}

                            {showsReportSection(
                                activeReportType,
                                'renewalsExpired',
                            ) && (
                                <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm print:shadow-none print:break-inside-avoid">
                                    <div className="mb-4">
                                        <h2 className="text-lg font-semibold text-gray-900">
                                            Expired members
                                        </h2>
                                        <p className="text-sm text-gray-500">
                                            Win-back list — export/print only
                                            these rows for lapsed campaigns.
                                        </p>
                                    </div>
                                    <div className="overflow-x-auto rounded-lg border border-gray-100">
                                        <table className="w-full min-w-[640px] border-collapse">
                                            <thead>
                                                <tr className="bg-[#F4F4F4]">
                                                    <th className="text-left py-3 px-3 text-sm font-semibold">
                                                        Member
                                                    </th>
                                                    <th className="text-left py-3 px-3 text-sm font-semibold">
                                                        Plan
                                                    </th>
                                                    <th className="text-left py-3 px-3 text-sm font-semibold">
                                                        End date
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {renewalReport.expired
                                                    .length === 0 ? (
                                                    <EmptyRows label="No expired members in this filter set." />
                                                ) : (
                                                    renewalReport.expired.map(
                                                        (member) => (
                                                            <tr
                                                                key={member.id}
                                                                className="border-b border-gray-100"
                                                            >
                                                                <td className="py-3 px-3 text-sm text-[#7B7878]">
                                                                    {
                                                                        member.firstName
                                                                    }{' '}
                                                                    {
                                                                        member.lastName
                                                                    }
                                                                </td>
                                                                <td className="py-3 px-3 text-sm text-[#7B7878]">
                                                                    {member.plan
                                                                        ?.name ||
                                                                        'No plan'}
                                                                </td>
                                                                <td className="py-3 px-3 text-sm text-[#7B7878]">
                                                                    {formatDate(
                                                                        member.endDate,
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        ),
                                                    )
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </section>
                            )}

                            {showsReportSection(
                                activeReportType,
                                'renewalsDue',
                            ) && (
                                <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm print:shadow-none print:break-inside-avoid">
                                    <div className="mb-4">
                                        <h2 className="text-lg font-semibold text-gray-900">
                                            Renewals due (30 days)
                                        </h2>
                                        <p className="text-sm text-gray-500">
                                            Proactive outreach list before
                                            membership lapses.
                                        </p>
                                    </div>
                                    <div className="overflow-x-auto rounded-lg border border-gray-100">
                                        <table className="w-full min-w-[640px] border-collapse">
                                            <thead>
                                                <tr className="bg-[#F4F4F4]">
                                                    <th className="text-left py-3 px-3 text-sm font-semibold">
                                                        Member
                                                    </th>
                                                    <th className="text-left py-3 px-3 text-sm font-semibold">
                                                        Plan
                                                    </th>
                                                    <th className="text-right py-3 px-3 text-sm font-semibold">
                                                        Days left
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {renewalReport.dueSoon
                                                    .length === 0 ? (
                                                    <EmptyRows label="No renewals due in the next 30 days." />
                                                ) : (
                                                    renewalReport.dueSoon.map(
                                                        (member) => (
                                                            <tr
                                                                key={member.id}
                                                                className="border-b border-gray-100"
                                                            >
                                                                <td className="py-3 px-3 text-sm text-[#7B7878]">
                                                                    {
                                                                        member.firstName
                                                                    }{' '}
                                                                    {
                                                                        member.lastName
                                                                    }
                                                                </td>
                                                                <td className="py-3 px-3 text-sm text-[#7B7878]">
                                                                    {member.plan
                                                                        ?.name ||
                                                                        'No plan'}
                                                                </td>
                                                                <td className="py-3 px-3 text-right text-sm text-[#7B7878]">
                                                                    {daysUntil(
                                                                        member.endDate,
                                                                    ) ?? 'N/A'}
                                                                </td>
                                                            </tr>
                                                        ),
                                                    )
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </section>
                            )}

                            {showsReportSection(
                                activeReportType,
                                'notifications',
                            ) && (
                                <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm print:shadow-none print:break-inside-avoid">
                                    <div className="mb-6 flex flex-col gap-1">
                                        <div className="flex items-center gap-2">
                                            <FileSpreadsheet className="h-5 w-5 text-orion-blue" />
                                            <h2 className="text-lg font-semibold text-gray-900">
                                                Notification & Activity Audit
                                            </h2>
                                        </div>
                                        <p className="text-sm text-gray-500">
                                            Renewal, birthday, welcome,
                                            check-in, and booking notification
                                            attempts captured for the report
                                            period.
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                        <ReportKpi
                                            label="Notification rows"
                                            value={
                                                filteredNotificationLogs.length
                                            }
                                        />
                                        <ReportKpi
                                            label="Successful"
                                            value={
                                                filteredNotificationLogs.filter(
                                                    (log) => log.success,
                                                ).length
                                            }
                                        />
                                        <ReportKpi
                                            label="Failed"
                                            value={
                                                filteredNotificationLogs.filter(
                                                    (log) => !log.success,
                                                ).length
                                            }
                                        />
                                        <ReportKpi
                                            label="Birthday notices"
                                            value={
                                                filteredNotificationLogs.filter(
                                                    (log) =>
                                                        log.type === 'birthday',
                                                ).length
                                            }
                                        />
                                    </div>

                                    <div className="overflow-x-auto rounded-lg border border-gray-100">
                                        <table className="w-full min-w-[860px] border-collapse">
                                            <thead>
                                                <tr className="bg-[#F4F4F4]">
                                                    <th className="text-left py-3 px-3 text-sm font-semibold text-[#0A0A0A]">
                                                        Type
                                                    </th>
                                                    <th className="text-left py-3 px-3 text-sm font-semibold text-[#0A0A0A]">
                                                        Member
                                                    </th>
                                                    <th className="text-left py-3 px-3 text-sm font-semibold text-[#0A0A0A]">
                                                        Email
                                                    </th>
                                                    <th className="text-left py-3 px-3 text-sm font-semibold text-[#0A0A0A]">
                                                        Date
                                                    </th>
                                                    <th className="text-left py-3 px-3 text-sm font-semibold text-[#0A0A0A]">
                                                        Result
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredNotificationLogs.length ===
                                                0 ? (
                                                    <EmptyRows label="No notification activity for the selected filters." />
                                                ) : (
                                                    filteredNotificationLogs
                                                        .slice(0, 25)
                                                        .map((log) => (
                                                            <tr
                                                                key={log.id}
                                                                className="border-b border-gray-100 hover:bg-gray-50"
                                                            >
                                                                <td className="py-3 px-3 text-sm text-[#7B7878]">
                                                                    {log.type}
                                                                </td>
                                                                <td className="py-3 px-3 text-sm text-[#7B7878]">
                                                                    {`${log.member?.firstName || ''} ${log.member?.lastName || ''}`.trim() ||
                                                                        'N/A'}
                                                                </td>
                                                                <td className="py-3 px-3 text-sm text-[#7B7878]">
                                                                    {log.email}
                                                                </td>
                                                                <td className="py-3 px-3 text-sm text-[#7B7878]">
                                                                    {formatDate(
                                                                        log.notificationDate,
                                                                    )}
                                                                </td>
                                                                <td className="py-3 px-3 text-sm text-[#7B7878]">
                                                                    {log.success
                                                                        ? 'Success'
                                                                        : 'Failed'}
                                                                </td>
                                                            </tr>
                                                        ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                    {filteredNotificationLogs.length > 25 && (
                                        <p className="mt-3 text-xs text-gray-500">
                                            Showing first 25 rows here. Excel
                                            export includes all notification
                                            audit rows.
                                        </p>
                                    )}
                                </section>
                            )}

                            {showsReportSection(
                                activeReportType,
                                'facilityUsage',
                            ) && (
                                <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm print:shadow-none print:break-inside-avoid">
                                    <div className="mb-6 flex flex-col gap-1">
                                        <div className="flex items-center gap-2">
                                            <BarChart3 className="h-5 w-5 text-orion-blue" />
                                            <h2 className="text-lg font-semibold text-gray-900">
                                                Facility usage
                                            </h2>
                                        </div>
                                        <p className="text-sm text-gray-500">
                                            Aggregated bookings and fees per
                                            facility — ops and capacity view.
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                        <ReportKpi
                                            label="Bookings in period"
                                            value={filteredBookings.length}
                                        />
                                        <ReportKpi
                                            label="Estimated booking fees"
                                            value={facilityReport.reduce(
                                                (sum, facility) =>
                                                    sum + facility.revenue,
                                                0,
                                            )}
                                            isCurrency
                                        />
                                        <ReportKpi
                                            label="Facilities used"
                                            value={facilityReport.length}
                                        />
                                        <ReportKpi
                                            label="Checked in today"
                                            value={checkedInMembers.length}
                                        />
                                    </div>

                                    <div className="overflow-x-auto rounded-lg border border-gray-100">
                                        <table className="w-full min-w-[760px] border-collapse">
                                            <thead>
                                                <tr className="bg-[#F4F4F4]">
                                                    <th className="text-left py-3 px-3 text-sm font-semibold text-[#0A0A0A]">
                                                        Facility
                                                    </th>
                                                    <th className="text-right py-3 px-3 text-sm font-semibold text-[#0A0A0A]">
                                                        Bookings
                                                    </th>
                                                    <th className="text-right py-3 px-3 text-sm font-semibold text-[#0A0A0A]">
                                                        Est. fees
                                                    </th>
                                                    <th className="text-right py-3 px-3 text-sm font-semibold text-[#0A0A0A]">
                                                        Confirmed
                                                    </th>
                                                    <th className="text-right py-3 px-3 text-sm font-semibold text-[#0A0A0A]">
                                                        Cancelled
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {facilityReport.length === 0 ? (
                                                    <EmptyRows label="No facility usage data for the selected filters." />
                                                ) : (
                                                    facilityReport.map(
                                                        (facility) => (
                                                            <tr
                                                                key={
                                                                    facility.facility
                                                                }
                                                                className="border-b border-gray-100 hover:bg-gray-50"
                                                            >
                                                                <td className="py-3 px-3 text-sm text-[#7B7878]">
                                                                    {
                                                                        facility.facility
                                                                    }
                                                                </td>
                                                                <td className="py-3 px-3 text-right text-sm text-[#7B7878]">
                                                                    {facility.bookings.toLocaleString()}
                                                                </td>
                                                                <td className="py-3 px-3 text-right text-sm text-[#7B7878]">
                                                                    {formatCurrency(
                                                                        facility.revenue,
                                                                    )}
                                                                </td>
                                                                <td className="py-3 px-3 text-right text-sm text-[#7B7878]">
                                                                    {facility.confirmed.toLocaleString()}
                                                                </td>
                                                                <td className="py-3 px-3 text-right text-sm text-[#7B7878]">
                                                                    {facility.cancelled.toLocaleString()}
                                                                </td>
                                                            </tr>
                                                        ),
                                                    )
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </section>
                            )}

                            {showsReportSection(
                                activeReportType,
                                'bookings',
                            ) && (
                                <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm print:shadow-none print:break-inside-avoid">
                                    <div className="mb-4">
                                        <h2 className="text-lg font-semibold text-gray-900">
                                            Bookings list
                                        </h2>
                                        <p className="text-sm text-gray-500">
                                            One row per reservation —
                                            member-level detail for
                                            reconciliation.
                                        </p>
                                    </div>
                                    <div className="overflow-x-auto rounded-lg border border-gray-100">
                                        <table className="w-full min-w-[800px] border-collapse text-sm">
                                            <thead>
                                                <tr className="bg-[#F4F4F4]">
                                                    <th className="py-3 px-3 text-left font-semibold">
                                                        Member
                                                    </th>
                                                    <th className="py-3 px-3 text-left font-semibold">
                                                        Facility
                                                    </th>
                                                    <th className="py-3 px-3 text-left font-semibold">
                                                        Status
                                                    </th>
                                                    <th className="py-3 px-3 text-left font-semibold">
                                                        Start
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredBookings.length ===
                                                0 ? (
                                                    <EmptyRows label="No bookings in this period." />
                                                ) : (
                                                    filteredBookings
                                                        .slice(0, 50)
                                                        .map((booking) => (
                                                            <tr
                                                                key={booking.id}
                                                                className="border-b border-gray-100"
                                                            >
                                                                <td className="py-3 px-3 text-[#7B7878]">
                                                                    {`${booking.member?.firstName || ''} ${booking.member?.lastName || ''}`.trim()}
                                                                </td>
                                                                <td className="py-3 px-3 text-[#7B7878]">
                                                                    {booking
                                                                        .facility
                                                                        ?.name ||
                                                                        '—'}
                                                                </td>
                                                                <td className="py-3 px-3 text-[#7B7878]">
                                                                    {
                                                                        booking.status
                                                                    }
                                                                </td>
                                                                <td className="py-3 px-3 text-[#7B7878]">
                                                                    {formatDate(
                                                                        booking.startTime,
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </section>
                            )}

                            {showsReportSection(
                                activeReportType,
                                'checkIns',
                            ) && (
                                <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm print:shadow-none print:break-inside-avoid">
                                    <div className="mb-4">
                                        <h2 className="text-lg font-semibold text-gray-900">
                                            Today&apos;s check-ins
                                        </h2>
                                        <p className="text-sm text-gray-500">
                                            Who is on property now —
                                            front-of-house snapshot.
                                        </p>
                                    </div>
                                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                        {checkedInMembers.length === 0 ? (
                                            <p className="text-sm text-gray-500">
                                                No check-ins recorded today.
                                            </p>
                                        ) : (
                                            checkedInMembers.map((member) => (
                                                <div
                                                    key={member.id}
                                                    className="rounded-md border border-gray-200 bg-gray-50 p-3"
                                                >
                                                    <p className="font-medium text-gray-900">
                                                        {member.firstName}{' '}
                                                        {member.lastName}
                                                    </p>
                                                    <p className="mt-1 text-xs text-gray-500">
                                                        {member.latestVisit
                                                            ?.facility ||
                                                            'Facility not recorded'}
                                                    </p>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </section>
                            )}
                        </>
                    )}
                </div>
            </main>
        </PageWrapper>
    );
}
