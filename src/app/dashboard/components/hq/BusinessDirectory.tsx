"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowDown, ArrowUp, ArrowUpDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useBusiness } from "@/context/businessContext";
import type { BusinessDTO } from "@/types/business";
import type { HotelHealth } from "@/app/actions/hq-overview";

const HEALTH_META: Record<
  string,
  { label: string; className: string; dot: string }
> = {
  healthy: {
    label: "Healthy",
    className:
      "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-800",
    dot: "bg-emerald-500",
  },
  warning: {
    label: "Warning",
    className:
      "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-800",
    dot: "bg-amber-500",
  },
  critical: {
    label: "Critical",
    className:
      "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/40 dark:text-red-300 dark:border-red-800",
    dot: "bg-red-500",
  },
  unknown: {
    label: "Unknown",
    className:
      "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700",
    dot: "bg-gray-400",
  },
};

function HealthBadge({ status, score }: { status: string; score: number | null }) {
  const meta = HEALTH_META[status] ?? HEALTH_META.unknown;
  return (
    <Badge variant="outline" className={cn("whitespace-nowrap", meta.className)}>
      <span className={cn("mr-1.5 h-2 w-2 rounded-full", meta.dot)} />
      {meta.label}
      {score !== null && score !== undefined && (
        <span className="ml-1 font-bold">{score}</span>
      )}
    </Badge>
  );
}

function SubStatusBadge({ status }: { status: string }) {
  const s = status.toLowerCase();
  const cls = s.includes("active")
    ? "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-800"
    : s.includes("trial")
      ? "bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-900/40 dark:text-sky-300 dark:border-sky-800"
      : s.includes("grace")
        ? "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-800"
        : s.includes("expir") || s.includes("cancel")
          ? "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/40 dark:text-red-300 dark:border-red-800"
          : "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700";
  return (
    <Badge variant="outline" className={cn("whitespace-nowrap text-[11px]", cls)}>
      {status}
    </Badge>
  );
}

export function BusinessDirectorySkeleton() {
  return <Skeleton className="h-96 rounded-xl" />;
}

/* ── M3: client-side column sorting ────────────────────────────────────── */

type SortKey =
  | "hotelName"
  | "healthStatus"
  | "planName"
  | "mrr"
  | "subStatus"
  | "users"
  | "openTickets";

type Dir = 1 | -1;

const HEALTH_RANK = (s: string) =>
  s === "critical" ? 0 : s === "warning" ? 1 : s === "unknown" ? 2 : 3;

const SUB_RANK = (s: string) =>
  s.includes("expir") || s.includes("cancel")
    ? 0
    : s.includes("trial") || s.includes("grace")
      ? 1
      : s.includes("active")
        ? 2
        : 3;

function SortHeader({
  label,
  sortKey,
  activeKey,
  dir,
  onSort,
  className,
}: {
  label: string;
  sortKey: SortKey;
  activeKey: SortKey;
  dir: Dir;
  onSort: (k: SortKey) => void;
  className?: string;
}) {
  const active = activeKey === sortKey;
  const Icon = active ? (dir === 1 ? ArrowUp : ArrowDown) : ArrowUpDown;
  return (
    <TableHead className={className}>
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className={cn(
          "inline-flex items-center gap-1 font-medium hover:text-foreground",
          active ? "text-foreground" : "text-muted-foreground",
          className?.includes("text-right") && "flex-row-reverse",
        )}
        aria-label={`Sort by ${label} ${active ? (dir === 1 ? "descending" : "ascending") : ""}`}
        aria-sort={active ? (dir === 1 ? "ascending" : "descending") : undefined}
      >
        {label}
        <Icon className={cn("h-3.5 w-3.5", !active && "opacity-40")} />
      </button>
    </TableHead>
  );
}

