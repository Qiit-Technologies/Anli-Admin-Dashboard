import fetcher from "@/app/actions/fetcher";
import { selectPlan } from "@/app/actions/plan";
import { getSubscriptionPlansResponse } from "@/app/actions/types";
import { CustomDialog } from "@/components/common/CustomDialog";
import { SearchSelect } from "@/components/common/SearchSelect";
import { useBusiness } from "@/context/businessContext";
import { useState } from "react";
import { toast } from "react-toastify";
import useSWR, { useSWRConfig } from "swr";

export const SelectPlanBtn = () => {
  const { mutate } = useSWRConfig();
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { business, loading: businessLoading } = useBusiness();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const { data: response, isLoading: planLoading } = useSWR(
    "/super-admin/subscription-plan",
    (url: string) => fetcher<getSubscriptionPlansResponse>(url),
  );

  const handleSelectPlan = async () => {
    setLoading(true);
    try {
      if (!selectedPlan) {
        toast.error("Please select a plan before proceeding");
        return;
      }

      if (!business) {
        return;
      }

      const payload = { planId: selectedPlan };
      await selectPlan(payload, business?.id);

      toast.success("Plan has been changed successfully");
      mutate(`/super-admin/${business.id}/billing/current-plan`);
      setIsDialogOpen(false);
    } catch (error) {
      if (typeof error === "string") toast.error(error);
      else toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const plans =
    response?.data?.plans.map((plan) => ({
      value: String(plan.id),
      label: `${plan.name} - ${"₦" + Number(plan.price).toLocaleString()}`,
    })) || [];

  return (
    <CustomDialog
      open={isDialogOpen}
      onSubmit={handleSelectPlan}
      onOpenChange={setIsDialogOpen}
      title="Select Subscription Plan"
      loading={loading || businessLoading || planLoading}
      trigger={
        <button className="rounded-lg bg-[#007BFF] px-4 py-2 font-semibold text-sm text-white hover:bg-blue-700 w-full sm:w-auto">
          Select Plan
        </button>
      }
    >
      <SearchSelect
        id="plans"
        label="Subscription Plans"
        placeholder="Select a Plan"
        items={plans}
        disabled={false}
        value={
          selectedPlan
            ? (plans?.find(
                (plan: { value: string; label: string }) =>
                  plan.value === selectedPlan,
              ) ?? null)
            : null
        }
        className="w-full min-w-0 h-10"
        onChange={(plan: { value: string; label: string }) =>
          setSelectedPlan(String(plan.value))
        }
        displayValue={(plan: { value: string; label: string }) => plan.label}
      />
    </CustomDialog>
  );
};
