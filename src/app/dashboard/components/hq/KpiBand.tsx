"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Building2,
  FlaskConical,
  Inbox,
  Wallet,
  CreditCard,
} from "lucide-react";
import type { HqOverview } from "@/app/actions/hq-overview";
import type { DerivedOverview } from "./useHqData";

function fmtMoney(n: number | undefined | null): string {
  if (n === undefined || n === null) return "—";
  return "₦" + Number(n).toLocaleString("en-NG", { maximumFractionDigits: 0 });
}

function KpiCard({
  icon: Icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub?: string;
  accent: string;
}) {
  return (
    <Card className="overflow-hidden border shadow-sm dark:bg-[#151a22] dark:border-white/10">
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-center justify-between">
          <p className="text-xs sm:text-sm font-medium text-muted-foreground">
            {label}
          </p>
          <span
            className={`flex h-8 w-8 items-center justify-center rounded-full ${accent}`}
          >
            <Icon className="h-4 w-4" />
          </span>
        </div>
        <p className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight">
          {value}
        </p>
        {sub && (
          <p className="mt-1 text-xs text-muted-foreground">{sub}</p>
        )}
      </CardContent>
    </Card>
  );
}

export function KpiBandSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-28 rounded-xl" />
      ))}
    </div>
  );
}

export default function KpiBand({
  api,
  derived,
}: {
  api: HqOverview | null;
  derived: DerivedOverview;
}) {
  const mrr = api?.mrr;
  const trialMrr = api?.trialMrr;
  const activeHotels = api?.totals.activeHotels ?? derived.activeHotels;
  const trials = api?.totals.trialHotels ?? derived.trialHotels;
  const expiringCount = api
    ? api.alerts.filter((a) => a.type === "trial_expiring").length
    : derived.expiringTrials.length;
  const openTickets = api?.tickets.open ?? derived.openTickets;
  const payMonth = api?.paymentsThisMonth;

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
      <KpiCard
        icon={Wallet}
        label="MRR"
        value={fmtMoney(mrr)}
        sub={
          mrr === undefined
            ? "Connect billing API"
            : `${fmtMoney(api?.arr)} ARR${trialMrr ? ` · ${fmtMoney(trialMrr)} trial pipeline` : ""}`
        }
        accent="bg-orange-100 text-[#FF6F00] dark:bg-orange-900/30 dark:text-orange-400"
      />
      <KpiCard
        icon={Building2}
        label="Active hotels"
        value={String(activeHotels)}
        sub={`${api?.totals.hotels ?? derived.hotels} total businesses`}
        accent="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
      />
      <KpiCard
        icon={FlaskConical}
        label="Trials"
        value={String(trials)}
        sub={expiringCount > 0 ? `${expiringCount} expiring ≤ 7 days` : "none expiring soon"}
        accent="bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400"
      />
      <KpiCard
        icon={Inbox}
        label="Open tickets"
        value={String(openTickets)}
        sub={`${api?.tickets.in_progress ?? derived.inProgressTickets} in progress`}
        accent="bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400"
      />
      <KpiCard
        icon={CreditCard}
        label="Payments this month"
        value={payMonth ? fmtMoney(payMonth.total) : "—"}
        sub={payMonth ? `${payMonth.count} payments` : "Connect billing API"}
        accent="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
      />
    </div>
  );
}
