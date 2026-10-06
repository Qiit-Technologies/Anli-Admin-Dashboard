'use client';

import { getArrivalReport } from '@/app/actions/guest';
import { getRoomTypesByHotelId } from '@/app/actions/roomType';
import { getStaffByDepartment } from '@/app/actions/staff';
import PageWrapper from '@/components/common/PageWrapper';
import ArrivalReportContent from '@/components/front-office/arrival-report/ArrivalReportContent';
import EmptyReportState from '@/components/front-office/arrival-report/EmptyReportState';
import Header from '@/components/front-office/arrival-report/Header';
import ReportFilters from '@/components/front-office/arrival-report/ReportFilters';
import ReportFooter from '@/components/front-office/arrival-report/ReportFooter';
import {
    ArrivalReportData,
    ArrivalReportFiltersState,
} from '@/components/front-office/arrival-report/types';
import { useUser } from '@/context/useUser';
import { downloadData } from '@/lib/downloadData';
import { format } from 'date-fns';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

const formatAccountTypeLabel = (role: string) =>
    role.replace(/[_-]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

const ArrivalReport = () => {
    const { user } = useUser();
    const [filters, setFilters] = useState<ArrivalReportFiltersState>({
        startDate: new Date(),
        startTime: '12:00 PM',
        endDate: new Date(),
        endTime: '12:00 PM',
        staff: 'all',
        roomType: 'all',
    });

    const [reportData, setReportData] = useState<ArrivalReportData | null>(
        null,
    );
    const [isLoading, setIsLoading] = useState(false);
    const [reportGeneratedAt, setReportGeneratedAt] = useState<Date | null>(
        null,
    );
    const [staffOptions, setStaffOptions] = useState<
        { value: string; label: string }[]
    >([]);
    const [roomTypeOptions, setRoomTypeOptions] = useState<
        { value: string; label: string }[]
    >([]);

    useEffect(() => {
        const load = async () => {
            try {
                const staffResult = await getStaffByDepartment('frontoffice');
                if (staffResult?.data) {
                    setStaffOptions(
                        staffResult.data.map(
                            (s: { id: number; fullName?: string }) => ({
                                value: String(s.id),
                                label: s.fullName ?? `Staff ${s.id}`,
                            }),
                        ),
                    );
                }
                const rtResult = await getRoomTypesByHotelId();
                if (
                    typeof rtResult === 'object' &&
                    'data' in rtResult &&
                    rtResult.data
                ) {
                    setRoomTypeOptions(
                        rtResult.data.map(
                            (rt: { id: number; name: string }) => ({
                                value: String(rt.id),
                                label: rt.name ?? `Type ${rt.id}`,
                            }),
                        ),
                    );
                }
            } catch {
                toast.error('Failed to load filter options');
            }
        };
        load();
    }, []);

    const handleGenerateReport = async () => {
        setIsLoading(true);
        try {
            const dateFrom = filters.startDate
                ? format(filters.startDate, 'yyyy-MM-dd')
                : undefined;
            const dateTo = filters.endDate
                ? format(filters.endDate, 'yyyy-MM-dd')
                : undefined;
            const result = await getArrivalReport({
                dateFrom,
                dateTo,
                roomTypeId:
                    filters.roomType && filters.roomType !== 'all'
                        ? Number(filters.roomType)
                        : undefined,
                staffId:
                    filters.staff && filters.staff !== 'all'
                        ? Number(filters.staff)
                        : undefined,
            });

            if (result.error) {
                toast.error(result.error);
                return;
            }

            if (result.data) {
                setReportData(result.data as ArrivalReportData);
                setReportGeneratedAt(new Date());
                toast.success('Report generated successfully');
            }
        } catch {
            toast.error('Failed to generate report');
        } finally {
            setIsLoading(false);
        }
    };

    const handleExportExcel = () => {
        if (!reportData?.arrivals.length) {
            toast.error('Generate a report first');
            return;
        }
        const rows = reportData.arrivals.map((a) => ({
            'Res. No': a.resNo,
            'Guest Name': a.guestName,
            Room: a.room,
            Rate: a.rate,
            'Arrival Date': a.arrivalDate,
            'Arrival Time': a.arrivalTime,
            'Departure Date': a.departureDate,
            Staff: a.staff,
        }));
        const from = filters.startDate
            ? format(filters.startDate, 'yyyy-MM-dd')
            : '';
        const to = filters.endDate ? format(filters.endDate, 'yyyy-MM-dd') : '';
        downloadData(rows, 'xlsx', `Arrival Report (${from} - ${to})`);
    };

    const handlePrint = () => {
        window.print();
    };

    const hasData = reportData && reportData.arrivals.length > 0;

    const getRoomTypeLabel = (value: string) => {
        if (!value || value === 'all') return 'All Types';
        const opt = roomTypeOptions.find((o) => o.value === value);
        return opt?.label ?? value;
    };

    return (
        <>
            <div className="print:hidden">
                <Header />
            </div>
            <PageWrapper className="flex flex-col min-h-full">
                <div className="mb-6 print:hidden">
                    <ReportFilters
                        filters={filters}
                        onFiltersChange={setFilters}
                        onGenerateReport={handleGenerateReport}
                        onExportExcel={handleExportExcel}
                        onPrint={handlePrint}
                        isLoading={isLoading}
                        staffOptions={staffOptions}
                        roomTypeOptions={roomTypeOptions}
                    />
                </div>

                <hr className="-mt-4 print:hidden" />

                <div className="min-h-[400px] flex-1">
                    {isLoading ? (
                        <ArrivalReportContent data={null} loading={true} />
                    ) : hasData ? (
                        <ArrivalReportContent
                            data={reportData}
                            loading={false}
                            headerInfo={{
                                printedBy:
                                    user?.fullName ??
                                    reportData?.generatedBy ??
                                    'System',
                                accountType: user?.roles?.name
                                    ? formatAccountTypeLabel(user.roles.name)
                                    : undefined,
                                printedAt: reportGeneratedAt
                                    ? format(
                                          reportGeneratedAt,
                                          'dd MMM yyyy, hh:mm a',
                                      )
                                    : undefined,
                                reportPeriodStart: filters.startDate
                                    ? format(filters.startDate, 'dd MMM yyyy')
                                    : undefined,
                                reportPeriodEnd: filters.endDate
                                    ? format(filters.endDate, 'dd MMM yyyy')
                                    : undefined,
                                roomType: getRoomTypeLabel(filters.roomType),
                            }}
                        />
                    ) : (
                        <EmptyReportState
                            title="No results found"
                            description="Select a timeframe and click Generate to see arrivals."
                        />
                    )}
                </div>

                {reportGeneratedAt && (
                    <div className="print:hidden">
                        <ReportFooter generatedAt={reportGeneratedAt} />
                    </div>
                )}
            </PageWrapper>
        </>
    );
};

export default ArrivalReport;
