'use client';

import { MenuSearchResultRow } from '@/components/global-menu-search/MenuSearchResultRow';
import {
    CommandEmpty,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import { useGlobalMenuSearchContext } from '@/context/GlobalMenuSearchContext';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

interface MenuSearchPanelProps {
    variant: 'inline' | 'dialog';
    onQueryChange?: (query: string) => void;
    onClose?: () => void;
}

function MenuSearchResultsList({
    selectedIndex,
    onSelectedIndexChange,
}: {
    selectedIndex: number;
    onSelectedIndexChange: (index: number) => void;
}) {
    const { results } = useGlobalMenuSearchContext();

    return (
        <div className="divide-y divide-border/50">
            {results.map((item, index) => (
                <div
                    key={item.id}
                    className={cn(
                        'flex h-14 items-center bg-white transition-colors hover:bg-muted/60',
                        index === selectedIndex && 'bg-muted',
                    )}
                    onMouseEnter={() => onSelectedIndexChange(index)}
                >
                    <MenuSearchResultRow item={item} />
                </div>
            ))}
        </div>
    );
}

export function MenuSearchPanel({
    variant,
    onQueryChange,
    onClose,
}: MenuSearchPanelProps) {
    const {
        query,
        setQuery,
        debouncedQuery,
        results,
        isLoading,
        isReady,
        itemCount,
    } = useGlobalMenuSearchContext();
    const [selectedIndex, setSelectedIndex] = useState(0);

    useEffect(() => {
        onQueryChange?.(query);
    }, [onQueryChange, query]);

    useEffect(() => {
        setSelectedIndex(0);
    }, [debouncedQuery, results.length]);

    const showLoading = isLoading && !isReady;
    const showEmpty =
        !showLoading &&
        debouncedQuery.trim().length > 0 &&
        results.length === 0;
    const showResults = debouncedQuery.trim().length > 0 && results.length > 0;

    if (variant === 'dialog') {
        return (
            <>
                <CommandInput
                    value={query}
                    onValueChange={setQuery}
                    placeholder="Search menu items by name, category, or description..."
                    className="h-14 shrink-0 text-base"
                />
                <CommandList className="h-[min(400px,50vh)] max-h-none overflow-hidden p-0">
                    {showResults ? (
                        <div className="h-full overflow-y-auto">
                            {results.map((item, index) => (
                                <CommandItem
                                    key={item.id}
                                    value={String(item.id)}
                                    onSelect={() => onClose?.()}
                                    className={cn(
                                        'flex h-14 w-full cursor-default items-center gap-0 rounded-none border-0 p-0 aria-selected:bg-muted data-[selected=true]:bg-muted',
                                        index > 0 &&
                                            'border-t border-border/50',
                                    )}
                                >
                                    <MenuSearchResultRow item={item} />
                                </CommandItem>
                            ))}
                        </div>
                    ) : (
                        <div className="flex h-full p-24 items-center justify-center px-6 text-center text-sm text-muted-foreground">
                            {showLoading ? (
                                <div className="flex items-center gap-2">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Loading menu items...
                                </div>
                            ) : showEmpty ? (
                                <CommandEmpty className="py-0">
                                    No menu items found.
                                </CommandEmpty>
                            ) : (
                                <div>
                                    <p>
                                        Search {itemCount.toLocaleString()} menu
                                        items.
                                    </p>
                                    <p className="mt-1 text-xs">
                                        Type to filter by name, category, or
                                        description.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </CommandList>
            </>
        );
    }

    return (
        <div className="flex flex-col">
            {showLoading ? (
                <div className="flex items-center justify-center gap-2 px-4 py-6 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading menu items...
                </div>
            ) : null}
            {!showLoading && showEmpty ? (
                <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                    No menu items found.
                </div>
            ) : null}
            {!showLoading && showResults ? (
                <div className="max-h-80 overflow-y-auto">
                    <MenuSearchResultsList
                        selectedIndex={selectedIndex}
                        onSelectedIndexChange={setSelectedIndex}
                    />
                </div>
            ) : null}
            {!showLoading && !debouncedQuery.trim() ? (
                <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                    Search {itemCount.toLocaleString()} menu items
                </div>
            ) : null}
        </div>
    );
}

export function MenuSearchShortcutHint() {
    const isMac =
        typeof navigator !== 'undefined' &&
        /Mac|iPhone|iPad|iPod/.test(navigator.platform);

    return (
        <span className="hidden text-[10px] font-medium tracking-widest text-muted-foreground sm:inline-flex">
            {isMac ? '⌘K' : 'Ctrl+K'}
        </span>
    );
}