export default function BusinessDirectory({
  health,
  hotels,
}: {
  health: HotelHealth[] | null;
  hotels: BusinessDTO[];
}) {
  const router = useRouter();
  const { setBusiness } = useBusiness();
  const [search, setSearch] = useState("");
  // Default keeps the previous critical-first ordering.
  const [sortKey, setSortKey] = useState<SortKey>("healthStatus");
  const [sortDir, setSortDir] = useState<Dir>(1);

  const onSort = (k: SortKey) => {
    if (k === sortKey) {
      setSortDir((d) => (d === 1 ? -1 : 1));
    } else {
      setSortKey(k);
      setSortDir(1);
    }
  };

  const rows = useMemo(() => {
    const healthById = new Map<string, HotelHealth>();
    (health ?? []).forEach((h) => healthById.set(String(h.hotelId), h));

    const all: {
      key: string;
      hotelId: string | number;
      hotelName: string;
      healthStatus: string;
      healthScore: number | null;
      planName: string;
      mrr: number | null;
      subStatus: string;
      users: number | null;
      openTickets: number | null;
      updated: string | null;
      dto: BusinessDTO | null;
    }[] = hotels.map((h) => {
      const hh = healthById.get(String(h.id));
      // subscription may be null on health items — stay null-safe
      const sub = hh?.subscription ?? null;
      const st = (
        sub?.status ||
        h.subscription?.status ||
        "unknown"
      ).toLowerCase();
      return {
        key: `h-${h.id}`,
        hotelId: h.id,
        hotelName: h.name,
        healthStatus: hh?.healthStatus ?? "unknown",
        healthScore: hh?.healthScore ?? null,
        planName: sub?.planName ?? "—",
        mrr: sub && sub.mrr ? sub.mrr : null,
        subStatus: st,
        users: hh?.users?.staffCount ?? null,
        openTickets: hh?.tickets?.open ?? null,
        updated: null,
        dto: h,
      };
    });

    // Health-only rows for hotels not in the directory list (shouldn't normally happen)
    (health ?? []).forEach((hh) => {
      if (!all.some((r) => String(r.hotelId) === String(hh.hotelId))) {
        const sub = hh.subscription ?? null;
        all.push({
          key: `hh-${hh.hotelId}`,
          hotelId: hh.hotelId,
          hotelName: hh.hotelName,
          healthStatus: hh.healthStatus,
          healthScore: hh.healthScore,
          planName: sub?.planName ?? "—",
          mrr: sub && sub.mrr ? sub.mrr : null,
          subStatus: (sub?.status ?? "unknown").toLowerCase(),
          users: hh.users?.staffCount ?? null,
          openTickets: hh.tickets?.open ?? null,
          updated: null,
          dto: null,
        });
      }
    });

    const q = search.trim().toLowerCase();
    const filtered = q
      ? all.filter((r) => r.hotelName.toLowerCase().includes(q))
      : all;

    const nullsLast = (v: number | null) => (v === null ? Infinity : v);
    const comparators: Record<SortKey, (a: (typeof all)[number], b: (typeof all)[number]) => number> = {
      hotelName: (a, b) => a.hotelName.localeCompare(b.hotelName),
      healthStatus: (a, b) => HEALTH_RANK(a.healthStatus) - HEALTH_RANK(b.healthStatus),
      planName: (a, b) =>
        (a.planName === "—" ? "" : a.planName).localeCompare(
          b.planName === "—" ? "" : b.planName,
        ),
      mrr: (a, b) => nullsLast(a.mrr) - nullsLast(b.mrr),
      subStatus: (a, b) => SUB_RANK(a.subStatus) - SUB_RANK(b.subStatus),
      users: (a, b) => nullsLast(a.users) - nullsLast(b.users),
      openTickets: (a, b) => nullsLast(a.openTickets) - nullsLast(b.openTickets),
    };
    const cmp = comparators[sortKey];
    return [...filtered].sort((a, b) => sortDir * cmp(a, b));
  }, [health, hotels, search, sortKey, sortDir]);

  const openBusiness = (hotelId: string | number, dto: BusinessDTO | null) => {
    if (dto) {
      setBusiness(dto);
      router.push("/dashboard/details");
    } else {
      router.push("/business-list");
    }
  };

  return (
    <Card className="dark:bg-[#151a22] dark:border-white/10">
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle className="text-base sm:text-lg">
          Business directory
          <span className="ml-2 text-sm font-normal text-muted-foreground">
            {rows.length} businesses
          </span>
        </CardTitle>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search businesses…"
            className="pl-9"
            aria-label="Search businesses"
          />
        </div>
      </CardHeader>
      <CardContent className="overflow-x-auto p-0 sm:p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <SortHeader label="Business" sortKey="hotelName" activeKey={sortKey} dir={sortDir} onSort={onSort} />
              <SortHeader label="Health" sortKey="healthStatus" activeKey={sortKey} dir={sortDir} onSort={onSort} />
              <SortHeader label="Plan" sortKey="planName" activeKey={sortKey} dir={sortDir} onSort={onSort} />
              <SortHeader label="MRR" sortKey="mrr" activeKey={sortKey} dir={sortDir} onSort={onSort} />
              <SortHeader label="Subscription" sortKey="subStatus" activeKey={sortKey} dir={sortDir} onSort={onSort} />
              <SortHeader label="Users" sortKey="users" activeKey={sortKey} dir={sortDir} onSort={onSort} className="text-right" />
              <SortHeader label="Open tickets" sortKey="openTickets" activeKey={sortKey} dir={sortDir} onSort={onSort} className="text-right" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center text-sm text-muted-foreground">
                  {search ? "No businesses match your search." : "No businesses found."}
                </TableCell>
              </TableRow>
            ) : (
              rows.map((r) => (
                <TableRow
                  key={r.key}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => openBusiness(r.hotelId, r.dto)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") openBusiness(r.hotelId, r.dto);
                  }}
                  tabIndex={0}
                  aria-label={`Open ${r.hotelName}`}
                >
                  <TableCell className="font-medium">{r.hotelName}</TableCell>
                  <TableCell>
                    <HealthBadge status={r.healthStatus} score={r.healthScore} />
                  </TableCell>
                  <TableCell className="text-sm">{r.planName}</TableCell>
                  <TableCell className="text-sm">
                    {r.mrr !== null ? `₦${Number(r.mrr).toLocaleString()}` : "—"}
                  </TableCell>
                  <TableCell>
                    <SubStatusBadge status={r.subStatus} />
                  </TableCell>
                  <TableCell className="text-right text-sm">
                    {r.users ?? "—"}
                  </TableCell>
                  <TableCell className="text-right text-sm">
                    {r.openTickets ?? "—"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
