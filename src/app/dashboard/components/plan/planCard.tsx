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
  <div className="rounded-2xl bg-[#FFF9F4] p-8">
    <div className="flex items-start justify-between">
      {/* Icon + name */}
      <div className="flex items-start gap-4">
        <div className="flex h-[120px] w-[120px] items-center justify-center rounded-full bg-[#552500]">
          <Zap className="h-[60px] w-[60px] text-[#D55D00]" />
        </div>
        <div className="flex flex-col">
          <h3 className="text-xl font-normal text-[#552500]">{planName}</h3>
          <p className="text-[32px] font-semibold text-[#101828]">{price}</p>
          <p className="text-md font-normal text-[#667085]">{tagline}</p>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-2">
        <button
          className="rounded-lg border border-gray-300 px-4 py-2 text-gray-400 font-semibold text-md"
          disabled
          onClick={onDowngrade}
        >
          Downgrade
        </button>
        <button
          className="rounded-lg bg-gray-500 px-4 py-2 font-semibold text-md text-white hover:bg-gray-600"
          onClick={onSwitchBilling}
        >
          Switch billing cycle
        </button>
        <button
          className="rounded-lg bg-[#007BFF] px-4 py-2 font-semibold text-md text-white hover:bg-blue-700"
          onClick={onUpgrade}
        >
          Upgrade
        </button>
      </div>
    </div>

    {/* Divider */}
    <Divider className="my-8 border-[#D3D3D3]" />

    {/* ─── Details row ──────────────────────────────────────────────────── */}
    <div className="grid grid-cols-4 gap-4 text-sm text-gray-700">
      <div>
        <p className="font-normal text-sm text-[#919191] mb-3">Renewal Date</p>
        <p className="font-semibold">{renewalDate}</p>
      </div>
      <div>
        <p className="font-normal text-sm text-[#919191] mb-3">Modules Allowed</p>
        <p className="font-semibold">{modulesAllowed}</p>
      </div>
      <div>
        <p className="font-normal text-sm text-[#919191] mb-3">Billing Cycle</p>
        <p className="font-semibold">{billingCycle}</p>
      </div>
      <div>
        <p className="font-normal text-sm text-[#919191] mb-3">Plan Benefits</p>
        <p className="font-semibold">{benefits}</p>
      </div>
    </div>
  </div>
);
