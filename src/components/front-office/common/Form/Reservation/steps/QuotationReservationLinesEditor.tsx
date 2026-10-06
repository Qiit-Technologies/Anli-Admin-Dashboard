'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatPrintMoney } from '@/lib/front-office/print-document-utils';
import type { QuotationRoomLine } from '@/lib/front-office/quotation-room-lines';
import {
    calculateNightsFromDates,
    getRoomNightlyRate,
    getRoomTypeName,
} from '@/lib/front-office/quotation-room-lines';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Plus, Trash2 } from 'lucide-react';
import type { InputHTMLAttributes, SelectHTMLAttributes } from 'react';

interface QuotationReservationLinesEditorProps {
    lines: QuotationRoomLine[];
    roomTypes: Array<{
        id: number;
        name?: string;
        rooms?: Array<{ price?: number }>;
    }>;
    onChange: (lines: QuotationRoomLine[]) => void;
    inputClass: string;
    lineErrors?: Record<string, string>;
    defaultStartDate: string;
    defaultEndDate: string;
    guestName?: string;
}

function formatLineDate(date?: string, time?: string): string {
    if (!date) return '—';
    try {
        const label = format(new Date(date), 'dd MMM yyyy');
        return time ? `${label} ${time}` : label;
    } catch {
        return date;
    }
}

function LineInput({
    className,
    ...props
}: InputHTMLAttributes<HTMLInputElement>) {
    return (
        <Input
            className={cn(
                'h-10 bg-white shadow-none border-gray-300',
                className,
            )}
            {...props}
        />
    );
}

