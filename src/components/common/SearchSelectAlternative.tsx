'use client';
import { cn } from '@/lib/utils';
import { Check, ChevronDown } from 'lucide-react';
import { ReactNode, useEffect, useRef, useState } from 'react';

interface SearchSelectProps<T> {
    items: T[];
    value: T | null;
    onChange: (item: T) => void;
    placeholder?: string;
    className?: string;
    displayValue?: (item: T) => string;
    searchPlaceholder?: string;
    label: string | ReactNode;
    id: string;
    disabled?: boolean;
    isLoading?: boolean;
    isRequired?: boolean;
    name?: string;
    getValue?: (value: any) => void;
    requiredMessage?: string;
    onSearch?: (query: string) => void;
}

export const SearchSelectAlternative = <T,>({
    items,
    value,
    onChange,
    placeholder = 'Select an item',
    className = 'bg-white h-10',
    displayValue = (item) => String(item),
    searchPlaceholder = 'Search...',
    id,
    label,
    disabled,
    isLoading,
    isRequired,
    name,
    getValue,
    requiredMessage,
    onSearch,
}: SearchSelectProps<T>) => {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [dropdownPosition, setDropdownPosition] = useState<'bottom' | 'top'>(
        'bottom',
    );
    const [invalid, setInvalid] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const filteredItems = items.filter((item) => {
        const itemValue = displayValue(item) || '';
        return itemValue
            .toString()
            .toLowerCase()
            .includes(search.toLowerCase());
    });

    const calculatePosition = () => {
        if (!containerRef.current) return;

        const container = containerRef.current;
        const rect = container.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const dropdownHeight = Math.min(240, filteredItems.length * 40 + 60);

        const spaceBelow = viewportHeight - rect.bottom;
        const spaceAbove = rect.top;

        if (spaceBelow < dropdownHeight && spaceAbove > dropdownHeight) {
            setDropdownPosition('top');
        } else {
            setDropdownPosition('bottom');
        }
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target as Node)
            ) {
                setOpen(false);
                setSearch('');
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () =>
            document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (open) {
            calculatePosition();
            if (inputRef.current) {
                inputRef.current.focus();
            }
        }
    }, [open, filteredItems.length]);

    useEffect(() => {
        const handleResize = () => {
            if (open) {
                calculatePosition();
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [open]);

    const handleSelect = (item: T) => {
        onChange(item);
        setOpen(false);
        setSearch('');
        setInvalid(false);
    };

    const handleToggle = () => {
        if (!disabled) {
            setOpen(!open);
            setSearch('');
        }
    };

    return (
        <div className="flex flex-col w-full flex-1" ref={containerRef}>
            {typeof label === 'string' ? (
                <label
                    htmlFor={id}
                    className="text-sm font-medium text-muted-foreground mb-1"
                >
                    {label}
                </label>
            ) : (
                <div className="text-sm font-medium text-muted-foreground mb-1">
                    {label}
                </div>
            )}
            <div className="w-full relative">
                <input
                    id={`${id}-input`}
                    name={name ?? id}
                    value={
                        value
                            ? String(
                                  getValue
                                      ? getValue(value)
                                      : displayValue(value),
                              )
                            : ''
                    }
                    required={!!isRequired}
                    onInvalid={(e) => {
                        if (requiredMessage) {
                            e.currentTarget.setCustomValidity(requiredMessage);
                        }
                        setInvalid(true);
                    }}
                    onInput={(e) => {
                        e.currentTarget.setCustomValidity('');
                    }}
                    className="sr-only"
                    tabIndex={-1}
                    aria-hidden="true"
                />

                {isLoading ? (
                    <div className="animate-pulse">
                        <div className="h-10 bg-gray-200 rounded"></div>
                    </div>
                ) : (
                    <button
                        type="button"
                        onClick={handleToggle}
                        disabled={disabled}
                        aria-invalid={invalid}
                        className={cn(
                            'w-full text-inherit rounded-md border shadow-none items-center justify-start h-10 px-3 py-2 text-left bg-transparent hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50 flex',
                            invalid && 'border-red-500 focus:ring-red-500',
                            !value && 'text-muted-foreground',
                            className,
                        )}
                        style={{
                            fontFamily: 'DM Sans, sans-serif',
                        }}
                    >
                        <span
                            className={cn(
                                'flex-1 truncate',
                                !value && 'text-muted-foreground',
                            )}
                            style={{
                                fontFamily: 'DM Sans, sans-serif',
                            }}
                        >
                            {value ? displayValue(value) : placeholder}
                        </span>
                        <ChevronDown
                            className={cn(
                                'ml-2 h-4 w-4 shrink-0 opacity-50 transition-transform',
                                open && 'rotate-180',
                            )}
                        />
                    </button>
                )}

                {invalid && (
                    <div className="mt-1 text-xs text-red-600">
                        {requiredMessage || 'This field is required'}
                    </div>
                )}

                {open && (
                    <div
                        ref={dropdownRef}
                        className={cn(
                            'absolute left-0 right-0 z-50 bg-white border rounded-md shadow-lg',
                            dropdownPosition === 'top'
                                ? 'bottom-full mb-1'
                                : 'top-full mt-1',
                        )}
                        style={{
                            maxHeight: '240px',
                            minWidth: '100%',
                        }}
                    >
                        <div className="p-2 border-b">
                            <input
                                ref={inputRef}
                                type="text"
                                placeholder={searchPlaceholder}
                                value={search}
                                onChange={(e) => {
                                    const query = e.target.value;
                                    setSearch(query);
                                    if (onSearch) {
                                        onSearch(query);
                                    }
                                }}
                                className="w-full px-3 py-2 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-orion-blue"
                                style={{
                                    fontFamily: 'DM Sans, sans-serif',
                                }}
                            />
                        </div>

                        <div className="max-h-48 overflow-auto">
                            {filteredItems.length === 0 ? (
                                <div className="px-3 py-2 text-sm text-muted-foreground">
                                    No items found
                                </div>
                            ) : (
                                filteredItems.map((item, index) => (
                                    <button
                                        key={index}
                                        type="button"
                                        onClick={() => handleSelect(item)}
                                        className={cn(
                                            'w-full px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground flex items-center justify-between transition-colors',
                                            value === item && 'bg-accent',
                                        )}
                                    >
                                        <span>{displayValue(item)}</span>
                                        <Check
                                            className={cn(
                                                'h-4 w-4',
                                                value === item
                                                    ? 'opacity-100'
                                                    : 'opacity-0',
                                            )}
                                        />
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
