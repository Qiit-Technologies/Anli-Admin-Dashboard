'use client';

import { cn } from '@/lib/utils';

type CategoryTabsProps = {
    categories: string[];
    value: string;
    onChange: (category: string) => void;
    loading?: boolean;
};

export function CategoryTabs({
    categories,
    value,
    onChange,
    loading,
}: CategoryTabsProps) {
    if (loading) {
        return (
            <div className="flex gap-4 overflow-x-auto border-b pb-0">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div
                        key={i}
                        className="mb-px h-9 w-24 shrink-0 animate-pulse rounded-sm bg-gray-100"
                    />
                ))}
            </div>
        );
    }

    if (categories.length === 0) {
        return (
            <div className="border-b py-3 text-[13px] text-muted-foreground">
                No item categories yet. Add categories on the Items page.
            </div>
        );
    }

    return (
        <div className="w-full overflow-x-auto border-b">
            <div
                role="tablist"
                aria-label="Item categories"
                className="flex min-w-max items-end gap-5"
            >
                {categories.map((category) => {
                    const active =
                        category.toLowerCase() === value.toLowerCase();
                    return (
                        <button
                            key={category}
                            type="button"
                            role="tab"
                            aria-selected={active}
                            onClick={() => onChange(category)}
                            className={cn(
                                'shrink-0 border-b-2 px-0 pb-2.5 pt-1 text-[14px] font-medium transition-colors',
                                active
                                    ? 'border-orion-blue text-orion-blue'
                                    : 'border-transparent text-muted-foreground hover:text-foreground',
                            )}
                        >
                            {category}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
