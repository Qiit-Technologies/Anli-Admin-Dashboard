'use client';

import { Loader2 } from 'lucide-react';

interface ScanProgressToastProps {
    title: string;
    description: string;
}

export default function ScanProgressToast({
    title,
    description,
}: Readonly<ScanProgressToastProps>) {
    return (
        <div
            role="status"
            aria-live="polite"
            className="flex w-full max-w-sm items-center gap-2.5 rounded-lg border border-blue-200/80 bg-white px-3.5 py-2.5 shadow-md"
        >
            <Loader2
                className="h-4 w-4 shrink-0 animate-spin text-orion-blue"
                aria-hidden
            />
            <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold leading-tight text-gray-900">
                    {title}
                </p>
                <p className="mt-0.5 text-xs text-gray-600">{description}</p>
            </div>
        </div>
    );
}
