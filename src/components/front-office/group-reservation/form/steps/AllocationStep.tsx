'use client';

import type {
    AllocatedRoom,
    GroupGuestDraft,
    RoomTypeOption,
} from '../../types';
import { GroupSelectField } from '../GroupFormFields';

export function AllocationStep({
    rooms = [],
    roomTypes = [],
    guestCount,
    guests,
    onAssign,
    onAutoAllocate,
}: {
    rooms?: AllocatedRoom[];
    roomTypes?: RoomTypeOption[];
    guestCount: number;
    guests: GroupGuestDraft[];
    onAssign: (roomId: string, guestId: string | null) => void;
    onAutoAllocate: () => void;
}) {
    const assigned = new Set(rooms.flatMap((room) => room.guestIds));

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-muted-foreground">
                    {rooms.length} room{rooms.length === 1 ? '' : 's'} selected
                    for {guestCount} guest{guestCount === 1 ? '' : 's'},
                    including the Master. The Master uses one of these rooms
                    and does not add another.
                </p>
                <button
                    type="button"
                    onClick={onAutoAllocate}
                    disabled={rooms.length === 0 || guests.length === 0}
                    className="shrink-0 text-sm font-medium text-orion-blue disabled:opacity-40"
                >
                    Auto allocate
                </button>
            </div>
            {rooms.length === 0 ? (
                <p className="rounded-lg border border-gray-100 p-4 text-sm text-muted-foreground">
                    No rooms selected. Go back and add rooms first.
                </p>
            ) : (
                <div className="divide-y divide-gray-100 rounded-lg border border-gray-100">
                    {rooms.map((room) => {
                        const roomType = roomTypes.find(
                            (item) => item.id === room.roomTypeId,
                        );
                        const currentGuestId = room.guestIds[0] || '';
                        const options = guests
                            .filter(
                                (guest) =>
                                    (!guest.roomTypeId ||
                                        guest.roomTypeId === room.roomTypeId) &&
                                    (!assigned.has(guest.id) ||
                                        room.guestIds.includes(guest.id)),
                            )
                            .map((guest) => ({
                                value: guest.id,
                                label: guest.isMaster
                                    ? `Master · ${guest.name || 'Unnamed'}`
                                    : guest.name || 'Unnamed guest',
                            }));
                        return (
                            <div
                                key={room.id}
                                className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-[8rem_1fr_minmax(0,16rem)] sm:items-end"
                            >
                                <div className="pb-1.5">
                                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                                        Room
                                    </p>
                                    <p className="mt-1 font-mono text-sm font-medium">
                                        {room.roomNumber || 'Auto-assign'}
                                    </p>
                                </div>
                                <div className="pb-1.5">
                                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                                        Type
                                    </p>
                                    <p className="mt-1 text-sm font-medium">
                                        {roomType?.name || room.roomTypeId}
                                    </p>
                                </div>
                                <GroupSelectField
                                    id={`alloc-${room.id}`}
                                    label="Assign Guest"
                                    placeholder="Leave empty"
                                    value={currentGuestId || '__empty'}
                                    options={[
                                        {
                                            value: '__empty',
                                            label: 'Empty room',
                                        },
                                        ...options,
                                    ]}
                                    onChange={(value) =>
                                        onAssign(
                                            room.id,
                                            value === '__empty' ? null : value,
                                        )
                                    }
                                />
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
