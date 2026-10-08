import { cn } from '@/lib/utils';
import Link from 'next/link';
import React from 'react';
import { BsVirus } from 'react-icons/bs';
import { LuBuilding, LuHouse, LuPaintbrush, LuWrench } from 'react-icons/lu';

export interface RoomStatusItemProps {
    icon: React.ReactNode;
    count: number;
    label: string;
}

export interface RoomTypeStats {
    id: number;
    name: string;
    total: number;
    stats: {
        dirty: number;
        cleaned: number;
        inHouse: number;
        maintenance: number;
    };
}

export interface QuickActionLinkCardsProps {
    icon: React.ElementType;
    title: string;
    link: string;
    cardColor?: string;
    iconBgColor?: string;
    iconClassname?: string;
    textColor?: string;
}

export const QuickActionLinkCards = ({
    icon,
    title,
    link,
    cardColor,
    iconClassname,
    textColor,
    iconBgColor,
}: QuickActionLinkCardsProps) => {
    return (
        <Link href={link}>
            <div
                className={cn(
                    cardColor ?? 'bg-white',
                    'border group hover:border-brand rounded-lg p-4 py-6 flex items-center gap-3 justify-start',
                )}
            >
                <div
                    className={cn(
                        iconBgColor ?? 'bg-brand/20',
                        'rounded-full p-3',
                    )}
                >
                    {React.createElement(icon, {
                        className: cn(iconClassname ?? 'text-brand', 'w-6 h-6'),
                    })}
                </div>
                <div>
                    <h3
                        className={cn(
                            textColor ?? 'text-gray-800',
                            'text-base font-semibold capitalize',
                        )}
                    >
                        {title}
                    </h3>
                </div>
            </div>
        </Link>
    );
};

export const RoomStatusItem = ({ icon, count, label }: RoomStatusItemProps) => {
    return (
        <div className="flex items-center capitalize text-gray-500 justify-start gap-1">
            {icon}
            <span>{`${count} ${label}`}</span>
        </div>
    );
};

export const RoomTypeCard = (room: RoomTypeStats) => {
    return (
        <Link
            href={'/house-keeping/room-status/all-room-activities'}
            className="w-full hover:border-orion-blue transition-width flex flex-col items-center justify-center bg-white border rounded-2xl py-6 p-4"
        >
            <div className={cn('rounded-full bg-gray-100 p-3')}>
                <LuBuilding className="text-brand w-6 h-6" />
            </div>
            <h1 className="mt-3 text-base">
                {room.name} ({room.total})
            </h1>
            <div className="flex items-center gap-x-2 mt-2 justify-center flex-wrap">
                <RoomStatusItem
                    icon={<BsVirus />}
                    count={room.stats.dirty ?? 0}
                    label="dirty rooms"
                />
                <RoomStatusItem
                    icon={<LuPaintbrush />}
                    count={room.stats.cleaned ?? 0}
                    label="cleaned rooms"
                />
                <RoomStatusItem
                    icon={<LuHouse />}
                    count={room.stats.inHouse ?? 0}
                    label="in house"
                />
                <RoomStatusItem
                    icon={<LuWrench />}
                    count={room.stats.maintenance ?? 0}
                    label="maintenance"
                />
            </div>
        </Link>
    );
};
