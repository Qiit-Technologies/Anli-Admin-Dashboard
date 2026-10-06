'use client';

import { PageHeader, PageHeadertitle } from '@/components/common/layout/Header';
import PageWrapper from '@/components/common/PageWrapper';
import { BarChartComponent } from '@/components/house-keeping/common/charts/BarChart';
import CleaningStaffPieChart from '@/components/house-keeping/common/charts/PieChart';
import { NotificationsPopover } from '@/components/house-keeping/common/Notification';
import { fetchHousekeepingCleaningTaskByStaff } from '@/hooks/fetcher';
import useSWR from 'swr';

type StaffProductivityRow = {
    staff: string;
    cleaningTasks: number;
};

export default function HouseKeepingProductivityPage() {
    const { data, error, isLoading } = useSWR<StaffProductivityRow[]>(
        '/housekeeping/cleaning-task-staff',
        fetchHousekeepingCleaningTaskByStaff,
    );

    const rows = data ?? [];
    const totalTasks = rows.reduce((sum, row) => sum + row.cleaningTasks, 0);
    const topPerformer = rows.length
        ? rows.reduce((best, row) =>
              row.cleaningTasks > best.cleaningTasks ? row : best,
          )
        : null;

    return (
        <PageWrapper>
            <PageHeader>
                <PageHeadertitle
                    title="Housekeeping Productivity"
                    subtitle="Track team cleaning output and performance trends."
                />
                <div className="ml-auto flex items-center">
                    <NotificationsPopover />
                </div>
            </PageHeader>

            {error ? (
                <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 my-4">
                    {error.message}
                </div>
            ) : null}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 my-4">
                <div className="rounded-md border bg-white p-4">
                    <div className="text-xs text-muted-foreground">
                        Staff Count
                    </div>
                    <div className="text-2xl font-semibold">
                        {isLoading ? '…' : rows.length}
                    </div>
                </div>
                <div className="rounded-md border bg-white p-4">
                    <div className="text-xs text-muted-foreground">
                        Total Cleaning Tasks
                    </div>
                    <div className="text-2xl font-semibold">
                        {isLoading ? '…' : totalTasks}
                    </div>
                </div>
                <div className="rounded-md border bg-white p-4">
                    <div className="text-xs text-muted-foreground">
                        Top Performer
                    </div>
                    <div className="text-lg font-semibold">
                        {isLoading
                            ? '…'
                            : topPerformer
                              ? `${topPerformer.staff} (${topPerformer.cleaningTasks})`
                              : 'N/A'}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <BarChartComponent />
                <CleaningStaffPieChart />
            </div>
        </PageWrapper>
    );
}
