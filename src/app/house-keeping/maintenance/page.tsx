'use client';

import { getRoomsUnderMaintainance } from '@/app/actions/houseKeeping';
import EmptyState from '@/components/common/EmptyState';
import { PageHeader, PageHeadertitle } from '@/components/common/layout/Header';
import PageWrapper from '@/components/common/PageWrapper';
import DashboardLoader from '@/components/DashboardLoader';
import { maintainanceIllustration } from '@/components/house-keeping/common/illustrations';
import { MaintainanceModal } from '@/components/house-keeping/common/modals/MaintainanceModal';
import {
    maintainanceColumn,
    maintainanceFilters,
} from '@/components/house-keeping/tables/columns/maintainance';
import CustomTable from '@/components/house-keeping/tables/CustomTable';
import { IMaintenance } from '@/types';
import { Button } from '@heroui/react';
import { LuBell } from 'react-icons/lu';
import useSWR, { mutate } from 'swr';

const MaintainancePage = () => {
    const {
        data: maintenanceList,
        error,
        isLoading,
    } = useSWR<IMaintenance[]>(
        '/housekeeping/maintenance',
        getRoomsUnderMaintainance,
    );
    console.log(maintenanceList);

    if (isLoading) {
        return <DashboardLoader />;
    }
    if (error) {
        return <div>Error: {error.message}</div>;
    }
    if (!maintenanceList || (maintenanceList && maintenanceList.length === 0)) {
        return (
            <div className="w-full min-h-full mt-20 flex items-center justify-center">
                <EmptyState
                    icon={maintainanceIllustration}
                    title="Maintainance Requests"
                    description="Once there is a request you will see it here."
                >
                    <div className="mt-5">
                        <MaintainanceModal
                            onSuccess={() =>
                                mutate('/housekeeping/maintenance')
                            }
                        />
                    </div>
                </EmptyState>
            </div>
        );
    }

    return (
        <PageWrapper>
            <PageHeader>
                <PageHeadertitle
                    title="Maintainance"
                    subtitle={`View rooms under maintenance`}
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
                    data={maintenanceList}
                    columns={maintainanceColumn}
                    filters={maintainanceFilters}
                    extend={
                        <MaintainanceModal
                            onSuccess={() =>
                                mutate('/housekeeping/maintenance')
                            }
                        />
                    }
                />
            </div>
        </PageWrapper>
    );
};

export default MaintainancePage;
