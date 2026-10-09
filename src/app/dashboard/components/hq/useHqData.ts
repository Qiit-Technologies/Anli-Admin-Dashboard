"use client";

import useSWR from "swr";
import {
  getHqOverview,
  getHotelHealth,
  getBillingMetrics,
  type HqOverview,
  type HotelHealth,
  type BillingMetrics,
} from "@/app/actions/hq-overview";
import getBusinessList from "@/app/actions/business";
import {
  getSupportTickets,
} from "@/app/actions/super-admin-support";
import type { BusinessDTO } from "@/types/business";

/* ── Fallback derivation when the new /super-admin HQ endpoints don't exist yet ── */

function normStatus(s?: string | null): string {
  return (s || "").toLowerCase().replace(/[\s-]+/g, "_");
}

export interface DerivedOverview {
  hotels: number;
  activeHotels: number;
  trialHotels: number;
  gracePeriodHotels: number;
  expiredHotels: number;
  cancelledHotels: number;
  openTickets: number;
  inProgressTickets: number;
  expiringTrials: { hotelId: number; hotelName: string; endDate: string | null; daysLeft: number | null }[];
  source: "api" | "derived";
}

async function deriveOverview(): Promise<DerivedOverview> {
  const [bizRes, openRes, progRes] = await Promise.all([
    getBusinessList({ page: 1, limit: 100 }),
    getSupportTickets({ status: "open", page: 1, limit: 1 }).catch(() => null),
    getSupportTickets({ status: "in_progress", page: 1, limit: 1 }).catch(() => null),
  ]);

  const hotels: BusinessDTO[] = (bizRes as any)?.data?.hotels ?? [];
  const counts = {
    hotels: hotels.length,
    activeHotels: 0,
    trialHotels: 0,
    gracePeriodHotels: 0,
    expiredHotels: 0,
    cancelledHotels: 0,
  };
  const expiringTrials: DerivedOverview["expiringTrials"] = [];
  const now = Date.now();

  for (const h of hotels) {
    if (h.isActive) counts.activeHotels += 1;
    const st = normStatus(h.subscription?.status);
    if (st.includes("trial")) counts.trialHotels += 1;
    else if (st.includes("grace")) counts.gracePeriodHotels += 1;
    else if (st.includes("expir")) counts.expiredHotels += 1;
    else if (st.includes("cancel")) counts.cancelledHotels += 1;

    if (st.includes("trial") && h.subscription?.endDate) {
      const daysLeft = Math.ceil(
        (new Date(h.subscription.endDate).getTime() - now) / 86400000,
      );
      if (daysLeft <= 7) {
        expiringTrials.push({
          hotelId: h.id,
          hotelName: h.name,
          endDate: h.subscription.endDate,
          daysLeft,
        });
      }
    }
  }
  expiringTrials.sort((a, b) => (a.daysLeft ?? 99) - (b.daysLeft ?? 99));

  return {
    ...counts,
    openTickets: (openRes as any)?.total ?? 0,
    inProgressTickets: (progRes as any)?.total ?? 0,
    expiringTrials,
    source: "derived",
  };
}

export function useHqOverview() {
  const { data, error, isLoading, mutate } = useSWR(
    "hq-overview",
    async (): Promise<{
      api: HqOverview | null;
      derived: DerivedOverview;
    }> => {
      const [apiRes, derived] = await Promise.all([
        getHqOverview().catch(() => ({ ok: false as const, error: "unavailable" })),
        deriveOverview().catch(() => ({
          hotels: 0, activeHotels: 0, trialHotels: 0, gracePeriodHotels: 0,
          expiredHotels: 0, cancelledHotels: 0, openTickets: 0, inProgressTickets: 0,
          expiringTrials: [], source: "derived" as const,
        })),
      ]);
      return {
        api: apiRes.ok ? apiRes.data : null,
        derived,
      };
    },
    { revalidateOnFocus: false },
  );
  return { data, error, isLoading, refresh: mutate };
}

export function useHotelHealth(fallbackHotels: BusinessDTO[]) {
  const { data, error, isLoading, mutate } = useSWR(
    "hq-hotel-health",
    async (): Promise<HotelHealth[]> => {
      const res = await getHotelHealth().catch(() => ({
        ok: false as const,
        error: "unavailable",
      }));
      if (res.ok && Array.isArray(res.data)) return res.data;
      // Fallback: map the business list into health-shaped rows
      return fallbackHotels.map((h) => {
        const st = normStatus(h.subscription?.status);
        const healthStatus: HotelHealth["healthStatus"] =
          !h.isActive || st.includes("expir") || st.includes("cancel")
            ? "critical"
            : st.includes("trial") || st.includes("grace")
              ? "warning"
              : "healthy";
        return {
          hotelId: h.id,
          hotelName: h.name,
          isActive: h.isActive,
          subscription: {
            status: h.subscription?.status || "unknown",
            planName: "—",
            mrr: 0,
            billingCycle: "—",
            endDate: h.subscription?.endDate ?? null,
            daysToExpiry: null,
          },
          users: { staffCount: null },
          tickets: { open: null },
          activity: { activeModules: null, lowActivityModules: null },
          healthScore: null,
          healthStatus,
        };
      });
    },
    { revalidateOnFocus: false },
  );
  return { data, error, isLoading, refresh: mutate };
}

export function useBillingMetrics() {
  const { data, error, isLoading, mutate } = useSWR(
    "hq-billing-metrics",
    async (): Promise<BillingMetrics | null> => {
      const res = await getBillingMetrics().catch(() => ({
        ok: false as const,
        error: "unavailable",
      }));
      return res.ok ? res.data : null;
    },
    { revalidateOnFocus: false },
  );
  return { data, error, isLoading, refresh: mutate };
}

export function useBusinessDirectory() {
  const { data, error, isLoading, mutate } = useSWR(
    "hq-business-directory",
    async (): Promise<BusinessDTO[]> => {
      const res = await getBusinessList({ page: 1, limit: 100 });
      return (res as any)?.data?.hotels ?? [];
    },
    { revalidateOnFocus: false },
  );
  return { data, error, isLoading, refresh: mutate };
}
