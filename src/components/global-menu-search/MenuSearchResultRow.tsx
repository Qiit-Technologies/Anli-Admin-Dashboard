'use client';

import type {
    MenuItemCategoryType,
    MenuSearchResult,
} from '@/lib/global-menu-search/types';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { useEffect, useState } from 'react';

interface MenuSearchResultRowProps {
    item: MenuSearchResult;
}

const CATEGORY_STYLES: Record<
    MenuItemCategoryType,
    { badge: string; fallback: string; label: string }
> = {
    food: {
        label: 'Food',
        badge: 'border-emerald-100 bg-emerald-50 text-emerald-700',
        fallback: 'bg-emerald-50 text-emerald-600',
    },
    drink: {
        label: 'Drink',
        badge: 'border-sky-100 bg-sky-50 text-sky-700',
        fallback: 'bg-sky-50 text-sky-600',
    },
    other: {
        label: 'Item',
        badge: 'border-slate-100 bg-slate-50 text-slate-600',
        fallback: 'bg-slate-50 text-slate-500',
    },
};

export function MenuSearchResultRow({ item }: MenuSearchResultRowProps) {
    const [imageError, setImageError] = useState(false);
    const styles = CATEGORY_STYLES[item.categoryType];
    const hasImage = Boolean(item.imageUrl) && !imageError;

    useEffect(() => {
        setImageError(false);
    }, [item.imageUrl]);

    return (
        <div className="grid w-full grid-cols-[2.5rem_minmax(0,1fr)_auto] grid-rows-[auto_auto] items-center gap-x-2.5 gap-y-0.5 px-3">
            <div className="col-start-1 row-span-2 row-start-1 self-center">
                <div
                    className={cn(
                        'relative h-10 w-10 overflow-hidden rounded-md border border-border/60',
                        !hasImage && styles.fallback,
                    )}
                >
                    {hasImage ? (
                        <Image
                            src={item.imageUrl!}
                            alt={item.name}
                            fill
                            className="object-cover"
                            sizes="40px"
                            onError={() => setImageError(true)}
                        />
                    ) : (
                        <span className="flex h-full w-full items-center justify-center text-xs font-semibold">
                            {item.name.charAt(0).toUpperCase()}
                        </span>
                    )}
                </div>
            </div>

            <div className="col-start-2 row-start-1 flex min-w-0 items-center gap-1.5">
                <span className="truncate text-sm font-medium text-foreground">
                    {item.name}
                </span>
                <span
                    className={cn(
                        'shrink-0 rounded border px-1.5 py-0.5 text-[10px] font-medium leading-none',
                        styles.badge,
                    )}
                >
                    {styles.label}
                </span>
                {!item.isAvailable ? (
                    <span className="shrink-0 rounded border border-amber-200 bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium leading-none text-amber-700">
                        Out
                    </span>
                ) : null}
            </div>

            <span className="col-start-2 row-start-2 truncate text-xs text-muted-foreground">
                {[item.categoryName, item.subCategoryName]
                    .filter(Boolean)
                    .join(' · ') || '\u00A0'}
            </span>

            <span className="col-start-3 row-span-2 row-start-1 self-center text-sm font-semibold tabular-nums text-foreground">
                ₦{item.price.toLocaleString()}
            </span>
        </div>
    );
}
