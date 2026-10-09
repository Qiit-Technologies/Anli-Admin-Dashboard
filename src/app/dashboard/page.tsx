"use client";

import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import AlertsFeed, {
  AlertsFeedSkeleton,
} from "./components/hq/AlertsFeed";
import BusinessDirectory, {
  BusinessDirectorySkeleton,
} from "./components/hq/BusinessDirectory";
import HqCharts, { HqChartsSkeleton } from "./components/hq/HqCharts";
import KpiBand, { KpiBandSkeleton } from "./components/hq/KpiBand";
import HqShell from "./components/layout/hq-shell";
import {
  useBillingMetrics,
  useBusinessDirectory,
  useHqOverview,
  useHotelHealth,
} from "./components/hq/useHqData";

export default function DashboardPage() {
  const overview = useHqOverview();
  const directory = useBusinessDirectory();
  const health = useHotelHealth(directory.data ?? []);
  const billing = useBillingMetrics();

  const loading =
    overview.isLoading || directory.isLoading || health.isLoading;

  const refreshAll = async () => {
    await Promise.all([
      overview.refresh(),
      directory.refresh(),
      health.refresh(),
      billing.refresh(),
    ]);
    toast.success("Refreshed");
  };

  return (
    <HqShell title="Command Center">
      <div className="flex items-center justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={refreshAll}
          className="gap-2"
          aria-label="Refresh dashboard data"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {loading || !overview.data ? (
        <KpiBandSkeleton />
      ) : (
        <KpiBand api={overview.data.api} derived={overview.data.derived} />
      )}

      {loading || !overview.data ? (
        <HqChartsSkeleton />
      ) : (
        <HqCharts
          api={overview.data.api}
          derived={overview.data.derived}
          billing={billing.data ?? null}
        />
      )}

      <div className="grid gap-3 sm:gap-4 lg:grid-cols-5">
        <div className="lg:col-span-2">
          {loading || !overview.data ? (
            <AlertsFeedSkeleton />
          ) : (
            <AlertsFeed
              api={overview.data.api}
              derived={overview.data.derived}
            />
          )}
        </div>
        <div className="lg:col-span-3">
          {loading ? (
            <BusinessDirectorySkeleton />
          ) : (
            <BusinessDirectory
              health={health.data ?? null}
              hotels={directory.data ?? []}
            />
          )}
        </div>
      </div>
    </HqShell>
  );
}
