'use client';
import { PageHeader, PageHeadertitle } from '@/components/common/layout/Header';
import PageWrapper from '@/components/common/PageWrapper';
import DashboardLoader from '@/components/DashboardLoader';
import SearchInput from '@/components/house-keeping/common/SearchInput';
import { RoomActivityTableUnGrouped } from '@/components/house-keeping/tables/RoomActivity';
import { fetchRoomStats } from '@/hooks/fetcher';
import { useRooms } from '@/hooks/useRooms';
import { cn } from '@/lib/utils';
import { ROOM } from '@/types';
import { Button } from '@heroui/react';
import {
    Bell,
    Briefcase,
    Home,
    LucideIcon,
    Paintbrush,
    Waves,
    Wrench,
} from 'lucide-react';
import { LuBell } from 'react-icons/lu';
import useSWR from 'swr';

interface CardProps {
    id: number;
    title: string;
    value: number;
    icon: LucideIcon;
    iconBgColor?: string;
    cardColor?: string;
    iconColor?: string;
    valueColor?: string;
}

const Card = ({
    title,
    value,
    icon,
    iconBgColor,
    cardColor,
    valueColor,
    iconColor,
}: CardProps) => {
    const Icon = icon;
    return (
        <div
            className={cn(
                cardColor,
                'border flex items-center justify-between rounded-md px-4 py-6',
            )}
        >
            <div className="flex items-center gap-2">
                <div className={cn(iconBgColor, 'rounded-full p-3')}>
                    <Icon className={cn(iconColor, 'w-5 h-5')} />
                </div>
                <p className="text-muted-foreground">{title}</p>
            </div>
            <h3 className={cn(valueColor ?? 'text-black', 'text-lg font-bold')}>
                {value}
            </h3>
        </div>
    );
};

const DataFetchError = ({ error }: { error: string }) => {
    return <div>{error}</div>;
};

const RoomStatus = () => {
    const { data: room } = useSWR('/room/stat', fetchRoomStats);
    const { rooms, isLoading, isError } = useRooms();
    const cardData: CardProps[] = [
        {
            id: 1,
            title: 'Number of Rooms',
            iconColor: 'text-gray-600',
            cardColor: 'bg-gray-300/10',
            iconBgColor: 'bg-gray-400/20',
            value: room?.total ?? 0,
            icon: Home,
        },
        {
            id: 2,
            title: 'Number of Dirty Rooms',
            iconColor: 'text-red-600',
            valueColor: 'text-red-600',
            cardColor: 'bg-red-600/10',
            iconBgColor: 'bg-red-600/20',
            value: room?.dirty ?? 0,
            icon: Waves,
        },
        {
            id: 3,
            title: 'Due Out guest',
            iconColor: 'text-orion-blue',
            valueColor: 'text-orion-blue',
            cardColor: 'bg-orion-blue/10',
            iconBgColor: 'bg-orion-blue/20',
            value: room?.dueOut ?? 0,
            icon: Bell,
        },
        {
            id: 4,
            title: 'Under Maintenance',
            iconColor: 'text-neutral-600',
            cardColor: 'bg-neutral-600/10',
            iconBgColor: 'bg-neutral-600/20',
            value: room?.maintenance ?? 0,
            icon: Wrench,
        },
        {
            id: 5,
            title: 'Stay over',
            iconColor: 'text-purple-600',
            cardColor: 'bg-purple-600/10',
            iconBgColor: 'bg-purple-600/20',
            value: room?.stayOver ?? 0,
            icon: Briefcase,
        },
        {
            id: 6,
            title: 'Number of Clean Rooms',
            iconColor: 'text-orange-600',
            valueColor: 'text-orange-600',
            cardColor: 'bg-orange-600/10',
            iconBgColor: 'bg-orange-600/20',
            value: room?.clean ?? 0,
            icon: Paintbrush,
        },
    ];

    if (isLoading) return <DashboardLoader />;
    if (isError) return <DataFetchError error="Error Loading Rooms" />;

    return (
        <PageWrapper>
            <PageHeader>
                <PageHeadertitle
                    title="Room Status"
                    subtitle={`Everything about room cleaning and others`}
                />
                <div className="ml-auto flex items-center">
                    <SearchInput />
                    <Button
                        variant="light"
                        isIconOnly
                        className="ml-4 bg-white rounded-full border text-gray-400"
                    >
                        <LuBell size={18} />
                    </Button>
                </div>
            </PageHeader>
            <div className="grid grid-cols-3 gap-4">
                {cardData.map((card) => (
                    <Card key={card.id} {...card} />
                ))}
            </div>
            <div>
                <RoomActivityTableUnGrouped data={rooms as ROOM[]} />
            </div>
        </PageWrapper>
    );
};

export default RoomStatus;
