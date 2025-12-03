import useSWR from "swr";
import { FaSpinner } from "react-icons/fa";
import fetcher from "@/app/actions/fetcher";
import { getPlanResponse } from "@/app/actions/types";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { sendPaymentReminder, reactivateBusiness } from "@/app/actions/plan";
import { RefreshCw } from "lucide-react";

export default function CurrentPlan({ businessId }: { businessId: string }) {
  const router = useRouter();
  const [sendingReminder, setSendingReminder] = useState(false);
  const [reactivating, setReactivating] = useState(false);
  const {
    isLoading,
    data: response,
    mutate,
  } = useSWR(`/super-admin/${businessId}/billing/current-plan`, (url: string) =>
    fetcher<getPlanResponse>(url)
  );

  const billingInfo = response?.data.billingInfo || {
    plan_name: "",
    renewal_date: "",
    billing_cycle: "",
    modules: [],
    status: "",
    isExpired: false,
  };

  const handleUpgradePlan = () => {
    router.push("/dashboard/plan");
  };

  const handleSendPaymentReminder = async () => {
    if (!businessId) {
      toast.error("No business selected");
      return;
    }

    setSendingReminder(true);
    try {
      await sendPaymentReminder(Number(businessId));
      toast.success("Payment reminder sent successfully");
      if (mutate) {
        await mutate();
      }
    } catch (error) {
      console.error("Failed to send payment reminder:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to send payment reminder";
      toast.error(errorMessage);
    } finally {
      setSendingReminder(false);
    }
  };

  const handleReactivate = async () => {
    if (!businessId) {
      toast.error("No business selected");
      return;
    }

    setReactivating(true);
    try {
      await reactivateBusiness(Number(businessId));
      toast.success("Business reactivated successfully");
      if (mutate) {
        await mutate();
      }
    } catch (error) {
      console.error("Failed to reactivate business:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to reactivate business";
      toast.error(errorMessage);
    } finally {
      setReactivating(false);
    }
  };

  const isExpired = billingInfo?.status === "expired" || billingInfo?.isExpired;

  return (
    <div className="w-full lg:w-2/5 bg-white p-4 sm:p-6 rounded-xl border border-[#E0E0E0] h-fit space-y-4">
      <h4 className="font-medium text-md text-gray-900">Current Plan</h4>
      <hr className="my-3 border border-[#DFDFDF]" />
      {isLoading ? (
        <FaSpinner className="animate-spin" />
      ) : (
        <>
          <ul className="w-full text-sm space-y-4 text-gray-700 pb-6 border-b border-[#DFDFDF]">
            <li className="flex justify-between">
              <span className="font-medium">Plan Name</span>
              <span>{billingInfo?.plan_name}</span>
            </li>
            <li className="flex justify-between">
              <span className="font-medium">Renewal Date</span>
              <span>{billingInfo?.renewal_date}</span>
            </li>
            <li className="flex justify-between">
              <span className="font-medium">Billing Cycle</span>
              <span>{billingInfo?.billing_cycle}</span>
            </li>
            {/*<li className="flex flex-col">
              <span className="font-medium">Modules Allowed</span>
              <p className="lg:w-[300px] inline-block break-words whitespace-normal">
                {billingInfo?.modules}
              </p>
            </li>*/}
          </ul>

          {isExpired && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800 font-medium mb-2">
                ⚠️ Subscription Expired
              </p>
              <button
                onClick={handleReactivate}
                disabled={isLoading || reactivating}
                className="rounded-[10px] bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2 px-4 text-sm w-full font-semibold transition-colors flex items-center justify-center gap-2"
              >
                {reactivating ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Reactivating...
                  </>
                ) : (
                  <>
                    <RefreshCw size={16} />
                    Reactivate Business
                  </>
                )}
              </button>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleUpgradePlan}
              disabled={isLoading}
              className="rounded-[10px] bg-[#007BFF] hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 px-6 text-sm w-full font-semibold transition-colors"
            >
              Upgrade Plan
            </button>
            <button
              onClick={handleSendPaymentReminder}
              disabled={isLoading || sendingReminder}
              className="rounded-[10px] text-[#007BFF] border border-[#007BFF] hover:bg-[#007BFF] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed py-3 px-6 text-sm w-full font-semibold transition-colors"
            >
              {sendingReminder ? "Sending..." : "Send Payment Reminder"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
