"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import toast from "react-hot-toast";

/* ── HQ command center ─────────────────────────────────────────────────── */
import HqShell from "./components/layout/hq-shell";
import KpiBand, { KpiBandSkeleton } from "./components/hq/KpiBand";
import HqCharts, { HqChartsSkeleton } from "./components/hq/HqCharts";
import AlertsFeed, { AlertsFeedSkeleton } from "./components/hq/AlertsFeed";
import BusinessDirectory, {
  BusinessDirectorySkeleton,
} from "./components/hq/BusinessDirectory";
import {
  useHqOverview,
  useHotelHealth,
  useBillingMetrics,
  useBusinessDirectory,
} from "./components/hq/useHqData";

/* ── Operations dashboard (feature/loyalty-admin branch) ─────────────── */
import { HeroUIProvider } from "@heroui/react";
import { getMe } from "../actions/users";
import { navigationMap } from "./util/navigationMap";

function HqCommandCenter() {
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

function OperationsDashboard() {
  const searchParams = useSearchParams();
  const [DefaultComponent, setDefaultComponent] = useState<React.ElementType>(
    () => navigationMap.default.page,
  );

  const firstEntry = Array.from(searchParams.entries())[0];
  const queryName = firstEntry ? firstEntry[0] : "main";
  const page = firstEntry ? firstEntry[1] : null;

  useEffect(() => {
    const fetchUserAndInitialize = async () => {
      const response = await getMe();

      if ("error" in response) {
        localStorage.removeItem("user");
        setDefaultComponent(() => navigationMap.main.dashboard);
        return;
      }

      // Always update local storage with the latest data from the server
      const freshUser = response.data;
      localStorage.setItem("user", JSON.stringify(freshUser));

      const userRole = freshUser.roles.name;
      const roleDefaults: Record<string, React.ElementType> = {
        // administrator: navigationMap.staffing.dashboard,
        frontoffice: navigationMap.frontoffice.dashboard,
        //  stock: navigationMap.stock.dashboard,
        //  housekeeping: navigationMap.housekeeping.dashboard,
        profile: navigationMap.profile.settings,
        default: navigationMap.main.dashboard,
      };

      const SelectedComponent =
        roleDefaults[userRole] || roleDefaults.default;
      setDefaultComponent(() => SelectedComponent);
    };

    // Always re-validate on mount to ensure we have fresh session data
    fetchUserAndInitialize();
  }, []);

  const renderComponent = () => {
    const PageComponent =
      page && navigationMap[queryName]?.[page]
        ? navigationMap[queryName][page]
        : DefaultComponent;

    return <PageComponent />;
  };

  return (
    <HeroUIProvider>
      <Suspense fallback={<div>Loading...</div>}>
        {renderComponent()}
      </Suspense>
    </HeroUIProvider>
  );
}

type DashboardView = "super-admin" | "operations";

// HQ command center is the default super-admin view; the role-based operations
// dashboard (feature/loyalty-admin) remains one toggle away. Per-business
// deep dives live under the "Business" sidebar section once a business is
// selected, plus /business-list.
export default function DashboardPage() {
  const [view, setView] = useState<DashboardView>("super-admin");

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex items-center gap-2 px-4 py-2 bg-[#0B0B0B] text-white text-sm shrink-0 z-50">
        <span className="font-semibold mr-2">Dashboard view:</span>
        <button
          onClick={() => setView("super-admin")}
          className={`px-3 py-1 rounded-full font-medium cursor-pointer ${
            view === "super-admin"
              ? "bg-[#007BFF] text-white"
              : "bg-white/10 text-white/70 hover:bg-white/20"
          }`}
        >
          Super Admin
        </button>
        <button
          onClick={() => setView("operations")}
          className={`px-3 py-1 rounded-full font-medium cursor-pointer ${
            view === "operations"
              ? "bg-[#007BFF] text-white"
              : "bg-white/10 text-white/70 hover:bg-white/20"
          }`}
        >
          Operations
        </button>
      </div>
      <div className="flex-1 flex flex-col min-h-0">
        {view === "super-admin" ? <HqCommandCenter /> : <OperationsDashboard />}
      </div>
    </div>
  );
}
