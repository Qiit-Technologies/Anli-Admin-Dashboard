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
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useBusiness } from "@/context/businessContext";
import type { BusinessDTO } from "@/types/business";
import type { BusinessOverviewRow } from "@/app/actions/hq-overview";

/** Canonical tier id -> display name (mirrors the plan catalog). */
const TIER_LABELS: Record<string, string> = {
  flex: "Flex",
  "basic-hotel": "Basic (Hotel)",
  "basic-restaurant": "Basic (Restaurant)",
  advanced: "Advanced",
  custom: "Custom",
};

/* Health vocabulary matches the single documented backend definition
   (Oreon docs/business-health.md): healthy | at_risk | critical | inactive. */
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
  at_risk: {
    label: "At Risk",
    className:
      "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-800",
    dot: "bg-amber-500",
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
  inactive: {
    label: "Inactive",
    className:
      "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700",
    dot: "bg-gray-400",
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
  const cls = s.includes("active") && !s.includes("inactive")
    ? "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-800"
    : s.includes("trial")
      ? "bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-900/40 dark:text-sky-300 dark:border-sky-800"
      : s.includes("grace")
        ? "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-800"
        : s.includes("expir") || s.includes("cancel")
          ? "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/40 dark:text-red-300 dark:border-red-800"
          : "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700";
  const label = s === "no_subscription" ? "No subscription" : status;
  return (
    <Badge variant="outline" className={cn("whitespace-nowrap text-[11px]", cls)}>
      {label}
    </Badge>
  );
}

export function BusinessDirectorySkeleton() {
  return <Skeleton className="h-96 rounded-xl" />;
}

export default function BusinessDirectory({
  overview,
  hotels,
}: {
  /** Single-payload rows from GET /super-admin/businesses/overview (H7). */
  overview: BusinessOverviewRow[] | null;
  /** Business list, used only to resolve the click-through DTO. */
  hotels: BusinessDTO[];
}) {
  const router = useRouter();
  const { setBusiness } = useBusiness();
  const [search, setSearch] = useState("");

  const rows = useMemo(() => {
    const dtoById = new Map<string, BusinessDTO>();
    hotels.forEach((h) => dtoById.set(String(h.id), h));

    const all = (overview ?? []).map((o) => ({
      key: `h-${o.hotelId}`,
      hotelId: o.hotelId,
      hotelName: o.hotelName,
      healthStatus: o.healthStatus,
      healthScore: o.healthScore,
      planName: o.subscription?.planName ?? "—",
      // H6: display the canonical tier so the directory agrees with the
      // plan page (which labels from the subscription's plan_tier).
      planTier: o.subscription?.planTier ?? null,
      mrr: o.subscription?.mrr ?? null,
      subStatus: o.subscription?.status ?? "no_subscription",
      users: o.users,
      openTickets: o.openTickets,
      dto: dtoById.get(String(o.hotelId)) ?? null,
    }));

    const q = search.trim().toLowerCase();
    const filtered = q
      ? all.filter((r) => r.hotelName.toLowerCase().includes(q))
      : all;
    // Critical first, then at-risk, then inactive, then the rest
    const rank = (s: string) =>
      s === "critical" ? 0 : s === "at_risk" || s === "warning" ? 1 : s === "inactive" ? 2 : 3;
    return filtered.sort((a, b) => rank(a.healthStatus) - rank(b.healthStatus));
  }, [overview, hotels, search]);

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
              <TableHead>Business</TableHead>
              <TableHead>Health</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>MRR</TableHead>
              <TableHead>Subscription</TableHead>
              <TableHead className="text-right">Users</TableHead>
              <TableHead className="text-right">Open tickets</TableHead>
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
                  <TableCell className="text-sm">
                    {r.planTier && TIER_LABELS[r.planTier]
                      ? TIER_LABELS[r.planTier]
                      : r.planName}
                  </TableCell>
                  <TableCell className="text-sm">
                    {r.mrr !== null ? `₦${Number(r.mrr).toLocaleString()}` : "—"}
                  </TableCell>
                  <TableCell>
                    <SubStatusBadge status={r.subStatus} />
                  </TableCell>
                  <TableCell className="text-right text-sm">
                    {r.users}
                  </TableCell>
                  <TableCell className="text-right text-sm">
                    {r.openTickets}
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
