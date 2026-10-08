'use client';

import {
    fetchPrintStatus,
    printToIP,
    retryFailedPrintJobs,
} from '@/app/actions/print';
import { Button } from '@/components/ui/button';
import {
    clearPendingKitchenPrints,
    listPendingKitchenPrints,
    removePendingKitchenPrint,
    type PendingKitchenPrint,
} from '@/lib/kitchenPrintErrors';
import { cn } from '@/lib/utils';
import { Loader2, Printer } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import useSWR, { mutate } from 'swr';

type Station = {
    type: 'kot' | 'bot' | 'receipt';
    ip: string | null;
    port: number;
    configured: boolean;
};

export function PrinterStatusCard({ className }: { className?: string }) {
    const { data, isLoading } = useSWR(
        'print-status',
        async () => {
            const result = await fetchPrintStatus();
            return result.data || null;
        },
        { refreshInterval: 15_000, revalidateOnFocus: true },
    );
    const [retrying, setRetrying] = useState(false);
    const [retryingOffline, setRetryingOffline] = useState(false);
    const [offlineJobs, setOfflineJobs] = useState<PendingKitchenPrint[]>([]);

    const refreshOffline = useCallback(() => {
        setOfflineJobs(listPendingKitchenPrints());
    }, []);

    useEffect(() => {
        refreshOffline();
        const onFocus = () => refreshOffline();
        window.addEventListener('focus', onFocus);
        const onJump = () => {
            document
                .getElementById('printer-status-card')
                ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        };
        window.addEventListener('orion:focus-printer-status', onJump);
        return () => {
            window.removeEventListener('focus', onFocus);
            window.removeEventListener('orion:focus-printer-status', onJump);
        };
    }, [refreshOffline]);

    const printers: Station[] = data?.printers || [];
    const queue = data?.queue;
    const failed = queue?.recentFailures?.length || 0;
    const pending = (queue?.waiting || 0) + (queue?.active || 0);

    const handleRetry = async () => {
        setRetrying(true);
        const result = await retryFailedPrintJobs();
        setRetrying(false);
        if (result.error) {
            toast.error(result.error);
            return;
        }
        toast.success(
            `Retried ${result.data?.retried || 0} job(s). Stale jobs skipped: ${result.data?.skippedStale || 0}.`,
        );
        mutate('print-status');
    };

    const handleRetryOffline = async () => {
        const jobs = listPendingKitchenPrints();
        if (jobs.length === 0) {
            toast('No offline print jobs saved on this device.');
            return;
        }
        setRetryingOffline(true);
        let ok = 0;
        let fail = 0;
        for (const job of jobs) {
            const response = await printToIP(job.escposData, job.type);
            if (response.error) {
                fail += 1;
                continue;
            }
            removePendingKitchenPrint(job.id);
            ok += 1;
        }
        setRetryingOffline(false);
        refreshOffline();
        if (ok > 0) {
            toast.success(`Replayed ${ok} offline kitchen print job(s).`);
        }
        if (fail > 0) {
            toast.error(
                `${fail} offline job(s) still failed. Check printer IP / QZ Tray and try again.`,
            );
        }
        mutate('print-status');
    };

    return (
        <div
            id="printer-status-card"
            className={cn('rounded-lg border bg-white p-4', className)}
        >
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                    <Printer className="size-4 text-muted-foreground" />
                    <div>
                        <p className="text-sm font-semibold">Printer status</p>
                        <p className="text-xs text-muted-foreground">
                            Kitchen, bar, and receipt routing (QZ → IP fallback)
                        </p>
                    </div>
                </div>
                <div className="flex flex-wrap gap-2 justify-end">
                    {offlineJobs.length > 0 ? (
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={handleRetryOffline}
                            disabled={retryingOffline}
                        >
                            {retryingOffline ? (
                                <Loader2 className="mr-1 size-3 animate-spin" />
                            ) : null}
                            Retry offline ({offlineJobs.length})
                        </Button>
                    ) : null}
                    {failed > 0 ? (
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={handleRetry}
                            disabled={retrying}
                        >
                            {retrying ? (
                                <Loader2 className="mr-1 size-3 animate-spin" />
                            ) : null}
                            Retry failed
                        </Button>
                    ) : null}
                </div>
            </div>

            {isLoading && !data ? (
                <p className="mt-3 text-sm text-muted-foreground">
                    Checking printers…
                </p>
            ) : (
                <div className="mt-3 grid gap-2 sm:grid-cols-3">
                    {(['kot', 'bot', 'receipt'] as const).map((type) => {
                        const station = printers.find((p) => p.type === type);
                        const ok = Boolean(station?.configured);
                        const label =
                            type === 'kot'
                                ? 'Kitchen (KOT)'
                                : type === 'bot'
                                  ? 'Bar (BOT)'
                                  : 'Receipt';
                        return (
                            <div
                                key={type}
                                className="rounded-md border px-3 py-2"
                            >
                                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                    {label}
                                </p>
                                <p
                                    className={cn(
                                        'mt-1 text-sm font-semibold',
                                        ok
                                            ? 'text-emerald-700'
                                            : 'text-amber-700',
                                    )}
                                >
                                    {ok ? 'Ready' : 'Not configured'}
                                </p>
                                <p className="truncate text-xs text-muted-foreground">
                                    {station?.ip
                                        ? `${station.ip}:${station.port}`
                                        : 'Assign an IP in Settings'}
                                </p>
                            </div>
                        );
                    })}
                </div>
            )}

            <p className="mt-3 text-xs text-muted-foreground">
                Queue: {pending} pending
                {failed
                    ? ` · ${failed} failed (retry when the printer is back)`
                    : ''}
                {offlineJobs.length
                    ? ` · ${offlineJobs.length} saved offline on this device`
                    : ''}
            </p>

            {(queue?.recentFailures?.length || 0) > 0 ? (
                <div className="mt-3 space-y-1">
                    <p className="text-xs font-medium text-amber-800">
                        Recent failures
                    </p>
                    {queue!.recentFailures!.slice(0, 3).map((job: any) => (
                        <p
                            key={job.id}
                            className="text-[11px] text-muted-foreground"
                        >
                            {(job.type || 'print').toUpperCase()}:{' '}
                            {job.failedReason || 'Unknown error'}
                        </p>
                    ))}
                </div>
            ) : null}

            {offlineJobs.length > 0 ? (
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="mt-2 h-7 px-2 text-[11px] text-muted-foreground"
                    onClick={() => {
                        clearPendingKitchenPrints();
                        refreshOffline();
                        toast.success('Cleared offline print queue on this device.');
                    }}
                >
                    Clear offline queue
                </Button>
            ) : null}
        </div>
    );
}
