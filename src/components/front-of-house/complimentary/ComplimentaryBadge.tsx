'use client';

import { cn } from '@/lib/utils';
import {
    ComplimentaryStatus,
    complimentaryBadgeConfig,
} from '../utils/complimentary';

export default function ComplimentaryBadge({
    status,
    className,
    compact = false,
}: {
    status: ComplimentaryStatus;
    className?: string;
    compact?: boolean;
}) {
    const config = complimentaryBadgeConfig[status];
    const label = compact ? config.shortLabel : config.label;

    return (
        <span
            title={compact ? config.label : undefined}
            className={cn(
                'inline-flex max-w-full items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
                config.bg,
                config.text,
                compact && 'whitespace-nowrap',
                className,
            )}
        >
            <span className={cn('h-1.5 w-1.5 shrink-0 rounded-full', config.dot)} />
            <span className="truncate">{label}</span>
        </span>
    );
}
