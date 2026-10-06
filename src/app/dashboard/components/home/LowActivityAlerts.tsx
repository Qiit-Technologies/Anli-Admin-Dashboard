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

  const unusedModules = res?.data.unusedModules || [];

  if (unusedModules.length === 0) {
    return (
      <div className="bg-white p-4 sm:p-6 h-44 rounded-xl space-y-2 border border-[#E0E0E0] flex flex-col justify-center items-center">
        <p className="text-base sm:text-lg font-semibold text-green-600">
          All modules active
        </p>
        <p className="text-xs sm:text-sm text-gray-500 text-center px-2">
          No modules showing low activity this week.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 sm:p-6 rounded-xl space-y-3 border border-[#E0E0E0]">
      <div>
        <h4 className="font-semibold text-[#354052] text-xs sm:text-sm">
          Low Activity Alerts
        </h4>
        <p className="text-[#474747] text-xs font-normal mt-1">
          Inactive or underused modules:
        </p>
      </div>
      <hr className="my-2 border border-[#DFDFDF]" />
      <ul className="space-y-2 sm:space-y-3 max-h-[220px] overflow-y-auto pr-1">
        {unusedModules.map((item, index) => (
          <li
            key={index}
            className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg bg-orange-50 border border-orange-100"
          >
            <span className="text-orange-500 mt-0.5 shrink-0">⚠️</span>
            <span className="text-xs sm:text-sm text-[#474747] break-words">
              <span className="font-medium">
                {capitalize(removeUnderscore(item))}
              </span>{" "}
              module not used in the last 7 days
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

