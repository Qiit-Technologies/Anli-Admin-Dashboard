'use client';

import CustomTable from '@/components/common/table/CustomTable';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Users } from 'lucide-react';
import { useState } from 'react';
import useSWR from 'swr';
import { kitchenStaffColumn } from '../tables/columns/report/KitchenStaffReport';
import { loginLogoutColumn } from '../tables/columns/report/LoginLogoutHistory';
import { CustomHxBarChart } from './charts/CustomHxBar';
import CollapsibleCard from './components/CollapsibleCard';
import ReportsCard, { ReportsCardProps } from './components/ReportsCard';
import {
    getKitchenStaffReport,
    getKitchenStaffStats,
    getStaffPerformanceOverview,
    getStaffRevenueData,
} from '@/app/actions/order';
import WaiterReportComponent from './WaiterReportComponent';
import {
    getLoginLogoutHistory,
    getLoginLogoutStats,
} from '@/app/actions/staff';

const StaffPerformance = () => {
    const reportSections = [
        { id: 'all', title: 'All Reports' },
        {
            id: 'waiter',
            title: 'Waiter Performance',
        },
        {
            id: 'kitchen',
            title: 'Kitchen Staff Report',
        },
        {
            id: 'log',
            title: 'Login/Logout History',
        },
        { id: 'individual', title: 'Individual Staff Report' },
    ];

    const [selectedReport, setSelectedReport] = useState('waiter');

    const { data: kitchenStaffStat } = useSWR(
        '/orders/kitchen-staff-stats',
        getKitchenStaffStats,
    );

    const { data: kitchenStaffData } = useSWR(
        '/orders/kitchen-staff-report',
        getKitchenStaffReport,
    );

    const { data: isrStat } = useSWR(
        '/orders/waiter-performance-overview',
        getStaffPerformanceOverview,
    );

    const { data: isrData } = useSWR(
        '/orders/waiter-revenue-data',
        getStaffRevenueData,
    );

    const { data: loginLogoutData } = useSWR(
        '/staff/login-logout-history',
        getLoginLogoutHistory,
    );

    const { data: loginLogoutStat } = useSWR(
        '/staff/staff-status-stats',
        getLoginLogoutStats,
    );

    const handleReportChange = (value: string) => {
        setSelectedReport(value);
    };

    const shouldDisplaySection = (sectionId: string) => {
        return selectedReport === 'all' || selectedReport === sectionId;
    };

    return (
        <div className="flex w-full h-full flex-col gap-4">
            <div className="w-full mb-4">
                <Select
                    value={selectedReport}
                    onValueChange={handleReportChange}
                >
                    <SelectTrigger className="w-full md:w-[300px]">
                        <SelectValue placeholder="Select a report section" />
                    </SelectTrigger>
                    <SelectContent>
                        {reportSections.map((section) => (
                            <SelectItem key={section.id} value={section.id}>
                                {section.title}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {shouldDisplaySection('waiter') && (
                <CollapsibleCard title="Sales Report">
                    <WaiterReportComponent />
                </CollapsibleCard>
            )}

            {shouldDisplaySection('kitchen') && (
                <CollapsibleCard title="Kitchen Staff Report">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {kitchenStaffStat?.data.map(
                            (stat: ReportsCardProps, index: number) => (
                                <ReportsCard
                                    title={stat.title}
                                    value={stat.value}
                                    percent={stat.percent}
                                    trend={stat.trend}
                                    key={index}
                                />
                            ),
                        )}
                    </div>
                    <div className="w-full">
                        <CustomTable
                            title="Orders Prepared"
                            columns={kitchenStaffColumn}
                            data={kitchenStaffData?.data ?? []}
                            hasHeader
                            hasFilter={false}
                        />
                    </div>
                </CollapsibleCard>
            )}

            {shouldDisplaySection('log') && (
                <CollapsibleCard title="Login/Logout History">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {loginLogoutStat?.data.map(
                            (stat: ReportsCardProps, index: number) => (
                                <ReportsCard
                                    title={stat.title}
                                    value={stat.value}
                                    percent={stat.percent}
                                    trend={stat.trend as 'up' | 'down'}
                                    key={index}
                                />
                            ),
                        )}
                    </div>
                    <div className="w-full">
                        <CustomTable
                            title="Recent Login/Logout"
                            columns={loginLogoutColumn}
                            data={loginLogoutData?.data ?? []}
                            hasHeader
                            hasFilter={false}
                        />
                    </div>
                </CollapsibleCard>
            )}

            {shouldDisplaySection('individual') && (
                <CollapsibleCard title="Individual Staff Report">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {isrStat?.data.map(
                            (stat: ReportsCardProps, index: number) => (
                                <ReportsCard
                                    title={stat.title}
                                    value={stat.value}
                                    percent={stat.percent}
                                    trend={stat.trend as 'up' | 'down'}
                                    key={index}
                                />
                            ),
                        )}
                    </div>
                    <div className="w-full gap-4">
                        <CustomHxBarChart
                            DataIcon={Users}
                            title="Staff Report"
                            subtitle="Current Month"
                            data={isrData?.data ?? []}
                            trendPercentage={-2.1}
                            footerText="Showing staff performance"
                        />
                    </div>
                </CollapsibleCard>
            )}
        </div>
    );
};

export default StaffPerformance;
