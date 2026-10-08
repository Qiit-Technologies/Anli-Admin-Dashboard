'use client';

import { getAllReservations } from '@/app/actions/reservation';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { StandaloneReservation } from '../types';
import { ActionFooter } from './ActionFooter';

export function AddExistingPanel({
    onClose,
    onAdd,
}: {
    onClose: () => void;
    onAdd: (reservation: StandaloneReservation) => void;
}) {
    const [reservations, setReservations] = useState<StandaloneReservation[]>(
        [],
    );
    const [loading, setLoading] = useState(true);
    const [selectedId, setSelectedId] = useState('');
    const selected = reservations.find((item) => item.id === selectedId);

    useEffect(() => {
        let active = true;
        const load = async () => {
            try {
                const result = await getAllReservations();
                const rows = (result as { data?: any[] })?.data ?? [];
                if (!active) return;
                setReservations(
                    rows
                        // Only reservations that are not already in a group can
                        // be attached to one.
                        .filter((row: any) => !row?.groupReservationId)
                        .map((row: any) => ({
                            id: String(row?.id),
                            backendId: Number(row?.id),
                            name: row?.fullName || 'Guest',
                            roomName: row?.roomType?.name || 'Unassigned',
                            roomNumber: row?.roomNumber || '—',
                        })),
                );
            } finally {
                if (active) setLoading(false);
            }
        };
        void load();
        return () => {
            active = false;
        };
    }, []);

    return (
        <>
            {loading ? (
                <p className="rounded-lg border border-gray-100 p-4 text-sm text-muted-foreground">
                    Loading reservations...
                </p>
            ) : reservations.length === 0 ? (
                <p className="rounded-lg border border-gray-100 p-4 text-sm text-muted-foreground">
                    No standalone reservations available to attach.
                </p>
            ) : (
                <RadioGroup
                    value={selectedId}
                    onValueChange={setSelectedId}
                    className="max-h-72 gap-2 overflow-y-auto"
                >
                    {reservations.map((item) => (
                        <label
                            key={item.id}
                            className="flex cursor-pointer items-start gap-3 rounded-md border border-gray-100 px-3 py-2.5"
                        >
                            <RadioGroupItem
                                value={item.id}
                                className="mt-0.5 border-gray-300 text-orion-blue shadow-none data-[state=checked]:border-orion-blue"
                            />
                            <span className="min-w-0">
                                <span className="block truncate text-[13px] font-semibold">
                                    {item.name}
                                </span>
                                <span className="mt-0.5 block font-mono text-[11px] text-muted-foreground">
                                    {item.roomName}, room {item.roomNumber}
                                </span>
                            </span>
                        </label>
                    ))}
                </RadioGroup>
            )}
            <ActionFooter
                onCancel={onClose}
                confirm={{
                    label: 'Add to Group',
                    disabled: !selected,
                    icon: <ArrowRight className="size-4" />,
                    onClick: () => selected && onAdd(selected),
                }}
            />
        </>
    );
}
