'use client';

import { getDailyTaskList } from '@/app/actions/houseKeeping';
import EmptyState from '@/components/common/EmptyState';
import { PageHeader, PageHeadertitle } from '@/components/common/layout/Header';
import PageWrapper from '@/components/common/PageWrapper';
import { dailyTasksIllustration } from '@/components/house-keeping/common/illustrations';
import {
    dailyTasksColumn,
    dailyTasksFilters,
} from '@/components/house-keeping/tables/columns/daily-tasks';
import CustomTable from '@/components/house-keeping/tables/CustomTable';
import { IDailyTask } from '@/types';
import { Button } from '@heroui/react';
import { LuBell } from 'react-icons/lu';
import useSWR from 'swr';
import DashboardLoader from '@/components/DashboardLoader';

const DailyTaskPage = () => {
    const {
        data: dailyTasksList,
        error,
        isLoading,
    } = useSWR<IDailyTask[]>('/housekeeping/daily-task', getDailyTaskList);
    if (isLoading) {
        return <DashboardLoader />;
    }
    if (error) {
        return <div>Error: {error.message}</div>;
    }
    if (
        !dailyTasksList ||
        (dailyTasksList && dailyTasksList.length === 0) ||
        dailyTasksList === undefined
    ) {
        return (
            <div className="w-full mt-20 min-h-full flex items-center justify-center">
                <EmptyState
                    icon={dailyTasksIllustration}
                    title="Daily Task List"
                    description="All your recored tasked will be showed here "
                />
            </div>
        );
    }

    return (
        <PageWrapper>
            <PageHeader>
                <PageHeadertitle
                    title="Daily Task List"
                    subtitle={`View all the tasks that need to be done for the day`}
                />
                <div className="ml-auto flex items-center">
                    <Button
                        variant="light"
                        isIconOnly
                        className="ml-4 bg-white rounded-full border text-gray-400"
                    >
                        <LuBell size={18} />
                    </Button>
                </div>
            </PageHeader>
            <div>
                <CustomTable
                    data={dailyTasksList ?? []}
                    columns={dailyTasksColumn}
                    filters={dailyTasksFilters}
                />
            </div>
        </PageWrapper>
    );
};

export default DailyTaskPage;
