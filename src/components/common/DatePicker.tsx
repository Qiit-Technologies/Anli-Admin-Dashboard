'use client';

import { Calendar } from '@/components/ui/calendar';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { FaCalendarAlt } from 'react-icons/fa';
import { useState } from 'react';

interface DatePickerProps {
    id?: string;
    name?: string;
    label?: string;
    value?: string; // YYYY-MM-DD format
    onChange?: (date: string) => void;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
    required?: boolean;
    minDate?: Date;
    maxDate?: Date;
}

export const DatePicker = ({
    id,
    name,
    label,
    value,
    onChange,
    placeholder = 'Select date',
    disabled = false,
    className = '',
    required = false,
    minDate,
    maxDate,
}: DatePickerProps) => {
    const [open, setOpen] = useState(false);

    // Convert string value to Date object
    const selectedDate = value ? new Date(value) : undefined;

    // Handle date selection
    const handleSelect = (date: Date | undefined) => {
        if (date && onChange) {
            // Convert to YYYY-MM-DD format
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            onChange(`${year}-${month}-${day}`);
        }
        setOpen(false);
    };

    return (
        <div className="flex flex-col w-full">
            {label && (
                <label
                    htmlFor={id}
                    className="text-sm font-medium text-muted-foreground mb-1"
                >
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <button
                        type="button"
                        id={id}
                        disabled={disabled}
                        className={cn(
                            'w-full flex items-center justify-between rounded-md h-10 bg-gray-100 border border-gray-100 shadow-sm px-3 text-left text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand disabled:cursor-not-allowed disabled:opacity-50',
                            !selectedDate && 'text-muted-foreground',
                            className,
                        )}
                        style={{
                            fontFamily: 'DM Sans, sans-serif',
                            fontWeight: 500,
                        }}
                    >
                        <span className="flex-1">
                            {selectedDate
                                ? format(selectedDate, 'MMM dd, yyyy')
                                : placeholder}
                        </span>
                        <FaCalendarAlt className="h-4 w-4 text-gray-500 flex-shrink-0" />
                    </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={handleSelect}
                        disabled={(date) => {
                            if (disabled) return true;
                            if (minDate && date < minDate) return true;
                            if (maxDate && date > maxDate) return true;
                            return false;
                        }}
                        initialFocus
                    />
                </PopoverContent>
            </Popover>
            {/* Hidden native input for form compatibility */}
            {name && (
                <input
                    type="hidden"
                    name={name}
                    value={value || ''}
                    required={required}
                />
            )}
        </div>
    );
};
