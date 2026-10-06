'use client';

import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

interface OrderLike {
    id?: number | string;
    requestId?: string;
    table?: { number?: string | number };
    room?: { roomNumber?: string };
}

interface NewOrderBannerProps {
    show: boolean;
    newOrders: OrderLike[];
    onDismiss: () => void;
    className?: string;
}

export function NewOrderBanner({
    show,
    newOrders,
    onDismiss,
    className,
}: NewOrderBannerProps) {
    if (!show || newOrders.length === 0) return null;

    const label =
        newOrders.length === 1
            ? (() => {
                  const o = newOrders[0];
                  const ref =
                      o?.requestId ?? (o?.id != null ? `#${o.id}` : '');
                  const loc =
                      o?.table?.number != null
                          ? `Table ${o.table.number}`
                          : o?.room?.roomNumber ?? '';
                  const suffix = loc ? ` (${loc})` : '';
                  return `New order received — ${ref}${suffix}`.trim();
              })()
            : `${newOrders.length} new orders received`;

    return (
        <div
            role="alert"
            className={cn(
                'flex items-center justify-between gap-4 rounded-lg border border-orion-blue/30 bg-orion-blue/10 px-4 py-3 text-sm font-medium text-orion-blue shadow-sm animate-in fade-in slide-in-from-top-2 duration-300',
                className
            )}
        >
            <span className="flex items-center gap-2">
                <span className="inline-flex h-2 w-2 rounded-full bg-orion-blue animate-pulse" />
                {label}
            </span>
            <button
                type="button"
                onClick={onDismiss}
                className="rounded p-1 hover:bg-orion-blue/20 transition-colors"
                aria-label="Dismiss"
            >
                <X className="h-4 w-4" />
            </button>
        </div>
    );
}
