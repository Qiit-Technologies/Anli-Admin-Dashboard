'use client';

import React, {
    useCallback,
    useEffect,
    useId,
    useMemo,
    useRef,
    useState,
} from 'react';
import { Check, Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

type StockItemSearchOption = {
    value: string;
    label: string;
};

type StockItemSearchSelectProps = {
    id: string;
    label: string;
    required?: boolean;
    options: StockItemSearchOption[];
    value: string;
    onValueChange: (_value: string) => void;
    placeholder?: string;
    emptyText?: string;
    disabled?: boolean;
    className?: string;
};

const MAX_VISIBLE = 80;

export function StockItemSearchSelect({
    id,
    label,
    required = false,
    options,
    value,
    onValueChange,
    placeholder = 'Type to search items...',
    emptyText = 'No matching items',
    disabled = false,
    className,
}: Readonly<StockItemSearchSelectProps>) {
    const listboxId = useId();
    const rootRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const selected = useMemo(
        () => options.find((option) => option.value === value) ?? null,
        [options, value],
    );

    const [query, setQuery] = useState(selected?.label ?? '');
    const [open, setOpen] = useState(false);
    const [highlightIndex, setHighlightIndex] = useState(0);

    useEffect(() => {
        setQuery(selected?.label ?? '');
    }, [selected?.label, value]);

    const filteredOptions = useMemo(() => {
        const term = query.trim().toLowerCase();
        const list = !term
            ? options
            : options.filter((option) =>
                  `${option.label} ${option.value}`
                      .toLowerCase()
                      .includes(term),
              );
        return list.slice(0, MAX_VISIBLE);
    }, [options, query]);

    const close = useCallback(() => {
        setOpen(false);
        setHighlightIndex(0);
        setQuery(selected?.label ?? '');
    }, [selected?.label]);

    useEffect(() => {
        if (!open) return;

        const onPointerDown = (event: MouseEvent) => {
            if (!rootRef.current?.contains(event.target as Node)) {
                close();
            }
        };

        document.addEventListener('mousedown', onPointerDown);
        return () => document.removeEventListener('mousedown', onPointerDown);
    }, [close, open]);

    useEffect(() => {
        setHighlightIndex(0);
    }, [query, open]);

    const selectOption = (option: StockItemSearchOption) => {
        onValueChange(option.value);
        setQuery(option.label);
        setOpen(false);
        setHighlightIndex(0);
        inputRef.current?.blur();
    };

    const clearSelection = () => {
        onValueChange('');
        setQuery('');
        setOpen(true);
        setHighlightIndex(0);
        requestAnimationFrame(() => inputRef.current?.focus());
    };

    const handleInputChange = (next: string) => {
        setQuery(next);
        setOpen(true);
        if (value) {
            onValueChange('');
        }
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (disabled) return;

        if (event.key === 'ArrowDown') {
            event.preventDefault();
            setOpen(true);
            setHighlightIndex((index) =>
                filteredOptions.length === 0
                    ? 0
                    : Math.min(index + 1, filteredOptions.length - 1),
            );
            return;
        }

        if (event.key === 'ArrowUp') {
            event.preventDefault();
            setOpen(true);
            setHighlightIndex((index) => Math.max(index - 1, 0));
            return;
        }

        if (event.key === 'Enter') {
            if (!open || filteredOptions.length === 0) return;
            event.preventDefault();
            const option = filteredOptions[highlightIndex];
            if (option) selectOption(option);
            return;
        }

        if (event.key === 'Escape') {
            event.preventDefault();
            close();
        }
    };

    const showResults = open && !disabled;
    const hasQueryOrValue = Boolean(query || value);

    return (
        <div ref={rootRef} className={cn('relative space-y-1.5', className)}>
            <Label className="text-sm font-medium text-foreground" htmlFor={id}>
                {label}
                {required ? (
                    <span className="text-destructive"> *</span>
                ) : null}
            </Label>

            <div className="relative">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    ref={inputRef}
                    id={id}
                    role="combobox"
                    aria-expanded={showResults}
                    aria-controls={listboxId}
                    aria-autocomplete="list"
                    autoComplete="off"
                    disabled={disabled}
                    value={query}
                    placeholder={placeholder}
                    onFocus={() => setOpen(true)}
                    onChange={(event) => handleInputChange(event.target.value)}
                    onKeyDown={handleKeyDown}
                    className={cn(
                        'h-9 rounded-sm border-border bg-background pl-8 pr-8 text-sm',
                        'focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-0',
                    )}
                />
                {hasQueryOrValue && !disabled ? (
                    <button
                        type="button"
                        aria-label="Clear item search"
                        className="absolute right-2 top-1/2 inline-flex size-5 -translate-y-1/2 items-center justify-center rounded-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                        onClick={clearSelection}
                    >
                        <X className="size-3.5" />
                    </button>
                ) : null}
            </div>

            {showResults ? (
                <div
                    id={listboxId}
                    role="listbox"
                    className="absolute z-50 mt-1 max-h-60 w-full overflow-hidden rounded-md border border-border bg-popover"
                >
                    {filteredOptions.length === 0 ? (
                        <p className="px-3 py-2.5 text-sm text-muted-foreground">
                            {emptyText}
                        </p>
                    ) : (
                        <ul className="max-h-60 overflow-y-auto overscroll-contain py-1">
                            {filteredOptions.map((option, index) => {
                                const isSelected = option.value === value;
                                const isHighlighted = index === highlightIndex;

                                return (
                                    <li key={option.value} role="none">
                                        <button
                                            type="button"
                                            role="option"
                                            aria-selected={isSelected}
                                            className={cn(
                                                'flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors',
                                                isHighlighted
                                                    ? 'bg-muted text-foreground'
                                                    : 'text-foreground hover:bg-muted/70',
                                                isSelected && 'font-medium',
                                            )}
                                            onMouseEnter={() =>
                                                setHighlightIndex(index)
                                            }
                                            onMouseDown={(event) => {
                                                event.preventDefault();
                                                selectOption(option);
                                            }}
                                        >
                                            <Check
                                                className={cn(
                                                    'size-4 shrink-0 text-primary',
                                                    isSelected
                                                        ? 'opacity-100'
                                                        : 'opacity-0',
                                                )}
                                            />
                                            <span className="truncate">
                                                {option.label}
                                            </span>
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                    {options.length > MAX_VISIBLE &&
                    filteredOptions.length >= MAX_VISIBLE ? (
                        <p className="border-t border-border px-3 py-1.5 text-xs text-muted-foreground">
                            Showing first {MAX_VISIBLE} matches — keep typing to
                            narrow
                        </p>
                    ) : null}
                </div>
            ) : null}
        </div>
    );
}
