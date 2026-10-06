'use client';

import { getOwnerDashboard, OwnerDashboardData } from '@/app/actions/reports';
import PageWrapper from '@/components/common/PageWrapper';
import { PageHeader, PageHeadertitle } from '@/components/common/layout/Header';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
    Activity,
    AlertTriangle,
    BedDouble,
    ClipboardList,
    GitBranch,
    Loader2,
    TrendingUp,
    Users,
} from 'lucide-react';
import { useMemo } from 'react';
import useSWR from 'swr';

function formatMoney(n: number) {
    return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
        maximumFractionDigits: 0,
    }).format(n || 0);
}

function formatWhen(value?: string) {
    if (!value) return '—';
    try {
        return new Date(value).toLocaleString();
    } catch {
        return value;
    }
}

function severityClass(severity: string) {
    if (severity === 'critical') return 'bg-red-50 border-red-200 text-red-900';
    if (severity === 'warning')
        return 'bg-amber-50 border-amber-200 text-amber-900';
    return 'bg-sky-50 border-sky-200 text-sky-900';
}

function MetricTile({
    label,
    value,
    hint,
}: {
    label: string;
    value: string;
    hint?: string;
}) {
    return (
        <Card className="shadow-sm">
            <CardContent className="pt-5 pb-4 px-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    {label}
                </p>
                <p className="mt-1 text-2xl font-semibold tabular-nums">
                    {value}
                </p>
                {hint ? (
                    <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
                ) : null}
            </CardContent>
        </Card>
    );
}

