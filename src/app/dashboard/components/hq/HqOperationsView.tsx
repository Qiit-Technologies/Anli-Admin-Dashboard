"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import HqShell from "../layout/hq-shell";
import { useBusinessDirectory } from "./useHqData";
import {
  getOperationsOverview,
  type OperationsOverview,
} from "@/app/actions/hq-operations";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CalendarPlus,
  BookOpenCheck,
  LogIn,
  LogOut,
  BedDouble,
  Wallet,
  TrendingUp,
  Flame,
} from "lucide-react";

const ngn = (v: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(v);

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="bg-white dark:bg-[#171a21] rounded-xl border border-gray-200 dark:border-gray-800 p-4 sm:p-5">
      <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
        <Icon className="h-4 w-4" />
        <p className="text-xs font-medium uppercase tracking-wide">{label}</p>
      </div>
      <p className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">
        {value}
      </p>
      {hint && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{hint}</p>
      )}
    </div>
  );
}

function WeeklyChart({ data }: { data: OperationsOverview["weeklyTrend"] }) {
  const max = Math.max(1, ...data.map((d) => d.bookings));
  return (
    <div className="bg-white dark:bg-[#171a21] rounded-xl border border-gray-200 dark:border-gray-800 p-4 sm:p-5">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
        Last 7 days
      </h3>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
        New reservations per day · revenue in ₦
      </p>
      <div className="flex items-end gap-2 sm:gap-3 h-40">
        {data.map((d) => (
          <div
            key={d.date}
            className="flex-1 flex flex-col items-center justify-end gap-1 h-full"
            title={`${d.date}: ${d.bookings} bookings · ${ngn(d.revenue)} revenue · ${d.checkins} check-ins`}
          >
            <span className="text-[10px] sm:text-xs font-medium text-gray-700 dark:text-gray-300">
              {d.bookings > 0 ? d.bookings : ""}
            </span>
            <div
              className="w-full max-w-10 rounded-t-md bg-[#007BFF]/80"
              style={{ height: `${Math.max(4, (d.bookings / max) * 100)}%` }}
            />
            <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
              {d.label}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-4 grid grid-cols-7 gap-2 sm:gap-3">
        {data.map((d) => (
          <div
            key={d.date}
            className="text-center text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 truncate"
          >
            {d.revenue > 0 ? ngn(d.revenue) : "—"}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * HQ Operations view (M5). Shows REAL per-business operations aggregates from
 * GET /super-admin/hotels/:hotelId/operations-overview. When the data is not
 * available it says so honestly — it never renders mock figures and never
 * shows $ amounts on this ₦ platform.
 */
export default function HqOperationsView() {
  const directory = useBusinessDirectory();
  const businesses = directory.data ?? [];
  const [hotelId, setHotelId] = useState<number | null>(null);

  useEffect(() => {
    if (hotelId === null && businesses.length > 0) {
      setHotelId(businesses[0].id);
    }
  }, [businesses, hotelId]);

  const { data, error, isLoading, mutate } = useSWR(
    hotelId !== null ? ["hq-operations-overview", hotelId] : null,
    () => getOperationsOverview(hotelId as number),
    { revalidateOnFocus: false },
  );

  const overview =
    data && data.ok ? (data.data as OperationsOverview) : null;
  const loadError =
    (data && !data.ok ? data.error : null) ?? (error ? "Request failed" : null);

  return (
    <HqShell title="Operations">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Live front-office figures for the selected business.
        </p>
        <div className="w-full sm:w-72">
          <Select
            value={hotelId !== null ? String(hotelId) : ""}
            onValueChange={(v) => setHotelId(Number(v))}
            disabled={directory.isLoading || businesses.length === 0}
          >
            <SelectTrigger aria-label="Select business">
              <SelectValue placeholder="Select a business" />
            </SelectTrigger>
            <SelectContent>
              {businesses.map((b) => (
                <SelectItem key={b.id} value={String(b.id)}>
                  {b.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {directory.isLoading || isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      ) : businesses.length === 0 ? (
        <div className="bg-white dark:bg-[#171a21] rounded-xl border border-dashed border-gray-300 dark:border-gray-700 p-10 text-center">
          <p className="font-medium text-gray-900 dark:text-white">
            No businesses found
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Operations figures appear here once a business is onboarded.
          </p>
        </div>
      ) : loadError || !overview ? (
        <div className="bg-white dark:bg-[#171a21] rounded-xl border border-dashed border-gray-300 dark:border-gray-700 p-10 text-center">
          <p className="font-medium text-gray-900 dark:text-white">
            Operations data unavailable
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {loadError ??
              "Could not load operations figures for this business."}{" "}
            Figures are shown only when live data exists — no estimates.
          </p>
          <button
            onClick={() => mutate()}
            className="mt-4 px-4 py-2 text-sm font-medium rounded-lg bg-[#007BFF] text-white hover:bg-[#0069d9]"
          >
            Retry
          </button>
        </div>
      ) : !overview.hasData ? (
        <div className="bg-white dark:bg-[#171a21] rounded-xl border border-dashed border-gray-300 dark:border-gray-700 p-10 text-center">
          <p className="font-medium text-gray-900 dark:text-white">
            No operations data yet for {overview.hotel.name}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            This business has no rooms, reservations or stays recorded yet.
            Figures will appear here automatically once it starts operating.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <StatCard
              icon={CalendarPlus}
              label="New bookings (7d)"
              value={String(overview.bookings.newLast7Days)}
              hint="Reservations created in the last 7 days"
            />
            <StatCard
              icon={BookOpenCheck}
              label="Total bookings"
              value={String(overview.bookings.total)}
              hint="All reservations on record"
            />
            <StatCard
              icon={LogIn}
              label="Check-ins today"
              value={String(overview.checkInsToday)}
            />
            <StatCard
              icon={LogOut}
              label="Check-outs today"
              value={String(overview.checkOutsToday)}
            />
            <StatCard
              icon={BedDouble}
              label="Occupancy today"
              value={
                overview.occupancy.totalRooms > 0
                  ? `${overview.occupancy.percent}%`
                  : "—"
              }
              hint={
                overview.occupancy.totalRooms > 0
                  ? `${overview.occupancy.occupiedRooms} of ${overview.occupancy.totalRooms} rooms occupied`
                  : "No rooms configured"
              }
            />
            <StatCard
              icon={Flame}
              label="Sold out today"
              value={overview.soldOutToday ? "Yes" : "No"}
              hint={
                overview.occupancy.totalRooms > 0
                  ? "100% of rooms occupied"
                  : "No rooms configured"
              }
            />
            <StatCard
              icon={Wallet}
              label="ADR today"
              value={ngn(overview.adrToday)}
              hint="Average daily rate"
            />
            <StatCard
              icon={TrendingUp}
              label="RevPAR"
              value={ngn(overview.revpar)}
              hint="Revenue per available room"
            />
          </div>
          <WeeklyChart data={overview.weeklyTrend} />
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Updated {new Date(overview.generatedAt).toLocaleString("en-NG")} ·
            All amounts in Nigerian naira (₦).
          </p>
        </>
      )}
    </HqShell>
  );
}
