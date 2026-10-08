'use client';

import { Calendar as CalendarIcon, Clock, Search } from 'lucide-react';
import { format } from 'date-fns';
import type { InputHTMLAttributes, ReactNode } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { groupFieldClass, groupLabelClass } from '../constants';

export function GroupField({
    id,
    label,
    required,
    className,
    children,
}: {
    id: string;
    label: string;
    required?: boolean;
    className?: string;
    children: ReactNode;
}) {
    return (
        <div className={cn('flex w-full flex-col', className)}>
            <label htmlFor={id} className={groupLabelClass}>
                {label}
                {required && <span className="text-destructive">*</span>}
            </label>
            {children}
        </div>
    );
}

export type GroupGuestSearchHit = {
    id?: string | number;
    fullName?: string;
    name?: string;
    email?: string;
    phoneNumber?: string | number;
    nationality?: string;
};

export function GroupSearchField({
    value,
    onChange,
    placeholder = 'Search Guest',
    results,
    searching,
    showResults,
    onSelect,
}: {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    results?: GroupGuestSearchHit[];
    searching?: boolean;
    showResults?: boolean;
    onSelect?: (guest: GroupGuestSearchHit) => void;
}) {
    const guestName = (guest: GroupGuestSearchHit) =>
        guest.fullName?.trim() || guest.name?.trim() || 'Unnamed guest';

    return (
        <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
                value={value}
                placeholder={placeholder}
                autoComplete="off"
                onChange={(e) => onChange(e.target.value)}
                className={cn(groupFieldClass, 'rounded-lg pl-10')}
            />
            {searching ? (
                <div className="absolute left-0 right-0 top-full z-20 mt-1 rounded-md border border-gray-200 bg-card px-3 py-2 text-xs text-muted-foreground">
                    Searching guest profiles…
                </div>
            ) : null}
            {showResults && onSelect && !searching && (results?.length ?? 0) > 0 ? (
                <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-56 overflow-y-auto rounded-md border border-gray-200 bg-card">
                    {results?.map((guest, index) => (
                        <button
                            key={guest.id ?? `${guestName(guest)}-${index}`}
                            type="button"
                            className="flex w-full flex-col items-start gap-0.5 border-b border-gray-100 px-3 py-2 text-left last:border-b-0 hover:bg-gray-50"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => onSelect(guest)}
                        >
                            <span className="text-sm font-medium text-foreground">
                                {guestName(guest)}
                            </span>
                            <span className="text-xs text-muted-foreground">
                                {[guest.email, guest.phoneNumber]
                                    .filter(Boolean)
                                    .join(' · ')}
                            </span>
                        </button>
                    ))}
                </div>
            ) : null}
        </div>
    );
}

export function GroupReadOnlyField({
    id,
    label,
    value,
}: {
    id: string;
    label: string;
    value: string;
}) {
    return (
        <GroupField id={id} label={label}>
            <Input
                id={id}
                value={value}
                readOnly
                tabIndex={-1}
                className={cn(
                    groupFieldClass,
                    'cursor-default text-muted-foreground',
                )}
            />
        </GroupField>
    );
}

export function GroupTextField({
    id,
    label,
    value,
    onChange,
    placeholder,
    type = 'text',
    required,
    icon,
    maxLength,
    min,
    max,
    inputMode,
    onBlur,
}: {
    id: string;
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    type?: string;
    required?: boolean;
    icon?: 'search';
    maxLength?: number;
    min?: number;
    max?: number;
    inputMode?: InputHTMLAttributes<HTMLInputElement>['inputMode'];
    onBlur?: () => void;
}) {
    return (
        <GroupField id={id} label={label} required={required}>
            <div className="relative">
                {icon === 'search' && (
                    <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                )}
                <Input
                    id={id}
                    value={value}
                    type={type}
                    min={min}
                    max={max}
                    step={type === 'number' ? 1 : undefined}
                    placeholder={placeholder}
                    maxLength={maxLength}
                    inputMode={inputMode}
                    onBlur={onBlur}
                    onKeyDown={(event) => {
                        if (
                            type === 'number' &&
                            ['e', 'E', '+', '-'].includes(event.key)
                        ) {
                            event.preventDefault();
                        }
                    }}
                    onChange={(e) => {
                        const raw = e.target.value;
                        if (type !== 'number') {
                            onChange(raw);
                            return;
                        }
                        if (raw === '') {
                            onChange('');
                            return;
                        }
                        const next = Number(raw);
                        if (!Number.isFinite(next)) return;
                        const lower = min ?? next;
                        const upper = max ?? next;
                        onChange(String(Math.min(upper, Math.max(lower, next))));
                    }}
                    className={cn(
                        groupFieldClass,
                        icon === 'search' && 'pl-9',
                    )}
                />
            </div>
        </GroupField>
    );
}

