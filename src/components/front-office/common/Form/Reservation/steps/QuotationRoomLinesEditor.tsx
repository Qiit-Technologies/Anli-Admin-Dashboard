'use client';

import { InputField, SelectField } from '@/components/common/Form';
import { Button } from '@/components/ui/button';
import type { QuotationRoomLine } from '@/lib/front-office/quotation-room-lines';
import {
    calculateNightsFromDates,
    getRoomNightlyRate,
    normalizeQuotationRooms,
} from '@/lib/front-office/quotation-room-lines';
import { formatPrintMoney } from '@/lib/front-office/print-document-utils';
import { Plus, Trash2 } from 'lucide-react';
import type { FormDataType } from '../types';

interface QuotationRoomLinesEditorProps {
    formData: Partial<FormDataType>;
    roomTypes: Array<{ id: number; name?: string; rooms?: Array<{ price?: number }> }>;
    handleInputChange: (field: keyof FormDataType, value: unknown) => void;
    inputClass: string;
    lineErrors?: Record<string, string>;
}

export function QuotationRoomLinesEditor({
    formData,
    roomTypes,
    handleInputChange,
    inputClass,
    lineErrors = {},
}: QuotationRoomLinesEditorProps) {
    const lines = normalizeQuotationRooms(formData.quotationRooms);
    const defaultStart = formData.startDate || '';
    const defaultEnd = formData.endDate || '';

    const updateLines = (nextLines: QuotationRoomLine[]) => {
        handleInputChange('quotationRooms', nextLines);
    };

    const addLine = () => {
        const fallback = roomTypes[0];
        if (!fallback) return;

        updateLines([
            ...lines,
            {
                roomTypeId: fallback.id,
                quantity: 1,
                startDate: defaultStart,
                endDate: defaultEnd,
            },
        ]);
    };

    const removeLine = (index: number) => {
        updateLines(lines.filter((_, i) => i !== index));
    };

    const updateLine = (index: number, patch: Partial<QuotationRoomLine>) => {
        updateLines(
            lines.map((line, i) => (i === index ? { ...line, ...patch } : line)),
        );
    };

    const roomOptions = (roomTypes ?? []).map((type) => ({
        value: type.id.toString(),
        label: type.name || `Room type ${type.id}`,
    }));

    return (
        <div className="flex flex-col gap-3">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-sm font-medium text-gray-900">
                        Additional reservations
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        Each room type is a separate stay with its own dates.
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

            {lines.length === 0 ? (
                <p className="text-xs text-muted-foreground rounded-md border border-dashed border-gray-300 px-4 py-3">
                    No additional reservations. The invoice will include the
                    primary room only.
                </p>
            ) : (
                <div className="flex flex-col gap-3">
                    {lines.map((line, index) => {
                        const nights = calculateNightsFromDates(
                            line.startDate || defaultStart,
                            line.endDate || defaultEnd,
                        );
                        const rate = getRoomNightlyRate(roomTypes, line.roomTypeId);
                        const lineTotal = rate * nights * line.quantity;

                        return (
                            <div
                                key={`quotation-line-${index}`}
                                className="rounded-md border border-gray-200 bg-white p-4 flex flex-col gap-3"
                            >
                                <div className="flex items-center justify-between gap-2">
                                    <p className="text-sm font-medium text-gray-900">
                                        Reservation {index + 2}
                                    </p>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="shrink-0 text-destructive hover:text-destructive"
                                        title="Remove reservation"
                                        onClick={() => removeLine(index)}
                                    >
                                        <Trash2 className="size-4" />
                                    </Button>
                                </div>

                                <SelectField
                                    id={`quotation-room-${index}`}
                                    name={`quotation-room-${index}`}
                                    label="Room type"
                                    className={inputClass}
                                    value={line.roomTypeId?.toString() || ''}
                                    onValueChange={(value) =>
                                        updateLine(index, {
                                            roomTypeId: parseInt(value, 10),
                                        })
                                    }
                                    options={roomOptions}
                                    placeholder="Select room type"
                                />

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <InputField
                                        id={`quotation-check-in-${index}`}
                                        name={`quotation-check-in-${index}`}
                                        label="Check-in"
                                        type="date"
                                        className={inputClass}
                                        value={line.startDate || defaultStart}
                                        onChange={(e) =>
                                            updateLine(index, {
                                                startDate: e.target.value,
                                            })
                                        }
                                    />
                                    <InputField
                                        id={`quotation-check-out-${index}`}
                                        name={`quotation-check-out-${index}`}
                                        label="Check-out"
                                        type="date"
                                        className={inputClass}
                                        value={line.endDate || defaultEnd}
                                        onChange={(e) =>
                                            updateLine(index, {
                                                endDate: e.target.value,
                                            })
                                        }
                                    />
                                </div>

                                {(lineErrors[`line-${index}-startDate`] ||
                                    lineErrors[`line-${index}-endDate`]) && (
                                    <p className="text-sm text-red-500 -mt-1">
                                        {lineErrors[`line-${index}-startDate`] ||
                                            lineErrors[`line-${index}-endDate`]}
                                    </p>
                                )}

                                <p className="text-xs text-muted-foreground">
                                    {nights} night{nights === 1 ? '' : 's'} ·{' '}
                                    {formatPrintMoney(rate)}/night · Line total{' '}
                                    {formatPrintMoney(lineTotal)}
                                </p>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
