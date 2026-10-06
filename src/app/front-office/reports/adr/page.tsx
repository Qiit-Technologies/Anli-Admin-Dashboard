'use client';

import {
    getAdrContributors,
    getAdrSnapshot,
    type AdrContributorsResult,
    type AdrSnapshot,
    type GetAdrSnapshotParams,
} from '@/app/actions/guest';
import {
    HeaderActions,
    PageHeader,
    PageHeadertitle,
} from '@/components/common/layout/Header';
import PageWrapper from '@/components/common/PageWrapper';
import AdrReportContent from '@/components/front-office/adr-report/AdrReportContent';
import AdrReportFilters from '@/components/front-office/adr-report/AdrReportFilters';
import AdrRevenueSettingsTab from '@/components/front-office/adr-report/AdrRevenueSettingsTab';
import AdrWhatIfPanel from '@/components/front-office/adr-report/AdrWhatIfPanel';
import type { AdrReportFiltersState } from '@/components/front-office/adr-report/types';
import {
    formatLongDate,
    to12Hour,
    toHHMM,
    toYYYYMMDD,
} from '@/components/front-office/complimentary-report/utils';
import EmptyReportState from '@/components/front-office/night-audit-report/EmptyReportState';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUser } from '@/context/useUser';
import useRoomTypes from '@/hooks/useRoomTypes';
import { useRouter, useSearchParams } from 'next/navigation';
import type { ReactNode } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

const ADR_CONTRIBUTORS_PAGE_SIZE = 50;

function todayYmd(): string {
    return toYYYYMMDD(new Date());
}

function monthStartYmd(): string {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    return `${y}-${m}-01`;
}

