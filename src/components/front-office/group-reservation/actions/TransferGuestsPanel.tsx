'use client';

import { ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { GroupSelectField } from '../form/GroupFormFields';
import type { GroupBooking } from '../types';
import { ActionFooter } from './ActionFooter';

export function TransferGuestsPanel({
    booking,
    bookings,
    selectedGuestId,
    onClose,
    onTransfer,
}: {
    booking: GroupBooking;
    bookings: GroupBooking[];
    selectedGuestId: string | null;
    onClose: () => void;
    onTransfer: (guestId: string, targetGroupId: string) => void;
}) {
    const [guestId, setGuestId] = useState(selectedGuestId || '');
    const [targetId, setTargetId] = useState('');
    const targets = bookings.filter((item) => item.id !== booking.id);

    return (
        <>
            <div className="space-y-4">
                <GroupSelectField
                    id="transfer-guest"
                    label="Guest Name"
                    placeholder="Select guest"
                    value={guestId}
                    options={booking.guests.map((guest) => ({
                        value: guest.id,
                        label: guest.name,
                    }))}
                    onChange={setGuestId}
                />
                <GroupSelectField
                    id="transfer-target"
                    label="Transfer to"
                    placeholder="Select new Group Reservation"
                    value={targetId}
                    options={targets.map((item) => ({
                        value: item.id,
                        label: `${item.name} · ${item.id}`,
                    }))}
                    onChange={setTargetId}
                />
            </div>
            <ActionFooter
                onCancel={onClose}
                confirm={{
                    label: 'Transfer',
                    disabled: !guestId || !targetId,
                    icon: <ArrowRight className="size-4" />,
                    onClick: () => onTransfer(guestId, targetId),
                }}
            />
        </>
    );
}