export function GroupSelectField({
    id,
    label,
    value,
    onChange,
    options,
    placeholder,
    required,
    disabled,
}: {
    id: string;
    label: string;
    value: string;
    onChange: (value: string) => void;
    options: { value: string; label: string }[];
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
}) {
    const safeOptions = (options ?? []).filter(
        (option) => option.value !== '' && option.value != null,
    );
    const isEmptyOptions = safeOptions.length === 0;

    return (
        <GroupField id={id} label={label} required={required}>
            <Select
                value={value || undefined}
                onValueChange={onChange}
                disabled={disabled || isEmptyOptions}
            >
                <SelectTrigger
                    id={id}
                    className={cn(
                        groupFieldClass,
                        'data-[placeholder]:text-gray-400',
                    )}
                >
                    <SelectValue
                        placeholder={
                            placeholder ||
                            (isEmptyOptions
                                ? 'No options available'
                                : 'Select an option')
                        }
                    />
                </SelectTrigger>
                <SelectContent>
                    {isEmptyOptions ? (
                        <SelectItem value="__none" disabled>
                            No options available
                        </SelectItem>
                    ) : (
                        safeOptions.map((option) => (
                            <SelectItem
                                key={option.value}
                                value={option.value}
                            >
                                {option.label}
                            </SelectItem>
                        ))
                    )}
                </SelectContent>
            </Select>
        </GroupField>
    );
}

export function GroupDateField({
    id,
    label,
    value,
    onChange,
    required,
    disablePast,
}: {
    id: string;
    label: string;
    value: Date | undefined;
    onChange: (date: Date | undefined) => void;
    required?: boolean;
    disablePast?: boolean;
}) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return (
        <GroupField id={id} label={label} required={required}>
            <Popover>
                <PopoverTrigger asChild>
                    <button
                        id={id}
                        type="button"
                        className={cn(
                            groupFieldClass,
                            'flex w-full items-center justify-between border px-3 text-left font-normal',
                            !value && 'text-gray-400',
                        )}
                    >
                        <span>
                            {value ? format(value, 'dd/MM/yyyy') : 'Select date'}
                        </span>
                        <CalendarIcon className="size-4 text-muted-foreground" />
                    </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        mode="single"
                        selected={value}
                        onSelect={onChange}
                        disabled={
                            disablePast
                                ? (date) => {
                                      const day = new Date(date);
                                      day.setHours(0, 0, 0, 0);
                                      return day < today;
                                  }
                                : undefined
                        }
                        initialFocus
                    />
                </PopoverContent>
            </Popover>
        </GroupField>
    );
}

export function GroupTimeField({
    id,
    label,
    value,
    onChange,
}: {
    id: string;
    label: string;
    value: string;
    onChange: (value: string) => void;
}) {
    const hours = Array.from({ length: 12 }, (_, i) => i + 1);
    const minutes = [0, 15, 30, 45];
    const periods = ['AM', 'PM'];
    const [currentHour, currentMinute, currentPeriod] = value
        ? value.split(/[: ]/)
        : ['02', '30', 'PM'];

    const updateTime = (h: string, m: string, p: string) => {
        onChange(`${h}:${m} ${p}`);
    };

    return (
        <GroupField id={id} label={label}>
            <Popover>
                <PopoverTrigger asChild>
                    <button
                        id={id}
                        type="button"
                        className={cn(
                            groupFieldClass,
                            'flex w-full items-center justify-between border px-3 text-left font-normal',
                            !value && 'text-gray-400',
                        )}
                    >
                        <span>{value || 'Select time'}</span>
                        <Clock className="size-4 text-muted-foreground" />
                    </button>
                </PopoverTrigger>
                <PopoverContent className="w-[240px] p-0" align="start">
                    <div className="flex h-56">
                        <div className="flex flex-1 flex-col border-r">
                            <div className="bg-muted px-2 py-1.5 text-center text-[11px] font-medium text-muted-foreground">
                                Hour
                            </div>
                            <ScrollArea className="flex-1">
                                {hours.map((h) => {
                                    const hStr = h.toString().padStart(2, '0');
                                    return (
                                        <button
                                            key={h}
                                            type="button"
                                            className={cn(
                                                'w-full px-2 py-1.5 text-sm hover:bg-muted',
                                                currentHour === hStr &&
                                                    'bg-orion-blue/10 font-medium text-orion-blue',
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
                        <div className="flex flex-1 flex-col border-r">
                            <div className="bg-muted px-2 py-1.5 text-center text-[11px] font-medium text-muted-foreground">
                                Min
                            </div>
                            <ScrollArea className="flex-1">
                                {minutes.map((m) => {
                                    const mStr = m.toString().padStart(2, '0');
                                    return (
                                        <button
                                            key={m}
                                            type="button"
                                            className={cn(
                                                'w-full px-2 py-1.5 text-sm hover:bg-muted',
                                                currentMinute === mStr &&
                                                    'bg-orion-blue/10 font-medium text-orion-blue',
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
                        <div className="flex flex-1 flex-col">
                            <div className="bg-muted px-2 py-1.5 text-center text-[11px] font-medium text-muted-foreground">
                                AM/PM
                            </div>
                            <div className="flex flex-1 flex-col justify-center">
                                {periods.map((p) => (
                                    <button
                                        key={p}
                                        type="button"
                                        className={cn(
                                            'w-full px-2 py-3 text-sm hover:bg-muted',
                                            currentPeriod === p &&
                                                'bg-orion-blue/10 font-medium text-orion-blue',
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
        </GroupField>
    );
}
