'use client';

import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn, formatCurrency } from '@/lib/utils';
import { ArrowRight, LayoutList } from 'lucide-react';
import { useMemo, useState } from 'react';
import { allocateShares } from '../form/groupBilling';
import type { GroupBooking, SplitBillMode } from '../types';
import { ActionFooter } from './ActionFooter';

const OPTIONS: {
    value: SplitBillMode;
    title: string;
    description: (booking: GroupBooking) => string;
}[] = [
    {
        value: 'equal',
        title: 'Equal Split',
        description: (booking) =>
            `${formatCurrency(
                booking.amount / Math.max(booking.guests.length, 1),
            )} per guest`,
    },
    {
        value: 'individual',
        title: 'Individual Billing',
        description: () => 'Each guest billed separately per consumption',
    },
    {
        value: 'custom',
        title: 'Custom Split',
        description: () => 'Set custom amounts per guest or room',
    },
];

export type SplitShare = { guestId: string; amount: number };

export function SplitBillsPanel({
    booking,
    onClose,
    onApply,
}: {
    booking: GroupBooking;
    onClose: () => void;
    onApply: (mode: SplitBillMode, shares: SplitShare[]) => void;
}) {
    const [mode, setMode] = useState<SplitBillMode>('equal');
    const [step, setStep] = useState<'choose' | 'review'>('choose');
    const guestCount = Math.max(booking.guests.length, 1);
    const equalShares = useMemo(
        () => allocateShares(booking.amount, booking.guests.map(() => 1)),
        [booking.amount, booking.guests],
    );
    const [customAmounts, setCustomAmounts] = useState<Record<string, string>>(
        () =>
            Object.fromEntries(
                booking.guests.map((guest, index) => [
                    guest.id,
                    String(equalShares[index] || 0),
                ]),
            ),
    );

    const rows = booking.guests.map((guest, index) => {
        const consumed = guest.billAmount || 0;
        const amount =
            mode === 'equal'
                ? equalShares[index] || 0
                : mode === 'individual'
                  ? consumed
                  : Number(customAmounts[guest.id] || 0);
        return { guest, amount, consumed };
    });
    const customTotal = rows.reduce((sum, row) => sum + row.amount, 0);
    const customMismatch =
        mode === 'custom' &&
        Math.abs(customTotal - booking.amount) > 0.5;

    if (step === 'review') {
        return (
            <>
                <p className="mb-3 text-xs text-muted-foreground">
                    {mode === 'equal'
                        ? `Equal split of ${formatCurrency(booking.amount)} across ${guestCount} guests.`
                        : mode === 'individual'
                          ? 'Each guest keeps the amount they have consumed.'
                          : 'Set how much of the group total each guest should carry.'}
                </p>
                <div className="overflow-hidden rounded-lg border border-gray-100">
                    {rows.map((row) => (
                        <div
                            key={row.guest.id}
                            className="flex items-center gap-3 border-b border-gray-100 px-3 py-2.5 last:border-b-0"
                        >
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-[13px] font-medium">
                                    {row.guest.name}
                                </p>
                                <p className="text-[11px] text-muted-foreground">
                                    {row.guest.roomName}, room{' '}
                                    {row.guest.roomNumber}
                                </p>
                            </div>
                            {mode === 'custom' ? (
                                <Input
                                    inputMode="decimal"
                                    value={
                                        customAmounts[row.guest.id]
                                            ? Number(
                                                  customAmounts[row.guest.id],
                                              ).toLocaleString('en-NG', {
                                                  maximumFractionDigits: 2,
                                              })
                                            : ''
                                    }
                                    onChange={(event) => {
                                        const raw = event.target.value.replace(
                                            /[^0-9.]/g,
                                            '',
                                        );
                                        setCustomAmounts((prev) => ({
                                            ...prev,
                                            [row.guest.id]: raw,
                                        }));
                                    }}
                                    className="h-9 w-32 text-right shadow-none"
                                />
                            ) : (
                                <span className="text-sm font-medium tabular-nums">
                                    {formatCurrency(row.amount)}
                                </span>
                            )}
                        </div>
                    ))}
                </div>
                <p
                    className={cn(
                        'mt-3 text-xs',
                        customMismatch
                            ? 'text-destructive'
                            : 'text-muted-foreground',
                    )}
                >
                    Allocated {formatCurrency(customTotal)} of{' '}
                    {formatCurrency(booking.amount)}
                </p>
            <ActionFooter
                cancelLabel="Back"
                onCancel={() => setStep('choose')}
                    confirm={{
                        label: 'Apply Split',
                        disabled: customMismatch,
                        icon: <LayoutList className="size-4" />,
                        onClick: () =>
                            onApply(
                                mode,
                                rows.map((row) => ({
                                    guestId: row.guest.id,
                                    amount: row.amount,
                                })),
                            ),
                    }}
                />
            </>
        );
    }

    return (
        <>
            <p className="mb-3 text-xs text-foreground">
                Total:{' '}
                <span className="font-medium">
                    {formatCurrency(booking.amount)}
                </span>{' '}
                across {booking.guests.length} guests
            </p>
            <RadioGroup
                value={mode}
                onValueChange={(value) => setMode(value as SplitBillMode)}
                className="gap-2"
            >
                {OPTIONS.map((option) => (
                    <label
                        key={option.value}
                        className={cn(
                            'flex cursor-pointer items-start gap-3 rounded-lg border px-4 py-3',
                            mode === option.value
                                ? 'border-gray-200 bg-card'
                                : 'border-transparent bg-[#F7F8FA]',
                        )}
                    >
                        <RadioGroupItem
                            value={option.value}
                            className="mt-0.5 border-gray-300 text-orion-blue shadow-none data-[state=checked]:border-orion-blue"
                        />
                        <span>
                            <span className="block text-[13px] font-semibold">
                                {option.title}
                            </span>
                            <span className="mt-0.5 block text-xs text-muted-foreground">
                                {option.description(booking)}
                            </span>
                        </span>
                    </label>
                ))}
            </RadioGroup>
            <ActionFooter
                onCancel={onClose}
                confirm={{
                    label: 'Continue',
                    icon: <ArrowRight className="size-4" />,
                    onClick: () => setStep('review'),
                }}
            />
        </>
    );
}
