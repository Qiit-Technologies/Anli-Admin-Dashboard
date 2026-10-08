'use client';

import { FormField } from '@/components/common/Form';
import { Input } from '@/components/ui/input';
import {
    amountRawToNumber,
    formatAmountDisplay,
    parseAmountRaw,
} from '@/lib/amount-format';
import { cn } from '@/lib/utils';
import React, { ReactNode, useCallback, useEffect, useState } from 'react';

export interface AmountInputProps {
    id?: string;
    name?: string;
    label?: string | ReactNode;
    value: string;
    onChange: (value: string) => void;
    onValueNumberChange?: (value: number) => void;
    currencySymbol?: string;
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
    readOnly?: boolean;
    className?: string;
    inputClassName?: string;
    symbolClassName?: string;
    bare?: boolean;
    decimals?: number;
    locale?: string;
}

export default function AmountInput({
    id,
    name,
    label,
    value,
    onChange,
    onValueNumberChange,
    currencySymbol = '₦',
    placeholder = '0.00',
    required = false,
    disabled = false,
    readOnly = false,
    className,
    inputClassName,
    symbolClassName,
    bare = false,
    decimals = 2,
    locale = 'en-NG',
}: Readonly<AmountInputProps>) {
    const [focused, setFocused] = useState(false);
    const [display, setDisplay] = useState(() =>
        formatAmountDisplay(value, { decimals, locale }),
    );

    useEffect(() => {
        if (!focused) {
            setDisplay(formatAmountDisplay(value, { decimals, locale }));
        }
    }, [value, focused, decimals, locale]);

    const emit = useCallback(
        (raw: string) => {
            const normalized = parseAmountRaw(raw);
            onChange(normalized);
            onValueNumberChange?.(amountRawToNumber(normalized));
        },
        [onChange, onValueNumberChange],
    );

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const next = parseAmountRaw(e.target.value);
        setDisplay(e.target.value);
        emit(next);
    };

    const handleFocus = () => {
        setFocused(true);
        setDisplay(parseAmountRaw(value));
    };

    const handleBlur = () => {
        setFocused(false);
        const formatted = formatAmountDisplay(value, { decimals, locale });
        setDisplay(formatted);
    };

    const input = (
        <div className={cn('relative', className)}>
            {currencySymbol ? (
                <span
                    className={cn(
                        'pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground',
                        symbolClassName,
                    )}
                >
                    {currencySymbol}
                </span>
            ) : null}
            <Input
                id={id}
                name={name}
                type="text"
                inputMode="decimal"
                autoComplete="off"
                placeholder={placeholder}
                value={display}
                onChange={handleChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
                required={required}
                disabled={disabled}
                readOnly={readOnly}
                className={cn(
                    'h-10 tabular-nums',
                    currencySymbol && 'pl-8',
                    inputClassName,
                )}
            />
        </div>
    );

    if (bare || !label) {
        return input;
    }

    return (
        <FormField
            label={label}
            htmlFor={id ?? name ?? 'amount'}
            required={required}
        >
            {input}
        </FormField>
    );
}
