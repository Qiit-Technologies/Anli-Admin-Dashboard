import { cn } from '@/lib/utils';
import { GROUP_TYPE_OPTIONS } from './constants';
import type { GroupBookingStatus, GroupType } from './types';

const STATUS_CLASS: Record<GroupBookingStatus, string> = {
    active: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    pending: 'border-amber-200 bg-amber-50 text-amber-800',
    completed: 'border-sky-200 bg-sky-50 text-sky-800',
};

const TYPE_CLASS: Record<GroupType, string> = {
    conference: 'text-emerald-700',
    corporate: 'text-amber-700',
    wedding: 'text-orange-700',
    sport: 'text-sky-700',
    government: 'text-violet-700',
    ngo: 'text-teal-700',
    religious: 'text-indigo-700',
    school: 'text-cyan-700',
    tour: 'text-lime-700',
    individual: 'text-muted-foreground',
    other: 'text-muted-foreground',
};

export function StatusPill({ status }: { status: GroupBookingStatus }) {
    const label =
        status === 'completed'
            ? 'Completed'
            : status.charAt(0).toUpperCase() + status.slice(1);
    return (
        <span
            className={cn(
                'inline-flex rounded-full border px-2 py-0.5 text-[12px] font-medium capitalize',
                STATUS_CLASS[status],
            )}
        >
            {label}
        </span>
    );
}

export function GroupTypeLabel({ type }: { type: GroupType }) {
    const label =
        GROUP_TYPE_OPTIONS.find((option) => option.value === type)?.label ||
        type;
    return (
        <span className={cn('text-[12px] font-medium', TYPE_CLASS[type])}>
            {label}
        </span>
    );
}
