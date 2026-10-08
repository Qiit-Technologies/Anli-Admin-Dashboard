'use client';

import { cn } from '@/lib/utils';

export default function SelectionDot({ className }: { className?: string }) {
    return (
        <span
            className={cn(
                'mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 border-hexbrand',
                className,
            )}
            aria-hidden
        >
            <span className="h-2 w-2 rounded-full bg-hexbrand" />
        </span>
    );
}
