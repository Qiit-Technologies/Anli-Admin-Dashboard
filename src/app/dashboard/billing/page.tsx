"use client";

import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Wallet, TrendingUp, FlaskConical, Send, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import HqShell from "../components/layout/hq-shell";
import { useBillingMetrics } from "../components/hq/useHqData";
import { sendPaymentReminder } from "@/app/actions/plan";

function fmtMoney(n: number | undefined | null): string {
  if (n === undefined || n === null) return "—";
  return "₦" + Number(n).toLocaleString("en-NG", { maximumFractionDigits: 0 });
}

function fmtDate(v?: string | null): string {
  if (!v) return "—";
  try {
    return new Date(v).toLocaleDateString("en-NG", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

function ExpiringTrials() {
  const { data: metrics, isLoading } = useBillingMetrics();
  const [sendingId, setSendingId] = useState<string | number | null>(null);

  const sendReminder = async (hotelId: string | number, hotelName: string) => {
    setSendingId(hotelId);
    try {
      await sendPaymentReminder(Number(hotelId));
      toast.success(`Reminder sent to ${hotelName}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to send reminder");
    } finally {
      setSendingId(null);
    }
  };

  if (isLoading) return <Skeleton className="h-56 rounded-xl" />;

  const trials = metrics?.expiringTrials ?? [];
  return (
    <Card className="dark:bg-[#151a22] dark:border-white/10">
      <CardHeader>
        <CardTitle className="text-base sm:text-lg">Expiring trials</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto p-0">
        {trials.length === 0 ? (
          <p className="px-6 py-8 text-center text-sm text-muted-foreground">
            {metrics
              ? "No trials expiring."
              : "Trial data unavailable — connect the billing metrics API."}
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Business</TableHead>
                <TableHead>Ends</TableHead>
                <TableHead className="text-right">Days left</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {trials.map((t) => (
                <TableRow key={String(t.hotelId)}>
                  <TableCell className="font-medium">{t.hotelName}</TableCell>
                  <TableCell className="text-sm">{fmtDate(t.endDate)}</TableCell>
                  <TableCell className="text-right">
                    <Badge
                      variant="outline"
                      className={
                        (t.daysLeft ?? 99) <= 3
                          ? "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/40 dark:text-red-300 dark:border-red-800"
                          : "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-800"
                      }
                    >
                      {t.daysLeft ?? "?"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1.5"
                      disabled={sendingId === t.hotelId}
                      onClick={() => sendReminder(t.hotelId, t.hotelName)}
                    >
                      {sendingId === t.hotelId ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Send className="h-3.5 w-3.5" />
                      )}
                      Remind
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

function PaymentsTables() {
  const { data: metrics, isLoading } = useBillingMetrics();

  if (isLoading) return <Skeleton className="h-64 rounded-xl" />;

  const failed = metrics?.failedPayments ?? [];
  const recent = metrics?.recentPayments ?? [];

  return (
    <div className="grid gap-3 sm:gap-4 lg:grid-cols-2">
      <Card className="dark:bg-[#151a22] dark:border-white/10">
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Failed payments</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          {failed.length === 0 ? (
            <p className="px-6 py-8 text-center text-sm text-muted-foreground">
              {metrics
                ? "No failed payments."
                : "Payment data unavailable — connect the billing metrics API."}
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Business</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Reason</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {failed.map((p, i) => (
                  <TableRow key={`${p.hotelId}-${i}`}>
                    <TableCell className="font-medium">{p.hotelName}</TableCell>
                    <TableCell className="text-right">
                      {fmtMoney(p.amount)}
                    </TableCell>
                    <TableCell className="text-sm">{fmtDate(p.date)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {p.reason || "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card className="dark:bg-[#151a22] dark:border-white/10">
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Recent payments</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          {recent.length === 0 ? (
            <p className="px-6 py-8 text-center text-sm text-muted-foreground">
              {metrics
                ? "No recent payments."
                : "Payment data unavailable — connect the billing metrics API."}
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Business</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recent.map((p, i) => (
                  <TableRow key={`${p.hotelId}-${p.reference || i}`}>
                    <TableCell className="font-medium">{p.hotelName}</TableCell>
                    <TableCell className="text-right">
                      {fmtMoney(p.amount)}
                    </TableCell>
                    <TableCell className="text-sm">{fmtDate(p.date)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[11px]">
                        {p.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function BillingPage() {
  const { data: metrics, isLoading } = useBillingMetrics();
  const planData = (metrics?.byPlan ?? []).map((p) => ({
    name: p.planName,
    mrr: p.mrr,
    hotels: p.hotelCount,
  }));

  return (
    <HqShell title="Billing">
      {isLoading ? (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
          <Card className="dark:bg-[#151a22] dark:border-white/10">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">MRR</p>
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 text-[#FF6F00] dark:bg-orange-900/30 dark:text-orange-400">
                  <Wallet className="h-4 w-4" />
                </span>
              </div>
              <p className="mt-2 text-2xl sm:text-3xl font-bold">{fmtMoney(metrics?.mrr)}</p>
              <p className="mt-1 text-xs text-muted-foreground">{fmtMoney(metrics?.arr)} ARR</p>
            </CardContent>
          </Card>
          <Card className="dark:bg-[#151a22] dark:border-white/10">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">Trial pipeline</p>
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400">
                  <FlaskConical className="h-4 w-4" />
                </span>
              </div>
              <p className="mt-2 text-2xl sm:text-3xl font-bold">{fmtMoney(metrics?.trialMrr)}</p>
              <p className="mt-1 text-xs text-muted-foreground">MRR if trials convert</p>
            </CardContent>
          </Card>
          <Card className="dark:bg-[#151a22] dark:border-white/10">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">Plans tracked</p>
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                  <TrendingUp className="h-4 w-4" />
                </span>
              </div>
              <p className="mt-2 text-2xl sm:text-3xl font-bold">{planData.length || "—"}</p>
              <p className="mt-1 text-xs text-muted-foreground">active plan tiers</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Card className="dark:bg-[#151a22] dark:border-white/10">
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Revenue by plan</CardTitle>
        </CardHeader>
        <CardContent className="h-64">
          {planData.length === 0 ? (
            <p className="flex h-full items-center justify-center text-sm text-muted-foreground">
              {isLoading ? "Loading…" : "Plan breakdown unavailable — connect the billing metrics API."}
            </p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={planData} margin={{ left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  formatter={(v: any) => [
                    "₦" + Number(v ?? 0).toLocaleString(),
                    "MRR",
                  ]}
                />
                <Bar dataKey="mrr" fill="#FF6F00" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <ExpiringTrials />
      <PaymentsTables />
    </HqShell>
  );
}
