/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { axiosGet, isRedirectError } from "../lib/server-api";

/* ── Types matching the /super-admin/reports/* HQ contract ─────────────── */

export interface MrrMovementRow {
  /** YYYY-MM */
  month: string;
  mrr: number;
  trialMrr: number;
  newMrr: number;
  churnedMrr: number;
  netMovement: number;
  activeSubscriptions: number;
}

export interface TrialConversionRow {
  /** YYYY-MM cohort by subscription start date */
  month: string;
  trialsStarted: number;
  converted: number;
  stillInTrial: number;
  /** converted / trialsStarted, null when no trials started */
  conversionRate: number | null;
}

export interface SupportSla {
  periodDays: number;
  totalTickets: number;
  respondedTickets: number;
  resolvedTickets: number;
  respondedRate: number | null;
  resolvedRate: number | null;
  /** mean hours from creation to first super-admin reply */
  avgFirstResponseHours: number | null;
  /** mean hours from creation to resolved/closed */
  avgResolutionHours: number | null;
  byPriority: {
    priority: string;
    tickets: number;
    avgFirstResponseHours: number | null;
    avgResolutionHours: number | null;
  }[];
}

export type ReportResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

async function safeGet<T>(
  path: string,
  params?: Record<string, string | number>,
): Promise<ReportResult<T>> {
  try {
    const body = await axiosGet<any>(path, {
      params,
      currentPath: "/dashboard",
    });
    // HQ endpoints wrap payloads in { success, data, message }.
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

/** Monthly MRR movement, reconstructed from subscription records. */
export async function getMrrMovement(
  months = 12,
): Promise<ReportResult<MrrMovementRow[]>> {
  return safeGet<MrrMovementRow[]>("/super-admin/reports/mrr-movement", {
    months,
  });
}

/** Trial-to-paid conversion by subscription-start cohort. */
export async function getTrialConversion(
  months = 12,
): Promise<ReportResult<TrialConversionRow[]>> {
  return safeGet<TrialConversionRow[]>("/super-admin/reports/trial-conversion", {
    months,
  });
}

/** Support SLA from ticket/message timestamps. */
export async function getSupportSla(
  days = 90,
): Promise<ReportResult<SupportSla>> {
  return safeGet<SupportSla>("/super-admin/reports/support-sla", { days });
}
