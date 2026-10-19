"use server";

import { axiosGet, isRedirectError } from "../lib/server-api";

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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isOperationsOverview(value: unknown): value is OperationsOverview {
  if (!isRecord(value)) return false;

  const hotel = value.hotel;
  const bookings = value.bookings;
  const occupancy = value.occupancy;
  const weeklyTrend = value.weeklyTrend;

  return (
    typeof value.generatedAt === "string" &&
    isRecord(hotel) &&
    isNumber(hotel.id) &&
    typeof hotel.name === "string" &&
    isRecord(bookings) &&
    isNumber(bookings.newLast7Days) &&
    isNumber(bookings.total) &&
    isNumber(value.checkInsToday) &&
    isNumber(value.checkOutsToday) &&
    isRecord(occupancy) &&
    isNumber(occupancy.percent) &&
    isNumber(occupancy.occupiedRooms) &&
    isNumber(occupancy.totalRooms) &&
    typeof value.soldOutToday === "boolean" &&
    isNumber(value.adrToday) &&
    isNumber(value.revpar) &&
    Array.isArray(weeklyTrend) &&
    weeklyTrend.every(
      (day) =>
        isRecord(day) &&
        typeof day.date === "string" &&
        typeof day.label === "string" &&
        isNumber(day.bookings) &&
        isNumber(day.revenue) &&
        isNumber(day.checkins),
    ) &&
    typeof value.hasData === "boolean"
  );
}

export async function getOperationsOverview(
  hotelId: number | string,
): Promise<OperationsResult> {
  try {
    const body = await axiosGet<unknown>(
      `/super-admin/hotels/${hotelId}/operations-overview`,
      { currentPath: "/dashboard" },
    );
    const data =
      isRecord(body) && "success" in body && "data" in body
        ? body.data
        : body;

    if (!isOperationsOverview(data)) {
      return {
        ok: false,
        error: "The operations endpoint returned an unexpected response.",
      };
    }

    return { ok: true, data };
  } catch (error: unknown) {
    if (isRedirectError(error)) throw error;
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Request failed",
    };
  }
}
