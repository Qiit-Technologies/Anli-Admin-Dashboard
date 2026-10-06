'use client';

import { ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { GroupSelectField } from '../form/GroupFormFields';
import type { GroupBooking } from '../types';
import { ActionFooter } from './ActionFooter';

export function TransferChargesPanel({
    booking,
    selectedGuestId,
    onClose,
    onTransfer,
}: {
    booking: GroupBooking;
    selectedGuestId: string | null;
    onClose: () => void;
    onTransfer: (fromGuestId: string, to: 'master' | string) => void;
}) {
    const [fromId, setFromId] = useState(selectedGuestId || '');
    const [toId, setToId] = useState('master');

    return (
        <>
            <div className="space-y-4">
                <GroupSelectField
                    id="charges-from"
                    label="From"
                    placeholder="Select guest"
                    value={fromId}
                    options={booking.guests.map((guest) => ({
                        value: guest.id,
                        label: `${guest.name} · ${guest.reservationId}`,
                    }))}
                    onChange={setFromId}
                />
                <GroupSelectField
                    id="charges-to"
                    label="To"
                    value={toId}
                    options={[
                        { value: 'master', label: `Master folio · ${booking.id}` },
                        ...booking.guests
                            .filter((guest) => guest.id !== fromId)
                            .map((guest) => ({
                                value: guest.id,
                                label: `${guest.name} · ${guest.reservationId}`,
                            })),
                    ]}
                    onChange={setToId}
                />
            </div>
            <ActionFooter
                onCancel={onClose}
                confirm={{
                    label: 'Transfer Charges',
                    disabled: !fromId || !toId,
                    icon: <ArrowRight className="size-4" />,
                    onClick: () => onTransfer(fromId, toId),
                }}
            />
        </>
    );
}
