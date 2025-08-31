"use client";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from "recharts";
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

export function GrowthActivityChart({ period }: { period: string }) {
  const { business, loading } = useBusiness();
  const { data: res, isLoading } = useSWR(
    business?.id
      ? `/super-admin/hotels/module-activity-chart/${business?.id}?period=${period}`
      : null,
    (url: string) => fetcher<GeneralModuleActivityResponse>(url),
  );

  if (loading || isLoading) {
    return (
      <div className="w-full min-h-[400px] flex flex-col items-center justify-center text-xl ">
        Loading...
      </div>
    );
  }

  console.log(res);

  return (
    <ChartContainer config={chartConfig} className="min-h-[400px] w-full">
      <LineChart accessibilityLayer data={res?.data?.moduleActivity}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey={period === "year" ? "month" : "date"}
          tickLine={false}
          tickMargin={4}
          axisLine={false}
          // tickFormatter={(value) => value.slice(0, 3)}
          angle={-45}
          textAnchor="end"
        />
        <YAxis />
        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent className="mt-7" />} />
        {Object.keys(chartConfig).map((key) => (
          <Line
            key={key}
            dataKey={key}
            stroke={chartConfig[key as keyof typeof chartConfig].color}
            strokeWidth={2}
            dot={{
              fill: chartConfig[key as keyof typeof chartConfig].color,
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

const chartConfig = {
  front_office: {
    label: "Front Office",
    color: "#2563eb",
  },
  housekeeping: {
    label: "Housekeeping",
    color: "#60a5fa",
  },
  stock: {
    label: "Stock",
    color: "#16a34a",
  },
  membership: {
    label: "Membership",
    color: "#4ade80",
  },
  restaurant: {
    label: "Restaurant",
    color: "#4ade80",
  },
  account: {
    label: "Account",
    color: "#4ade80",
  },
  employee: {
    label: "Employee",
    color: "#4ade80",
  },
} satisfies ChartConfig;
