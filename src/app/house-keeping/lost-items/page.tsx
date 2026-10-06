'use client';

import { getLostItem } from '@/app/actions/houseKeeping';
import EmptyState from '@/components/common/EmptyState';
import { PageHeader, PageHeadertitle } from '@/components/common/layout/Header';
import PageWrapper from '@/components/common/PageWrapper';
import { lostItemIllustration } from '@/components/house-keeping/common/illustrations';
import { LostItemModal } from '@/components/house-keeping/common/modals/LostItem';
import {
    lostItemColumn,
    lostItemFilters,
} from '@/components/house-keeping/tables/columns/lost-item';
import CustomTable from '@/components/house-keeping/tables/CustomTable';
import { Button } from '@/components/ui/button';
import { ILostItem } from '@/types';
import { LuBell } from 'react-icons/lu';
import useSWR from 'swr';
import DashboardLoader from '@/components/DashboardLoader';

const LostItemsPage = () => {
    const {
        data: lostItemsList,
        error,
        isLoading,
        mutate,
    } = useSWR<ILostItem[]>('/housekeeping/lost-item', getLostItem);
    console.log(lostItemsList);
    if (isLoading) {
        return <DashboardLoader />;
    }

    if (error) {
        return <div>Error: {error.message}</div>;
    }

    if (!lostItemsList || (lostItemsList && lostItemsList.length === 0)) {
        return (
            <div className="w-full mt-20 min-h-full flex items-center justify-center">
                <EmptyState
                    icon={lostItemIllustration}
                    title="Lost Items"
                    description="Once there are any reported lost items found in the room, they will be shown here."
                />
            </div>
        );
    }

    return (
        <PageWrapper>
            <PageHeader>
                <PageHeadertitle
                    title="Lost Items"
                    subtitle={`View all lost items`}
                />
                <div className="ml-auto flex items-center">
                    <Button
                        size={'icon'}
                        className="ml-4 rounded-full hover:bg-white bg-white p-4 border text-gray-400"
                    >
                        <LuBell size={18} />
                    </Button>
                </div>
            </PageHeader>
            <div>
                <CustomTable
                    data={lostItemsList ?? []}
                    columns={lostItemColumn}
                    filters={lostItemFilters}
                    extend={<LostItemModal onSuccess={() => mutate()} />}
                />
            </div>
        </PageWrapper>
    );
};

export default LostItemsPage;
