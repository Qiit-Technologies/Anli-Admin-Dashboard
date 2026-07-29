import useSWR from "swr";
import { FaSpinner } from "react-icons/fa";
import fetcher from "@/app/actions/fetcher";
import { getPlanResponse } from "@/app/actions/types";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { sendPaymentReminder, reactivateBusiness } from "@/app/actions/plan";
import { RefreshCw } from "lucide-react";
import { useBusiness } from "@/context/businessContext";

/* ── Filter out unwanted non-module services ──────────────────────────── */
export function filterServices(services: string | null | undefined): string[] {
  if (!services) return [];
  return services
    .split(",")
    .map((s) => s.trim())
    .filter((s) => {
      if (!s) return false;
      const lower = s.toLowerCase();
      if (lower.includes("channel manager") || lower.includes("channel_manager")) return false;
      if (lower.includes("idle logout") || lower.includes("idle_logout")) return false;
      return true;
    });
}

/* ── Pricing catalogue (mirrors the Anli pricing sheet) ── */
const TIERS = [
  {
    name: "Flex",
    monthly: 70_000,
    annually: 700_000,
    tagline: "Shortlets, mini-apartments & small flats",
    color: "#6366f1",
  },
  {
    name: "Basic (Hotel)",
    monthly: 170_000,
    annually: 1_700_000,
    tagline: "Small hotels",
    color: "#0ea5e9",
  },
  {
    name: "Basic (Restaurant)",
    monthly: 170_000,
    annually: 1_700_000,
    tagline: "Restaurants",
    color: "#ec4899",
  },
  {
    name: "Advanced",
    monthly: 240_000,
    annually: 2_400_000,
    tagline: "Apartments + restaurant combined",
    color: "#f47411",
  },
  {
    name: "Custom",
    monthly: null,
    annually: null,
    tagline: "Full VIP — everything + dedicated support",
    color: "#10b981",
  },
] as const;

function deriveTierFromServices(services: string | null | undefined): string {
  const filtered = filterServices(services);
  if (filtered.length === 0) return "—";

  const lowerList = filtered.map((s) => s.toLowerCase());
  if (lowerList.some((s) => s === "vip" || s === "custom" || s.includes("vip"))) return "Custom";

  const hasRestaurant = lowerList.some((s) => s === "restaurant" || s.includes("restaurant"));
  const hasHotel = lowerList.some((s) => s === "front_office" || s.includes("front_office"));
  const count = filtered.length;

  if (count >= 7) return "Advanced";
  if (hasRestaurant && hasHotel) return "Advanced";
  if (hasRestaurant) return "Basic (Restaurant)";
  if (hasHotel && count >= 4) return "Basic (Hotel)";
  if (count >= 1) return "Flex";
  return "—";
}

function deriveTierColor(tierName: string): string {
  const tier = TIERS.find((t) => t.name === tierName);
  return tier?.color ?? "#6b7280";
}

function formatPrice(n: number | null) {
  if (n === null) return "Custom";
  return `₦${n.toLocaleString("en-NG")}`;
}

