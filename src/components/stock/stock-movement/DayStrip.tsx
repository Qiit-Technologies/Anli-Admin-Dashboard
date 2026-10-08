'use client';

import { cn } from '@/lib/utils';
import {
    eachDayOfInterval,
    endOfMonth,
    format,
    isSameDay,
    isToday,
    startOfMonth,
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCallback, useEffect, useRef, useState } from 'react';

type DayStripProps = {
    month: Date;
    selected: Date;
    onSelect: (date: Date) => void;
    onMonthChange: (month: Date) => void;
    movedDays?: Set<string>;
};

export function DayStrip({
    month,
    selected,
    onSelect,
    onMonthChange,
    movedDays,
}: DayStripProps) {
    const scrollerRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

    const days = eachDayOfInterval({
        start: startOfMonth(month),
        end: endOfMonth(month),
    });

    const updateScrollState = useCallback(() => {
        const el = scrollerRef.current;
        if (!el) return;
        const maxScroll = el.scrollWidth - el.clientWidth;
        setCanScrollLeft(el.scrollLeft > 2);
        setCanScrollRight(el.scrollLeft < maxScroll - 2);
    }, []);

    useEffect(() => {
        const el = scrollerRef.current;
        if (!el) return;

        updateScrollState();
        el.addEventListener('scroll', updateScrollState, { passive: true });

        const resizeObserver = new ResizeObserver(updateScrollState);
        resizeObserver.observe(el);

        return () => {
            el.removeEventListener('scroll', updateScrollState);
            resizeObserver.disconnect();
        };
    }, [updateScrollState, days.length, month]);

    useEffect(() => {
        const el = scrollerRef.current;
        if (!el) return;
        const key = format(selected, 'yyyy-MM-dd');
        const active = el.querySelector<HTMLElement>(`[data-day="${key}"]`);
        if (!active) return;
        active.scrollIntoView({
            behavior: 'smooth',
            inline: 'center',
            block: 'nearest',
        });
        // After programmatic scroll settles, refresh edge button state.
        const timer = window.setTimeout(updateScrollState, 320);
        return () => window.clearTimeout(timer);
    }, [selected, month, updateScrollState]);

    const shiftMonth = (delta: number) => {
        const next = new Date(month);
        next.setMonth(next.getMonth() + delta);
        onMonthChange(next);
    };

    const scrollByPage = (direction: -1 | 1) => {
        const el = scrollerRef.current;
        if (!el) return;
        const amount = Math.max(el.clientWidth * 0.7, 160);
        el.scrollBy({ left: direction * amount, behavior: 'smooth' });
    };

    return (
        <div className="rounded-lg border bg-card">
            <div className="flex items-center justify-between border-b px-4 py-3">
                <div>
                    <p className="text-[12px] font-semibold uppercase tracking-wide text-muted-foreground">
                        Working day
                    </p>
                    <p className="text-[14px] font-semibold tracking-tight">
                        {format(selected, 'EEEE, d MMMM yyyy')}
                    </p>
                </div>
                <div className="flex items-center gap-1">
                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => shiftMonth(-1)}
                        aria-label="Previous month"
                    >
                        <ChevronLeft className="size-4" />
                    </Button>
                    <span className="min-w-[7.5rem] text-center text-[14px] font-medium tabular-nums">
                        {format(month, 'MMMM yyyy')}
                    </span>
                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => shiftMonth(1)}
                        aria-label="Next month"
                    >
                        <ChevronRight className="size-4" />
                    </Button>
                </div>
            </div>

            <div className="relative">
                <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    aria-label="Scroll days left"
                    disabled={!canScrollLeft}
                    onClick={() => scrollByPage(-1)}
                    className={cn(
                        'absolute left-2 top-1/2 z-10 h-8 w-8 -translate-y-1/2 rounded-full border bg-white',
                        !canScrollLeft && 'opacity-40',
                    )}
                >
                    <ChevronLeft className="size-4" />
                </Button>

                <div
                    ref={scrollerRef}
                    className="flex gap-1.5 overflow-x-auto scroll-smooth px-12 py-3 [scrollbar-width:thin]"
                >
                    {days.map((day) => {
                        const key = format(day, 'yyyy-MM-dd');
                        const active = isSameDay(day, selected);
                        const today = isToday(day);
                        const hasMoves = movedDays?.has(key);

                        return (
                            <button
                                key={key}
                                type="button"
                                data-day={key}
                                onClick={() => onSelect(day)}
                                className={cn(
                                    'relative flex h-14 min-w-11 shrink-0 flex-col items-center justify-center rounded-md border px-2 transition-colors',
                                    active
                                        ? 'border-orion-blue bg-orion-blue/10 text-orion-blue'
                                        : 'border-transparent bg-gray-50 text-foreground hover:border-border hover:bg-card',
                                    today && !active && 'border-border',
                                )}
                            >
                                <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                                    {format(day, 'EEE')}
                                </span>
                                <span className="text-[14px] font-semibold tabular-nums">
                                    {format(day, 'd')}
                                </span>
                                {hasMoves ? (
                                    <span
                                        className={cn(
                                            'absolute bottom-1 h-1 w-1 rounded-full',
                                            active
                                                ? 'bg-orion-blue'
                                                : 'bg-emerald-500',
                                        )}
                                    />
                                ) : null}
                            </button>
                        );
                    })}
                </div>

                <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    aria-label="Scroll days right"
                    disabled={!canScrollRight}
                    onClick={() => scrollByPage(1)}
                    className={cn(
                        'absolute right-2 top-1/2 z-10 h-8 w-8 -translate-y-1/2 rounded-full border bg-white',
                        !canScrollRight && 'opacity-40',
                    )}
                >
                    <ChevronRight className="size-4" />
                </Button>
            </div>
        </div>
    );
}
