/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { axiosGet, axiosPost, isRedirectError } from "../lib/server-api";
import { getAuthHeaders } from "../lib/auth";

/* ── Types matching the /super-admin/* HQ contract ─────────────────────── */

export interface HqAlert {
  type: string;
  hotelId: string | number;
  hotelName: string;
  message: string;
  severity: "info" | "warning" | "critical";
}

export interface HqOverview {
  totals: {
    hotels: number;
    activeHotels: number;
    trialHotels: number;
    gracePeriodHotels: number;
    expiredHotels: number;
    cancelledHotels: number;
  };
  mrr: number;
  arr: number;
  /** Pipeline MRR from active trials */
  trialMrr?: number;
  subscriptions: {
    active: number;
    free_trial: number;
    grace_period: number;
    expired: number;
    cancelled: number;
  };
  tickets: { open: number; in_progress: number };
  staffUsers: number;
  ownerUsers: number;
  paymentsThisMonth: { count: number; total: number };
  alerts: HqAlert[];
}

export interface HotelHealth {
  hotelId: string | number;
  hotelName: string;
  isActive: boolean;
  /** May be null for hotels without subscription data */
  subscription: {
    status: string;
    planName: string;
    mrr: number;
    billingCycle: string;
    endDate: string | null;
    daysToExpiry: number | null;
  } | null;
  users: { staffCount: number | null };
  tickets: { open: number | null };
  activity: { activeModules: number | null; lowActivityModules: number | null };
  healthScore: number | null;
  healthStatus:
    | "healthy"
    | "at_risk"
    | "warning"
    | "critical"
    | "inactive"
    | "unknown";
}

/**
 * One row of GET /super-admin/businesses/overview — the single payload that
 * wires the HQ business directory (H7). Health follows the single documented
 * definition (docs in the Oreon repo: docs/business-health.md).
 */
export interface BusinessOverviewRow {
  hotelId: number;
  hotelName: string;
  isActive: boolean;
  /** Null when the business has no subscription record. */
  subscription: {
    /** Effective status (self-healed against the renewal date) — never contradicts endDate. */
    status: string;
    planName: string | null;
    /** Canonical tier id ('flex' | 'basic-hotel' | 'basic-restaurant' | 'advanced' | 'custom') or null. */
    planTier: string | null;
    /** Monthly MRR contribution (0 unless the effective status is active). */
    mrr: number;
    billingCycle: string;
    endDate: string | null;
  } | null;
  /** Staff count for the business. */
  users: number;
  /** Tickets with status open or in_progress. */
  openTickets: number;
  urgentTickets: number;
  healthScore: number;
  healthStatus: "healthy" | "at_risk" | "critical" | "inactive";
}

export interface BillingMetrics {
  mrr: number;
  arr: number;
  /** Pipeline MRR from active trials */
  trialMrr?: number;
  byPlan: { planName: string; hotelCount: number; mrr: number }[];
  expiringTrials: {
    hotelId: string | number;
    hotelName: string;
    endDate: string | null;
    daysLeft: number | null;
  }[];
  failedPayments: {
    hotelId: string | number;
    hotelName: string;
    amount: number;
    date: string;
    reason: string;
  }[];
  recentPayments: {
    hotelId: string | number;
    hotelName: string;
    amount: number;
    date: string;
    status: string;
    reference: string;
  }[];
}

export type HqResult<T> = { ok: true; data: T } | { ok: false; error: string };

async function safeGet<T>(url: string): Promise<HqResult<T>> {
  try {
    const body = await axiosGet<any>(url, {
      config: { headers: await getAuthHeaders() },
      currentPath: "/dashboard",
    });
    // New HQ endpoints wrap payloads in { success, data, message } (backend PR #557).
    // Unwrap defensively so both wrapped and unwrapped shapes work.
    const data =
      body &&
      typeof body === "object" &&
      !Array.isArray(body) &&
      "success" in body &&
      "data" in body
        ? body.data
        : body;
    return { ok: true, data: data as T };
  } catch (error: unknown) {
    if (isRedirectError(error)) throw error;
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Request failed",
    };
  }
}

/** Cross-business HQ overview. May not exist yet on the backend — callers must handle {ok:false}. */
export async function getHqOverview(): Promise<HqResult<HqOverview>> {
  return safeGet<HqOverview>("/super-admin/overview");
}

/** Per-hotel health rows. May not exist yet on the backend — callers must handle {ok:false}. */
export async function getHotelHealth(): Promise<HqResult<HotelHealth[]>> {
  return safeGet<HotelHealth[]>("/super-admin/hotels/health");
}

/** Per-business aggregation for the HQ directory. Callers must handle {ok:false}. */
export async function getBusinessesOverview(): Promise<
  HqResult<BusinessOverviewRow[]>
> {
  return safeGet<BusinessOverviewRow[]>("/super-admin/businesses/overview");
}

/** Billing command metrics. May not exist yet on the backend — callers must handle {ok:false}. */
export async function getBillingMetrics(): Promise<HqResult<BillingMetrics>> {
  return safeGet<BillingMetrics>("/super-admin/billing/metrics");
}

/** Reset an owner-level user's password. */
export async function resetOwnerPassword(
  userId: string | number,
  password: string,
): Promise<HqResult<{ ok: boolean }>> {
  try {
    const body = await axiosPost<any>(
      `/super-admin/users/${userId}/reset-password`,
      { password },
      {
        config: { headers: await getAuthHeaders() },
        currentPath: "/dashboard/users",
      },
    );
    // Unwrap { success, data, message } like the other HQ endpoints
    const data =
      body &&
      typeof body === "object" &&
      !Array.isArray(body) &&
      "success" in body &&
      "data" in body
        ? body.data
        : body;
    return { ok: true, data: data as { ok: boolean } };
  } catch (error: unknown) {
    if (isRedirectError(error)) throw error;
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Password reset failed",
    };
  }
}
