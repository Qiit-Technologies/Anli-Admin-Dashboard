'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { ArrowRight } from 'lucide-react';
import { useMemo, useState } from 'react';
import { checkInBlockReason } from '../form/group-party';
import type { GroupBooking, GroupStayStatus } from '../types';
import { ActionFooter } from './ActionFooter';

const checkboxClass =
    'size-4 shadow-none data-[state=checked]:border-emerald-600 data-[state=checked]:bg-emerald-600';

export function BulkStayActionPanel({
    booking,
    stayStatus,
    emptyLabel,
    confirmLabel,
    onClose,
    onConfirm,
}: {
    booking: GroupBooking;
    stayStatus: GroupStayStatus;
    emptyLabel: string;
    confirmLabel: string;
    onClose: () => void;
    onConfirm: (guestIds: string[]) => void;
}) {
    const guests = useMemo(
        () =>
            booking.guests.filter((guest) => guest.stayStatus === stayStatus),
        [booking, stayStatus],
    );
    const selectable = useMemo(
        () =>
            guests.filter(
                (guest) =>
                    stayStatus !== 'expected' ||
                    !checkInBlockReason(guest.startDate),
            ),
        [guests, stayStatus],
    );
    const [selected, setSelected] = useState<string[]>(() =>
        selectable.map((guest) => guest.id),
    );
    const allSelected =
        selectable.length > 0 && selected.length === selectable.length;

    return (
        <>
            <label className="mb-3 flex cursor-pointer items-center gap-2 text-sm font-medium">
                <Checkbox
                    checked={allSelected}
                    className={checkboxClass}
                    onCheckedChange={(checked) =>
                        setSelected(
                            checked ? selectable.map((guest) => guest.id) : [],
                        )
                    }
                />
                {allSelected ? 'Deselect All' : 'Select All'} ({selected.length})
            </label>
            <div className="max-h-72 space-y-2 overflow-y-auto">
                {guests.length === 0 ? (
                    <p className="rounded-md border border-gray-100 p-4 text-sm text-muted-foreground">
                        {emptyLabel}
                    </p>
                ) : (
                    guests.map((guest) => {
                        const blocked =
                            stayStatus === 'expected'
                                ? checkInBlockReason(guest.startDate)
                                : null;
                        return (
                        <label
                            key={guest.id}
                            className="flex items-center gap-3 rounded-md border border-gray-100 px-3 py-2.5"
                        >
                            <Checkbox
                                checked={selected.includes(guest.id)}
                                disabled={Boolean(blocked)}
                                className={checkboxClass}
                                onCheckedChange={(checked) =>
                                    setSelected((prev) =>
                                        checked
                                            ? [...prev, guest.id]
                                            : prev.filter(
                                                  (id) => id !== guest.id,
                                              ),
                                    )
                                }
                            />
                            <span className="min-w-0 flex-1">
                                <span className="block truncate text-[13px] font-semibold text-foreground">
                                    {guest.name}
                                </span>
                                <span className="block text-[11px] text-muted-foreground">
                                    {blocked || `Room ${guest.roomNumber}`}
                                </span>
                            </span>
                        </label>
                        );
                    })
                )}
            </div>
            <ActionFooter
                onCancel={onClose}
                confirm={{
                    label: `${confirmLabel} (${selected.length})`,
                    disabled: selected.length === 0,
                    icon: <ArrowRight className="size-4" />,
                    onClick: () => onConfirm(selected),
                }}
            />
        </>
    );
}
