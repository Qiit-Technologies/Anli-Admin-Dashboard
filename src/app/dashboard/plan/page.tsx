"use client";

import { PlanCard } from "../components/plan/planCard";
import PlanHistoryTable from "../components/plan/planHistoryTable";
import Header from "../components/layout/header";
import Sidebar from "../components/layout/sidebar";
import { useState } from "react";

export default function CurrentPlanPage() {
  const [menuOpen, setMenuOpen] = useState(false);

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
          <PlanCard
            planName="Free plan"
            price="$00/mth"
            tagline="Our most popular plan."
            renewalDate="July 15, 2025, 3 days left"
            modulesAllowed={5}
            billingCycle="Monthly"
            benefits="Housekeeping Automation, Advanced Reports, Priority Support"
            // onUpgrade={() => console.log("upgrade")}
            // onSwitchBilling={() => console.log("switch")}
          />

          <div className="mt-5">
            <PlanHistoryTable />
          </div>
        </main>
      </div>
    </div>
  );
}
