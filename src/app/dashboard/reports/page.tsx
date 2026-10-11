"use client";

import { useMemo, useState, type ReactNode } from "react";
import useSWR from "swr";
import toast from "react-hot-toast";
import { Download } from "lucide-react";
import HqShell from "../components/layout/hq-shell";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  getMrrMovement,
  getTrialConversion,
  getSupportSla,
  type MrrMovementRow,
  type TrialConversionRow,
  type SupportSla,
  type ReportResult,
} from "@/app/actions/hq-reports";
import { getBillingMetrics } from "@/app/actions/hq-overview";
import { toCsv, downloadCsv } from "@/lib/csv";

function fmtNaira(n: number | null | undefined): string {
  if (n === null || n === undefined) return "—";
  return `₦${Number(n).toLocaleString("en-NG", { maximumFractionDigits: 0 })}`;
}

function fmtHours(h: number | null | undefined): string {
  if (h === null || h === undefined) return "—";
  if (h < 1) return `${Math.round(h * 60)} min`;
  if (h < 48) return `${h.toFixed(1)} h`;
  return `${(h / 24).toFixed(1)} days`;
}

function fmtPct(r: number | null | undefined): string {
  if (r === null || r === undefined) return "—";
  return `${(r * 100).toFixed(1)}%`;
}

function stamp(): string {
  return new Date().toISOString().slice(0, 10);
}

function exportGuarded<T>(
  filename: string,
  rows: T[],
  columns: Parameters<typeof toCsv<T>>[1],
  emptyMessage: string,
) {
  if (rows.length === 0) {
    toast.error(emptyMessage);
    return;
  }
  downloadCsv(filename, toCsv(rows, columns));
  toast.success(
    `Exported ${rows.length} row${rows.length === 1 ? "" : "s"}.`,
  );
}

function ReportCard({
  title,
  description,
  onExport,
  loading,
  error,
  isEmpty,
  onRetry,
  children,
}: {
  title: string;
  description: string;
  onExport: () => void;
  loading: boolean;
  error: string | null;
  isEmpty: boolean;
  onRetry: () => void;
  children: ReactNode;
}) {
  return (
    <Card className="dark:bg-[#151a22] dark:border-white/10">
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <CardTitle className="text-base sm:text-lg">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onExport}
          disabled={loading}
          className="gap-1.5 shrink-0"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-10 rounded-lg" />
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            <Button variant="outline" size="sm" onClick={onRetry}>
              Retry
            </Button>
          </div>
        ) : isEmpty ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            No data for this period.
          </p>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
}

function resultState<T>(res: ReportResult<T> | undefined): {
  loading: boolean;
  error: string | null;
  data: T | null;
} {
  if (!res) return { loading: true, error: null, data: null };
  if (!res.ok) return { loading: false, error: res.error, data: null };
  return { loading: false, error: null, data: res.data };
}

