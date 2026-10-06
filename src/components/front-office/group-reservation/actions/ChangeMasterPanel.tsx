'use client';

import { ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { GroupSelectField } from '../form/GroupFormFields';
import type { GroupBooking } from '../types';
import { ActionFooter } from './ActionFooter';

export function ChangeMasterPanel({
    booking,
    onClose,
    onSave,
}: {
    booking: GroupBooking;
    onClose: () => void;
    onSave: (guestId: string) => void;
}) {
    const current =
        booking.guests.find(
            (guest) =>
                guest.name.trim().toLowerCase() ===
                booking.contactName.trim().toLowerCase(),
        )?.id ||
        booking.guests[0]?.id ||
        '';
    const [guestId, setGuestId] = useState(current);

    return (
        <>
            <p className="mb-3 text-xs text-muted-foreground">
                The master is the contact for this group folio. Pick a guest
                already on the reservation.
            </p>
            <GroupSelectField
                id="change-master"
                label="New master"
                value={guestId}
                options={booking.guests.map((guest) => ({
                    value: guest.id,
                    label: `${guest.name} · room ${guest.roomNumber}`,
                }))}
                onChange={setGuestId}
            />
            <ActionFooter
                onCancel={onClose}
                confirm={{
                    label: 'Change Master',
                    disabled: !guestId,
                    icon: <ArrowRight className="size-4" />,
                    onClick: () => onSave(guestId),
                }}
            />
        </>
    );
}
