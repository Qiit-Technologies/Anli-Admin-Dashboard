"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";

/* ── Super-admin dashboard (main branch) ─────────────────────────────── */
import Header from "./components/layout/header";
import Sidebar from "./components/layout/sidebar";
import { useBusiness } from "@/context/businessContext";
import CurrentPlan from "./components/general/currentPlan";
import PaymentTable from "./components/general/paymentTable";
import { LowActivityAlerts } from "./components/home/LowActivityAlerts";
import { MostActiveModules } from "./components/home/MostActiveModules";
import { ModuleActivityGrowthSection } from "./components/general/ModuleActivityGrowthSection";

/* ── Operations dashboard (feature/loyalty-admin branch) ─────────────── */
import { HeroUIProvider } from "@heroui/react";
import { getMe } from "../actions/users";
import { navigationMap } from "./util/navigationMap";

function SuperAdminDashboard() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { business, loading } = useBusiness();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!business || Object.keys(business).length < 1)) {
      router.replace("/business-list");
    }
  }, [business, loading, router]);

  if (loading || !business) return null;

  return (
    <div className="h-screen w-screen flex flex-col sm:flex-row overflow-hidden">
      <Sidebar isOpen={menuOpen} setIsOpen={setMenuOpen} />
      <div className="flex-1 flex flex-col overflow-hidden min-h-0">
        <Header
          isOpen={menuOpen}
          setIsOpen={setMenuOpen}
          title="General Info"
        />
        <main className="px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-10 space-y-4 sm:space-y-6 bg-white overflow-y-auto overflow-x-hidden flex-1 min-h-0">
          {/* Top grid section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {/* Profile Card */}
            <div className="bg-[#F5EFEB] p-4 sm:p-6 rounded-xl shadow-sm text-center w-full flex flex-col gap-2 sm:gap-3">
              <div className="mx-auto rounded-full flex items-center justify-center">
                <Image
                  src={business?.coverImage || "/sample-company.png"}
                  alt="Company Logo"
                  width={180}
                  height={180}
                  className="w-[100px] h-[100px] sm:w-[140px] sm:h-[140px] md:w-[180px] md:h-[180px] object-contain"
                />
              </div>
              <h2 className="text-base sm:text-lg md:text-xl font-semibold text-[#0B0B0B] break-words px-2">
                {business?.name}
              </h2>
              <p className="text-xs sm:text-sm md:text-md font-medium text-[#0B0B0B] break-words px-2">
                {business?.address}
              </p>
              <p className="text-xs text-[#0B0B0B] px-2">
                {business?.owner?.phoneNumber}
              </p>
              <button
                onClick={() => router.push("/dashboard/details")}
                className="rounded-[10px] mt-2 bg-[#007BFF] hover:bg-blue-700 text-white w-full py-2.5 sm:py-3 px-4 sm:px-6 font-semibold cursor-pointer text-sm sm:text-base transition-colors"
              >
                View details
              </button>
            </div>

            {/* Assigned Modules */}
            <div className="md:col-span-2 space-y-4">
              <MostActiveModules />
              <LowActivityAlerts />
            </div>
          </div>

          {/* General Activity + Plan Info */}
          <div className="w-full flex flex-col lg:flex-row gap-4">
            <ModuleActivityGrowthSection />
            <CurrentPlan businessId={business.id.toString()} />
          </div>

          <PaymentTable />
        </main>
      </div>
    </div>
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

// Merge of both branches' /dashboard pages. The super-admin business dashboard
// (main) is the default; the role-based operations dashboard
// (feature/loyalty-admin) is one toggle away. Nothing from either side removed.
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
        {view === "super-admin" ? (
          <SuperAdminDashboard />
        ) : (
          <OperationsDashboard />
        )}
      </div>
    </div>
  );
}