export default function ReportsPage() {
  const [months, setMonths] = useState("12");
  const [slaDays, setSlaDays] = useState("90");

  const mrrSwr = useSWR(["hq-reports-mrr", months], () =>
    getMrrMovement(Number(months)),
  { revalidateOnFocus: false });
  const trialSwr = useSWR(["hq-reports-trial", months], () =>
    getTrialConversion(Number(months)),
  { revalidateOnFocus: false });
  const slaSwr = useSWR(["hq-reports-sla", slaDays], () =>
    getSupportSla(Number(slaDays)),
  { revalidateOnFocus: false });
  const plansSwr = useSWR("hq-reports-plans", () => getBillingMetrics(), {
    revalidateOnFocus: false,
  });

  const mrr = resultState<MrrMovementRow[]>(mrrSwr.data);
  const trial = resultState<TrialConversionRow[]>(trialSwr.data);
  const sla = resultState<SupportSla>(slaSwr.data);
  const plansLoading = !plansSwr.data && !plansSwr.error;
  const plansError = plansSwr.error
    ? "Couldn't load plan performance."
    : !plansSwr.data?.ok
      ? (plansSwr.data as { ok: false; error: string } | undefined)?.error ??
        null
      : null;
  const byPlan = useMemo(
    () =>
      plansSwr.data && plansSwr.data.ok ? plansSwr.data.data.byPlan ?? [] : [],
    [plansSwr.data],
  );

  const mrrRows = mrr.data ?? [];
  const trialRows = trial.data ?? [];
  const slaData = sla.data;
  const maxMrr = Math.max(1, ...mrrRows.map((r) => r.mrr));

  return (
    <HqShell title="Reports">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Revenue, trial, support and plan performance across all businesses.
        </p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Select value={months} onValueChange={setMonths}>
            <SelectTrigger className="w-full sm:w-44" aria-label="Report period">
              <SelectValue placeholder="Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="6">Last 6 months</SelectItem>
              <SelectItem value="12">Last 12 months</SelectItem>
            </SelectContent>
          </Select>
          <Select value={slaDays} onValueChange={setSlaDays}>
            <SelectTrigger
              className="w-full sm:w-44"
              aria-label="Support SLA period"
            >
              <SelectValue placeholder="Support period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30">Support: last 30 days</SelectItem>
              <SelectItem value="90">Support: last 90 days</SelectItem>
              <SelectItem value="180">Support: last 180 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* MRR movement */}
      <ReportCard
        title="MRR movement"
        description="Monthly recurring revenue reconstructed from subscription records (no status-history table exists yet)."
        loading={mrr.loading}
        error={mrr.error}
        isEmpty={mrrRows.length === 0}
        onRetry={() => mrrSwr.mutate()}
        onExport={() =>
          exportGuarded(
            `mrr-movement-${stamp()}.csv`,
            mrrRows,
            [
              { header: "Month", value: (r) => r.month },
              { header: "MRR (NGN)", value: (r) => r.mrr },
              { header: "Trial MRR (NGN)", value: (r) => r.trialMrr },
              { header: "New MRR (NGN)", value: (r) => r.newMrr },
              { header: "Churned MRR (NGN)", value: (r) => r.churnedMrr },
              { header: "Net movement (NGN)", value: (r) => r.netMovement },
              {
                header: "Active subscriptions",
                value: (r) => r.activeSubscriptions,
              },
            ],
            "No MRR data to export for this period.",
          )
        }
      >
        <div className="mb-6 space-y-2">
          {mrrRows.map((r) => (
            <div key={r.month} className="flex items-center gap-3">
              <span className="w-16 shrink-0 text-xs text-muted-foreground">
                {r.month}
              </span>
              <div className="h-5 flex-1 overflow-hidden rounded bg-muted">
                <div
                  className="h-full rounded bg-emerald-500"
                  style={{ width: `${Math.max(2, (r.mrr / maxMrr) * 100)}%` }}
                />
              </div>
              <span className="w-24 shrink-0 text-right text-xs font-medium">
                {fmtNaira(r.mrr)}
              </span>
            </div>
          ))}
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Month</TableHead>
                <TableHead className="text-right">MRR</TableHead>
                <TableHead className="text-right">Trial MRR</TableHead>
                <TableHead className="text-right">New</TableHead>
                <TableHead className="text-right">Churned</TableHead>
                <TableHead className="text-right">Net</TableHead>
                <TableHead className="text-right">Active subs</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mrrRows.map((r) => (
                <TableRow key={r.month}>
                  <TableCell className="font-medium">{r.month}</TableCell>
                  <TableCell className="text-right">{fmtNaira(r.mrr)}</TableCell>
                  <TableCell className="text-right">
                    {fmtNaira(r.trialMrr)}
                  </TableCell>
                  <TableCell className="text-right text-emerald-600">
                    +{fmtNaira(r.newMrr)}
                  </TableCell>
                  <TableCell className="text-right text-red-600">
                    −{fmtNaira(r.churnedMrr)}
                  </TableCell>
                  <TableCell
                    className={`text-right font-medium ${r.netMovement >= 0 ? "text-emerald-600" : "text-red-600"}`}
                  >
                    {r.netMovement >= 0 ? "+" : "−"}
                    {fmtNaira(Math.abs(r.netMovement))}
                  </TableCell>
                  <TableCell className="text-right">
                    {r.activeSubscriptions}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </ReportCard>

      {/* Trial conversion */}
      <ReportCard
        title="Trial conversion"
        description="Trial cohorts by subscription start month: trials started, converted to paid, still in trial, and conversion rate."
        loading={trial.loading}
        error={trial.error}
        isEmpty={trialRows.length === 0 || trialRows.every((r) => r.trialsStarted === 0)}
        onRetry={() => trialSwr.mutate()}
        onExport={() =>
          exportGuarded(
            `trial-conversion-${stamp()}.csv`,
            trialRows,
            [
              { header: "Cohort", value: (r) => r.month },
              { header: "Trials started", value: (r) => r.trialsStarted },
              { header: "Converted", value: (r) => r.converted },
              { header: "Still in trial", value: (r) => r.stillInTrial },
              {
                header: "Conversion rate",
                value: (r) =>
                  r.conversionRate === null
                    ? ""
                    : `${(r.conversionRate * 100).toFixed(1)}%`,
              },
            ],
            "No trial data to export for this period.",
          )
        }
      >
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cohort</TableHead>
                <TableHead className="text-right">Trials started</TableHead>
                <TableHead className="text-right">Converted</TableHead>
                <TableHead className="text-right">Still in trial</TableHead>
                <TableHead className="text-right">Conversion rate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {trialRows.map((r) => (
                <TableRow key={r.month}>
                  <TableCell className="font-medium">{r.month}</TableCell>
                  <TableCell className="text-right">{r.trialsStarted}</TableCell>
                  <TableCell className="text-right">{r.converted}</TableCell>
                  <TableCell className="text-right">{r.stillInTrial}</TableCell>
                  <TableCell className="text-right font-medium">
                    {fmtPct(r.conversionRate)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </ReportCard>

      {/* Support SLA */}
      <ReportCard
        title="Support SLA"
        description={`Average first response and resolution, from ticket timestamps (last ${slaDays} days).`}
        loading={sla.loading}
        error={sla.error}
        isEmpty={!slaData || slaData.totalTickets === 0}
        onRetry={() => slaSwr.mutate()}
        onExport={() => {
          if (!slaData || slaData.totalTickets === 0) {
            toast.error("No support data to export for this period.");
            return;
          }
          const rows = slaData.byPriority.map((p) => ({
            priority: p.priority,
            tickets: p.tickets,
            avgFirstResponseHours: p.avgFirstResponseHours,
            avgResolutionHours: p.avgResolutionHours,
          }));
          exportGuarded(
            `support-sla-${slaDays}d-${stamp()}.csv`,
            rows,
            [
              { header: "Priority", value: (r) => r.priority },
              { header: "Tickets", value: (r) => r.tickets },
              {
                header: "Avg first response (hours)",
                value: (r) => r.avgFirstResponseHours ?? "",
              },
              {
                header: "Avg resolution (hours)",
                value: (r) => r.avgResolutionHours ?? "",
              },
            ],
            "No support data to export for this period.",
          );
        }}
      >
        {slaData && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {[
                {
                  label: "Avg first response",
                  value: fmtHours(slaData.avgFirstResponseHours),
                },
                {
                  label: "Avg resolution",
                  value: fmtHours(slaData.avgResolutionHours),
                },
                {
                  label: "Responded",
                  value: fmtPct(slaData.respondedRate),
                },
                {
                  label: "Resolved",
                  value: fmtPct(slaData.resolvedRate),
                },
              ].map((s) => (
                <div
                  key={s.label}
                  className="rounded-lg border p-4 dark:border-white/10"
                >
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <p className="mt-1 text-xl font-semibold">{s.value}</p>
                </div>
              ))}
              <p className="col-span-2 text-xs text-muted-foreground lg:col-span-4">
                {slaData.totalTickets} ticket
                {slaData.totalTickets === 1 ? "" : "s"} in period ·{" "}
                {slaData.respondedTickets} with a support reply ·{" "}
                {slaData.resolvedTickets} resolved/closed
              </p>
            </div>
            {slaData.byPriority.length > 0 && (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Priority</TableHead>
                      <TableHead className="text-right">Tickets</TableHead>
                      <TableHead className="text-right">
                        Avg first response
                      </TableHead>
                      <TableHead className="text-right">Avg resolution</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {slaData.byPriority.map((p) => (
                      <TableRow key={p.priority}>
                        <TableCell className="font-medium capitalize">
                          {p.priority.replace(/_/g, " ")}
                        </TableCell>
                        <TableCell className="text-right">{p.tickets}</TableCell>
                        <TableCell className="text-right">
                          {fmtHours(p.avgFirstResponseHours)}
                        </TableCell>
                        <TableCell className="text-right">
                          {fmtHours(p.avgResolutionHours)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        )}
      </ReportCard>

      {/* Per-plan performance */}
      <ReportCard
        title="Per-plan performance"
        description="Businesses and MRR per subscription plan, from live billing metrics."
        loading={plansLoading}
        error={plansError}
        isEmpty={byPlan.length === 0}
        onRetry={() => plansSwr.mutate()}
        onExport={() =>
          exportGuarded(
            `plan-performance-${stamp()}.csv`,
            byPlan,
            [
              { header: "Plan", value: (r) => r.planName },
              { header: "Businesses", value: (r) => r.hotelCount },
              { header: "MRR (NGN)", value: (r) => r.mrr },
            ],
            "No plan data to export.",
          )
        }
      >
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Plan</TableHead>
                <TableHead className="text-right">Businesses</TableHead>
                <TableHead className="text-right">MRR</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {byPlan.map((p) => (
                <TableRow key={p.planName}>
                  <TableCell className="font-medium">{p.planName}</TableCell>
                  <TableCell className="text-right">{p.hotelCount}</TableCell>
                  <TableCell className="text-right">{fmtNaira(p.mrr)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </ReportCard>
    </HqShell>
  );
}
