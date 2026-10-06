'use client';

import { ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { GroupDateField, GroupSelectField } from '../form/GroupFormFields';
import type { GroupBooking } from '../types';
import { ActionFooter } from './ActionFooter';

export function ExtendStayPanel({
    booking,
    selectedGuestId,
    onClose,
    onExtend,
}: {
    booking: GroupBooking;
    selectedGuestId: string | null;
    onClose: () => void;
    onExtend: (guestId: string, departureDate: Date) => void;
}) {
    const [guestId, setGuestId] = useState(selectedGuestId || '');
    const [departureDate, setDepartureDate] = useState<Date | undefined>();

    return (
        <>
            <div className="space-y-4">
                <GroupSelectField
                    id="extend-guest"
                    label="Guest"
                    placeholder="Select guest"
                    value={guestId}
                    options={booking.guests.map((guest) => ({
                        value: guest.id,
                        label: `${guest.name} · ${guest.reservationId}`,
                    }))}
                    onChange={setGuestId}
                />
                <GroupDateField
                    id="extend-date"
                    label="New Departure Date"
                    value={departureDate}
                    onChange={setDepartureDate}
                />
            </div>
            <ActionFooter
                onCancel={onClose}
                confirm={{
                    label: 'Extend Stay',
                    disabled: !guestId || !departureDate,
                    icon: <ArrowRight className="size-4" />,
                    onClick: () =>
                        departureDate && onExtend(guestId, departureDate),
                }}
            />
        </>
    );
}
