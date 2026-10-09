"use client";

import { useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { HqOverview, BillingMetrics } from "@/app/actions/hq-overview";
import type { DerivedOverview } from "./useHqData";

const DONUT_COLORS = ["#16a34a", "#0ea5e9", "#f59e0b", "#ef4444", "#6b7280"];

export function HqChartsSkeleton() {
  return (
    <div className="grid gap-3 sm:gap-4 lg:grid-cols-2">
      <Skeleton className="h-72 rounded-xl" />
      <Skeleton className="h-72 rounded-xl" />
    </div>
  );
}

export default function HqCharts({
  api,
  derived,
  billing,
}: {
  api: HqOverview | null;
  derived: DerivedOverview;
  billing: BillingMetrics | null;
}) {
  const donutData = useMemo(() => {
    const s = api?.subscriptions;
    const rows = [
      { name: "Active", value: s?.active ?? 0 },
      { name: "Trial", value: s?.free_trial ?? derived.trialHotels },
      { name: "Grace period", value: s?.grace_period ?? derived.gracePeriodHotels },
      { name: "Expired", value: s?.expired ?? derived.expiredHotels },
      { name: "Cancelled", value: s?.cancelled ?? derived.cancelledHotels },
    ];
    return rows.filter((r) => r.value > 0);
  }, [api, derived]);

  const planData = useMemo(
    () =>
      (billing?.byPlan ?? []).map((p) => ({
        name: p.planName,
        mrr: p.mrr,
        hotels: p.hotelCount,
      })),
    [billing],
  );

  return (
    <div className="grid gap-3 sm:gap-4 lg:grid-cols-2">
      <Card className="dark:bg-[#151a22] dark:border-white/10">
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">
            Subscriptions by status
          </CardTitle>
        </CardHeader>
        <CardContent className="h-64">
          {donutData.length === 0 ? (
            <p className="flex h-full items-center justify-center text-sm text-muted-foreground">
              No subscription data yet
            </p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={donutData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={3}
                >
                  {donutData.map((_, i) => (
                    <Cell
                      key={i}
                      fill={DONUT_COLORS[i % DONUT_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card className="dark:bg-[#151a22] dark:border-white/10">
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">MRR by plan</CardTitle>
        </CardHeader>
        <CardContent className="h-64">
          {planData.length === 0 ? (
            <p className="flex h-full items-center justify-center text-sm text-muted-foreground">
              Plan revenue breakdown unavailable — connect the billing metrics API
            </p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={planData} margin={{ left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  formatter={(v: any) => [
                    "₦" + Number(v ?? 0).toLocaleString(),
                    "MRR",
                  ]}
                />
                <Bar dataKey="mrr" fill="#FF6F00" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
