'use client';
import { PageHeader, PageHeadertitle } from '@/components/common/layout/Header';
import PageWrapper from '@/components/common/PageWrapper';
import { RoomTypeCard } from '@/components/house-keeping/common/cards/Dashboard';
import SearchInput from '@/components/house-keeping/common/SearchInput';
import { Button } from '@/components/ui/button';
import { fetchRoomTypesStat } from '@/hooks/fetcher';
import { BreadcrumbItem, Breadcrumbs, Divider } from '@heroui/react';
import { ArrowLeft, ArrowRight, ListFilter } from 'lucide-react';
import useSWR from 'swr';

const RoomTypesPage = () => {
    const {
        data: roomTypes,
        error,
        isLoading,
    } = useSWR('/roomtypes/stat', fetchRoomTypesStat);

    return (
        <PageWrapper className="gap-0">
            <div>
                <Breadcrumbs>
                    <BreadcrumbItem
                        classNames={{
                            item: [
                                'hover:underline',
                                'hover:text-brand',
                                'text-base',
                            ],
                        }}
                        href="/house-keeping/dashboard"
                    >
                        Dashboard
                    </BreadcrumbItem>
                    <BreadcrumbItem
                        classNames={{
                            item: ['text-orion-blue text-base'],
                        }}
                    >
                        Room Type
                    </BreadcrumbItem>
                </Breadcrumbs>
            </div>
            <PageHeader>
                <PageHeadertitle
                    title="Room Types"
                    subtitle={`Shows statistics about the room types in the hotel`}
                />
            </PageHeader>
            <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between my-2">
                    <SearchInput className="w-full lg:w-[400px]" />
                    <Button variant={'outline'}>
                        <ListFilter />
                        More filters
                    </Button>
                </div>
                {isLoading ? (
                    <p className="text-gray-500">Loading room types...</p>
                ) : error ? (
                    <p className="text-red-500">Failed to load room types.</p>
                ) : (
                    <div className="grid grid-cols-3 items-center gap-5 w-full transition-width overflow-x-auto">
                        {roomTypes?.map((room) => (
                            <RoomTypeCard key={room.id} {...room} />
                        ))}
                    </div>
                )}
            </div>
            <Divider />
            <div className="w-full flex items-center justify-between">
                <Button variant={'outline'}>
                    <ArrowLeft /> Previous
                </Button>
                <Button variant={'outline'}>
                    Next <ArrowRight />
                </Button>
            </div>
        </PageWrapper>
    );
};

export default RoomTypesPage;
