'use client';

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
import { Check, ChevronsUpDown, Loader2, Plus } from 'lucide-react';
import { useMemo, useState } from 'react';

export type CreatableOption = {
    value: string;
    label: string;
};

type CreatableSearchSelectProps = {
    options: CreatableOption[];
    value: string;
    onChange: (value: string) => void;
    onCreate: (name: string) => Promise<CreatableOption | null>;
    placeholder?: string;
    searchPlaceholder?: string;
    className?: string;
    disabled?: boolean;
};

function formatLabel(name: string): string {
    return name.replaceAll('-', ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export function CreatableSearchSelect({
    options,
    value,
    onChange,
    onCreate,
    placeholder = 'Select…',
    searchPlaceholder = 'Search…',
    className,
    disabled = false,
}: Readonly<CreatableSearchSelectProps>) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [creating, setCreating] = useState(false);

    const selected = useMemo(
        () => options.find((opt) => opt.value === value),
        [options, value],
    );

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return options;
        return options.filter(
            (opt) =>
                opt.label.toLowerCase().includes(q) ||
                opt.value.toLowerCase().includes(q),
        );
    }, [options, query]);

    const canCreate = useMemo(() => {
        const q = query.trim();
        if (!q) return false;
        return !options.some(
            (opt) =>
                opt.value.toLowerCase() === q.toLowerCase() ||
                opt.label.toLowerCase() === q.toLowerCase(),
        );
    }, [options, query]);

    const handleCreate = async () => {
        const name = query.trim();
        if (!name || creating) return;
        setCreating(true);
        try {
            const created = await onCreate(name);
            if (created) {
                onChange(created.value);
                setQuery('');
                setOpen(false);
            }
        } finally {
            setCreating(false);
        }
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild disabled={disabled}>
                <Button
                    type="button"
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    disabled={disabled}
                    className={cn(
                        'w-full justify-between font-normal h-[50px] border-gray-200 rounded-md bg-white hover:bg-white',
                        !selected && 'text-muted-foreground',
                        className,
                    )}
                >
                    <span className="truncate">
                        {selected
                            ? formatLabel(selected.label)
                            : value
                              ? formatLabel(value)
                              : placeholder}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                <Command shouldFilter={false}>
                    <CommandInput
                        placeholder={searchPlaceholder}
                        value={query}
                        onValueChange={setQuery}
                        className="h-9"
                    />
                    <CommandList>
                        <CommandEmpty>
                            {canCreate
                                ? 'No match — create a new one below.'
                                : 'No option found.'}
                        </CommandEmpty>
                        <CommandGroup>
                            {filtered.map((opt) => (
                                <CommandItem
                                    key={opt.value}
                                    value={opt.value}
                                    onSelect={() => {
                                        onChange(opt.value);
                                        setOpen(false);
                                        setQuery('');
                                    }}
                                >
                                    {formatLabel(opt.label)}
                                    <Check
                                        className={cn(
                                            'ml-auto h-4 w-4',
                                            value === opt.value
                                                ? 'opacity-100'
                                                : 'opacity-0',
                                        )}
                                    />
                                </CommandItem>
                            ))}
                        </CommandGroup>
                        {canCreate ? (
                            <div className="border-t p-1">
                                <button
                                    type="button"
                                    disabled={creating}
                                    onClick={handleCreate}
                                    className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-orion-blue hover:bg-accent"
                                >
                                    {creating ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Plus className="h-4 w-4" />
                                    )}
                                    Create “{query.trim()}”
                                </button>
                            </div>
                        ) : null}
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
