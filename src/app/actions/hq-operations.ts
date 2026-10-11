/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { axiosGet, isRedirectError } from "../lib/api";

/* ── Types matching GET /super-admin/hotels/:hotelId/operations-overview ── */

export interface OperationsDayTrend {
  date: string;
  label: string;
  bookings: number;
  revenue: number;
  checkins: number;
}

export interface OperationsOverview {
  generatedAt: string;
  hotel: { id: number; name: string };
  bookings: { newLast7Days: number; total: number };
  checkInsToday: number;
  checkOutsToday: number;
  occupancy: { percent: number; occupiedRooms: number; totalRooms: number };
  soldOutToday: boolean;
  adrToday: number;
  revpar: number;
  weeklyTrend: OperationsDayTrend[];
  hasData: boolean;
}

export type OperationsResult =
  | { ok: true; data: OperationsOverview }
  | { ok: false; error: string };

/**
 * Real per-business operations aggregates for the HQ Operations view.
 * Returns { ok: false } when the backend endpoint is unavailable so the UI
 * can render an honest empty state instead of mock figures (M5).
 */
export async function getOperationsOverview(
  hotelId: number | string,
): Promise<OperationsResult> {
  try {
    const body = await axiosGet<any>(
      `/super-admin/hotels/${hotelId}/operations-overview`,
      { currentPath: "/dashboard" },
    );
    const data =
      body &&
      typeof body === "object" &&
      !Array.isArray(body) &&
      "success" in body &&
      "data" in body
        ? body.data
        : body;
    return { ok: true, data: data as OperationsOverview };
  } catch (error: unknown) {
    if (isRedirectError(error)) throw error;
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Request failed",
    };
  }
}
