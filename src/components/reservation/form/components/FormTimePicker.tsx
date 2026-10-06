'use client';

import React from 'react';
import { Control, Controller, FieldValues, Path } from 'react-hook-form';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

interface FormTimePickerProps<T extends FieldValues> {
    label: string;
    name: Path<T>;
    control: Control<T>;
    placeholder?: string;
    error?: string;
    icon?: React.ReactNode;
    className?: string;
}

export default function FormTimePicker<T extends FieldValues>({
    label,
    name,
    control,
    placeholder = 'Select time',
    error,
    icon,
    className = '',
}: FormTimePickerProps<T>) {
    const hours = Array.from({ length: 12 }, (_, i) => i + 1);
    const minutes = Array.from({ length: 60 }, (_, i) => i);
    const periods = ['AM', 'PM'];

    const formatTime = (time: string) => {
        if (!time) return placeholder;
        // Assuming time is in "HH:mm AM/PM" or "HH:mm" format
        return time;
    };

    return (
        <div className="w-full">
            <label className="block text-sm text-[#919191] mb-2">{label}</label>
            <Controller
                name={name}
                control={control}
                render={({ field }) => {
                    const [currentHour, currentMinute, currentPeriod] =
                        field.value
                            ? field.value.split(/[: ]/)
                            : ['12', '00', 'PM'];

                    const updateTime = (h: string, m: string, p: string) => {
                        field.onChange(`${h}:${m} ${p}`);
                    };

                    return (
                        <Popover>
                            <PopoverTrigger asChild>
                                <button
                                    type="button"
                                    className={cn(
                                        'w-full px-4 h-14 md:h-16 border rounded-[8px] text-sm transition-colors text-left flex items-center relative',
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
                                    <span>{formatTime(field.value)}</span>
                                </button>
                            </PopoverTrigger>
                            <PopoverContent
                                className="w-[280px] p-0"
                                align="start"
                            >
                                <div className="flex h-64">
                                    <div className="flex-1 flex flex-col border-r">
                                        <div className="p-2 text-center text-xs font-semibold text-gray-500 bg-gray-50">
                                            Hour
                                        </div>
                                        <ScrollArea className="flex-1">
                                            {hours.map((h) => {
                                                const hStr = h
                                                    .toString()
                                                    .padStart(2, '0');
                                                return (
                                                    <button
                                                        key={h}
                                                        className={cn(
                                                            'w-full px-2 py-2 text-sm hover:bg-gray-100 transition-colors text-center',
                                                            currentHour ===
                                                                hStr &&
                                                                'bg-blue-50 text-blue-600 font-bold',
                                                        )}
                                                        onClick={() =>
                                                            updateTime(
                                                                hStr,
                                                                currentMinute,
                                                                currentPeriod,
                                                            )
                                                        }
                                                    >
                                                        {hStr}
                                                    </button>
                                                );
                                            })}
                                        </ScrollArea>
                                    </div>
                                    <div className="flex-1 flex flex-col border-r">
                                        <div className="p-2 text-center text-xs font-semibold text-gray-500 bg-gray-50">
                                            Min
                                        </div>
                                        <ScrollArea className="flex-1">
                                            {minutes.map((m) => {
                                                const mStr = m
                                                    .toString()
                                                    .padStart(2, '0');
                                                return (
                                                    <button
                                                        key={m}
                                                        className={cn(
                                                            'w-full px-2 py-2 text-sm hover:bg-gray-100 transition-colors text-center',
                                                            currentMinute ===
                                                                mStr &&
                                                                'bg-blue-50 text-blue-600 font-bold',
                                                        )}
                                                        onClick={() =>
                                                            updateTime(
                                                                currentHour,
                                                                mStr,
                                                                currentPeriod,
                                                            )
                                                        }
                                                    >
                                                        {mStr}
                                                    </button>
                                                );
                                            })}
                                        </ScrollArea>
                                    </div>
                                    <div className="flex-1 flex flex-col">
                                        <div className="p-2 text-center text-xs font-semibold text-gray-500 bg-gray-50">
                                            AM/PM
                                        </div>
                                        <div className="flex-1 flex flex-col justify-center">
                                            {periods.map((p) => (
                                                <button
                                                    key={p}
                                                    className={cn(
                                                        'w-full px-2 py-4 text-sm hover:bg-gray-100 transition-colors text-center font-medium',
                                                        currentPeriod === p &&
                                                            'bg-blue-50 text-blue-600 font-bold',
                                                    )}
                                                    onClick={() =>
                                                        updateTime(
                                                            currentHour,
                                                            currentMinute,
                                                            p,
                                                        )
                                                    }
                                                >
                                                    {p}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </PopoverContent>
                        </Popover>
                    );
                }}
            />
            {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        </div>
    );
}
