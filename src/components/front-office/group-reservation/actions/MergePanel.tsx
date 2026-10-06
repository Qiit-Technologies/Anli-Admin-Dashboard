'use client';

import { ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { GroupSelectField } from '../form/GroupFormFields';
import type { GroupBooking } from '../types';
import { ActionFooter } from './ActionFooter';

export function MergePanel({
    booking,
    bookings,
    onClose,
    onMerge,
}: {
    booking: GroupBooking;
    bookings: GroupBooking[];
    onClose: () => void;
    onMerge: (sourceGroupId: string) => void;
}) {
    const [sourceId, setSourceId] = useState('');
    const sources = bookings.filter((item) => item.id !== booking.id);

    return (
        <>
            <GroupSelectField
                id="merge-source"
                label="Merge from"
                placeholder="Select group reservation"
                value={sourceId}
                options={sources.map((item) => ({
                    value: item.id,
                    label: `${item.name} · ${item.id}`,
                }))}
                onChange={setSourceId}
            />
            <ActionFooter
                onCancel={onClose}
                confirm={{
                    label: 'Merge',
                    disabled: !sourceId,
                    icon: <ArrowRight className="size-4" />,
                    onClick: () => onMerge(sourceId),
                }}
            />
        </>
    );
}
