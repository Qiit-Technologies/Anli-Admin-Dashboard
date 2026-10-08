'use client';

import { getGroupRoomingList } from '@/app/actions/group-reservation';
import { FileText } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { GroupBooking } from '../types';
import { ActionFooter } from './ActionFooter';

type RoomingRow = {
    roomNumber?: string;
    roomType?: string;
    guestName?: string;
    reservationId?: string | number;
};

export function RoomingListPanel({
    booking,
    onClose,
    onGenerate,
}: {
    booking: GroupBooking;
    onClose: () => void;
    onGenerate: () => void;
}) {
    const [rooms, setRooms] = useState<RoomingRow[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let active = true;
        const load = async () => {
            try {
                if (!booking.backendId) return;
                const data = await getGroupRoomingList(booking.backendId);
                if (active) setRooms(data?.rooms || []);
            } finally {
                if (active) setLoading(false);
            }
        };
        void load();
        return () => {
            active = false;
        };
    }, [booking.backendId]);

    return (
        <>
            {loading ? (
                <p className="rounded-lg border border-gray-100 p-4 text-sm text-muted-foreground">
                    Loading rooming list...
                </p>
            ) : rooms.length === 0 ? (
                <p className="rounded-lg border border-gray-100 p-4 text-sm text-muted-foreground">
                    No rooms assigned to this group yet.
                </p>
            ) : (
                <div className="divide-y divide-gray-100 overflow-hidden rounded-lg border border-gray-100">
                    <div className="grid grid-cols-[5rem_1fr_1fr] gap-3 bg-gray-50 px-4 py-2.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        <span>Room</span>
                        <span>Type</span>
                        <span>Guest</span>
                    </div>
                    {rooms.map((room, index) => (
                        <div
                            key={`${room.reservationId ?? index}`}
                            className="grid grid-cols-[5rem_1fr_1fr] gap-3 px-4 py-3 text-sm"
                        >
                            <span className="font-mono">
                                {room.roomNumber || '—'}
                            </span>
                            <span>{room.roomType || '—'}</span>
                            <span className="min-w-0">
                                <span className="block truncate">
                                    {room.guestName || 'Guest'}
                                </span>
                                <span className="mt-0.5 block font-mono text-xs text-muted-foreground">
                                    {room.reservationId}
                                </span>
                            </span>
                        </div>
                    ))}
                </div>
            )}
            <ActionFooter
                onCancel={onClose}
                confirm={{
                    label: 'Generate Rooming List',
                    icon: <FileText className="size-4" />,
                    onClick: onGenerate,
                }}
            />
        </>
    );
}
