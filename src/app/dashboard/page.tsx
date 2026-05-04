"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "./components/layout/header";
import Sidebar from "./components/layout/sidebar";
import { useBusiness } from "@/context/businessContext";
import CurrentPlan from "./components/general/currentPlan";
import PaymentTable from "./components/general/paymentTable";
import { LowActivityAlerts } from "./components/home/LowActivityAlerts";
import { MostActiveModules } from "./components/home/MostActiveModules";
import { ModuleActivityGrowthSection } from "./components/general/ModuleActivityGrowthSection";

export default function DashboardPage() {
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
