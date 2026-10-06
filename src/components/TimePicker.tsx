'use client';

import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useEffect, useState } from 'react';

export interface TimePickerProps {
    value?: string | number | Date;
    onChange?: (value: string | number | Date) => void;
    label?: string;
    format?: TimeFormat;
}

export type TimeFormat = 'HH:MM' | 'ISO' | 'TIMESTAMP';

export function TimePicker({
    value,
    onChange,
    label = 'Time Expected',
    format = 'HH:MM',
}: TimePickerProps) {
    const [hour, setHour] = useState<string>('12');
    const [minute, setMinute] = useState<string>('00');
    const [period, setPeriod] = useState<string>('AM');
    const [internalUpdate, setInternalUpdate] = useState<boolean>(false);

    useEffect(() => {
        if (!value || internalUpdate) {
            setInternalUpdate(false);
            return;
        }

        try {
            let date: Date;

            if (value instanceof Date) {
                date = value;
            } else if (typeof value === 'number') {
                date = new Date(value);
            } else if (typeof value === 'string') {
                if (value.includes('T')) {
                    date = new Date(value);
                } else {
                    date = new Date(`2000-01-01T${value}`);
                }
            } else {
                return;
            }

            if (!isNaN(date.getTime())) {
                let hours = date.getHours();
                const minutes = date.getMinutes();

                const newPeriod = hours >= 12 ? 'PM' : 'AM';
                hours = hours % 12;
                hours = hours === 0 ? 12 : hours;

                setHour(hours.toString().padStart(2, '0'));
                setMinute(minutes.toString().padStart(2, '0'));
                setPeriod(newPeriod);
            }
        } catch (e) {
            console.error('Error parsing time value:', e);
        }

        setInternalUpdate(false);
    }, [value, internalUpdate]);

    const handleTimeChange = (
        newHour: string,
        newMinute: string,
        newPeriod: string,
    ) => {
        if (!onChange) return;

        setInternalUpdate(true);

        let hours = parseInt(newHour, 10);
        if (newPeriod === 'PM' && hours < 12) hours += 12;
        if (newPeriod === 'AM' && hours === 12) hours = 0;

        const minutes = parseInt(newMinute, 10);

        const date = new Date();
        date.setHours(hours, minutes, 0, 0);

        let formattedValue: string | number | Date;

        switch (format) {
            case 'ISO':
                formattedValue = date.toISOString();
                break;
            case 'TIMESTAMP':
                formattedValue = date.getTime();
                break;
            case 'HH:MM':
            default:
                formattedValue = `${hours.toString().padStart(2, '0')}:${newMinute}`;
                break;
        }

        onChange(formattedValue);
    };

    const onHourChange = (newHour: string) => {
        setHour(newHour);
        handleTimeChange(newHour, minute, period);
    };

    const onMinuteChange = (newMinute: string) => {
        setMinute(newMinute);
        handleTimeChange(hour, newMinute, period);
    };

    const onPeriodChange = (newPeriod: string) => {
        setPeriod(newPeriod);
        handleTimeChange(hour, minute, newPeriod);
    };

    return (
        <div className="space-y-2">
            {label && <Label>{label}</Label>}
            <div className="flex gap-2">
                <Select value={hour} onValueChange={onHourChange}>
                    <SelectTrigger className="w-20">
                        <SelectValue placeholder="Hour" />
                    </SelectTrigger>
                    <SelectContent>
                        {Array.from({ length: 12 }, (_, i) => {
                            const hourValue = (i + 1)
                                .toString()
                                .padStart(2, '0');
                            return (
                                <SelectItem key={hourValue} value={hourValue}>
                                    {hourValue}
                                </SelectItem>
                            );
                        })}
                    </SelectContent>
                </Select>

                <Select value={minute} onValueChange={onMinuteChange}>
                    <SelectTrigger className="w-20">
                        <SelectValue placeholder="Min" />
                    </SelectTrigger>
                    <SelectContent>
                        {Array.from({ length: 60 }, (_, i) => {
                            const minuteValue = i.toString().padStart(2, '0');
                            return (
                                <SelectItem
                                    key={minuteValue}
                                    value={minuteValue}
                                >
                                    {minuteValue}
                                </SelectItem>
                            );
                        })}
                    </SelectContent>
                </Select>

                <Select value={period} onValueChange={onPeriodChange}>
                    <SelectTrigger className="w-20">
                        <SelectValue placeholder="AM/PM" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="AM">AM</SelectItem>
                        <SelectItem value="PM">PM</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}
