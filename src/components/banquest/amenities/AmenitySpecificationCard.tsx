'use client';

import { cn } from '@/lib/utils';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

export default function AmenitySpecificationCard({
    items,
}: {
    items: Array<{ label: string; value: string }>;
}) {
    const [open, setOpen] = useState(true);

    return (
        <div className="rounded-xl border border-gray-200 bg-white">
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="flex w-full items-center justify-between px-6 py-4 text-left"
            >
                <h3 className="text-base font-semibold text-gray-900">
                    Specification
                </h3>
                {open ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
            </button>
            {open && (
                <ul className="space-y-4 border-t border-gray-100 px-6 py-5">
                    {items.map(({ label, value }) => (
                        <li
                            key={label}
                            className="flex items-center justify-between gap-4 text-sm"
                        >
                            <span className="text-muted-foreground">
                                {label}
                            </span>
                            <span
                                className={cn(
                                    'text-right font-medium text-gray-900',
                                )}
                            >
                                {value}
                            </span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
