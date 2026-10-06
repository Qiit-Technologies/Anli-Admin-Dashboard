'use client';

import { Minus, Plus } from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import {
    groupPanelClass,
    groupPanelSubtitleClass,
    groupPanelTitleClass,
} from '../constants';
import type { RoomTypeOption } from '../types';

function QuantityStepper({
    label,
    value,
    max,
    onChange,
}: {
    label: string;
    value: number;
    max: number;
    onChange: (next: number) => void;
}) {
    return (
        <div className="flex shrink-0 items-center gap-1.5">
            <button
                type="button"
                aria-label={`Remove one ${label} room`}
                disabled={value <= 0}
                onClick={() => onChange(Math.max(0, value - 1))}
                className="flex size-7 items-center justify-center rounded-md bg-gray-200/80 text-foreground transition-colors hover:bg-gray-300/80 disabled:opacity-40 disabled:hover:bg-gray-200/80"
            >
                <Minus className="size-3.5" />
            </button>
            <span className="w-6 text-center text-sm font-semibold tabular-nums">
                {value}
            </span>
            <button
                type="button"
                aria-label={`Add one ${label} room`}
                disabled={Number.isFinite(max) && value >= max}
                onClick={() =>
                    onChange(
                        Number.isFinite(max)
                            ? Math.min(max, value + 1)
                            : value + 1,
                    )
                }
                className="flex size-7 items-center justify-center rounded-md bg-gray-200/80 text-foreground transition-colors hover:bg-gray-300/80 disabled:opacity-40 disabled:hover:bg-gray-200/80"
            >
                <Plus className="size-3.5" />
            </button>
        </div>
    );
}

export function RoomsSelectionPanel({
    rooms = [],
    quantities,
    availableByType,
    nights,
    guestLimit,
    onQuantityChange,
}: {
    rooms?: RoomTypeOption[];
    quantities: Record<string, number>;
    availableByType: Record<string, number>;
    nights: number;
    guestLimit: number;
    onQuantityChange: (roomId: string, quantity: number) => void;
}) {
    const totalRooms = Object.values(quantities).reduce(
        (sum, qty) => sum + qty,
        0,
    );
    const totalAmount = rooms.reduce((sum, room) => {
        const qty = quantities[room.id] ?? 0;
        return sum + qty * room.pricePerNight * nights;
    }, 0);

    return (
        <div className={cn(groupPanelClass, 'flex h-full min-h-0 flex-col p-4')}>
            <div className="shrink-0">
                <h3 className={groupPanelTitleClass}>Rooms</h3>
                <p className={groupPanelSubtitleClass}>
                    Up to {guestLimit} room{guestLimit === 1 ? '' : 's'} for{' '}
                    {guestLimit} guest{guestLimit === 1 ? '' : 's'}, including
                    the Master
                </p>
            </div>
            <div className="mt-4 flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto pr-1">
                {rooms.map((room) => {
                    const available = availableByType[room.id] ?? 0;
                    const max = Math.max(0, available);
                    return (
                    <div
                        key={room.id}
                        className="flex items-center justify-between gap-3 rounded-lg bg-[#F6F7F9] px-3 py-2.5"
                    >
                        <div className="min-w-0">
                            <p className="truncate text-[13px] font-semibold text-foreground">
                                {room.name}
                            </p>
                            <p className="mt-0.5 text-[11px] text-muted-foreground">
                                <span className="font-medium text-foreground/70">
                                    {formatCurrency(room.pricePerNight)}
                                </span>{' '}
                                / night
                                <span className="ml-1.5">
                                    · {available} free
                                </span>
                            </p>
                        </div>
                        <QuantityStepper
                            label={room.name}
                            value={quantities[room.id] ?? 0}
                            max={max}
                            onChange={(qty) => onQuantityChange(room.id, qty)}
                        />
                    </div>
                    );
                })}
                {rooms.length === 0 ? (
                    <p className="rounded-md border border-dashed border-gray-200 px-3 py-4 text-center text-xs text-muted-foreground">
                        No room types loaded. Refresh the page or check hotel
                        inventory.
                    </p>
                ) : null}
            </div>
            <div className="mt-2 flex shrink-0 items-center gap-3 rounded-lg bg-hexbrand px-3 py-2 text-white">
                <span className="text-xs font-semibold">Total Rooms</span>
                <span className="ml-auto text-xs font-semibold tabular-nums">
                    {formatCurrency(totalAmount)}
                </span>
                <span className="text-lg font-bold leading-none tabular-nums">
                    {totalRooms}
                </span>
            </div>
        </div>
    );
}