export default function OwnerDashboardPage() {
    const dateKey = useMemo(
        () => new Date().toISOString().slice(0, 10),
        [],
    );
    const { data, isLoading, error } = useSWR(
        ['owner-dashboard', dateKey],
        async () => {
            const result = await getOwnerDashboard(dateKey);
            if (result.error) throw new Error(result.error);
            return result.data as OwnerDashboardData;
        },
        { refreshInterval: 60_000 },
    );

    const m = data?.metrics;

    return (
        <PageWrapper>
            <PageHeader>
                <PageHeadertitle
                    title="Owner Dashboard"
                    subtitle="Executive overview — Metrics, Events, Logs & Traces (MELT)"
                />
            </PageHeader>

            {isLoading && !data ? (
                <div className="flex items-center gap-2 text-muted-foreground py-16 justify-center">
                    <Loader2 className="size-5 animate-spin" />
                    Loading owner overview…
                </div>
            ) : null}

            {error ? (
                <Card className="border-red-200 bg-red-50">
                    <CardContent className="py-6 text-sm text-red-800">
                        Could not load the owner dashboard. Please refresh and
                        try again.
                    </CardContent>
                </Card>
            ) : null}

            {m ? (
                <div className="space-y-8">
                    <section className="space-y-3">
                        <div className="flex items-center gap-2">
                            <TrendingUp className="size-4 text-brand" />
                            <h2 className="text-sm font-semibold uppercase tracking-wide">
                                Metrics
                            </h2>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                            <MetricTile
                                label="Occupancy"
                                value={`${m.occupancyPct}%`}
                                hint={`${m.occupied} occupied · ${m.vacant} vacant`}
                            />
                            <MetricTile
                                label="ADR"
                                value={formatMoney(m.adr)}
                                hint={`RevPAR ${formatMoney(m.revpar)}`}
                            />
                            <MetricTile
                                label="Total revenue (today)"
                                value={formatMoney(m.totalRevenue)}
                                hint={`Rooms ${formatMoney(m.roomRevenue)} · F&B ${formatMoney(m.fbRevenue)}`}
                            />
                            <MetricTile
                                label="Arrivals / Departures"
                                value={`${m.arrivals} / ${m.departures}`}
                                hint={`${m.restaurantCovers} F&B covers · peak ${m.peakPeriod}`}
                            />
                            <MetricTile
                                label="Restaurant activity"
                                value={String(m.restaurantOrders)}
                                hint="Orders today (all statuses)"
                            />
                            <MetricTile
                                label="Staff on duty"
                                value={String(m.staffOnDuty)}
                                hint="Active staff accounts"
                            />
                            <MetricTile
                                label="Pending approvals"
                                value={String(m.pendingApprovals)}
                                hint="Discount / complimentary waiting PIN"
                            />
                            <MetricTile
                                label="Low stock alerts"
                                value={String(m.lowStockCount)}
                                hint="Items below minimum stock"
                            />
                        </div>
                    </section>

                    <div className="grid gap-6 lg:grid-cols-2">
                        <section className="space-y-3">
                            <div className="flex items-center gap-2">
                                <AlertTriangle className="size-4 text-amber-600" />
                                <h2 className="text-sm font-semibold uppercase tracking-wide">
                                    Events
                                </h2>
                            </div>
                            <Card>
                                <CardContent className="p-0 divide-y max-h-[420px] overflow-y-auto">
                                    {(data?.events || []).length === 0 ? (
                                        <p className="p-4 text-sm text-muted-foreground">
                                            No alerts right now — property looks
                                            calm.
                                        </p>
                                    ) : (
                                        data?.events.map((ev) => (
                                            <div
                                                key={ev.id}
                                                className={cn(
                                                    'px-4 py-3 border-l-4',
                                                    severityClass(ev.severity),
                                                )}
                                            >
                                                <div className="flex items-start justify-between gap-2">
                                                    <p className="text-sm font-medium">
                                                        {ev.title}
                                                    </p>
                                                    <Badge variant="outline">
                                                        {ev.category}
                                                    </Badge>
                                                </div>
                                                <p className="mt-1 text-xs opacity-90">
                                                    {ev.detail}
                                                </p>
                                                <p className="mt-1 text-[11px] opacity-70">
                                                    {formatWhen(ev.at)}
                                                </p>
                                            </div>
                                        ))
                                    )}
                                </CardContent>
                            </Card>
                        </section>

                        <section className="space-y-3">
                            <div className="flex items-center gap-2">
                                <ClipboardList className="size-4 text-slate-600" />
                                <h2 className="text-sm font-semibold uppercase tracking-wide">
                                    Logs
                                </h2>
                            </div>
                            <Card>
                                <CardContent className="p-0 divide-y max-h-[420px] overflow-y-auto">
                                    {(data?.logs || []).length === 0 ? (
                                        <p className="p-4 text-sm text-muted-foreground">
                                            No recent activity logged.
                                        </p>
                                    ) : (
                                        data?.logs.map((log) => (
                                            <div
                                                key={log.id}
                                                className="px-4 py-3"
                                            >
                                                <div className="flex items-center gap-2 text-sm font-medium">
                                                    <Activity className="size-3.5 text-muted-foreground" />
                                                    {log.action.replaceAll(
                                                        '_',
                                                        ' ',
                                                    )}
                                                </div>
                                                <p className="mt-1 text-xs text-muted-foreground">
                                                    {log.guestName}
                                                    {log.roomNumber
                                                        ? ` · Room ${log.roomNumber}`
                                                        : ''}{' '}
                                                    · by {log.adminName}
                                                </p>
                                                <p className="text-[11px] text-muted-foreground">
                                                    {formatWhen(log.timestamp)}
                                                </p>
                                            </div>
                                        ))
                                    )}
                                </CardContent>
                            </Card>
                        </section>
                    </div>

                    <section className="space-y-3">
                        <div className="flex items-center gap-2">
                            <GitBranch className="size-4 text-violet-600" />
                            <h2 className="text-sm font-semibold uppercase tracking-wide">
                                Traces
                            </h2>
                        </div>
                        <div className="grid gap-3 md:grid-cols-2">
                            {(data?.traces || []).length === 0 ? (
                                <Card>
                                    <CardContent className="py-6 text-sm text-muted-foreground">
                                        No significant sequences in the last 48
                                        hours (rebooks, approval flows, room
                                        transfers).
                                    </CardContent>
                                </Card>
                            ) : (
                                data?.traces.map((trace) => (
                                    <Card key={trace.id}>
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-base flex items-center gap-2">
                                                <BedDouble className="size-4" />
                                                {trace.title}
                                            </CardTitle>
                                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                <Users className="size-3" />
                                                {trace.guestName}
                                                {trace.roomNumber
                                                    ? ` · Room ${trace.roomNumber}`
                                                    : ''}
                                            </p>
                                        </CardHeader>
                                        <CardContent className="space-y-2">
                                            {trace.steps.map((step, idx) => (
                                                <div
                                                    key={`${trace.id}-${idx}`}
                                                    className="flex gap-3 text-sm"
                                                >
                                                    <div className="flex flex-col items-center">
                                                        <span className="size-2 rounded-full bg-violet-500 mt-1.5" />
                                                        {idx <
                                                        trace.steps.length - 1 ? (
                                                            <span className="w-px flex-1 bg-violet-200 my-1" />
                                                        ) : null}
                                                    </div>
                                                    <div className="pb-2">
                                                        <p className="font-medium">
                                                            {step.action.replaceAll(
                                                                '_',
                                                                ' ',
                                                            )}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {formatWhen(
                                                                step.at,
                                                            )}{' '}
                                                            · {step.by}
                                                        </p>
                                                        {step.detail ? (
                                                            <p className="text-xs mt-0.5">
                                                                {step.detail}
                                                            </p>
                                                        ) : null}
                                                    </div>
                                                </div>
                                            ))}
                                        </CardContent>
                                    </Card>
                                ))
                            )}
                        </div>
                    </section>
                </div>
            ) : null}
        </PageWrapper>
    );
}
