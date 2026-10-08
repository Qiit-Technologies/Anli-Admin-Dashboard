'use client';

import {
    emailNightAuditReport,
    getNightAuditReport,
} from '@/app/actions/guest';
import { getRoomTypesByHotelId } from '@/app/actions/roomType';
import { getStaffByDepartment } from '@/app/actions/staff';
import BrandButton from '@/components/common/Button';
import PageWrapper from '@/components/common/PageWrapper';
import EmptyReportState from '@/components/front-office/night-audit-report/EmptyReportState';
import Header from '@/components/front-office/night-audit-report/Header';
import NightAuditReportContent from '@/components/front-office/night-audit-report/NightAuditReportContent';
import ReportFilters, {
    ReportFiltersState,
} from '@/components/front-office/night-audit-report/ReportFilters';
import ReportFooter from '@/components/front-office/night-audit-report/ReportFooter';
import { NightAuditReportData } from '@/components/front-office/night-audit-report/types';
import { downloadData } from '@/lib/downloadData';
import { formatCurrency } from '@/lib/utils';
import { Mail } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface SelectOption {
    value: string;
    label: string;
}

const NightAuditReports = () => {
    const [filters, setFilters] = useState<ReportFiltersState>({
        businessDate: new Date(),
        staffOnShift: 'all',
        roomType: '',
        reportTypes: ['occupancy'],
    });

    const [reportData, setReportData] = useState<NightAuditReportData | null>(
        null,
    );
    const [isLoading, setIsLoading] = useState(false);
    const [reportGeneratedAt, setReportGeneratedAt] = useState<Date | null>(
        null,
    );
    const [createdBy, setCreatedBy] = useState<string>('');
    const [staffOptions, setStaffOptions] = useState<SelectOption[]>([]);
    const [roomTypeOptions, setRoomTypeOptions] = useState<SelectOption[]>([]);
    const [sendingEmail, setSendingEmail] = useState(false);

    const formatLongDate = (d: Date) =>
        d.toLocaleDateString(undefined, {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
        });

    useEffect(() => {
        const fetchOptions = async () => {
            try {
                const staffResult = await getStaffByDepartment('frontoffice');
                if (staffResult?.data) {
                    setStaffOptions(
                        staffResult.data.map(
                            (staff: { id: number; fullName: string }) => ({
                                value: staff.id.toString(),
                                label: staff.fullName || 'Unknown Staff',
                            }),
                        ),
                    );
                }

                const roomTypesResult = await getRoomTypesByHotelId();
                if (
                    typeof roomTypesResult === 'object' &&
                    'data' in roomTypesResult &&
                    roomTypesResult.data
                ) {
                    setRoomTypeOptions(
                        roomTypesResult.data.map(
                            (rt: { id: number; name: string }) => ({
                                value: rt.id.toString(),
                                label: rt.name || 'Unknown Type',
                            }),
                        ),
                    );
                }
            } catch (error: any) {
                console.error('Error fetching filter options:', error);
            }
        };

        fetchOptions();
    }, []);

    const handleGenerateReport = async () => {
        if (filters.businessDate) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const businessDate = new Date(filters.businessDate);
            businessDate.setHours(0, 0, 0, 0);
            if (businessDate > today) {
                toast.error('Cannot generate report for a future date');
                return;
            }
        }

        setIsLoading(true);

        try {
            const selectedStaff = staffOptions.find(
                (o) => o.value === filters.staffOnShift,
            );
            const staffOnShiftName =
                filters.staffOnShift &&
                filters.staffOnShift !== 'all' &&
                selectedStaff
                    ? selectedStaff.label
                    : undefined;

            const result = await getNightAuditReport({
                businessDate: filters.businessDate,
                staffOnShift: staffOnShiftName,
                roomTypeId: filters.roomType
                    ? Number(filters.roomType)
                    : undefined,
            });

            if (result.error) {
                toast.error(result.error);
                setIsLoading(false);
                return;
            }

            if (result.data) {
                setReportData(result.data as NightAuditReportData);
                setReportGeneratedAt(new Date(result.data.generatedAt));
                setCreatedBy(result.data.generatedBy || 'System');
            }
        } catch (error: any) {
            console.error('Error generating report:', error);
            toast.error('Failed to generate report. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendEmail = async () => {
        if (!reportData) {
            toast.error('Please generate a report first');
            return;
        }
        const businessDate = filters.businessDate ?? new Date();
        try {
            setSendingEmail(true);
            const result = await emailNightAuditReport(businessDate);
            if (result.error) {
                toast.error(result.error);
            } else {
                const recipients =
                    result.data?.recipients ?? result.data?.resolvedRecipients;
                const count = Array.isArray(recipients) ? recipients.length : null;
                toast.success(
                    count
                        ? `Night audit email sent to ${count} recipient(s).`
                        : 'Night audit email sent.',
                );
            }
        } catch (err: any) {
            toast.error(err?.message || 'Failed to send night audit email.');
        } finally {
            setSendingEmail(false);
        }
    };

    const handleExportExcel = () => {
        if (!reportData) {
            toast.error('Please generate a report first');
            return;
        }

        const businessDateStr = filters.businessDate
            ? formatLongDate(filters.businessDate)
            : 'Unknown Date';
        const filename = `Night-Audit-Report-${businessDateStr}`;

        const sheets: Record<string, any[]> = {};

        if (reportData.stats) {
            sheets['Occupancy Summary'] = [
                {
                    Metric: 'Total Rooms in Property',
                    Value: reportData.stats.totalRoomsInProperty,
                },
                {
                    Metric: 'Rooms Available Today',
                    Value: reportData.stats.roomsAvailableToday,
                },
                { Metric: 'Rooms Sold', Value: reportData.stats.roomsSold },
                {
                    Metric: 'Complimentary / House Use',
                    Value: reportData.stats.complimentaryHouseUse,
                },
                { Metric: 'No-Shows', Value: reportData.stats.noShows },
                {
                    Metric: 'Early Checkouts',
                    Value: reportData.stats.earlyCheckouts,
                },
                { Metric: 'Occupancy %', Value: reportData.stats.occupancy },
            ];
        }

        if (reportData.stayingOverGuests?.length) {
            sheets['Staying Over Guests'] = reportData.stayingOverGuests.map(
                (g, idx) => ({
                    'S/N': idx + 1,
                    Room: g.room,
                    'Guest Name': g.guestName,
                    Arrival: g.arrivalDate,
                    Departure: g.departureDate,
                    Nights: g.noNights,
                    Pax: g.pax,
                    Source: g.source,
                    'Res No': g.resNo,
                    'Folio No': g.folioNo,
                    'Total (₦)': g.total,
                    'Paid (₦)': g.paid,
                    'Balance (₦)': g.balance,
                }),
            );
        }

        if (reportData.departingGuests?.length) {
            sheets['Departing Guests'] = reportData.departingGuests.map(
                (g, idx) => ({
                    'S/N': idx + 1,
                    Room: g.room,
                    'Guest Name': g.guestName,
                    Arrival: g.arrivalDate,
                    Departure: g.departureDate,
                    Nights: g.noNights,
                    Pax: g.pax,
                    Source: g.source,
                    'Res No': g.resNo,
                }),
            );
        }

        if (reportData.roomRevenue?.length) {
            sheets['Room Revenue'] = reportData.roomRevenue.map((r, idx) => ({
                'S/N': idx + 1,
                Room: r.room,
                Nights: r.noNights,
                'Rate (₦)': r.rate,
                'Amount (₦)': r.amount,
                'Payment Mode': r.paymentMode,
                Status: r.status,
            }));
        }

        if (reportData.foodBeverageCharges?.length) {
            sheets['Food & Beverage'] = reportData.foodBeverageCharges.map(
                (f, idx) => ({
                    'S/N': idx + 1,
                    Source: f.source,
                    Item: f.item,
                    Qty: f.quantity,
                    'Amount (₦)': f.amount,
                    'Payment Mode': f.paymentMode,
                    Paid: f.paid,
                }),
            );
        }

        if (reportData.roomServices?.length) {
            sheets['Room Services'] = reportData.roomServices.map((s, idx) => ({
                'S/N': idx + 1,
                Room: s.room,
                Service: s.service,
                Qty: s.quantity,
                'Amount (₦)': s.amount,
                Paid: s.paid,
            }));
        }

        if (reportData.paymentSummary?.length) {
            sheets['Payment Summary'] = reportData.paymentSummary.map((p) => ({
                'Payment Method': p.paymentMethod,
                'Amount (₦)': p.amount,
            }));
        }

        if (reportData.revenueSummary?.length) {
            sheets['Revenue Summary'] = reportData.revenueSummary.map((r) => ({
                Description: r.description,
                'Amount (₦)': r.amount,
            }));
        }

        if (reportData.outstandingCredits?.length) {
            sheets['Outstanding Credits'] = reportData.outstandingCredits.map(
                (o) => ({
                    Category: o.description,
                    Value: o.value,
                }),
            );
        }

        const firstSheetData =
            Object.values(sheets).find((arr) => arr.length > 0) || [];
        downloadData(firstSheetData, 'xlsx', filename);
        toast.success('Report exported to Excel');
    };

    const handlePrint = () => {
        if (!reportData) {
            toast.error('Please generate a report first');
            return;
        }

        const businessDateStr = filters.businessDate
            ? formatLongDate(filters.businessDate)
            : 'Unknown Date';

        const win = window.open('', '_blank');
        if (!win) {
            toast.error('Could not open print window. Please allow popups.');
            return;
        }

        const generateTableHtml = (
            title: string,
            headers: string[],
            rows: string[][],
        ) => {
            if (rows.length === 0) return '';
            return `
                <div class="section">
                    <h3>${title}</h3>
                    <table>
                        <thead>
                            <tr>${headers.map((h) => `<th>${h}</th>`).join('')}</tr>
                        </thead>
                        <tbody>
                            ${rows.map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join('')}</tr>`).join('')}
                        </tbody>
                    </table>
                </div>
            `;
        };

        let sectionsHtml = '';

        if (reportData.stats) {
            sectionsHtml += `
                <div class="section">
                    <h3>Occupancy Summary</h3>
                    <div class="stats-grid">
                        <div class="stat-item"><span>Total Rooms</span><strong>${reportData.stats.totalRoomsInProperty}</strong></div>
                        <div class="stat-item"><span>Available</span><strong>${reportData.stats.roomsAvailableToday}</strong></div>
                        <div class="stat-item"><span>Sold</span><strong>${reportData.stats.roomsSold}</strong></div>
                        <div class="stat-item"><span>Complimentary</span><strong>${reportData.stats.complimentaryHouseUse}</strong></div>
                        <div class="stat-item"><span>No-Shows</span><strong>${reportData.stats.noShows}</strong></div>
                        <div class="stat-item"><span>Early Checkouts</span><strong>${reportData.stats.earlyCheckouts}</strong></div>
                        <div class="stat-item"><span>Occupancy</span><strong>${reportData.stats.occupancy}</strong></div>
                    </div>
                </div>
            `;
        }

        if (reportData.stayingOverGuests?.length) {
            sectionsHtml += generateTableHtml(
                'Staying-Over Guests',
                [
                    'Room',
                    'Guest',
                    'Arrival',
                    'Departure',
                    'Nights',
                    'Pax',
                    'Source',
                    'Total',
                    'Paid',
                    'Balance',
                ],
                reportData.stayingOverGuests.map((g) => [
                    g.room,
                    g.guestName,
                    g.arrivalDate,
                    g.departureDate,
                    String(g.noNights),
                    g.pax,
                    g.source,
                    formatCurrency(g.total),
                    formatCurrency(g.paid),
                    formatCurrency(g.balance),
                ]),
            );
        }

        if (reportData.departingGuests?.length) {
            sectionsHtml += generateTableHtml(
                'Departing Guests',
                [
                    'Room',
                    'Guest',
                    'Arrival',
                    'Departure',
                    'Nights',
                    'Pax',
                    'Source',
                    'Res No',
                ],
                reportData.departingGuests.map((g) => [
                    g.room,
                    g.guestName,
                    g.arrivalDate,
                    g.departureDate,
                    String(g.noNights),
                    g.pax,
                    g.source,
                    g.resNo,
                ]),
            );
        }

        if (reportData.roomRevenue?.length) {
            sectionsHtml += generateTableHtml(
                'Room Revenue',
                ['Room', 'Nights', 'Rate', 'Amount', 'Payment Mode', 'Status'],
                reportData.roomRevenue.map((r) => [
                    r.room,
                    String(r.noNights),
                    formatCurrency(r.rate),
                    formatCurrency(r.amount),
                    r.paymentMode,
                    r.status,
                ]),
            );
        }

        if (reportData.foodBeverageCharges?.length) {
            sectionsHtml += generateTableHtml(
                'Food & Beverage Charges',
                ['Source', 'Item', 'Qty', 'Amount', 'Payment Mode', 'Paid'],
                reportData.foodBeverageCharges.map((f) => [
                    f.source,
                    f.item,
                    String(f.quantity),
                    formatCurrency(f.amount),
                    f.paymentMode,
                    f.paid,
                ]),
            );
        }

        if (reportData.roomServices?.length) {
            sectionsHtml += generateTableHtml(
                'Room Services',
                ['Room', 'Service', 'Qty', 'Amount', 'Paid'],
                reportData.roomServices.map((s) => [
                    s.room,
                    s.service,
                    String(s.quantity),
                    formatCurrency(s.amount),
                    s.paid,
                ]),
            );
        }

        if (reportData.paymentSummary?.length) {
            sectionsHtml += generateTableHtml(
                'Payment Summary',
                ['Payment Method', 'Amount'],
                reportData.paymentSummary.map((p) => [
                    p.paymentMethod,
                    formatCurrency(p.amount),
                ]),
            );
        }

        if (reportData.discountsVoids?.length) {
            sectionsHtml += generateTableHtml(
                'Discounts, Voids & Complimentary',
                ['Type', 'Count', 'Amount'],
                reportData.discountsVoids.map((d) => [
                    d.type,
                    String(d.count),
                    formatCurrency(d.amount),
                ]),
            );
        }

        if (reportData.revenueSummary?.length) {
            sectionsHtml += generateTableHtml(
                'Revenue Summary',
                ['Description', 'Amount'],
                reportData.revenueSummary.map((r) => [
                    r.description,
                    formatCurrency(r.amount),
                ]),
            );
        }

        if (reportData.outstandingCredits?.length) {
            sectionsHtml += generateTableHtml(
                'Outstanding & Credit Control',
                ['Category', 'Value'],
                reportData.outstandingCredits.map((o) => [
                    o.description,
                    String(o.value),
                ]),
            );
        }

        const html = `
            <!doctype html>
            <html>
            <head>
                <meta charset="utf-8" />
                <title>Night Audit Report - ${businessDateStr}</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 1000px; margin: 0 auto; }
                    h1 { margin: 0 0 6px 0; font-size: 24px; text-align: center; }
                    h3 { margin: 20px 0 10px 0; font-size: 16px; color: #444; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
                    .meta { text-align: center; margin-bottom: 20px; color: #666; font-size: 13px; }
                    .section { margin-bottom: 20px; }
                    table { width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 8px; }
                    th, td { border: 1px solid #ddd; padding: 6px 8px; text-align: left; }
                    th { background: #f8f8f8; font-weight: 600; }
                    .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
                    .stat-item { background: #f9fafb; border: 1px solid #eee; padding: 10px; border-radius: 6px; text-align: center; }
                    .stat-item span { display: block; font-size: 11px; color: #666; }
                    .stat-item strong { display: block; font-size: 18px; margin-top: 4px; }
                    .footer { margin-top: 30px; font-size: 11px; color: #777; text-align: center; border-top: 1px solid #ddd; padding-top: 10px; }
                    @media print {
                        body { padding: 0; }
                        .no-print { display: none; }
                    }
                </style>
            </head>
            <body>
                <h1>Night Audit Report</h1>
                <div class="meta">
                    <div>Business Date: ${businessDateStr}</div>
                    <div>Generated By: ${createdBy} | Generated At: ${reportGeneratedAt ? formatLongDate(reportGeneratedAt) : 'N/A'}</div>
                </div>
                ${sectionsHtml}
                <div class="footer">
                    <div>Report ID: NA-${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}-001</div>
                    <div>System Timezone: WAT (UTC+1)</div>
                </div>
                <script>
                    window.onload = function() {
                        window.print();
                    };
                </script>
            </body>
            </html>
        `;

        win.document.write(html);
        win.document.close();
        win.focus();
    };

    const hasData = reportData && reportData.stats;

    return (
        <>
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                    <Header />
                </div>
                <div className="pt-4 pr-4">
                    <BrandButton
                        onClick={handleSendEmail}
                        loading={sendingEmail}
                        disabled={!reportData || sendingEmail}
                        icon={<Mail size={16} />}
                        iconPosition="left"
                    >
                        Send Night Audit Email
                    </BrandButton>
                </div>
            </div>
            <PageWrapper className="flex flex-col min-h-full">
                <div className="mb-6">
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

                <hr className="-mt-4" />

                <div className="min-h-[400px] flex-1">
                    {isLoading ? (
                        <NightAuditReportContent
                            data={null}
                            loading={true}
                            visibleReportTypes={filters.reportTypes}
                        />
                    ) : hasData ? (
                        <NightAuditReportContent
                            data={reportData}
                            loading={false}
                            visibleReportTypes={filters.reportTypes}
                            headerInfo={{
                                generatedBy: createdBy,
                                businessDate: filters.businessDate
                                    ? filters.businessDate.toLocaleDateString(
                                          'en-GB',
                                          {
                                              day: '2-digit',
                                              month: 'short',
                                              year: 'numeric',
                                          },
                                      )
                                    : undefined,
                                auditCompletedAt: reportGeneratedAt
                                    ? reportGeneratedAt.toLocaleString(
                                          'en-GB',
                                          {
                                              day: '2-digit',
                                              month: 'short',
                                              year: 'numeric',
                                              hour: '2-digit',
                                              minute: '2-digit',
                                              hour12: true,
                                          },
                                      )
                                    : undefined,
                                outlet: 'Best Café',
                                staffOnShift:
                                    filters.staffOnShift === 'all' ||
                                    !filters.staffOnShift
                                        ? 'All staff'
                                        : (staffOptions.find(
                                              (o) =>
                                                  o.value ===
                                                  filters.staffOnShift,
                                          )?.label ?? filters.staffOnShift),
                                reportId: `NA-${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}-001`,
                                systemTimezone: 'WAT (UTC+1)',
                            }}
                        />
                    ) : (
                        <EmptyReportState
                            title="No results found"
                            description="Select a timeframe and click Generate to see item sales."
                        />
                    )}
                </div>
                {reportGeneratedAt && (
                    <ReportFooter generatedAt={reportGeneratedAt} />
                )}
            </PageWrapper>
        </>
    );
};

export default NightAuditReports;
