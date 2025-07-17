"use client";

import Header from "./components/layout/header";
import Sidebar from "./components/layout/sidebar";
import Image from "next/image";
import PaymentTable from "./components/general/paymentTable";
import { useEffect, useState } from "react";
import { useBusiness } from "@/context/businessContext";
import { useRouter } from "next/navigation";
import CurrentPlan from "./components/general/currentPlan";

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
        <main className="px-4 sm:px-8 md:px-12 py-10 space-y-6 bg-white">
          {/* Top grid section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Profile Card */}
            <div className="bg-[#F5EFEB] p-6 rounded-xl shadow-sm text-center space-y-3 w-full max-w-md mx-auto md:mx-0">
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
              <button className="rounded-[10px] mt-4 bg-[#007BFF] hover:bg-blue-700 text-white w-full py-4 px-6">
                Add more modules
              </button>
            </div>

            {/* Assigned Modules */}
            <div className="md:col-span-2 space-y-4">
              <div className="bg-white p-6 rounded-xl space-y-4 border border-[#E0E0E0]">
                <h3 className="text-sm font-semibold text-[#354052]">
                  Assigned Modules
                </h3>
                <hr className="my-3 border border-[#DFDFDF]" />
                <ul className="text-sm space-y-4">
                  <li className="flex justify-between">
                    <span className="font-medium text-[#474747]">
                      House Keeping
                    </span>
                    <span className="font-normal text-[#111111]">
                      0 updates (Inactive for 3 weeks)
                    </span>
                  </li>
                  <li className="flex justify-between">
                    <span className="font-medium text-[#474747]">Bookings</span>
                    <span className="font-normal text-[#111111]">
                      120 bookings created this month
                    </span>
                  </li>
                  <li className="flex justify-between">
                    <span className="font-medium text-[#474747]">Payments</span>
                    <span className="font-normal text-[#111111]">
                      50 successful transactions
                    </span>
                  </li>
                </ul>
              </div>

              <div className="bg-white p-6 rounded-xl space-y-4 border border-[#E0E0E0]">
                <div className="text-sm">
                  <h4 className="font-semibold mb-2 text-[#354052]">
                    Low Activity Alerts
                  </h4>
                  <h4 className="mb-2 text-[#474747] text-sm font-normal">
                    inactivity or underuse by module:
                  </h4>
                  <hr className="my-3 border border-[#DFDFDF]" />
                  <ul className="space-y-4">
                    <li>⚠️ Housekeeping module not used in 3 weeks</li>
                    <li>⚠️ Only 1 report generated this month</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* General Activity + Plan Info */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 p-6 rounded-xl">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
                <h3 className="text-sm font-medium">General Actives Growth</h3>
                <div className="flex space-x-2 text-sm text-gray-500 border border-gray-300 rounded-md overflow-hidden">
                  <button className="hover:text-black bg-gray-50 border-r px-4 py-2">
                    12 months
                  </button>
                  <button className="hover:text-black border-r px-4 py-2">
                    30 days
                  </button>
                  <button className="hover:text-black px-4 py-2">7 days</button>
                </div>
              </div>
              <div className="h-48 bg-gray-100 rounded-md flex items-center justify-center text-sm text-gray-500">
                Activity Chart Placeholder
              </div>
            </div>

            {/* Current Plan */}
            <CurrentPlan businessId={business.id.toString()} />
          </div>

          <PaymentTable />
        </main>
      </div>
    </div>
  );
}
