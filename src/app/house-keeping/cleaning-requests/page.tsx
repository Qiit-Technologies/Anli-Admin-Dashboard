'use client';

import { getCleaningRequests } from '@/app/actions/houseKeeping';
import EmptyState from '@/components/common/EmptyState';
import { PageHeader, PageHeadertitle } from '@/components/common/layout/Header';
import PageWrapper from '@/components/common/PageWrapper';
import DashboardLoader from '@/components/DashboardLoader';
import { CleaningIllustration } from '@/components/house-keeping/common/illustrations';
import {
    cleaningRequestColumn,
    cleaningRequestFilters,
} from '@/components/house-keeping/tables/columns/cleaning-request';
import CustomTable from '@/components/house-keeping/tables/CustomTable';
import { Button } from '@heroui/react';
import { LuBell } from 'react-icons/lu';
import useSWR from 'swr';

const CleaningRequest = () => {
    const {
        data: cleaningRequests,
        error,
        isLoading,
    } = useSWR('/housekeeping/cleaning-request', getCleaningRequests);

    if (isLoading) {
        return <DashboardLoader />;
    }
    if (error) {
        return <div>Error: {error.message}</div>;
    }

    if (!cleaningRequests) {
        return (
            <div className="w-full mt-20 min-h-full flex items-center justify-center">
                <EmptyState
                    icon={CleaningIllustration}
                    title="You have no cleaning requests"
                    description="Once there is a request, you will see it here"
                />
            </div>
        );
    }

    return (
        <PageWrapper>
            <PageHeader>
                <PageHeadertitle
                    title="Cleaning Requests"
                    subtitle={`Everything about room cleaning and others`}
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
                    data={cleaningRequests}
                    columns={cleaningRequestColumn}
                    filters={cleaningRequestFilters}
                />
            </div>
        </PageWrapper>
    );
};

export default CleaningRequest;
