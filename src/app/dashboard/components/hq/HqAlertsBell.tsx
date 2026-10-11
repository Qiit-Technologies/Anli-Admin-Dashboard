"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Bell,
  CheckCheck,
  Clock,
  CreditCard,
  Info,
  MoonStar,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useHqAlerts } from "./useHqAlerts";

const SEVERITY_DOT: Record<string, string> = {
  critical: "bg-red-500",
  warning: "bg-amber-500",
  info: "bg-sky-500",
};

const TYPE_META: Record<string, { icon: React.ElementType; label: string }> = {
  trial_expiring: { icon: Clock, label: "Trial expiring" },
  subscription_expiring: { icon: Clock, label: "Subscription expiring" },
  subscription_expired: { icon: AlertTriangle, label: "Subscription expired" },
  grace_period: { icon: MoonStar, label: "Grace period" },
  payment_failed: { icon: CreditCard, label: "Payment failed" },
  inactive_hotel: { icon: MoonStar, label: "Inactive hotel" },
};

/**
 * M1 — HQ notifications bell. Opens a dropdown panel listing the same
 * actionable alerts as the Alerts feed, with an unread badge (visible,
 * non-dismissed count). Each alert deep-links to /businesses/:id.
 */
export default function HqAlertsBell() {
  const { alerts, unread, dismiss, markAllRead } = useHqAlerts();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open ]);

  return (
    <div ref={rootRef} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="p-2 hover:bg-gray-100 rounded-md transition-colors relative"
        aria-label={unread > 0 ? `${unread} unread alerts` : "Notifications"}
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        <Bell size={20} className="text-gray-500" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-semibold text-white">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="HQ alerts"
          className="absolute right-0 top-full z-50 mt-2 w-[22rem] max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border bg-white shadow-xl dark:bg-[#151a22] dark:border-white/10"
        >
          <div className="flex items-center justify-between border-b px-4 py-3 dark:border-white/10">
            <p className="text-sm font-semibold">
              Alerts{" "}
              {unread > 0 && (
                <span className="ml-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700 dark:bg-red-900/40 dark:text-red-300">
                  {unread}
                </span>
              )}
            </p>
            {unread > 0 && (
              <button
                onClick={markAllRead}
                className="flex items-center gap-1 text-xs font-medium text-[#FF6F00] hover:underline"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {alerts.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-muted-foreground">
                All clear — no alerts right now.
              </p>
            ) : (
              <ul className="divide-y dark:divide-white/10">
                {alerts.slice(0, 20).map((a) => {
                  const typeMeta = TYPE_META[a.type] ?? {
                    icon: Info,
                    label: a.type,
                  };
                  const TypeIcon = typeMeta.icon;
                  return (
                    <li
                      key={a.key}
                      className="group flex items-start gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-white/5"
                    >
                      <span
                        className={cn(
                          "mt-1.5 h-2 w-2 shrink-0 rounded-full",
                          SEVERITY_DOT[a.severity] ?? SEVERITY_DOT.info,
                        )}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <TypeIcon className="h-3.5 w-3.5" />
                          {typeMeta.label}
                        </div>
                        <Link
                          href={a.deepLink}
                          onClick={() => setOpen(false)}
                          className="mt-0.5 block truncate text-sm font-semibold hover:text-[#FF6F00] hover:underline"
                        >
                          {a.hotelName}
                        </Link>
                        <p className="text-xs text-muted-foreground">
                          {a.message}
                        </p>
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
          </div>

          {alerts.length > 0 && (
            <div className="border-t px-4 py-2.5 text-center dark:border-white/10">
              <Link
                href="/dashboard"
                onClick={() => setOpen(false)}
                className="text-xs font-medium text-[#FF6F00] hover:underline"
              >
                View all alerts in the Command Center
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
