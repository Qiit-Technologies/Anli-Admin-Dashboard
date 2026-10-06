'use client';

import { Button } from '@/components/ui/button';
import { ExternalLink, Info } from 'lucide-react';

/**
 * ANLI-018 — short support-facing kitchen printing setup guide shown in Settings.
 */
export function KitchenPrintingGuide() {
    return (
        <div className="rounded-lg border bg-slate-50 p-4 space-y-3">
            <div className="flex items-start gap-2">
                <Info className="size-4 mt-0.5 text-slate-600" />
                <div>
                    <h3 className="text-sm font-semibold">
                        Standard kitchen printing (KOT / BOT)
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                        ANLI routes kitchen dockets by station: Kitchen (KOT),
                        Bar (BOT), and customer Receipt. Desktop devices should
                        prefer QZ Tray; tablets/phones use network (IP) printing
                        or the hotel print gateway.
                    </p>
                </div>
            </div>
            <ol className="list-decimal list-inside text-xs text-slate-700 space-y-1.5 pl-1">
                <li>
                    Install and run{' '}
                    <a
                        className="text-brand underline inline-flex items-center gap-1"
                        href="https://qz.io/download/"
                        target="_blank"
                        rel="noreferrer"
                    >
                        QZ Tray
                        <ExternalLink className="size-3" />
                    </a>{' '}
                    on each front-of-house PC that prints dockets.
                </li>
                <li>
                    In Printing Method, choose <strong>Auto</strong> (QZ when
                    available, then IP) unless support directs otherwise.
                </li>
                <li>
                    Map printers under QZ Multi-Printer Setup: one for KOT, one
                    for BOT, one for receipts.
                </li>
                <li>
                    Also save IP/port for each station so printing continues if
                    QZ Tray is offline.
                </li>
                <li>
                    Confirm green <strong>Ready</strong> status on Kitchen
                    Dashboard / Printer status. Use <strong>Retry failed</strong>{' '}
                    after the printer is back online (jobs older than 10 minutes
                    are skipped as stale).
                </li>
            </ol>
            <p className="text-[11px] text-muted-foreground">
                QZ Tray desktop use is free for typical hospitality setups;
                commercial licensing may apply for large deployments — confirm
                with QZ for your customer count. Prefer ANLI-supported POS
                hardware at the front counter for the most stable receipt path.
            </p>
            <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => {
                    window.dispatchEvent(
                        new CustomEvent('orion:focus-printer-status'),
                    );
                }}
            >
                Jump to printer status
            </Button>
        </div>
    );
}