function LineSelect({
    className,
    children,
    ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
    return (
        <select
            className={cn(
                'h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm shadow-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand',
                className,
            )}
            {...props}
        >
            {children}
        </select>
    );
}

export function QuotationReservationLinesEditor({
    lines,
    roomTypes,
    onChange,
    inputClass,
    lineErrors = {},
    defaultStartDate,
    defaultEndDate,
    guestName = '',
}: QuotationReservationLinesEditorProps) {
    const roomOptions = (roomTypes ?? []).map((type) => ({
        value: type.id.toString(),
        label: type.name || `Room type ${type.id}`,
    }));

    const updateLine = (index: number, patch: Partial<QuotationRoomLine>) => {
        onChange(
            lines.map((line, i) => (i === index ? { ...line, ...patch } : line)),
        );
    };

    const addLine = () => {
        const fallback = (roomTypes ?? [])[0];
        if (!fallback) return;

        onChange([
            ...lines,
            {
                roomTypeId: fallback.id,
                quantity: 1,
                startDate: defaultStartDate,
                endDate: defaultEndDate,
                startTime: '14:00',
                endTime: '12:00',
            },
        ]);
    };

    const removeLine = (index: number) => {
        if (lines.length <= 1) return;
        onChange(lines.filter((_, i) => i !== index));
    };

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-sm font-semibold text-gray-900">
                        Reservations
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        Add as many lines as needed. The same room type can be
                        used on different dates or times.
                    </p>
                </div>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addLine}
                    disabled={!(roomTypes ?? []).length}
                >
                    <Plus className="size-4 mr-1" />
                    Add reservation
                </Button>
            </div>

            <div className="overflow-x-auto rounded-md border border-gray-200">
                <table className="w-full min-w-[720px] text-sm">
                    <thead>
                        <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                            <th className="px-3 py-2 font-medium">#</th>
                            <th className="px-3 py-2 font-medium">Room type</th>
                            <th className="px-3 py-2 font-medium">Check-in</th>
                            <th className="px-3 py-2 font-medium">Check-out</th>
                            <th className="px-3 py-2 font-medium text-right">
                                Line total
                            </th>
                            <th className="px-3 py-2 w-10" />
                        </tr>
                    </thead>
                    <tbody>
                        {lines.map((line, index) => {
                            const startDate =
                                line.startDate || defaultStartDate;
                            const endDate = line.endDate || defaultEndDate;
                            const nights = calculateNightsFromDates(
                                startDate,
                                endDate,
                            );
                            const rate = getRoomNightlyRate(
                                roomTypes,
                                line.roomTypeId,
                            );
                            const lineTotal = rate * nights * line.quantity;

                            return (
                                <tr
                                    key={`reservation-line-${index}`}
                                    className="border-b border-gray-100 align-top"
                                >
                                    <td className="px-3 py-3 text-muted-foreground">
                                        {index + 1}
                                    </td>
                                    <td className="px-3 py-3">
                                        <LineSelect
                                            id={`reservation-room-${index}`}
                                            name={`reservation-room-${index}`}
                                            className={inputClass}
                                            value={
                                                line.roomTypeId > 0
                                                    ? String(line.roomTypeId)
                                                    : ''
                                            }
                                            onChange={(e) =>
                                                updateLine(index, {
                                                    roomTypeId:
                                                        Number.parseInt(
                                                            e.target.value,
                                                            10,
                                                        ) || 0,
                                                })
                                            }
                                        >
                                            <option value="">
                                                Select room type
                                            </option>
                                            {roomOptions.map((option) => (
                                                <option
                                                    key={option.value}
                                                    value={option.value}
                                                >
                                                    {option.label}
                                                </option>
                                            ))}
                                        </LineSelect>
                                        {lineErrors[
                                            `line-${index}-roomType`
                                        ] && (
                                            <p className="text-xs text-red-500 mt-1">
                                                {
                                                    lineErrors[
                                                        `line-${index}-roomType`
                                                    ]
                                                }
                                            </p>
                                        )}
                                    </td>
                                    <td className="px-3 py-3">
                                        <div className="flex flex-col gap-2">
                                            <LineInput
                                                id={`reservation-check-in-${index}`}
                                                name={`reservation-check-in-${index}`}
                                                type="date"
                                                className={inputClass}
                                                value={startDate}
                                                onChange={(e) =>
                                                    updateLine(index, {
                                                        startDate:
                                                            e.target.value,
                                                    })
                                                }
                                            />
                                            <LineInput
                                                id={`reservation-check-in-time-${index}`}
                                                name={`reservation-check-in-time-${index}`}
                                                type="time"
                                                className={inputClass}
                                                value={
                                                    line.startTime || '14:00'
                                                }
                                                onChange={(e) =>
                                                    updateLine(index, {
                                                        startTime:
                                                            e.target.value,
                                                    })
                                                }
                                            />
                                        </div>
                                        {lineErrors[
                                            `line-${index}-startDate`
                                        ] && (
                                            <p className="text-xs text-red-500 mt-1">
                                                {
                                                    lineErrors[
                                                        `line-${index}-startDate`
                                                    ]
                                                }
                                            </p>
                                        )}
                                    </td>
                                    <td className="px-3 py-3">
                                        <div className="flex flex-col gap-2">
                                            <LineInput
                                                id={`reservation-check-out-${index}`}
                                                name={`reservation-check-out-${index}`}
                                                type="date"
                                                className={inputClass}
                                                value={endDate}
                                                onChange={(e) =>
                                                    updateLine(index, {
                                                        endDate: e.target.value,
                                                    })
                                                }
                                            />
                                            <LineInput
                                                id={`reservation-check-out-time-${index}`}
                                                name={`reservation-check-out-time-${index}`}
                                                type="time"
                                                className={inputClass}
                                                value={line.endTime || '12:00'}
                                                onChange={(e) =>
                                                    updateLine(index, {
                                                        endTime: e.target.value,
                                                    })
                                                }
                                            />
                                        </div>
                                        {lineErrors[
                                            `line-${index}-endDate`
                                        ] && (
                                            <p className="text-xs text-red-500 mt-1">
                                                {
                                                    lineErrors[
                                                        `line-${index}-endDate`
                                                    ]
                                                }
                                            </p>
                                        )}
                                    </td>
                                    <td className="px-3 py-3 text-right whitespace-nowrap">
                                        <p className="font-medium text-gray-900">
                                            {formatPrintMoney(lineTotal)}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            {nights} night
                                            {nights === 1 ? '' : 's'} ·{' '}
                                            {formatPrintMoney(rate)}/night
                                        </p>
                                    </td>
                                    <td className="px-3 py-3">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="text-destructive hover:text-destructive"
                                            title="Remove reservation"
                                            disabled={lines.length <= 1}
                                            onClick={() => removeLine(index)}
                                        >
                                            <Trash2 className="size-4" />
                                        </Button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {lines.some((line) => line.roomTypeId > 0) && (
                <div className="rounded-md border border-dashed border-gray-300 px-4 py-3">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2">
                        Invoice preview
                    </p>
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[640px] text-xs">
                            <thead>
                                <tr className="text-left text-muted-foreground border-b border-gray-200">
                                    <th className="py-1 pr-3">Guest</th>
                                    <th className="py-1 pr-3">Room</th>
                                    <th className="py-1 pr-3">Check-in</th>
                                    <th className="py-1 pr-3">Check-out</th>
                                    <th className="py-1 text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {lines
                                    .filter((line) => line.roomTypeId > 0)
                                    .map((line, index) => {
                                        const startDate =
                                            line.startDate || defaultStartDate;
                                        const endDate =
                                            line.endDate || defaultEndDate;
                                        const nights =
                                            calculateNightsFromDates(
                                                startDate,
                                                endDate,
                                            );
                                        const rate = getRoomNightlyRate(
                                            roomTypes,
                                            line.roomTypeId,
                                        );

                                        return (
                                            <tr
                                                key={`preview-${index}`}
                                                className="border-b border-gray-100"
                                            >
                                                <td className="py-2 pr-3">
                                                    {guestName.trim() || '—'}
                                                </td>
                                                <td className="py-2 pr-3">
                                                    {getRoomTypeName(
                                                        roomTypes,
                                                        line.roomTypeId,
                                                    )}
                                                </td>
                                                <td className="py-2 pr-3">
                                                    {formatLineDate(
                                                        startDate,
                                                        line.startTime,
                                                    )}
                                                </td>
                                                <td className="py-2 pr-3">
                                                    {formatLineDate(
                                                        endDate,
                                                        line.endTime,
                                                    )}
                                                </td>
                                                <td className="py-2 text-right">
                                                    {formatPrintMoney(
                                                        rate *
                                                            nights *
                                                            line.quantity,
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
