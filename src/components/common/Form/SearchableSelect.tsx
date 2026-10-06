'use client';

import * as React from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
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
import { FormField } from './index';

interface SearchableSelectProps {
    id: string;
    label: string;
    options: { value: string; label: string }[];
    value: string;
    onValueChange: (value: string) => void;
    onSearch?: (query: string) => void;
    placeholder?: string;
    emptyText?: string;
    required?: boolean;
    disabled?: boolean;
    className?: string;
}

export function SearchableSelect({
    id,
    label,
    options,
    value,
    onValueChange,
    onSearch,
    placeholder = 'Select an option...',
    emptyText = 'No results found.',
    required = false,
    disabled = false,
    className,
}: SearchableSelectProps) {
    const [open, setOpen] = React.useState(false);
    const [searchValue, setSearchValue] = React.useState('');

    const selectedLabel = options.find((option) => option.value === value)?.label;

    const visibleOptions = React.useMemo(() => {
        if (onSearch) return options;
        const query = searchValue.trim().toLowerCase();
        if (!query) return options;
        return options.filter((option) =>
            `${option.label} ${option.value}`.toLowerCase().includes(query),
        );
    }, [onSearch, options, searchValue]);

    const handleSearchChange = (val: string) => {
        setSearchValue(val);
        if (onSearch) {
            onSearch(val);
        }
    };

    const searchPlaceholder = label
        ? `Search ${label.toLowerCase()}...`
        : 'Search...';

    React.useEffect(() => {
        if (!open) {
            setSearchValue('');
        }
    }, [open]);

    return (
        <FormField label={label} htmlFor={id} required={required}>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        id={id}
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        disabled={disabled}
                        className={cn(
                            'w-full justify-between bg-gray-100 border-gray-100 h-10 font-normal hover:bg-gray-100/80 transition-colors',
                            !value && 'text-muted-foreground',
                            className
                        )}
                    >
                        <span className="truncate">
                            {selectedLabel || placeholder}
                        </span>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent 
                    className="w-[var(--radix-popover-trigger-width)] p-0 z-[100] pointer-events-auto" 
                    align="start"
                    onOpenAutoFocus={(e) => e.preventDefault()}
                    onWheel={(e) => e.stopPropagation()}
                >
                    <Command className="w-full h-auto max-h-[300px]" shouldFilter={false}>
                        <CommandInput 
                            placeholder={searchPlaceholder}
                            value={searchValue}
                            onValueChange={handleSearchChange}
                        />
                        <CommandList 
                            className="max-h-[250px] overflow-y-auto overscroll-contain"
                            onWheel={(e) => e.stopPropagation()}
                        >
                            <CommandEmpty>{emptyText}</CommandEmpty>
                            <CommandGroup>
                                {visibleOptions.map((option) => (
                                    <CommandItem
                                        key={option.value}
                                        value={`${option.label} ${option.value}`}
                                        onSelect={() => {
                                            onValueChange(option.value === value ? '' : option.value);
                                            setOpen(false);
                                            setSearchValue('');
                                        }}
                                        className="cursor-pointer"
                                    >
                                        <Check
                                            className={cn(
                                                'mr-2 h-4 w-4',
                                                value === option.value ? 'opacity-100' : 'opacity-0'
                                            )}
                                        />
                                        <span className="truncate flex-1">{option.label}</span>
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
        </FormField>
    );
}
