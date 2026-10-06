"use client";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import useSWR from "swr";
import fetcher from "@/app/actions/fetcher";
import { useBusiness } from "@/context/businessContext";
import { GeneralModuleActivityResponse } from "@/app/actions/types";

const MODULE_COLORS: Record<string, string> = {
  front_office: "#2563eb",
  housekeeping: "#f59e0b",
  stock: "#10b981",
  membership: "#8b5cf6",
  restaurant: "#ef4444",
  account: "#06b6d4",
  employee: "#f97316",
  reservation: "#6366f1",
};

const MODULE_LABELS: Record<string, string> = {
  front_office: "Front Office",
  housekeeping: "Housekeeping",
  stock: "Stock",
  membership: "Membership",
  restaurant: "Restaurant",
  account: "Account",
  employee: "Employee",
  reservation: "Reservation",
};

const FALLBACK_COLORS = [
  "#ec4899",
  "#14b8a6",
  "#6366f1",
  "#84cc16",
  "#e11d48",
  "#0ea5e9",
];

export function GrowthActivityChart({ period }: { period: string }) {
  const { business, loading } = useBusiness();
  const { data: res, isLoading } = useSWR(
    business?.id
      ? `/super-admin/hotels/module-activity-chart/${business?.id}?period=${period}`
      : null,
    (url: string) => fetcher<GeneralModuleActivityResponse>(url)
  );

  if (loading || isLoading) {
    return (
      <div className="w-full min-h-[400px] flex flex-col items-center justify-center text-xl">
        Loading...
      </div>
    );
  }

  const chartData = res?.data?.moduleActivity;

  if (!chartData || chartData.length === 0) {
    return (
      <div className="w-full min-h-[400px] flex flex-col items-center justify-center text-gray-400">
        <p className="text-lg font-medium">No activity data available</p>
        <p className="text-sm mt-1">
          Activity will appear here once modules are used.
        </p>
      </div>
    );
  }

  const moduleKeys = Object.keys(chartData[0] || {}).filter(
    (key) => key !== "month" && key !== "date",
  );

  const dynamicChartConfig = moduleKeys.reduce<ChartConfig>((acc, key) => {
    acc[key] = {
      label: MODULE_LABELS[key] || key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      color: MODULE_COLORS[key] || FALLBACK_COLORS[moduleKeys.indexOf(key) % FALLBACK_COLORS.length],
    };
    return acc;
  }, {});

  const hasAnyActivity = moduleKeys.some((key) =>
    chartData.some((entry) => (entry[key] as number) > 0),
  );

  if (!hasAnyActivity) {
    return (
      <div className="w-full min-h-[400px] flex flex-col items-center justify-center text-gray-400">
        <p className="text-lg font-medium">No activity recorded yet</p>
        <p className="text-sm mt-1">
          Start using modules to see activity growth over time.
        </p>
      </div>
    );
  }

  return (
    <ChartContainer config={dynamicChartConfig} className="min-h-[400px] w-full">
      <LineChart accessibilityLayer data={chartData}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey={period === "year" ? "month" : "date"}
          tickLine={false}
          tickMargin={4}
          axisLine={false}
          angle={-45}
          textAnchor="end"
        />
        <YAxis />
        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent className="mt-7" />} />
        {moduleKeys.map((key) => (
          <Line
            key={key}
            dataKey={key}
            stroke={dynamicChartConfig[key]?.color}
            strokeWidth={2}
            dot={{
              fill: dynamicChartConfig[key]?.color,
            }}
            activeDot={{
              r: 6,
            }}
          />
        ))}
      </LineChart>
    </ChartContainer>
  );
}
