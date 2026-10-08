'use client';

import BrandButton from '@/components/common/Button';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { EVENT_CATEGORY_META } from './utils/event-category';

export type CalendarView = 'days' | 'weeks' | 'months' | 'years';

const VIEW_OPTIONS: { id: CalendarView; label: string }[] = [
    { id: 'days', label: 'days' },
    { id: 'weeks', label: 'weeks' },
    { id: 'months', label: 'months' },
    { id: 'years', label: 'Years' },
];

interface EventsToolbarProps {
    monthLabel: string;
    view: CalendarView;
    onViewChange: (view: CalendarView) => void;
    onPrevMonth: () => void;
    onNextMonth: () => void;
}

export default function EventsToolbar({
    monthLabel,
    view,
    onViewChange,
    onPrevMonth,
    onNextMonth,
}: EventsToolbarProps) {
    return (
        <div className="flex flex-col gap-5 bg-white px-4 py-6 lg:px-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-col gap-1">
                    <h2 className="text-lg font-semibold text-gray-900">
                        All Event
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        View and Manage the entires, meetings and functions.
                    </p>
                </div>
                <Link href="/banquet/bookings/new">
                    <BrandButton>+ Create Bookings</BrandButton>
                </Link>
            </div>

            <div className="h-px w-full bg-gray-200" />

            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div className="flex flex-row flex-wrap items-center gap-3">
                    <div className="flex flex-row items-center gap-1 rounded-lg border border-gray-200 bg-white px-2 h-10">
                        <button
                            type="button"
                            onClick={onPrevMonth}
                            className="px-2 text-gray-500 hover:text-gray-900"
                        >
                            ‹
                        </button>
                        <span className="flex flex-row items-center gap-1 min-w-[120px] justify-center text-sm font-medium text-gray-900">
                            {monthLabel}
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        </span>
                        <button
                            type="button"
                            onClick={onNextMonth}
                            className="px-2 text-gray-500 hover:text-gray-900"
                        >
                            ›
                        </button>
                    </div>

                    <div className="flex flex-row items-center rounded-lg border border-gray-200 bg-gray-50 p-1">
                        {VIEW_OPTIONS.map((item) => (
                            <Button
                                key={item.id}
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => onViewChange(item.id)}
                                className={cn(
                                    'rounded-md px-4 text-sm capitalize h-8',
                                    view === item.id
                                        ? 'bg-orion-blue text-white hover:bg-orion-blue/90 hover:text-white'
                                        : 'text-gray-600 hover:bg-white',
                                )}
                            >
                                {item.label}
                            </Button>
                        ))}
                    </div>
                </div>

                <div className="flex flex-row flex-wrap items-center gap-2">
                    {(['social', 'corporate', 'private'] as const).map(
                        (cat) => {
                            const meta = EVENT_CATEGORY_META[cat];
                            return (
                                <span
                                    key={cat}
                                    className={cn(
                                        'inline-flex flex-row items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium',
                                        meta.pill,
                                        meta.pillText,
                                    )}
                                >
                                    <span
                                        className={cn(
                                            'h-2 w-2 shrink-0 rounded-full',
                                            meta.dot,
                                        )}
                                    />
                                    {meta.label}
                                </span>
                            );
                        },
                    )}
                </div>
            </div>
        </div>
    );
}
