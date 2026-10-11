"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type {
  BillingMetrics,
  HqAlert,
  HqOverview,
} from "@/app/actions/hq-overview";
import type { BusinessDTO } from "@/types/business";
import {
  useHqOverview,
  useBillingMetrics,
  useBusinessDirectory,
  type DerivedOverview,
} from "./useHqData";

/**
 * M1 — shared HQ alert pipeline.
 *
 * Merges alert variety from data the backend already exposes:
 *   - backend /super-admin/overview alerts (e.g. inactive_hotel)
 *   - /super-admin/billing/metrics failedPayments  → payment_failed
 *   - /super-admin/billing/metrics expiringTrials  → trial_expiring
 *     (falls back to the derived trials when billing is unavailable)
 *   - business directory subscription status      → subscription_expired /
 *     grace_period / subscription_expiring
 *
 * Every alert deep-links to /businesses/:id (the Phase-2 deep-link route),
 * which establishes the business context and hands off to General Info.
 *
 * Dismissals are persisted per admin in localStorage (no backend endpoint
 * exists for alert state yet); the notifications bell counts the visible,
 * non-dismissed alerts as unread.
 */

export interface HqAlertItem extends HqAlert {
  key: string;
  deepLink: string;
}

const DISMISS_KEY = "hq-alert-dismissals/v1";

function readDismissals(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(DISMISS_KEY);
    if (!raw) return new Set();
    const arr: unknown = JSON.parse(raw);
    return new Set(Array.isArray(arr) ? arr.filter((x) => typeof x === "string") : []);
  } catch {
    return new Set();
  }
}

function normStatus(s?: string | null): string {
  return (s || "").toLowerCase().replace(/[\s-]+/g, "_");
}

function fmtNaira(n: number): string {
  return "₦" + Number(n).toLocaleString("en-NG", { maximumFractionDigits: 0 });
}

const SEVERITY_RANK: Record<string, number> = {
  critical: 0,
  warning: 1,
  info: 2,
};

const EMPTY_DERIVED: DerivedOverview = {
  hotels: 0,
  activeHotels: 0,
  trialHotels: 0,
  gracePeriodHotels: 0,
  expiredHotels: 0,
  cancelledHotels: 0,
  openTickets: 0,
  inProgressTickets: 0,
  expiringTrials: [],
  source: "derived",
};

function buildAlerts(
  api: HqOverview | null,
  derived: DerivedOverview,
  billing: BillingMetrics | null,
  hotels: BusinessDTO[],
): HqAlert[] {
  const out: HqAlert[] = [];
  const seen = new Set<string>();
  const push = (a: HqAlert) => {
    const k = `${a.type}:${a.hotelId}`;
    if (seen.has(k)) return;
    seen.add(k);
    out.push(a);
  };

  // 1. Backend-provided alerts (today: inactive_hotel; more types may arrive later)
  for (const a of api?.alerts ?? []) push(a);

  // 2. Failed payments — data the backend already exposes via billing metrics
  for (const fp of billing?.failedPayments ?? []) {
    push({
      type: "payment_failed",
      hotelId: fp.hotelId,
      hotelName: fp.hotelName,
      message: `Payment of ${fmtNaira(fp.amount)} failed${
        fp.reason ? ` — ${fp.reason}` : ""
      }${fp.date ? ` (${new Date(fp.date).toLocaleDateString()})` : ""}`,
      severity: "critical",
    });
  }

  // 3. Trials ending — billing metrics first, derived fallback
  const trials =
    billing?.expiringTrials && billing.expiringTrials.length > 0
      ? billing.expiringTrials
      : derived.expiringTrials;
  for (const t of trials) {
    push({
      type: "trial_expiring",
      hotelId: t.hotelId,
      hotelName: t.hotelName,
      message: `Trial ends ${
        t.endDate ? new Date(t.endDate).toLocaleDateString() : "soon"
      } (${t.daysLeft ?? "?"} days left)`,
      severity: (t.daysLeft ?? 99) <= 3 ? "critical" : "warning",
    });
  }

  // 4. Subscription expired / grace / expiring soon — from the business directory
  const now = Date.now();
  for (const h of hotels) {
    const st = normStatus(h.subscription?.status);
    const endMs = h.subscription?.endDate
      ? new Date(h.subscription.endDate).getTime()
      : NaN;
    const daysLeft = Number.isFinite(endMs)
      ? Math.ceil((endMs - now) / 86400000)
      : null;
    if (st.includes("expir") || h.subscription?.isExpired) {
      push({
        type: "subscription_expired",
        hotelId: h.id,
        hotelName: h.name,
        message: `Subscription expired${
          h.subscription?.endDate
            ? ` on ${new Date(h.subscription.endDate).toLocaleDateString()}`
            : ""
        }.`,
        severity: "critical",
      });
    } else if (st.includes("grace")) {
      push({
        type: "grace_period",
        hotelId: h.id,
        hotelName: h.name,
        message: `Subscription in grace period${
          daysLeft !== null ? ` — ${daysLeft} day${daysLeft === 1 ? "" : "s"} left` : ""
        }.`,
        severity: "warning",
      });
    } else if (
      daysLeft !== null &&
      daysLeft >= 0 &&
      daysLeft <= 14 &&
      !st.includes("trial")
    ) {
      push({
        type: "subscription_expiring",
        hotelId: h.id,
        hotelName: h.name,
        message: `Subscription ends in ${daysLeft} day${daysLeft === 1 ? "" : "s"}${
          h.subscription?.endDate
            ? ` (${new Date(h.subscription.endDate).toLocaleDateString()})`
            : ""
        }.`,
        severity: "warning",
      });
    }
  }

  // Critical first, then warning, then info
  out.sort(
    (a, b) => (SEVERITY_RANK[a.severity] ?? 2) - (SEVERITY_RANK[b.severity] ?? 2),
  );
  return out;
}

export function useHqAlerts() {
  const overview = useHqOverview();
  const billing = useBillingMetrics();
  const directory = useBusinessDirectory();

  // Read after mount so the first (SSR) render matches and hydration stays clean.
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  useEffect(() => {
    setDismissed(readDismissals());
  }, []);

  const persist = useCallback((next: Set<string>) => {
    try {
      window.localStorage.setItem(DISMISS_KEY, JSON.stringify([...next]));
    } catch {
      // storage full/blocked — dismissals just won't survive a reload
    }
  }, []);

  const dismiss = useCallback(
    (key: string) => {
      setDismissed((prev) => {
        const next = new Set(prev);
        next.add(key);
        persist(next);
        return next;
      });
    },
    [persist],
  );

  const alerts: HqAlertItem[] = useMemo(() => {
    const all = buildAlerts(
      overview.data?.api ?? null,
      overview.data?.derived ?? EMPTY_DERIVED,
      billing.data ?? null,
      directory.data ?? [],
    );
    return all
      .map((a) => ({
        ...a,
        key: `${a.type}:${a.hotelId}`,
        deepLink: `/businesses/${a.hotelId}`,
      }))
      .filter((a) => !dismissed.has(a.key));
  }, [overview.data, billing.data, directory.data, dismissed]);

  const markAllRead = useCallback(() => {
    setDismissed((prev) => {
      const next = new Set(prev);
      alerts.forEach((a) => next.add(a.key));
      persist(next);
      return next;
    });
  }, [alerts, persist]);

  return {
    alerts,
    /** Unread = visible, non-dismissed alerts (drives the bell badge). */
    unread: alerts.length,
    loading: overview.isLoading || directory.isLoading,
    dismiss,
    markAllRead,
  };
}
