"use client";
import { useState } from "react";
import { GrowthActivityChart } from "./GrowthActivityChart";

export const ModuleActivityGrowthSection = (): React.ReactNode => {
  const [selectedPeriod, setSelectedPeriod] = useState("year");

  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period);
  };

  return (
    <div className="w-full lg:w-3/5 p-4 sm:p-6 rounded-xl border flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
        <h3 className="text-sm font-medium">General Actives Growth</h3>
        <div className="flex text-sm text-gray-500 border border-gray-300 rounded-md overflow-hidden w-full sm:w-auto">
          <button
            onClick={() => handlePeriodChange("year")}
            className={`hover:text-black border-r px-3 sm:px-4 py-2 flex-1 sm:flex-none ${
              selectedPeriod === "year" && "bg-gray-50 font-semibold"
            }`}
          >
            12 months
          </button>
          <button
            onClick={() => handlePeriodChange("30d")}
            className={`hover:text-black border-r px-3 sm:px-4 py-2 flex-1 sm:flex-none ${
              selectedPeriod === "30d" && "bg-gray-50 font-semibold"
            }`}
          >
            30 days
          </button>
          <button
            onClick={() => handlePeriodChange("7d")}
            className={`hover:text-black px-3 sm:px-4 py-2 flex-1 sm:flex-none ${
              selectedPeriod === "7d" && "bg-gray-50 font-semibold"
            }`}
          >
            7 days
          </button>
        </div>
      </div>
      <GrowthActivityChart period={selectedPeriod} />
    </div>
  );
};
