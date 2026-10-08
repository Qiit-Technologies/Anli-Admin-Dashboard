'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export function menuCategoryBadgeClass(category: string): string {
    const key = category.toLowerCase();
    if (key.includes('main')) return 'bg-emerald-100 text-emerald-700';
    if (key.includes('drink')) return 'bg-indigo-100 text-indigo-700';
    if (key.includes('dessert')) return 'bg-fuchsia-100 text-fuchsia-700';
    if (key.includes('small')) return 'bg-amber-100 text-amber-700';
    if (key.includes('salad')) return 'bg-sky-100 text-sky-700';
    return 'bg-gray-100 text-gray-700';
}

export default function MenuCategoryBadge({
    category,
    className,
}: {
    category: string;
    className?: string;
}) {
    return (
        <Badge
            variant="secondary"
            className={cn(
                'font-medium capitalize',
                menuCategoryBadgeClass(category),
                className,
            )}
        >
            {category}
        </Badge>
    );
}
