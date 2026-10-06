'use client';

import { Check, ChevronsUpDown } from 'lucide-react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { ReactElement, useEffect, useState } from 'react';

export interface ComboboxItem {
    value: string;
    label: string;
}

export interface ComboboxProps {
    data: ComboboxItem[];
    placeholder?: string;
    searchPlaceholder?: string;
    notFoundText?: string;
    triggerComponent?: ReactElement;
    value?: string;
    onChange?: (value: string) => void;
    className?: string;
    disabled?: boolean;
    onOpenChange?: (open: boolean) => void;
    width?: string;
}

export function Combobox({
    data = [],
    placeholder = 'Select an option...',
    searchPlaceholder = 'Search...',
    notFoundText = 'No option found.',
    triggerComponent,
    value,
    onChange,
    className,
    disabled = false,
    onOpenChange,
    width = 'w-[200px]',
}: Readonly<ComboboxProps>): React.JSX.Element {
    const [open, setOpen] = useState<boolean>(false);
    const [internalValue, setInternalValue] = useState<string>(value ?? '');

    useEffect(() => {
        if (value !== undefined) {
            setInternalValue(value);
        }
    }, [value]);

    const handleOpenChange = (newOpen: boolean): void => {
        setOpen(newOpen);
        if (onOpenChange) {
            onOpenChange(newOpen);
        }
    };

    const handleValueChange = (currentValue: string): void => {
        const selectedItem = data.find((item) => item.label === currentValue);
        const newValue = selectedItem ? selectedItem.value : '';

        setInternalValue(newValue);
        if (onChange) {
            onChange(newValue);
        }
        handleOpenChange(false);
    };

    const selectedItem = data.find((item) => item.value === internalValue);

    return (
        <Popover open={open} onOpenChange={handleOpenChange}>
            <PopoverTrigger asChild disabled={disabled}>
                {triggerComponent ? (
                    React.cloneElement(triggerComponent, {
                        disabled,
                        onClick: (e: React.MouseEvent) => {
                            if (triggerComponent.props.onClick)
                                triggerComponent.props.onClick(e);
                        },
                    })
                ) : (
                    <Button
                        variant="ghost"
                        role="combobox"
                        aria-expanded={open}
                        className={cn(
                            width,
                            'justify-between border shadow-none truncate focus:ring-brand focus-visible:ring-brand focus-within:ring-brand placeholder:text-muted-foreground',
                            className,
                        )}
                        disabled={disabled}
                    >
                        {selectedItem ? selectedItem.label : placeholder}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0" />
                    </Button>
                )}
            </PopoverTrigger>
            <PopoverContent className={cn(width, 'p-0')}>
                <Command>
                    <CommandInput
                        placeholder={searchPlaceholder}
                        className="h-9"
                    />
                    <CommandList>
                        <CommandEmpty>{notFoundText}</CommandEmpty>
                        <CommandGroup>
                            {data.map((item) => (
                                <CommandItem
                                    key={item.value}
                                    value={item.value}
                                    onSelect={handleValueChange}
                                >
                                    {item.label}
                                    <Check
                                        className={cn(
                                            'ml-auto h-4 w-4',
                                            internalValue === item.value
                                                ? 'opacity-100'
                                                : 'opacity-0',
                                        )}
                                    />
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
