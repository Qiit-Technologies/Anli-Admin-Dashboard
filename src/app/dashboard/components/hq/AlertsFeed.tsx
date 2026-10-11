"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertTriangle,
  CheckCheck,
  Clock,
  CreditCard,
  MoonStar,
  Info,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { HqOverview } from "@/app/actions/hq-overview";
import type { DerivedOverview } from "./useHqData";
import { useHqAlerts } from "./useHqAlerts";

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
  subscription_expiring: { icon: Clock, label: "Subscription expiring" },
  subscription_expired: { icon: AlertTriangle, label: "Subscription expired" },
  grace_period: { icon: MoonStar, label: "Grace period" },
  payment_failed: { icon: CreditCard, label: "Payment failed" },
  inactive_hotel: { icon: MoonStar, label: "Inactive hotel" },
};

export function AlertsFeedSkeleton() {
  return <Skeleton className="h-64 rounded-xl" />;
}

/**
 * M1 — Alerts feed with real alert variety (subscription expiry/grace,
 * failed payments, trials ending, inactivity), deep links to the business,
 * and dismiss/mark-read persisted per admin.
 *
 * `api`/`derived` are kept as optional props for backward compatibility;
 * the feed now builds from the shared useHqAlerts pipeline.
 */
export default function AlertsFeed({
  api: _api,
  derived: _derived,
}: {
  api?: HqOverview | null;
  derived?: DerivedOverview;
} = {}) {
  void _api;
  void _derived;
  const { alerts, dismiss, markAllRead } = useHqAlerts();

  return (
    <Card className="dark:bg-[#151a22] dark:border-white/10">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base sm:text-lg">Alerts</CardTitle>
        <div className="flex items-center gap-2">
          {alerts.length > 0 && (
            <button
              onClick={markAllRead}
              className="flex items-center gap-1 text-xs font-medium text-[#FF6F00] hover:underline"
              title="Dismiss all alerts"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Mark all read</span>
            </button>
          )}
          <Badge variant="outline">{alerts.length}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            All clear — no alerts right now.
          </p>
        ) : (
          <ul className="max-h-80 space-y-3 overflow-y-auto pr-1">
            {alerts.map((a) => {
              const sev = SEVERITY_META[a.severity] ?? SEVERITY_META.info;
              const typeMeta = TYPE_META[a.type] ?? { icon: Info, label: a.type };
              const SevIcon = sev.icon;
              const TypeIcon = typeMeta.icon;
              return (
                <li
                  key={a.key}
                  className="group flex items-start gap-3 rounded-lg border p-3 dark:border-white/10"
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
                      href={a.deepLink}
                      className="mt-1 block truncate text-sm font-semibold hover:text-[#FF6F00] hover:underline"
                      title={`Open ${a.hotelName}`}
                    >
                      {a.hotelName}
                    </Link>
                    <p className="text-xs text-muted-foreground">{a.message}</p>
                  </div>
                  <button
                    onClick={() => dismiss(a.key)}
                    className="rounded p-1 text-gray-400 opacity-0 transition-opacity hover:bg-gray-200 hover:text-gray-600 group-hover:opacity-100 focus:opacity-100"
                    aria-label={`Dismiss alert for ${a.hotelName}`}
                    title="Dismiss"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
