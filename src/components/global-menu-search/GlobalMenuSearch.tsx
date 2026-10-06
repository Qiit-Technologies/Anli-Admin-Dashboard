'use client';

import {
    MenuSearchPanel,
    MenuSearchShortcutHint,
} from '@/components/global-menu-search/MenuSearchPanel';
import { Command } from '@/components/ui/command';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useGlobalMenuSearchContext } from '@/context/GlobalMenuSearchContext';
import { cn } from '@/lib/utils';
import { Search } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

export function GlobalMenuSearch() {
    const { query, setQuery, debouncedQuery, clearQuery } =
        useGlobalMenuSearchContext();
    const [dialogOpen, setDialogOpen] = useState(false);
    const [inlineOpen, setInlineOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const showInlinePanel = inlineOpen;

    const openDialog = useCallback(() => {
        setInlineOpen(false);
        setDialogOpen(true);
    }, []);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
                event.preventDefault();
                openDialog();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [openDialog]);

    useEffect(() => {
        const handlePointerDown = (event: MouseEvent) => {
            if (!containerRef.current?.contains(event.target as Node)) {
                setInlineOpen(false);
            }
        };

        document.addEventListener('mousedown', handlePointerDown);
        return () => document.removeEventListener('mousedown', handlePointerDown);
    }, []);

    const handleDialogOpenChange = (open: boolean) => {
        setDialogOpen(open);
        if (!open) clearQuery();
    };

    return (
        <>
            <div ref={containerRef} className="relative w-full">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    value={query}
                    onChange={(event) => {
                        setQuery(event.target.value);
                        setInlineOpen(true);
                    }}
                    onFocus={() => setInlineOpen(true)}
                    onKeyDown={(event) => {
                        if (event.key === 'Escape') {
                            setInlineOpen(false);
                            clearQuery();
                            return;
                        }
                        if (
                            (event.metaKey || event.ctrlKey) &&
                            event.key.toLowerCase() === 'k'
                        ) {
                            event.preventDefault();
                            openDialog();
                        }
                    }}
                    placeholder="Search menu items..."
                    className="h-10 border-gray-100 bg-gray-50/80 pl-10 pr-20 text-sm focus:bg-white"
                />
                <button
                    type="button"
                    onClick={openDialog}
                    className="absolute right-2 top-1/2 hidden -translate-y-1/2 items-center gap-1 rounded-md border border-gray-200 bg-white px-2 py-1 text-[10px] font-medium text-muted-foreground transition-colors hover:bg-gray-50 sm:inline-flex"
                    aria-label="Open menu search palette"
                >
                    <MenuSearchShortcutHint />
                </button>

                {showInlinePanel ? (
                    <div
                        className={cn(
                            'absolute left-0 right-0 top-[calc(100%+6px)] z-50 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xl',
                        )}
                    >
                        <MenuSearchPanel
                            variant="inline"
                            onClose={() => setInlineOpen(false)}
                        />
                    </div>
                ) : null}
            </div>

            <Dialog open={dialogOpen} onOpenChange={handleDialogOpenChange}>
                <DialogContent className="overflow-hidden p-0 sm:max-w-xl">
                    <Command
                        shouldFilter={false}
                        className="flex flex-col [&_[cmdk-input-wrapper]]:min-h-14 [&_[cmdk-input-wrapper]]:shrink-0 [&_[cmdk-input-wrapper]]:px-4 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-item]]:flex [&_[cmdk-item]]:h-14 [&_[cmdk-item]]:items-center [&_[cmdk-item]]:p-0"
                    >
                        <MenuSearchPanel
                            variant="dialog"
                            onClose={() => handleDialogOpenChange(false)}
                        />
                    </Command>
                </DialogContent>
            </Dialog>
        </>
    );
}
