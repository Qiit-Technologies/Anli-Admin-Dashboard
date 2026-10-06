'use client';

import { ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { GroupSelectField } from '../form/GroupFormFields';
import type { GroupBooking } from '../types';
import { ActionFooter } from './ActionFooter';

export function PullOutPanel({
    booking,
    selectedGuestId,
    onClose,
    onConfirm,
}: {
    booking: GroupBooking;
    selectedGuestId: string | null;
    onClose: () => void;
    onConfirm: (guestId: string) => void;
}) {
    const [guestId, setGuestId] = useState(selectedGuestId || '');

    return (
        <>
            <GroupSelectField
                id="pull-out-guest"
                label="Guest"
                placeholder="Select guest"
                value={guestId}
                options={booking.guests.map((item) => ({
                    value: item.id,
                    label: `${item.name} · ${item.reservationId}`,
                }))}
                onChange={setGuestId}
            />
            <ActionFooter
                onCancel={onClose}
                confirm={{
                    label: 'Pull Out Guest',
                    disabled: !guestId,
                    icon: <ArrowRight className="size-4" />,
                    onClick: () => guestId && onConfirm(guestId),
                }}
            />
        </>
    );
}
