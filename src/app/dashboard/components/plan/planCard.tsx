"use client";

import { Zap } from "lucide-react";
import { PlanCardProps } from "./types";
import { Divider } from "../divider";

export const PlanCard = ({
  planName,
  price,
  tagline,
  renewalDate,
  modulesAllowed,
  billingCycle,
  benefits,
  onUpgrade,
  onSwitchBilling,
  onDowngrade,
}: PlanCardProps) => (
  <div className="rounded-2xl bg-[#FFF9F4] p-6 sm:p-8 space-y-6">
    {/* Top Section */}
    <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
      {/* Icon + name */}
      <div className="flex flex-col sm:flex-row items-start gap-4">
        <div className="flex h-[100px] w-[100px] sm:h-[120px] sm:w-[120px] items-center justify-center rounded-full bg-[#552500]">
          <Zap className="h-[40px] w-[40px] sm:h-[60px] sm:w-[60px] text-[#D55D00]" />
        </div>
        <div className="space-y-1 sm:space-y-2">
          <h3 className="text-lg sm:text-xl font-normal text-[#552500]">
            {planName}
          </h3>
          <p className="text-2xl sm:text-[32px] font-semibold text-[#101828]">
            {price}
          </p>
          <p className="text-sm sm:text-md font-normal text-[#667085]">
            {tagline}
          </p>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
        <button
          className="rounded-lg border border-gray-300 px-4 py-2 text-gray-400 font-semibold text-sm w-full sm:w-auto"
          disabled
          onClick={onDowngrade}
        >
          Downgrade
        </button>
        <button
          className="rounded-lg bg-gray-500 px-4 py-2 font-semibold text-sm text-white hover:bg-gray-600 w-full sm:w-auto"
          onClick={onSwitchBilling}
        >
          Switch billing cycle
        </button>
        <button
          className="rounded-lg bg-[#007BFF] px-4 py-2 font-semibold text-sm text-white hover:bg-blue-700 w-full sm:w-auto"
          onClick={onUpgrade}
        >
          Make Payment
        </button>
      </div>
    </div>

    {/* Divider */}
    <Divider className="my-4 sm:my-8 border-[#D3D3D3]" />

    {/* Bottom Grid */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-sm text-gray-700">
      <div>
        <p className="text-sm text-[#919191] mb-1">Renewal Date</p>
        <p className="font-semibold">{renewalDate}</p>
      </div>
      <div>
        <p className="text-sm text-[#919191] mb-1">Modules Allowed</p>
        <p className="font-semibold">{modulesAllowed}</p>
      </div>
      <div>
        <p className="text-sm text-[#919191] mb-1">Billing Cycle</p>
        <p className="font-semibold">{billingCycle}</p>
      </div>
      <div>
        <p className="text-sm text-[#919191] mb-1">Plan Benefits</p>
        <p className="font-semibold">{benefits}</p>
      </div>
    </div>
  </div>
);
