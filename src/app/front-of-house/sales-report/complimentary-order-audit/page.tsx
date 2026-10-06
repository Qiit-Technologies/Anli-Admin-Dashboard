'use client';

import { getComplimentOrderHistory } from '@/app/actions/order';
import { getStaffList } from '@/app/actions/staff';
import { getDineInAreas } from '@/app/actions/back-of-house';
import { getMenus } from '@/app/actions/menu';
import { PageHeader, PageHeadertitle } from '@/components/common/layout/Header';
import PageWrapper from '@/components/common/PageWrapper';
import { PERMISSIONS } from '@/components/permission/data/permissions';
import ComplimentaryOrderFilters, {
    ComplimentaryOrderFiltersState,
} from '@/components/front-of-house/report/complimentory-order/ComplimentaryOrderFilters';
import ComplimentaryOrderReportContent from '@/components/front-of-house/report/complimentory-order/ComplimentaryOrderReportContent';
import EmptyReportState from '@/components/front-office/night-audit-report/EmptyReportState';
import ReportFooter from '@/components/front-office/night-audit-report/ReportFooter';
import { downloadData } from '@/lib/downloadData';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Staff } from '@/types/staff.types';
import { useUser } from '@/context/useUser';
import useHotel from '@/hooks/useHotel';

interface SelectOption {
    value: string;
    label: string;
}

/** Local calendar date as YYYY-MM-DD (avoids UTC shift from toISOString). */
const toYYYYMMDD = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
};

const DEFAULT_START_TIME = '06:00';
const DEFAULT_END_TIME = '18:00';

const isWaiterRole = (roleName?: string) => {
    const name = roleName?.toLowerCase() ?? '';
    return name.includes('waiter') || name.includes('waitress');
};

const isCashierRole = (roleName?: string) => {
    const name = roleName?.toLowerCase() ?? '';
    return name.includes('cashier');
};

