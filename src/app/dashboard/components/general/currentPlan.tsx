import getPlan from "@/app/actions/plan";
import { Spinner } from "@/components/ui/spinner";
import useSWR from "swr";

export default function CurrentPlan({ businessId }: { businessId: string }) {
  const {
    isLoading,
    data: response,
  } = useSWR(businessId ? businessId : null, () => getPlan({ id: businessId }));
  
  const billingInfo = response?.data?.billingInfo;

  return (
    <div className="bg-white p-6 rounded-xl border border-[#E0E0E0] space-y-4">
      <h4 className="font-medium text-md text-gray-900">Current Plan</h4>
      <hr className="my-3 border border-[#DFDFDF]" />
      {isLoading ? (
        <Spinner>Loading component</Spinner>
      ) : (
        <>
          <ul className="text-sm space-y-4 text-gray-700 pb-6 border-b border-[#DFDFDF]">
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
            <li className="flex justify-between">
              <span className="font-medium">Modules Allowed</span>
              <span>{billingInfo?.modules}</span>
            </li>
          </ul>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              disabled={isLoading}
              className="rounded-[10px] bg-[#007BFF] hover:bg-blue-700 text-white py-3 px-6 text-sm w-full"
            >
              Upgrade Plan
            </button>
            <button
              disabled={isLoading}
              className="rounded-[10px] text-[#007BFF] border border-[#007BFF] py-3 px-6 text-sm w-full"
            >
              Send Payment Reminder
            </button>
          </div>
        </>
      )}
    </div>
  );
}
