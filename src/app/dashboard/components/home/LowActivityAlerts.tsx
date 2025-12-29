import fetcher from "@/app/actions/fetcher";
import { getLowModuleActivityResponse } from "@/app/actions/types";
import { useBusiness } from "@/context/businessContext";
import { capitalize, removeUnderscore } from "@/utils/utils";
import useSWR from "swr";

export const LowActivityAlerts = () => {
  const { business, loading } = useBusiness();
  const { data: res, isLoading } = useSWR(
    `/super-admin/hotels/low-module-activity/${business?.id}`,
    (url: string) => fetcher<getLowModuleActivityResponse>(url)
  );

  if (isLoading || loading) {
    return (
      <div className="bg-white p-4 sm:p-6 h-44 rounded-xl space-y-4 border border-[#E0E0E0] flex flex-col justify-center items-center text-base sm:text-lg font-semibold">
        Loading...
      </div>
    );
  }

  return (
    <div className="bg-white p-4 sm:p-6 rounded-xl space-y-4 border border-[#E0E0E0]">
      <div className="text-xs sm:text-sm">
        <h4 className="font-semibold mb-2 text-[#354052]">
          Low Activity Alerts
        </h4>
        <h4 className="mb-2 text-[#474747] text-xs sm:text-sm font-normal">
          inactivity or underuse by module:
        </h4>
        <hr className="my-3 border border-[#DFDFDF]" />
        <ul className="space-y-3 sm:space-y-4">
          {res?.data.unusedModules.slice(0, 3).map((item, index) => {
            return (
              <li key={index} className="break-words">
                ⚠️ {capitalize(removeUnderscore(item))} module not used in a
                week
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};
