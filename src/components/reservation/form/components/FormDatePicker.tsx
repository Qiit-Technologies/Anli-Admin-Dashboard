'use client';

import React from 'react';
import { Control, Controller, FieldValues, Path } from 'react-hook-form';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface FormDatePickerProps<T extends FieldValues> {
    label: string;
    name: Path<T>;
    control: Control<T>;
    placeholder?: string;
    error?: string;
    icon?: React.ReactNode;
    className?: string;
    blockedDates?: {
        startDate: string;
        endDate: string;
        reason?: string;
        spaceName?: string;
        capacity?: string;
    }[];
}

export default function FormDatePicker<T extends FieldValues>({
    label,
    name,
    control,
    placeholder = 'Select date',
    error,
    icon,
    className = '',
    blockedDates = [],
}: FormDatePickerProps<T>) {
    const getDisabledReason = (date: Date) => {
        // Normalize to local midnight for accurate comparison regardless of timezone
        const check = new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate(),
        ).getTime();

        const blocked = blockedDates.find((blocked) => {
            const startDate = new Date(blocked.startDate);
            const start = new Date(
                startDate.getFullYear(),
                startDate.getMonth(),
                startDate.getDate(),
            ).getTime();

            const endDate = new Date(blocked.endDate);
            const end = new Date(
                endDate.getFullYear(),
                endDate.getMonth(),
                endDate.getDate(),
            ).getTime();

            return check >= start && check <= end;
        });

        return blocked
            ? blocked.reason || 'This date is blocked for reservations'
            : null;
    };

    const isDateDisabled = (date: Date) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Disable past dates
        if (date < today) return true;

        return !!getDisabledReason(date);
    };

    return (
        <div className="w-full">
            <label className="block text-sm text-[#919191] mb-2">{label}</label>
            <Controller
                name={name}
                control={control}
                render={({ field }) => (
                    <Popover>
                        <PopoverTrigger asChild>
                            <button
                                type="button"
                                className={cn(
                                    'w-full px-4 h-[50px] md:h-16 border rounded-[8px] text-sm transition-colors text-left flex items-center relative',
                                    icon ? 'pl-12' : '',
                                    error
                                        ? 'border-red-400 bg-red-50'
                                        : 'border-[#D5D4D4]',
                                    !field.value &&
                                        'text-[#8592AC] font-semibold text-[16px]',
                                    className,
                                )}
                            >
                                {icon && (
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                        {icon}
                                    </div>
                                )}
                                <span>
                                    {field.value
                                        ? format(new Date(field.value), 'PPP')
                                        : placeholder}
                                </span>
                            </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={
                                    field.value
                                        ? new Date(field.value)
                                        : undefined
                                }
                                onSelect={(date) => {
                                    if (date) {
                                        // Convert to YYYY-MM-DD for consistency
                                        const year = date.getFullYear();
                                        const month = String(
                                            date.getMonth() + 1,
                                        ).padStart(2, '0');
                                        const day = String(
                                            date.getDate(),
                                        ).padStart(2, '0');
                                        field.onChange(
                                            `${year}-${month}-${day}`,
                                        );
                                    }
                                }}
                                initialFocus
                                disabled={isDateDisabled}
                                disabledReason={getDisabledReason}
                                showFooter={blockedDates.length > 0}
                            />
                        </PopoverContent>
                    </Popover>
                )}
            />
            {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        </div>
    );
}
