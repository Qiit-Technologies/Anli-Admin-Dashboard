'use client';

import PageWrapper from '@/components/common/PageWrapper';
import { PageHeader } from '@/components/common/layout/Header';
import RoomActivityTable from '@/components/house-keeping/tables/RoomActivity';
import { useRooms } from '@/hooks/useRooms';
import { ROOM } from '@/types';
import { BreadcrumbItem, Breadcrumbs } from '@heroui/react';

const AllRoomActivitiesPage = () => {
    const { rooms, isLoading, isError } = useRooms();

    if (isLoading) return <div>Loading rooms...</div>;
    if (isError) return <div>Error loading rooms...</div>;

    return (
        <PageWrapper>
            <PageHeader>
                <Breadcrumbs classNames={{ base: 'text-lg' }}>
                    <BreadcrumbItem
                        classNames={{
                            item: [
                                'hover:underline',
                                'hover:text-brand',
                                'text-base',
                            ],
                        }}
                        href="/house-keeping/room-status"
                    >
                        Room Status
                    </BreadcrumbItem>
                    <BreadcrumbItem
                        classNames={{
                            item: ['text-orion-blue text-base'],
                        }}
                    >
                        Room Activities
                    </BreadcrumbItem>
                </Breadcrumbs>
            </PageHeader>
            <div>
                <RoomActivityTable variant="striped" data={rooms as ROOM[]} />
            </div>
        </PageWrapper>
    );
};

export default AllRoomActivitiesPage;
