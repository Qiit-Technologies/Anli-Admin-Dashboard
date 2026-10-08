'use client';

import { cn } from '@/lib/utils';

interface Pill {
    id: string;
    label: string;
}

interface CategoryPillFiltersProps {
    pills: readonly Pill[];
    value: string;
    onChange: (id: string) => void;
}

export default function CategoryPillFilters({
    pills,
    value,
    onChange,
}: CategoryPillFiltersProps) {
    return (
        <div className="flex flex-wrap gap-2">
            {pills.map((pill) => (
                <button
                    key={pill.id}
                    type="button"
                    onClick={() => onChange(pill.id)}
                    className={cn(
                        'rounded-full border px-3 py-1 text-xs font-medium md:text-sm',
                        value === pill.id
                            ? 'border-hexbrand bg-hexbrand text-white'
                            : 'border-gray-200 bg-white text-gray-700',
                    )}
                >
                    {pill.label}
                </button>
            ))}
        </div>
    );
}
