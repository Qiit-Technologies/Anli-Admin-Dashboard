"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Clock, Zap, MoreVertical, RefreshCw } from "lucide-react";
import { PlanCardProps } from "./types";
import { Divider } from "../divider";
import { LogInvoiceBtn } from "./LogInvoiceBtn";
import { SwitchBillingCycleBtn } from "./SwitchBillingCycleBtn";
import { SelectPlanBtn } from "./SelectPlanBtn";
import { UpgradePlanBtn } from "./UpgradePlanBtn";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const formatCountdown = (ms: number) => {
  if (!ms || ms <= 0) {
    return "00:00:00";
  }
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600)
    .toString()
    .padStart(2, "0");
  const minutes = Math.floor((totalSeconds % 3600) / 60)
    .toString()
    .padStart(2, "0");
  const seconds = Math.floor(totalSeconds % 60)
    .toString()
    .padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
};

const formatDisplayDate = (value?: string) => {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
};

const getCountdownMs = (warningExpiresAt?: string) => {
  if (!warningExpiresAt) return 0;
  return Math.max(0, new Date(warningExpiresAt).getTime() - Date.now());
};

const badgeTone = (variant: "success" | "danger" | "warning" | "neutral") => {
  switch (variant) {
    case "success":
      return "bg-emerald-50 text-emerald-700 border border-emerald-100";
    case "danger":
      return "bg-rose-50 text-rose-700 border border-rose-100";
    case "warning":
      return "bg-amber-50 text-amber-700 border border-amber-100";
    default:
      return "bg-gray-50 text-gray-700 border border-gray-100";
  }
};

