import { PlanCard } from "../components/currentPlan/planCard";
import PlanHistoryTable from "../components/currentPlan/planHistoryTable";
import Header from "../components/layout/header";
import Sidebar from "../components/layout/sidebar";

export default function CurrentPlanPage() {
  return (
    <div className="min-h-screen flex flex-col sm:flex-row">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header title="Current Plan" />
        <main className="px-12 py-10 space-y-6 bg-white">
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
