"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertTriangle,
  Clock,
  CreditCard,
  MoonStar,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { HqAlert, HqOverview } from "@/app/actions/hq-overview";
import type { DerivedOverview } from "./useHqData";

const SEVERITY_META: Record<
  string,
  { icon: React.ElementType; className: string; label: string }
> = {
  critical: {
    icon: AlertTriangle,
    label: "Critical",
    className:
      "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/40 dark:text-red-300 dark:border-red-800",
  },
  warning: {
    icon: Clock,
    label: "Warning",
    className:
      "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-800",
  },
  info: {
    icon: Info,
    label: "Info",
    className:
      "bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-900/40 dark:text-sky-300 dark:border-sky-800",
  },
};

const TYPE_META: Record<string, { icon: React.ElementType; label: string }> = {
  trial_expiring: { icon: Clock, label: "Trial expiring" },
  grace_period: { icon: MoonStar, label: "Grace period" },
  payment_failed: { icon: CreditCard, label: "Payment failed" },
  inactive_hotel: { icon: MoonStar, label: "Inactive hotel" },
};

export function AlertsFeedSkeleton() {
  return <Skeleton className="h-64 rounded-xl" />;
}

export default function AlertsFeed({
  api,
  derived,
}: {
  api: HqOverview | null;
  derived: DerivedOverview;
}) {
  const alerts: HqAlert[] =
    api?.alerts ??
    derived.expiringTrials.map((t) => ({
      type: "trial_expiring",
      hotelId: t.hotelId,
      hotelName: t.hotelName,
      message: `Trial ends ${t.endDate ? new Date(t.endDate).toLocaleDateString() : "soon"} (${t.daysLeft ?? "?"} days left)`,
      severity: (t.daysLeft ?? 99) <= 3 ? ("critical" as const) : ("warning" as const),
    }));

  return (
    <Card className="dark:bg-[#151a22] dark:border-white/10">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base sm:text-lg">Alerts</CardTitle>
        <Badge variant="outline">{alerts.length}</Badge>
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            All clear — no alerts right now.
          </p>
        ) : (
          <ul className="max-h-80 space-y-3 overflow-y-auto pr-1">
            {alerts.map((a, i) => {
              const sev = SEVERITY_META[a.severity] ?? SEVERITY_META.info;
              const typeMeta = TYPE_META[a.type] ?? { icon: Info, label: a.type };
              const SevIcon = sev.icon;
              const TypeIcon = typeMeta.icon;
              return (
                <li
                  key={`${a.type}-${a.hotelId}-${i}`}
                  className="flex items-start gap-3 rounded-lg border p-3 dark:border-white/10"
                >
                  <span
                    className={cn(
                      "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border",
                      sev.className,
                    )}
                  >
                    <TypeIcon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline" className={cn("text-[11px]", sev.className)}>
                        <SevIcon className="mr-1 h-3 w-3" />
                        {sev.label}
                      </Badge>
                      <span className="text-xs font-medium text-muted-foreground">
                        {typeMeta.label}
                      </span>
                    </div>
                    <Link
                      href="/business-list"
                      className="mt-1 block truncate text-sm font-semibold hover:text-[#FF6F00] hover:underline"
                    >
                      {a.hotelName}
                    </Link>
                    <p className="text-xs text-muted-foreground">{a.message}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
