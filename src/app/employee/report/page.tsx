'use client';

import { getEmployeeMetrics } from '@/app/actions/employee';
import { StatCard } from '@/components/common/cards/StatCard';
import { PageHeader, PageHeadertitle } from '@/components/common/layout/Header';
import PageWrapper from '@/components/common/PageWrapper';
import DepartmentCostAnalysis from '@/components/employee/chart/DepartmentCostAnalysis';
import PayrollBreakDownChart from '@/components/employee/chart/PayrollBreakDown';
import PunctualityChart from '@/components/employee/chart/PunctualityChart';
import useSWR from 'swr';

const Report = () => {
    const { data } = useSWR('/employees/metrics', getEmployeeMetrics);
    return (
        <PageWrapper>
            <PageHeader>
                <PageHeadertitle
                    title="Report"
                    subtitle={`View your reports`}
                />
            </PageHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {data?.data.map((dataPoint: any, index: number) => {
                    return (
                        <StatCard
                            key={index}
                            currentValue={dataPoint.value}
                            previousValue={0}
                            percentageChange={0}
                            title={dataPoint.label}
                            showMonthDiff={false}
                        />
                    );
                })}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DepartmentCostAnalysis />
                <PunctualityChart />
            </div>
            <div>
                <PayrollBreakDownChart />
            </div>
        </PageWrapper>
    );
};

export default Report;
