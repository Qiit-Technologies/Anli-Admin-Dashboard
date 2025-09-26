"use client";

import { PlanCard } from "../components/plan/planCard";
import PlanHistoryTable from "../components/plan/planHistoryTable";
import Header from "../components/layout/header";
import Sidebar from "../components/layout/sidebar";
import { useState } from "react";
import { useBusiness } from "@/context/businessContext";
import useSWR from "swr";
import { getPlanResponse } from "@/app/actions/types";
import fetcher from "@/app/actions/fetcher";
import { BillingInfoDTO } from "@/types/plan";
import { capitalize, formatPlanRenewalDate } from "@/utils/utils";

export default function CurrentPlanPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { business, loading } = useBusiness();

  const { isLoading, data: response } = useSWR(
    business ? `/super-admin/${business.id}/billing/current-plan` : null,
    (url: string) => fetcher<getPlanResponse>(url),
  );

  const planDetails: BillingInfoDTO = response?.data.billingInfo || {
    plan_name: "",
    renewal_date: "",
    billing_cycle: "",
    modules: [],
    price: 0,
  };

  console.log(planDetails);

  return (
    <div className="min-h-screen flex flex-col sm:flex-row">
      <Sidebar isOpen={menuOpen} setIsOpen={setMenuOpen} />
      <div className="flex-1 flex flex-col">
        <Header
          isOpen={menuOpen}
          setIsOpen={setMenuOpen}
          title="Current Plan"
        />
        <main className="px-4 sm:px-8 md:px-12 py-10 space-y-6 bg-white">
          {isLoading || loading ? (
            "loading..."
          ) : (
            <>
              <PlanCard
                planName={capitalize(planDetails.plan_name)}
                price={planDetails.price}
                tagline="Our most popular plan."
                renewalDate={formatPlanRenewalDate(planDetails.renewal_date)}
                modulesAllowed={5}
                billingCycle={capitalize(planDetails.billing_cycle)}
                benefits="Housekeeping Automation, Advanced Reports, Priority Support"
              />

              <div className="mt-5">
                <PlanHistoryTable />
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