export default function CurrentPlan({ businessId }: { businessId: string }) {
  const router = useRouter();
  const { business } = useBusiness();
  const [sendingReminder, setSendingReminder] = useState(false);
  const [reactivating, setReactivating] = useState(false);
  const {
    isLoading,
    data: response,
    mutate,
  } = useSWR(`/super-admin/${businessId}/billing/current-plan`, (url: string) =>
    fetcher<getPlanResponse>(url),
  );

  const billingInfo = response?.data.billingInfo || {
    plan_name: "",
    renewal_date: "",
    billing_cycle: "",
    modules: [],
    status: "",
    isExpired: false,
  };

  // Filter services removing channel manager & idle logout
  const activeModules = filterServices(business?.services);

  // Derive tier from services field on the business object
  const derivedTier = deriveTierFromServices(business?.services);
  const tierColor = deriveTierColor(derivedTier);
  const activeTier = TIERS.find((t) => t.name === derivedTier);

  const handleUpgradePlan = () => router.push("/dashboard/plan");

  const handleSendPaymentReminder = async () => {
    if (!businessId) { toast.error("No business selected"); return; }
    setSendingReminder(true);
    try {
      await sendPaymentReminder(Number(businessId));
      toast.success("Payment reminder sent successfully");
      if (mutate) await mutate();
    } catch (error: any) {
      toast.error(error instanceof Error ? error.message : "Failed to send payment reminder");
    } finally {
      setSendingReminder(false);
    }
  };

  const handleReactivate = async () => {
    if (!businessId) { toast.error("No business selected"); return; }
    setReactivating(true);
    try {
      await reactivateBusiness(Number(businessId));
      toast.success("Business reactivated successfully");
      if (mutate) await mutate();
    } catch (error: any) {
      toast.error(error instanceof Error ? error.message : "Failed to reactivate business");
    } finally {
      setReactivating(false);
    }
  };

  const isExpired = billingInfo?.status === "expired" || billingInfo?.isExpired;

  return (
    <div className="w-full lg:w-2/5 bg-white rounded-xl border border-[#E0E0E0] overflow-hidden h-fit">
      {/* Tier header banner */}
      <div
        className="px-5 py-4 flex items-center justify-between"
        style={{ backgroundColor: tierColor }}
      >
        <div>
          <p className="text-white text-xs font-medium opacity-80 uppercase tracking-wider">
            Current Plan
          </p>
          <h3 className="text-white text-2xl font-bold mt-0.5">
            {derivedTier !== "—" ? derivedTier : billingInfo?.plan_name || "—"}
          </h3>
          {activeTier && (
            <p className="text-white text-xs mt-1 opacity-80">
              {activeTier.tagline}
            </p>
          )}
        </div>
        <div className="text-right">
          {activeTier?.monthly !== undefined && (
            <>
              <p className="text-white text-xl font-bold">
                {formatPrice(activeTier.monthly)}
              </p>
              <p className="text-white text-xs opacity-70">/month</p>
            </>
          )}
        </div>
      </div>

      {/* Details */}
      <div className="p-5 space-y-4">
        {isLoading ? (
          <FaSpinner className="animate-spin text-gray-400" />
        ) : (
          <>
            <ul className="w-full text-sm space-y-3 text-gray-700 pb-4 border-b border-[#DFDFDF]">
              <li className="flex justify-between">
                <span className="font-medium text-gray-500">Billing Cycle</span>
                <span className="font-semibold capitalize">
                  {billingInfo?.billing_cycle || "—"}
                </span>
              </li>
              <li className="flex justify-between">
                <span className="font-medium text-gray-500">Renewal Date</span>
                <span className="font-semibold">
                  {billingInfo?.renewal_date
                    ? new Date(billingInfo.renewal_date).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })
                    : "—"}
                </span>
              </li>
              {activeModules.length > 0 && (
                <li className="flex flex-col gap-1">
                  <span className="font-medium text-gray-500">Active Modules</span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {activeModules.map((s) => (
                      <span
                        key={s}
                        className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700"
                      >
                        {s.replace(/_/g, " ")}
                      </span>
                    ))}
                  </div>
                </li>
              )}
              {activeTier?.annually && (
                <li className="flex justify-between">
                  <span className="font-medium text-gray-500">Annual Price</span>
                  <span className="font-semibold text-green-600">
                    {formatPrice(activeTier.annually)}{" "}
                    <span className="text-gray-400 font-normal text-xs">/ yr</span>
                  </span>
                </li>
              )}
            </ul>

            {isExpired && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
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

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleUpgradePlan}
                disabled={isLoading}
                className="rounded-[10px] text-white py-2.5 px-6 text-sm w-full font-semibold transition-colors disabled:opacity-50"
                style={{ backgroundColor: tierColor }}
              >
                View / Upgrade Plan
              </button>
              <button
                onClick={handleSendPaymentReminder}
                disabled={isLoading || sendingReminder}
                className="rounded-[10px] border py-2.5 px-6 text-sm w-full font-semibold transition-colors hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ borderColor: tierColor, color: tierColor }}
              >
                {sendingReminder ? "Sending..." : "Send Reminder"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