export default function AdrReportPage() {
    const router = useRouter();
    const urlParams = useSearchParams();
    const { user } = useUser();
    const { roomTypes } = useRoomTypes();

    const rtFromUrl = urlParams.get('roomTypeId');
    const initialRoomTypeId: AdrReportFiltersState['roomTypeId'] =
        rtFromUrl && /^\d+$/.test(rtFromUrl) ? rtFromUrl : 'all';

    const activeTab = useMemo(() => {
        const t = urlParams.get('tab');
        if (t === 'whatif' || t === 'settings') return t;
        return 'report';
    }, [urlParams]);

    const setActiveTab = useCallback(
        (t: 'report' | 'whatif' | 'settings') => {
            const sp = new URLSearchParams(urlParams.toString());
            if (t === 'report') {
                sp.delete('tab');
            } else {
                sp.set('tab', t);
            }
            router.replace(`/front-office/reports/adr?${sp.toString()}`, {
                scroll: false,
            });
        },
        [router, urlParams],
    );

    const [filters, setFilters] = useState<AdrReportFiltersState>(() => ({
        mode: urlParams.get('from') && urlParams.get('to') ? 'range' : 'single',
        singleDate: urlParams.get('date') || todayYmd(),
        fromDate: urlParams.get('from') || todayYmd(),
        toDate: urlParams.get('to') || todayYmd(),
        includePending: urlParams.get('includePending') === 'true',
        roomTypeId: initialRoomTypeId,
        includeNoShows: urlParams.get('includeNoShows') === 'true',
        bookingSource: urlParams.get('bookingSource')?.trim() ?? '',
    }));

    const [reportData, setReportData] = useState<AdrSnapshot | null>(null);
    const [contributors, setContributors] =
        useState<AdrContributorsResult | null>(null);
    const [contributorsLoading, setContributorsLoading] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [reportGeneratedAt, setReportGeneratedAt] = useState<Date | null>(
        null,
    );
    const [pollParams, setPollParams] = useState<GetAdrSnapshotParams | null>(
        null,
    );
    const contributorsPageRef = useRef(1);

    const snapshotQueryParams = useMemo((): GetAdrSnapshotParams => {
        const base =
            filters.mode === 'range'
                ? {
                      from: filters.fromDate,
                      to: filters.toDate,
                      includePending: filters.includePending,
                  }
                : {
                      date: filters.singleDate,
                      includePending: filters.includePending,
                  };
        const roomTypeIdNum =
            filters.roomTypeId === 'all'
                ? undefined
                : Number(filters.roomTypeId);
        const isSingleCalendarDay =
            filters.mode === 'single' ||
            (filters.mode === 'range' && filters.fromDate === filters.toDate);
        const bs = filters.bookingSource.trim();
        return {
            ...base,
            ...(roomTypeIdNum != null &&
            Number.isFinite(roomTypeIdNum) &&
            roomTypeIdNum > 0
                ? { roomTypeId: roomTypeIdNum }
                : {}),
            ...(filters.includeNoShows ? { includeNoShows: true } : {}),
            ...(bs ? { bookingSource: bs } : {}),
            ...(!isSingleCalendarDay ? { enrichContext: false } : {}),
        };
    }, [filters]);

    const syncUrl = useCallback(() => {
        const sp = new URLSearchParams();
        if (filters.mode === 'range') {
            sp.set('from', filters.fromDate);
            sp.set('to', filters.toDate);
        } else {
            sp.set('date', filters.singleDate);
        }
        if (filters.includePending) sp.set('includePending', 'true');
        if (filters.includeNoShows) sp.set('includeNoShows', 'true');
        const bst = filters.bookingSource.trim();
        if (bst) sp.set('bookingSource', bst);
        if (filters.roomTypeId !== 'all') {
            sp.set('roomTypeId', filters.roomTypeId);
        }
        const t = urlParams.get('tab');
        if (t === 'whatif' || t === 'settings') {
            sp.set('tab', t);
        }
        router.replace(`/front-office/reports/adr?${sp.toString()}`, {
            scroll: false,
        });
    }, [router, filters, urlParams]);

    const reportPeriodLabel = useCallback((data: AdrSnapshot) => {
        if (data.from === data.to) {
            return formatLongDate(data.from);
        }
        return `${formatLongDate(data.from)} → ${formatLongDate(data.to)}`;
    }, []);

    const fetchContributorsPage = useCallback(
        async (page: number) => {
            const base = pollParams ?? snapshotQueryParams;
            setContributorsLoading(true);
            try {
                const cr = await getAdrContributors({
                    ...base,
                    page,
                    limit: ADR_CONTRIBUTORS_PAGE_SIZE,
                });
                if ('error' in cr) {
                    toast.error(cr.error);
                    return;
                }
                setContributors(cr.data);
                contributorsPageRef.current = cr.data.page;
            } catch {
                toast.error('Failed to load contributing stays');
            } finally {
                setContributorsLoading(false);
            }
        },
        [pollParams, snapshotQueryParams],
    );

    const handleMonthToDate = useCallback(() => {
        setFilters((prev) => ({
            ...prev,
            mode: 'range',
            fromDate: monthStartYmd(),
            toDate: todayYmd(),
        }));
    }, []);

    useEffect(() => {
        if (!pollParams) return undefined;
        const tick = async () => {
            const page = contributorsPageRef.current;
            const [snap, cont] = await Promise.all([
                getAdrSnapshot(pollParams),
                getAdrContributors({
                    ...pollParams,
                    page,
                    limit: ADR_CONTRIBUTORS_PAGE_SIZE,
                }),
            ]);
            if ('data' in snap) setReportData(snap.data);
            if ('data' in cont) setContributors(cont.data);
        };
        const id = setInterval(tick, 5000);
        return () => clearInterval(id);
    }, [pollParams]);

    const handleGenerateReport = async () => {
        setIsLoading(true);
        setContributors(null);
        setPollParams(null);
        contributorsPageRef.current = 1;
        try {
            const result = await getAdrSnapshot(snapshotQueryParams);
            if ('error' in result) {
                toast.error(result.error);
                setReportData(null);
                setContributors(null);
                return;
            }
            setReportData(result.data);
            setReportGeneratedAt(new Date());
            setPollParams({ ...snapshotQueryParams });
            syncUrl();
            toast.success('Report generated successfully');

            const cr = await getAdrContributors({
                ...snapshotQueryParams,
                page: 1,
                limit: ADR_CONTRIBUTORS_PAGE_SIZE,
            });
            if ('error' in cr) {
                toast.error(cr.error);
                setContributors(null);
            } else {
                setContributors(cr.data);
                contributorsPageRef.current = cr.data.page;
            }
        } catch {
            toast.error('Failed to generate report');
            setReportData(null);
            setContributors(null);
            setPollParams(null);
        } finally {
            setIsLoading(false);
        }
    };

    const handleExportExcel = () => {
        if (!reportData) return;
        const dayRows = reportData.byDay.map((row) => ({
            Date: row.date,
            'Guest-nights': row.roomsSoldNights,
            'Occupancy %':
                reportData.context?.sellableRoomCount &&
                reportData.context.sellableRoomCount > 0
                    ? (
                          (row.roomsSoldNights /
                              reportData.context.sellableRoomCount) *
                          100
                      ).toFixed(1) + '%'
                    : '0%',
            'Room revenue': row.totalRoomRevenue,
            ADR: row.adr,
            RevPAR:
                reportData.context?.sellableRoomCount &&
                reportData.context.sellableRoomCount > 0
                    ? row.totalRoomRevenue /
                      reportData.context.sellableRoomCount
                    : 0,
        }));
        dayRows.push({
            Date: 'Blended (period)',
            'Guest-nights': reportData.roomsSoldNights,
            'Occupancy %':
                reportData.context?.sellableRoomCount &&
                reportData.context.sellableRoomCount > 0
                    ? (
                          (reportData.roomsSoldNights /
                              (reportData.context.sellableRoomCount *
                                  (reportData.byDay.length || 1))) *
                          100
                      ).toFixed(1) + '%'
                    : '0%',
            'Room revenue': reportData.totalRoomRevenue,
            ADR: reportData.adr,
            RevPAR:
                reportData.context?.sellableRoomCount &&
                reportData.context.sellableRoomCount > 0
                    ? reportData.totalRoomRevenue /
                      reportData.context.sellableRoomCount
                    : 0,
        });
        const period =
            filters.mode === 'range'
                ? `${filters.fromDate}_${filters.toDate}`
                : filters.singleDate;

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(
            wb,
            XLSX.utils.json_to_sheet(dayRows),
            'ADR daily',
        );
        if (contributors?.items?.length) {
            const contribRows = contributors.items.map((row) => ({
                Booking: row.bookingCode ?? '',
                Guest: row.guestName ?? '',
                Room: row.roomNumber ?? '',
                'Room type': row.roomTypeName ?? '',
                Status: row.bookingStatus,
                'Guest-nights': row.guestNights,
                'Room revenue': row.roomRevenue,
            }));
            XLSX.utils.book_append_sheet(
                wb,
                XLSX.utils.json_to_sheet(contribRows),
                'Contributing stays',
            );
        }
        XLSX.writeFile(wb, `ADR-report-${period}.xlsx`, { bookType: 'xlsx' });
    };

    const handlePrint = () => {
        if (!reportData) return;
        const win = window.open('', '_blank');
        if (!win) return;

        const title = 'Yield Performance Report (Occupancy, ADR & RevPAR)';
        const period = reportPeriodLabel(reportData);
        const generatedBy = user?.fullName ?? 'System';
        const printedAt = new Date().toLocaleString();

        const sellableCount =
            reportData.sellableRoomCount ??
            reportData.context?.sellableRoomCount ??
            0;

        const tableRows = reportData.byDay
            .map((row) => {
                const rowRevpar =
                    sellableCount > 0
                        ? row.totalRoomRevenue / sellableCount
                        : 0;
                const rowOccupancy =
                    sellableCount > 0
                        ? (row.roomsSoldNights / sellableCount) * 100
                        : 0;
                return `
                    <tr>
                        <td>${row.date}</td>
                        <td class="right">${row.roomsSoldNights}</td>
                        <td class="right">${rowOccupancy.toFixed(1)}%</td>
                        <td class="right">${row.totalRoomRevenue.toFixed(2)}</td>
                        <td class="right">${row.adr.toFixed(2)}</td>
                        <td class="right">${rowRevpar.toFixed(2)}</td>
                    </tr>`;
            })
            .join('');

        const ctx = reportData.context;
        const blendedRevpar =
            sellableCount > 0
                ? reportData.totalRoomRevenue / sellableCount
                : 0;
        const blendedOccupancy =
            sellableCount > 0
                ? (reportData.roomsSoldNights /
                      (sellableCount * (reportData.byDay.length || 1))) *
                  100
                : 0;

        const contextHtml = ctx
            ? `<p class="summary"><strong>Context (${reportData.from})</strong><br />
            Sellable rooms: ${ctx.sellableRoomCount} · Guest-nights: ${ctx.dayGuestNights}
            ${ctx.occupancyPercent != null ? ` · Occupancy ≈ ${ctx.occupancyPercent}%` : ''}
            ${ctx.priorDayAdr != null ? ` · Prior day ADR: ${Number(ctx.priorDayAdr).toFixed(2)} (${ctx.vsPriorDayPercent != null ? `${ctx.vsPriorDayPercent > 0 ? '+' : ''}${ctx.vsPriorDayPercent}%` : 'n/a'})` : ''}
            · Suggested min rate: ${Number(ctx.suggestedMinRate).toFixed(2)}
            </p>`
            : '';

        const contribTable =
            contributors && contributors.items.length > 0
                ? `<h2 style="font-size:14px;margin-top:24px;">Contributing stays (page ${contributors.page})</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Booking</th><th>Guest</th><th>Room</th><th>Type</th><th>Status</th>
                            <th class="right">Nights</th><th class="right">Revenue</th>
                        </tr>
                    </thead>
                    <tbody>
                    ${contributors.items
                        .map(
                            (r) => `<tr>
                        <td>${r.bookingCode ?? '—'}</td>
                        <td>${(r.guestName ?? '—').replace(/</g, '&lt;')}</td>
                        <td>${r.roomNumber ?? '—'}</td>
                        <td>${r.roomTypeName ?? '—'}</td>
                        <td>${r.bookingStatus}</td>
                        <td class="right">${r.guestNights}</td>
                        <td class="right">${r.roomRevenue.toFixed(2)}</td>
                    </tr>`,
                        )
                        .join('')}
                    </tbody>
                </table>
                <p class="summary">Total stays in period: ${contributors.total}. Export to Excel for full paginated extract.</p>`
                : '';

        const html = `
            <!doctype html>
            <html>
            <head>
                <meta charset="utf-8" />
                <title>${title}</title>
                <style>
                    body { font-family: 'Inter', sans-serif; padding: 40px; color: #1a1a1a; margin: auto; max-width: 100%; }
                    .header { text-align: center; margin-bottom: 30px; }
                    .header h1 { margin: 0; font-size: 20px; color: #000; }
                    .header p { margin: 5px 0; color: #666; font-size: 13px; }
                    table { width: 100%; border-collapse: collapse; margin-bottom: 10px; font-size: 11px; }
                    th, td { padding: 8px 6px; border-bottom: 1px solid #eee; text-align: left; }
                    th.right, td.right { text-align: right; }
                    th { color: #555; text-transform: uppercase; font-size: 9px; letter-spacing: 0.5px; border-bottom: 2px solid #333; }
                    .summary { margin-top: 16px; font-size: 12px; color: #444; }
                    @media print { body { padding: 0; } }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>${title}</h1>
                    <p>Report period: ${period}</p>
                    <p>Printed at: ${printedAt} · Printed by: ${generatedBy}.</p>
                    <p>Blended Occupancy: ${blendedOccupancy.toFixed(1)}% · Blended ADR: ${reportData.adr.toFixed(2)} · Blended RevPAR: ${blendedRevpar.toFixed(2)} · Total guest-nights: ${reportData.roomsSoldNights} · Total room revenue: ${reportData.totalRoomRevenue.toFixed(2)}</p>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th class="right">Guest-nights</th>
                            <th class="right">Occupancy %</th>
                            <th class="right">Room revenue</th>
                            <th class="right">ADR</th>
                            <th class="right">RevPAR</th>
                        </tr>
                    </thead>
                    <tbody>${tableRows}</tbody>
                </table>
                ${contextHtml}
                <p class="summary">${reportData.definition}</p>
                ${contribTable}
                <script>window.onload = () => { window.print(); window.close(); };</script>
            </body>
            </html>
        `;
        win.document.write(html);
        win.document.close();
    };

    const headerInfo =
        reportData && reportGeneratedAt
            ? {
                  hotelName: user?.orgName ?? '',
                  printedAt: `${formatLongDate(reportGeneratedAt.toISOString().slice(0, 10))}, ${to12Hour(toHHMM(reportGeneratedAt))}`,
                  reportPeriod: reportPeriodLabel(reportData),
                  generatedBy: user?.fullName ?? 'System',
              }
            : undefined;

    let reportBody: ReactNode;
    if (isLoading) {
        reportBody = <AdrReportContent data={null} loading />;
    } else if (reportData) {
        reportBody = (
            <AdrReportContent
                data={reportData}
                loading={false}
                headerInfo={headerInfo}
                contributors={contributors}
                contributorsLoading={contributorsLoading}
                onContributorsPageChange={fetchContributorsPage}
            />
        );
    } else {
        reportBody = (
            <EmptyReportState
                title="Nothing loaded yet"
                description="Choose dates and filters above, then click Generate report. Open the What-if tab to try a hypothetical rate against ADR without saving anything."
            />
        );
    }

    return (
        <div className="flex flex-col h-full overflow-auto bg-[#F8F9FC]">
            <PageHeader>
                <PageHeadertitle
                    title="Occupancy, ADR & RevPAR"
                    subtitle="Actual Occupancy, ADR & RevPAR reports, what-if calculator"
                />
                <HeaderActions />
            </PageHeader>
            <PageWrapper>
                <Tabs
                    value={activeTab}
                    onValueChange={(v) =>
                        setActiveTab(v as 'report' | 'whatif' | 'settings')
                    }
                    className="mt-3 w-full max-w-6xl mx-auto"
                >
                    <TabsList className="mx-auto w-fit">
                        <TabsTrigger value="report">Report</TabsTrigger>
                        <TabsTrigger value="whatif">What-if</TabsTrigger>
                        <TabsTrigger value="settings">Settings</TabsTrigger>
                    </TabsList>

                    <TabsContent value="report" className="mt-4">
                        <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 text-center sm:text-left">
                            <p className="font-medium text-slate-900">
                                This tab is actual performance
                            </p>
                            <p className="mt-1 text-slate-700">
                                Numbers reflect what already happened (or is on
                                the books) for the nights you pick. Use{' '}
                                <strong>What-if</strong> for a hypothetical rate
                                calculator — it does not save anything.
                            </p>
                        </div>

                        <div className="mt-6">
                            <AdrReportFilters
                                filters={filters}
                                onFiltersChange={setFilters}
                                onGenerateReport={handleGenerateReport}
                                onExportExcel={handleExportExcel}
                                onPrint={handlePrint}
                                isLoading={isLoading}
                                hasReportData={!!reportData}
                                roomTypes={roomTypes}
                                onMonthToDate={handleMonthToDate}
                                liveRefreshActive={!!pollParams}
                            />
                        </div>

                        <div className="min-h-[400px] mt-8">{reportBody}</div>
                    </TabsContent>

                    <TabsContent
                        value="whatif"
                        className="mt-4 max-w-6xl mx-auto w-full px-2"
                    >
                        <AdrWhatIfPanel variant="full" />
                    </TabsContent>

                    <TabsContent
                        value="settings"
                        className="mt-4 max-w-6xl mx-auto w-full px-2"
                    >
                        <AdrRevenueSettingsTab />
                    </TabsContent>
                </Tabs>
            </PageWrapper>
        </div>
    );
}