const OrderHistoryPage = () => {
    const { user } = useUser();
    const { organization } = useHotel();

    const [filters, setFilters] = useState<ComplimentaryOrderFiltersState>({
        startDate: toYYYYMMDD(new Date()),
        startTime: DEFAULT_START_TIME,
        endDate: toYYYYMMDD(new Date()),
        endTime: DEFAULT_END_TIME,
        outlet: 'all',
        orderType: 'all',
        approvedById: 'all',
        cashierId: 'all',
        menuType: 'all',
        waiterId: 'all',
        minAmount: '',
        maxAmount: '',
    });

    const [reportData, setReportData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [reportGeneratedAt, setReportGeneratedAt] = useState<Date | null>(
        null,
    );
    const [waiterOptions, setWaiterOptions] = useState<SelectOption[]>([]);
    const [cashierOptions, setCashierOptions] = useState<SelectOption[]>([]);
    const [outletOptions, setOutletOptions] = useState<SelectOption[]>([]);
    const [menuTypeOptions, setMenuTypeOptions] = useState<SelectOption[]>([]);

    const approverOptions = useMemo<SelectOption[]>(() => {
        const allowed =
            organization?.complimentarySettings?.allowedApprovers ?? [];
        return allowed.map((staff: Staff) => ({
            value: staff.id.toString(),
            label: staff.fullName || 'Unknown Staff',
        }));
    }, [organization?.complimentarySettings?.allowedApprovers]);

    const findLabel = (options: SelectOption[], value: string) =>
        options.find((option) => option.value === value)?.label;

    useEffect(() => {
        const fetchFilterOptions = async () => {
            try {
                const [staffRes, dineAreasRes, menusRes] = await Promise.all([
                    getStaffList(1, 1000),
                    getDineInAreas(),
                    getMenus(),
                ]);

                if (staffRes?.data) {
                    const staffList = staffRes.data as Staff[];
                    setWaiterOptions(
                        staffList
                            .filter((staff) => isWaiterRole(staff.roles?.name))
                            .map((staff) => ({
                                value: staff.id.toString(),
                                label: staff.fullName || 'Unknown Staff',
                            })),
                    );
                    setCashierOptions(
                        staffList
                            .filter((staff) => isCashierRole(staff.roles?.name))
                            .map((staff) => ({
                                value: staff.id.toString(),
                                label: staff.fullName || 'Unknown Staff',
                            })),
                    );
                }

                if (dineAreasRes?.data) {
                    setOutletOptions(
                        (dineAreasRes.data as { id: number; name: string }[]).map(
                            (area) => ({
                                value: String(area.id),
                                label: area.name,
                            }),
                        ),
                    );
                }

                if (menusRes?.data) {
                    const menus = Array.isArray(menusRes.data)
                        ? menusRes.data
                        : [];
                    setMenuTypeOptions(
                        menus.map((menu: { id: number; name: string }) => ({
                            value: String(menu.id),
                            label: menu.name,
                        })),
                    );
                }
            } catch (err) {
                console.error('Error fetching complementary report filters:', err);
            }
        };
        fetchFilterOptions();
    }, []);

    const handleGenerateReport = async () => {
        setIsLoading(true);

        try {
            const orderType =
                filters.orderType === 'all' ? '' : filters.orderType;
            const waiterId = filters.waiterId === 'all' ? '' : filters.waiterId;
            const approvedById =
                filters.approvedById === 'all' ? '' : filters.approvedById;
            const cashierId =
                filters.cashierId === 'all' ? '' : filters.cashierId;
            const outletId = filters.outlet === 'all' ? '' : filters.outlet;
            const menuId = filters.menuType === 'all' ? '' : filters.menuType;

            const queryParams = `?orderType=${orderType}&minAmount=${filters.minAmount}&maxAmount=${filters.maxAmount}&waiterId=${waiterId}&approvedById=${approvedById}&cashierId=${cashierId}&outletId=${outletId}&menuId=${menuId}&startDate=${filters.startDate}&startTime=${filters.startTime}&endDate=${filters.endDate}&endTime=${filters.endTime}`;

            const result = await getComplimentOrderHistory(queryParams);

            if (result?.data?.orderHistory) {
                const orderHistory = result.data.orderHistory;

                const breakdownByApproverMap = new Map();
                const sectionCounts = new Map<string, number>();
                let partialValue = 0;
                let fullValue = 0;

                orderHistory.forEach((order: any) => {
                    const key = order.approvedBy || 'Unknown';
                    const compValue =
                        Number(order.complimentaryValue ?? order.amount) || 0;

                    if (!breakdownByApproverMap.has(key)) {
                        breakdownByApproverMap.set(key, {
                            approvedBy: key,
                            noOfOrders: 0,
                            amount: 0,
                        });
                    }
                    const entry = breakdownByApproverMap.get(key);
                    entry.noOfOrders += 1;
                    entry.amount += compValue;

                    if (order.complimentaryStatus === 'PARTIAL') {
                        partialValue += compValue;
                    } else {
                        fullValue += compValue;
                    }

                    const section = order.section || order.orderType || 'Unknown';
                    sectionCounts.set(
                        section,
                        (sectionCounts.get(section) ?? 0) + 1,
                    );
                });

                let topApprover: string | null = null;
                let topApproverCount = 0;
                for (const entry of breakdownByApproverMap.values()) {
                    if (entry.noOfOrders > topApproverCount) {
                        topApproverCount = entry.noOfOrders;
                        topApprover = entry.approvedBy;
                    }
                }

                let topSection: string | null = null;
                let topSectionCount = 0;
                for (const [section, count] of sectionCounts.entries()) {
                    if (count > topSectionCount) {
                        topSectionCount = count;
                        topSection = section;
                    }
                }

                const totalValue = orderHistory.reduce(
                    (sum: number, order: any) =>
                        sum +
                        (Number(order.complimentaryValue ?? order.amount) || 0),
                    0,
                );

                const processedData = {
                    totalOrders: orderHistory.length,
                    totalValue,
                    averageValue:
                        orderHistory.length > 0
                            ? totalValue / orderHistory.length
                            : 0,
                    partialValue,
                    fullValue,
                    topApprover,
                    topSection,
                    topSectionCount,
                    breakdownByApprover: Array.from(
                        breakdownByApproverMap.values(),
                    ),
                    orderRows: orderHistory.map((order: any) => ({
                        orderId: order.orderId || `ORD-${order.orderNo ?? ''}`,
                        orderNo: order.orderNo,
                        guest: order.guest || '—',
                        section: order.section || order.orderType || '—',
                        orderValue: Number(order.orderValue) || 0,
                        complimentaryValue:
                            Number(order.complimentaryValue ?? order.amount) ||
                            0,
                        balancePaid: Number(order.balancePaid) || 0,
                        approvedBy: order.approvedBy || '—',
                        pinOverride: order.pinOverride ? 'Yes' : 'No',
                        staff: order.staff || order.waiter || '—',
                        reason: order.reason || '—',
                        dateTime: order.date
                            ? new Date(order.date).toLocaleString('en-GB')
                            : '',
                        complimentaryStatus: order.complimentaryStatus,
                    })),
                };

                setReportData(processedData);
                setReportGeneratedAt(new Date());
            } else {
                toast.error('No data found for the selected filters');
            }
        } catch (error: any) {
            console.error('Error generating report:', error);
            toast.error('Failed to generate report. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleExportExcel = () => {
        if (!reportData) {
            toast.error('Please generate a report first');
            return;
        }

        const filename = `Complementary-Report-${filters.startDate || 'Unknown'}-to-${filters.endDate || 'Unknown'}`;

        const excelData = reportData.orderRows.map(
            (item: any, idx: number) => ({
                'S/N': idx + 1,
                Date: item.dateTime,
                'Order No.': item.orderId,
                Guest: item.guest,
                Section: item.section,
                'Order Value (₦)': item.orderValue,
                'Complimentary Value (₦)': item.complimentaryValue,
                'Balance Paid (₦)': item.balancePaid,
                'Approved By': item.approvedBy,
                'PIN Override': item.pinOverride,
                Staff: item.staff,
                Reason: item.reason,
            }),
        );

        downloadData(excelData, 'xlsx', filename);
        toast.success('Report exported to Excel');
    };

    const handlePrint = () => {
        if (!reportData) {
            toast.error('Please generate a report first');
            return;
        }

        window.print();
    };

    const hasData = reportData && reportData.totalOrders > 0;

    return (
        <PageWrapper
            permissions={[
                PERMISSIONS.VIEW_ALL_PAGE,
                PERMISSIONS.VIEW_DAILY_SALES_REPORTS,
                PERMISSIONS.MARK_ORDERS_COMPLEMENTARY,
            ]}
            className="flex flex-col min-h-full"
        >
            <PageHeader>
                <div className="flex items-center justify-between flex-wrap gap-3">
                    <PageHeadertitle
                        title="Complementary Report"
                        subtitle="Complete transaction history and approvals"
                    />
                </div>
            </PageHeader>

            <div className="mt-4">
                <ComplimentaryOrderFilters
                    filters={filters}
                    onFiltersChange={setFilters}
                    onGenerateReport={handleGenerateReport}
                    onExportExcel={handleExportExcel}
                    onPrint={handlePrint}
                    isLoading={isLoading}
                    approverOptions={approverOptions}
                    waiterOptions={waiterOptions}
                    cashierOptions={cashierOptions}
                    outletOptions={outletOptions}
                    menuTypeOptions={menuTypeOptions}
                />
            </div>

            <hr className="my-4" />

            <div className="min-h-[400px] flex-1">
                {isLoading ? (
                    <ComplimentaryOrderReportContent
                        data={null}
                        loading={true}
                    />
                ) : hasData ? (
                    <ComplimentaryOrderReportContent
                        data={reportData}
                        loading={false}
                        headerInfo={{
                            cashier:
                                filters.cashierId === 'all'
                                    ? 'All Cashiers'
                                    : findLabel(
                                          cashierOptions,
                                          filters.cashierId,
                                      ) || 'Selected Cashier',
                            printedAt: reportGeneratedAt
                                ? reportGeneratedAt.toLocaleString('en-GB', {
                                      day: '2-digit',
                                      month: 'short',
                                      year: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit',
                                      hour12: true,
                                  })
                                : undefined,
                            reportPeriod:
                                filters.startDate && filters.endDate
                                    ? `${filters.startDate} ${filters.startTime} → ${filters.endDate} ${filters.endTime}`
                                    : undefined,
                            outlet:
                                filters.outlet === 'all'
                                    ? 'All Outlets'
                                    : findLabel(outletOptions, filters.outlet) ||
                                      organization?.name ||
                                      'Main Outlet',
                            menuType:
                                filters.menuType === 'all'
                                    ? 'All'
                                    : findLabel(
                                          menuTypeOptions,
                                          filters.menuType,
                                      ) || filters.menuType,
                            printedBy: user?.fullName || 'System',
                            orderType:
                                filters.orderType === 'all'
                                    ? 'All'
                                    : filters.orderType,
                        }}
                    />
                ) : (
                    <EmptyReportState
                        title="No results found"
                        description="Select a timeframe and click Generate to see complementary orders."
                    />
                )}
            </div>

            {reportGeneratedAt && (
                <ReportFooter generatedAt={reportGeneratedAt} />
            )}
        </PageWrapper>
    );
};

export default OrderHistoryPage;
