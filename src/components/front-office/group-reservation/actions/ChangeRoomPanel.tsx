'use client';

import { ArrowRight } from 'lucide-react';
import { useMemo, useState } from 'react';
import { GroupSelectField } from '../form/GroupFormFields';
import type { GroupBooking } from '../types';
import { useGroupOptions } from '../useGroupOptions';
import { ActionFooter } from './ActionFooter';

export function ChangeRoomPanel({
    booking,
    selectedGuestId,
    mode,
    onClose,
    onChange,
}: {
    booking: GroupBooking;
    selectedGuestId: string | null;
    mode: 'upgrade' | 'downgrade' | 'transfer';
    onClose: () => void;
    onChange: (
        guestId: string,
        roomTypeId: string,
        roomNumber: string,
    ) => void;
}) {
    const [guestId, setGuestId] = useState(selectedGuestId || '');
    const [roomTypeId, setRoomTypeId] = useState('');
    const [roomNumber, setRoomNumber] = useState('');
    const guest = booking.guests.find((item) => item.id === guestId);
    const { roomTypes: allRoomTypes, roomNumberOptions } = useGroupOptions();
    const currentPrice =
        allRoomTypes.find((room) => room.name === guest?.roomName)
            ?.pricePerNight || 0;

    const roomTypes = useMemo(() => {
        // Rates come from the rooms themselves, so an unpriced inventory would
        // filter everything out. Offer the full list instead of nothing.
        const priced = allRoomTypes.some((room) => room.pricePerNight > 0);
        if (!priced) return allRoomTypes;
        if (mode === 'upgrade') {
            return allRoomTypes.filter(
                (room) => room.pricePerNight > currentPrice,
            );
        }
        if (mode === 'downgrade') {
            return allRoomTypes.filter(
                (room) => room.pricePerNight < currentPrice,
            );
        }
        return allRoomTypes;
    }, [allRoomTypes, currentPrice, mode]);

    const confirmLabel =
        mode === 'upgrade'
            ? 'Upgrade Room'
            : mode === 'downgrade'
              ? 'Downgrade Room'
              : 'Transfer Room';

    return (
        <>
            <div className="space-y-4">
                <GroupSelectField
                    id="change-room-guest"
                    label="Guest"
                    placeholder="Select guest"
                    value={guestId}
                    options={booking.guests.map((item) => ({
                        value: item.id,
                        label: `${item.name} · ${item.roomName} ${item.roomNumber}`,
                    }))}
                    onChange={setGuestId}
                />
                <GroupSelectField
                    id="change-room-type"
                    label="New Room Type"
                    placeholder="Select room type"
                    value={roomTypeId}
                    options={(roomTypes ?? []).map((room) => ({
                        value: room.id,
                        label: room.name,
                    }))}
                    onChange={setRoomTypeId}
                />
                <GroupSelectField
                    id="change-room-number"
                    label="New Room Number"
                    placeholder="Select room number"
                    value={roomNumber}
                    options={roomNumberOptions}
                    onChange={setRoomNumber}
                />
            </div>
            <ActionFooter
                onCancel={onClose}
                confirm={{
                    label: confirmLabel,
                    disabled: !guestId || !roomTypeId || !roomNumber,
                    icon: <ArrowRight className="size-4" />,
                    onClick: () => onChange(guestId, roomTypeId, roomNumber),
                }}
            />
        </>
    );
}
