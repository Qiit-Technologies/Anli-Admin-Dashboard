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
    <div className="min-h-screen flex flex-col sm:flex-row">
      <Sidebar isOpen={menuOpen} setIsOpen={setMenuOpen} />
      <div className="flex-1 flex flex-col">
        <Header
          isOpen={menuOpen}
          setIsOpen={setMenuOpen}
          title="General Info"
        />
        <main className="px-4 sm:px-6 py-10 space-y-6 bg-white">
          {/* Top grid section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Profile Card */}
            <div className="bg-[#F5EFEB] p-6 rounded-xl shadow-sm text-center w-full flex flex-col gap-2">
              <div className="mx-auto rounded-full flex items-center justify-center">
                <Image
                  src="/sample-company.png"
                  alt="Company Logo"
                  width={180}
                  height={180}
                />
              </div>
              <h2 className="text-xl font-semibold text-[#0B0B0B]">
                {business?.name}
              </h2>
              <p className="text-md font-medium text-[#0B0B0B]">
                {business?.address}
              </p>
              <p className="text-sm text-[#0B0B0B]">+234 8070 234 000</p>
              <button className="rounded-[10px] mt-2 bg-[#007BFF] hover:bg-blue-700 text-white w-full py-3 px-6 font-semibold cursor-pointer">
                Add more modules
              </button>
            </div>

            {/* Assigned Modules */}
            <div className="md:col-span-2 space-y-4">
              <MostActiveModules />

              <LowActivityAlerts />
            </div>
          </div>

          {/* General Activity + Plan Info */}
          <div className="w-full flex flex-col sm:flex-row gap-4 ">
            <ModuleActivityGrowthSection />
            {/* Current Plan */}
            {/* This business id should be within a context */}
            <CurrentPlan businessId={business.id.toString()} />
          </div>

          <PaymentTable />
        </main>
      </div>
    </div>
  );
}
