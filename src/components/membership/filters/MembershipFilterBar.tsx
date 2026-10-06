'use client';

import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';
import { ReactNode } from 'react';

export type MembershipFilterOption<T extends string = string> = {
    label: string;
    value: T;
};

export type MembershipFilterGroup<T extends string = string> = {
    id: string;
    label: string;
    options: MembershipFilterOption<T>[];
    value: T;
    onChange: (value: T) => void;
};

export type MembershipFilterSelect = {
    id: string;
    label: string;
    value: string;
    onChange: (value: string) => void;
    options: { label: string; value: string }[];
};

type MembershipFilterBarProps = {
    groups: MembershipFilterGroup[];
    selects?: MembershipFilterSelect[];
    showing?: number;
    total?: number;
    itemLabel?: string;
    actions?: ReactNode;
    className?: string;
};

function FilterPillGroup<T extends string>({
    group,
}: {
    group: MembershipFilterGroup<T>;
}) {
    return (
        <div className="flex min-w-0 flex-col gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {group.label}
            </span>
            <div
                role="group"
                aria-label={group.label}
                className="inline-flex flex-wrap gap-1 rounded-lg bg-slate-100 p-1"
            >
                {group.options.map((option) => {
                    const isActive = group.value === option.value;
                    return (
                        <button
                            key={`${group.id}-${option.value}`}
                            type="button"
                            onClick={() => group.onChange(option.value)}
                            aria-pressed={isActive}
                            className={cn(
                                'rounded-full px-3.5 py-1.5 text-sm font-medium transition-all',
                                isActive
                                    ? 'bg-white text-orion-blue shadow-sm ring-1 ring-slate-200/80'
                                    : 'text-slate-600 hover:bg-white/60 hover:text-slate-900',
                            )}
                        >
                            {option.label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

export default function MembershipFilterBar({
    groups,
    selects = [],
    showing,
    total,
    itemLabel = 'items',
    actions,
    className,
}: MembershipFilterBarProps) {
    return (
        <div
            className={cn(
                'rounded-xl border border-slate-200 bg-white p-4 shadow-sm',
                className,
            )}
        >
            <div className="flex flex-col gap-4">
                {groups.map((group) => (
                    <FilterPillGroup key={group.id} group={group} />
                ))}

                {selects.length > 0 && (
                    <div className="flex flex-wrap items-end gap-4">
                        {selects.map((select) => (
                            <div
                                key={select.id}
                                className="flex min-w-[180px] flex-col gap-2"
                            >
                                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    {select.label}
                                </span>
                                <div className="relative">
                                    <select
                                        id={select.id}
                                        value={select.value}
                                        onChange={(event) =>
                                            select.onChange(event.target.value)
                                        }
                                        className={cn(
                                            'h-9 w-full appearance-none rounded-lg border border-slate-200 bg-slate-50',
                                            'pl-3 pr-9 text-sm font-medium text-slate-700',
                                            'focus:border-orion-blue focus:outline-none focus:ring-2 focus:ring-orion-blue/30',
                                        )}
                                    >
                                        {select.options.map((option) => (
                                            <option
                                                key={option.value}
                                                value={option.value}
                                            >
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown
                                        className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                                        aria-hidden
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {(actions || showing !== undefined) && (
                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">
                        {showing !== undefined && total !== undefined ? (
                            <p className="text-xs text-muted-foreground">
                                Showing {showing.toLocaleString()} of{' '}
                                {total.toLocaleString()} {itemLabel}
                            </p>
                        ) : (
                            <span />
                        )}
                        {actions ? (
                            <div className="flex flex-wrap items-center gap-2">
                                {actions}
                            </div>
                        ) : null}
                    </div>
                )}
            </div>
        </div>
    );
}