export const PlanCard = ({
  planName,
  price,
  tagline,
  renewalDate,
  modulesAllowed,
  billingCycle,
  benefits,
  status,
  isExpired,
  hotelActive,
  warningInfo,
  canStartWarning,
  canCancelWarning,
  warningActionLoading,
  warningCancelLoading,
  onStartWarning,
  onCancelWarning,
  onUpgrade,
  onMakePayment,
  onReactivate,
  reactivating,
}: PlanCardProps) => {
  const [warningReason, setWarningReason] = useState("");
  const [useCustomTimes, setUseCustomTimes] = useState(false);
  const [customStartTime, setCustomStartTime] = useState("");
  const [customEndTime, setCustomEndTime] = useState("");
  const [countdownMs, setCountdownMs] = useState(() =>
    getCountdownMs(warningInfo?.warningExpiresAt)
  );

  useEffect(() => {
    setCountdownMs(getCountdownMs(warningInfo?.warningExpiresAt));
  }, [warningInfo?.warningExpiresAt]);

  useEffect(() => {
    if (!warningInfo?.warningExpiresAt) return;
    const interval = setInterval(() => {
      setCountdownMs(getCountdownMs(warningInfo.warningExpiresAt));
    }, 1000);
    return () => clearInterval(interval);
  }, [warningInfo?.warningExpiresAt]);

  const countdownLabel = useMemo(
    () => formatCountdown(countdownMs),
    [countdownMs]
  );

  const planStatusVariant =
    status === "active"
      ? "success"
      : status === "grace_period"
      ? "warning"
      : status === "expired"
      ? "danger"
      : isExpired
      ? "danger"
      : "neutral";

  const accountStatusVariant = hotelActive ? "success" : "danger";

  const formattedStatus = status
    ? status.replace(/_/g, " ")
    : isExpired
    ? "expired"
    : "unknown";

  // Always show warning panel
  const showWarningPanel = true;

  const handleStartWarning = async (options?: {
    reason?: string;
    warningStartedAt?: string;
    warningExpiresAt?: string;
  }) => {
    if (!onStartWarning) return;
    await onStartWarning({
      reason:
        options?.reason ||
        (warningReason.trim() ? warningReason.trim() : undefined),
      warningStartedAt: options?.warningStartedAt,
      warningExpiresAt: options?.warningExpiresAt,
    });
    setWarningReason("");
    setUseCustomTimes(false);
    setCustomStartTime("");
    setCustomEndTime("");
  };

  return (
    <div className="rounded-2xl bg-[#FFF9F4] p-6 sm:p-8 space-y-6">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col sm:flex-row items-start gap-4">
          <div className="flex h-[100px] w-[100px] sm:h-[120px] sm:w-[120px] items-center justify-center rounded-full bg-[#552500]">
            <Zap className="h-[40px] w-[40px] sm:h-[60px] sm:w-[60px] text-[#D55D00]" />
          </div>
          <div className="space-y-1 sm:space-y-2">
            <div className="flex items-center gap-3 flex-wrap">
              <h3 className="text-lg sm:text-xl font-normal text-[#552500] capitalize">
                {planName}
              </h3>
              {isExpired && (
                <Badge className={badgeTone("danger")}>Expired</Badge>
              )}
            </div>
            <p className="text-2xl sm:text-[32px] font-semibold text-[#101828]">
              ₦ {Number(price || 0).toLocaleString()}
            </p>
            <p className="text-sm sm:text-md font-normal text-[#667085]">
              {tagline}
            </p>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="rounded-lg border-gray-300 px-4 py-2 font-semibold text-sm hover:bg-gray-50 w-full sm:w-auto"
            >
              <MoreVertical className="h-4 w-4 mr-2" />
              Actions
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <SelectPlanBtn asMenuItem />
            <DropdownMenuSeparator />
            <SwitchBillingCycleBtn asMenuItem />
            <DropdownMenuSeparator />
            <LogInvoiceBtn asMenuItem />
            <DropdownMenuSeparator />
            {onUpgrade && <UpgradePlanBtn asMenuItem />}
            <DropdownMenuSeparator />
            {onMakePayment && (
              <DropdownMenuItem
                onClick={onMakePayment}
                className="cursor-pointer"
              >
                Make Payment
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Divider className="my-4 sm:my-8 border-[#D3D3D3]" />

      {isExpired && onReactivate && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 shadow-sm space-y-4">
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-red-100 p-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-red-800 mb-1">
                Subscription Expired
              </p>
              <p className="text-sm text-red-700 mb-4">
                This business subscription has expired. Reactivate to restore access.
              </p>
              <button
                onClick={onReactivate}
                disabled={reactivating}
                className="w-full sm:w-auto rounded-lg bg-green-600 hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed px-4 py-2 text-sm font-semibold text-white flex items-center justify-center gap-2"
              >
                {reactivating ? (
                  <>
                    <Clock className="h-4 w-4 animate-spin" />
                    Reactivating...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4" />
                    Reactivate Business
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

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
          <p className="font-semibold capitalize">{billingCycle}</p>
        </div>
        <div>
          <p className="text-sm text-[#919191] mb-1">Plan Benefits</p>
          <p className="font-semibold text-[#101828] break-words line-clamp-3">
            {benefits || "—"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm text-gray-700">
        <div>
          <p className="text-sm text-[#919191] mb-1">Plan Status</p>
          <Badge className={badgeTone(planStatusVariant)}>
            {formattedStatus}
          </Badge>
        </div>
        <div>
          <p className="text-sm text-[#919191] mb-1">Account Status</p>
          <Badge className={badgeTone(accountStatusVariant)}>
            {hotelActive ? "Active" : "Deactivated"}
          </Badge>
        </div>
      </div>

      {showWarningPanel && (
        <div className="rounded-2xl border border-[#FFEAD5] bg-white p-5 shadow-sm space-y-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-[#FEF3C7] p-2">
                <AlertTriangle className="h-5 w-5 text-[#B45309]" />
              </div>
              <div>
                <p className="font-semibold text-[#B45309]">
                  {warningInfo?.isActive
                    ? "Warning timer is running"
                    : "Plan expired"}
                </p>
                <p className="text-sm text-[#6B7280]">
                  {warningInfo?.isActive
                    ? "This account will be deactivated automatically when the countdown ends."
                    : "Start a 24-hour warning timer before the system deactivates this account."}
                </p>
              </div>
            </div>
            {warningInfo?.isActive && (
              <div className="flex items-center gap-2 rounded-full bg-[#FEF3C7] px-4 py-2 text-sm font-semibold text-[#92400E]">
                <Clock className="h-4 w-4" />
                {countdownLabel}
              </div>
            )}
          </div>

          {warningInfo?.isActive && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-[#6B7280]">Started</p>
                <p className="font-medium text-[#111827]">
                  {formatDisplayDate(warningInfo.warningStartedAt)}
                </p>
              </div>
              <div>
                <p className="text-[#6B7280]">Deactivation time</p>
                <p className="font-medium text-[#111827]">
                  {formatDisplayDate(warningInfo.warningExpiresAt)}
                </p>
              </div>
              <div>
                <p className="text-[#6B7280]">Reason</p>
                <p className="font-medium text-[#111827]">
                  {warningInfo.reason || "Not specified"}
                </p>
              </div>
              <div>
                <p className="text-[#6B7280]">Set by</p>
                <p className="font-medium text-[#111827]">
                  {warningInfo.setBy || "—"}
                </p>
              </div>
            </div>
          )}

          {canStartWarning && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="useCustomTimes"
                  checked={useCustomTimes}
                  onChange={(e) => setUseCustomTimes(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-[#F97316] focus:ring-[#F97316]"
                />
                <label
                  htmlFor="useCustomTimes"
                  className="text-sm font-medium text-[#374151] cursor-pointer"
                >
                  Set custom start and end times
                </label>
              </div>

              {useCustomTimes && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-gray-50 rounded-lg">
                  <div>
                    <label className="block text-xs font-medium text-[#6B7280] mb-1">
                      Warning Start Time
                    </label>
                    <input
                      type="datetime-local"
                      value={customStartTime}
                      onChange={(e) => setCustomStartTime(e.target.value)}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F97316]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#6B7280] mb-1">
                      Warning End Time (Deactivation)
                    </label>
                    <input
                      type="datetime-local"
                      value={customEndTime}
                      onChange={(e) => setCustomEndTime(e.target.value)}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F97316]"
                    />
                  </div>
                </div>
              )}

              <label className="text-sm font-medium text-[#374151]">
                Warning note (optional)
              </label>
              <textarea
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F97316]"
                rows={3}
                placeholder="Add context for this warning..."
                value={warningReason}
                onChange={(event) => setWarningReason(event.target.value)}
              />
              <button
                onClick={() => {
                  if (useCustomTimes && customStartTime && customEndTime) {
                    // Convert datetime-local format to ISO string
                    const startDate = new Date(customStartTime).toISOString();
                    const endDate = new Date(customEndTime).toISOString();
                    handleStartWarning({
                      reason: warningReason,
                      warningStartedAt: startDate,
                      warningExpiresAt: endDate,
                    });
                  } else {
                    handleStartWarning({ reason: warningReason });
                  }
                }}
                disabled={
                  warningActionLoading ||
                  !onStartWarning ||
                  (useCustomTimes && (!customStartTime || !customEndTime))
                }
                className="w-full rounded-lg bg-[#F97316] px-4 py-2 text-sm font-semibold text-white hover:bg-[#ea580c] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {warningActionLoading
                  ? "Starting warning..."
                  : useCustomTimes
                  ? "Start Warning Timer"
                  : "Start 24-hour Warning Timer"}
              </button>
            </div>
          )}

          {warningInfo?.isActive && canCancelWarning && (
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-[#6B7280]">
                Cancel the timer if the customer renews within the countdown.
              </p>
              <button
                onClick={onCancelWarning}
                disabled={warningCancelLoading || !onCancelWarning}
                className="rounded-lg border border-[#B45309] px-4 py-2 text-sm font-semibold text-[#B45309] hover:bg-[#FEF3C7] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {warningCancelLoading
                  ? "Cancelling warning..."
                  : "Cancel Warning Timer"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
