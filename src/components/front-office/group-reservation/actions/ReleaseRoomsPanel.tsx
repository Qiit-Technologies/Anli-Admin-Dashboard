'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { ArrowRight } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { GroupBooking } from '../types';
import { ActionFooter } from './ActionFooter';

export function ReleaseRoomsPanel({
    booking,
    onClose,
    onRelease,
}: {
    booking: GroupBooking;
    onClose: () => void;
    onRelease: (roomNumbers: string[]) => void;
}) {
    const rooms = useMemo(() => {
        const unique = new Map<string, string>();
        booking.guests.forEach((guest) => {
            if (guest.roomNumber) {
                unique.set(
                    guest.roomNumber,
                    `${guest.roomName}, room ${guest.roomNumber}`,
                );
            }
        });
        return Array.from(unique, ([number, label]) => ({ number, label }));
    }, [booking]);
    const [selected, setSelected] = useState<string[]>([]);

    return (
        <>
            <div className="max-h-72 space-y-2 overflow-y-auto">
                {rooms.length === 0 ? (
                    <p className="rounded-md border border-gray-100 p-4 text-sm text-muted-foreground">
                        No rooms assigned to this group.
                    </p>
                ) : (
                    rooms.map((room) => (
                        <label
                            key={room.number}
                            className="flex cursor-pointer items-center gap-3 rounded-md border border-gray-100 px-3 py-2.5 text-sm"
                        >
                            <Checkbox
                                className="size-4 shadow-none data-[state=checked]:border-emerald-600 data-[state=checked]:bg-emerald-600"
                                checked={selected.includes(room.number)}
                                onCheckedChange={(checked) =>
                                    setSelected((prev) =>
                                        checked
                                            ? [...prev, room.number]
                                            : prev.filter(
                                                  (number) =>
                                                      number !== room.number,
                                              ),
                                    )
                                }
                            />
                            <span className="text-[13px] font-medium">
                                {room.label}
                            </span>
                        </label>
                    ))
                )}
            </div>
            <ActionFooter
                onCancel={onClose}
                confirm={{
                    label: `Release (${selected.length})`,
                    disabled: selected.length === 0,
                    icon: <ArrowRight className="size-4" />,
                    onClick: () => onRelease(selected),
                }}
            />
        </>
    );
}
