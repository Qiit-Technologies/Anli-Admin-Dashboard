import fetcher from "@/app/actions/fetcher";
import { getMostActiveModulesResponse } from "@/app/actions/types";
import { useBusiness } from "@/context/businessContext";
import { capitalize, removeUnderscore } from "@/utils/utils";
import useSWR from "swr";

export const MostActiveModules = () => {
  const { business, loading } = useBusiness();
  const { data: res, isLoading } = useSWR(
    `/super-admin/hotels/most-active-modules/${business?.id}`,
    (url: string) => fetcher<getMostActiveModulesResponse>(url)
  );

  if (loading || isLoading) {
    return (
      <div className="bg-white p-6 h-44 rounded-xl space-y-4 border border-[#E0E0E0] flex flex-col justify-center items-center text-lg font-semibold">
        Loading...
      </div>
    );
  }

  if (res) {
    console.log(res.data.pastMonthOfActivities);
  }

  if (res?.data.pastMonthOfActivities.length === 0) {
    return (
      <div className="bg-white p-6 h-44 rounded-xl space-y-4 border border-[#E0E0E0] flex flex-col justify-center items-center text-lg font-semibold">
        No Module Usage data
      </div>
    );
  }

  return (
    <div className="bg-white p-4 sm:p-6 rounded-xl space-y-4 border border-[#E0E0E0]">
      <h3 className="text-xs sm:text-sm font-semibold text-[#354052]">
        Most Active Modules
      </h3>
      <hr className="my-3 border border-[#DFDFDF]" />
      <ul className="text-xs sm:text-sm flex flex-col gap-3 sm:gap-4">
        {res?.data.pastMonthOfActivities.map((module, index) => (
          <li key={index} className="flex flex-col sm:flex-row justify-between py-2 gap-1 sm:gap-0">
            <span className="font-medium text-[#474747] break-words">
              {capitalize(removeUnderscore(module.moduleName))}
            </span>
            <span className="font-normal text-[#111111] text-left sm:text-right">
              was used {module.usageCount} times this month
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};
