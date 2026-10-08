'use client';
import { getCleaningRequests } from '@/app/actions/houseKeeping';
import { PageHeader, PageHeadertitle } from '@/components/common/layout/Header';
import PageWrapper from '@/components/common/PageWrapper';
import DashboardLoader from '@/components/DashboardLoader';
import {
    QuickActionLinkCards,
    QuickActionLinkCardsProps,
    RoomTypeCard,
} from '@/components/house-keeping/common/cards/Dashboard';
import { NotificationsPopover } from '@/components/house-keeping/common/Notification';
import SearchInput from '@/components/house-keeping/common/SearchInput';
import { cleaningRequestColumnTrimmed } from '@/components/house-keeping/tables/columns/cleaning-request';
import RecentActivityTable from '@/components/house-keeping/tables/RecentActivity';
import { roomStatusColumnTrimmed } from '@/components/house-keeping/tables/RoomActivity';
import { useUser } from '@/context/useUser';
import { fetchRoomTypesStat } from '@/hooks/fetcher';
import { useRooms } from '@/hooks/useRooms';
import Link from 'next/link';
import {
    LuClipboardList,
    LuHouse,
    LuPaintbrush,
    LuWrench,
} from 'react-icons/lu';
import useSWR from 'swr';

const cardItems: QuickActionLinkCardsProps[] = [
    {
        icon: LuPaintbrush,
        title: "Today's Cleaning Request",
        link: '/house-keeping/cleaning-requests',
        cardColor: 'bg-red-50',
        iconBgColor: 'bg-red-100',
        iconClassname: 'text-red-600',
        textColor: 'text-red-900',
    },
    {
        icon: LuHouse,
        title: 'View all rooms',
        link: '/house-keeping/room-status',
        cardColor: 'bg-orange-50',
        iconBgColor: 'bg-orange-100',
        iconClassname: 'text-orange-600',
        textColor: 'text-orange-900',
    },
    {
        icon: LuClipboardList,
        title: 'HouseKeeping Inventory',
        link: '/house-keeping/inventory',
        cardColor: 'bg-white',
        iconBgColor: 'bg-gray-100',
        iconClassname: 'text-orion-blue',
        textColor: 'text-muted-foreground',
    },
    {
        icon: LuWrench,
        title: 'Maintenance Block List',
        link: '/house-keeping/maintenance',
        cardColor: 'bg-gray-50',
        iconBgColor: 'bg-gray-100',
        iconClassname: 'text-gray-600',
        textColor: 'text-muted-foreground',
    },
];

const Dashboard = () => {
    const { user } = useUser();
    const {
        data: roomTypes,
        error,
        isLoading,
    } = useSWR('/roomtypes/stat', fetchRoomTypesStat);
    const {
        data: cleaningRequests,
        error: cError,
        isLoading: cIsLoading,
    } = useSWR('/housekeeping/cleaning-request', getCleaningRequests);
    const { rooms } = useRooms();

    if (cIsLoading) {
        return <DashboardLoader />;
    }
    if (cError) {
        return <div>Error: {error.message}</div>;
    }

    return (
        <PageWrapper>
            <PageHeader>
                <PageHeadertitle
                    title="Dashboard"
                    subtitle={`Welcome back, ${user?.fullName}`}
                />
                <div className="ml-auto flex items-center">
                    <SearchInput />
                    <NotificationsPopover />
                </div>
            </PageHeader>
            <div className="w-full mt-3 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                {cardItems.map((item) => (
                    <QuickActionLinkCards
                        key={item.title}
                        icon={item.icon}
                        title={item.title}
                        link={item.link}
                        cardColor={item.cardColor}
                        iconBgColor={item.iconBgColor}
                        iconClassname={item.iconClassname}
                        textColor={item.textColor}
                    />
                ))}
            </div>
            <div className="flex items-center gap-4 w-full overflow-x-auto mt-3">
                <div className="w-full flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                        <h1>Room Type</h1>
                        <Link href={'/house-keeping/dashboard/room-types'}>
                            <button className="hover:text-brand">
                                {'See All'}
                            </button>
                        </Link>
                    </div>
                    {isLoading ? (
                        <p className="text-gray-500">Loading room types...</p>
                    ) : error ? (
                        <p className="text-red-500">
                            Failed to load room types.
                        </p>
                    ) : (
                        <div className="grid grid-cols-3 items-center gap-4 w-full transition-width overflow-x-auto">
                            {roomTypes?.slice(0, 3).map((room) => (
                                <RoomTypeCard key={room.id} {...room} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
            <div className="w-full grid grid-cols-2 gap-4 relative">
                <RecentActivityTable
                    column={cleaningRequestColumnTrimmed}
                    title={`Cleaning Request (${cleaningRequests.length})`}
                    data={cleaningRequests}
                />
                <RecentActivityTable
                    column={roomStatusColumnTrimmed}
                    title={`Room Status (${rooms.length})`}
                    data={rooms}
                />
            </div>
        </PageWrapper>
    );
};

export default Dashboard;
