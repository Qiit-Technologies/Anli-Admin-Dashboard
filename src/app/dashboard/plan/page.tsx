"use client";

import { PlanCard } from "../components/plan/planCard";
import PlanHistoryTable from "../components/plan/planHistoryTable";
import { PaymentStatusTracker } from "../components/plan/paymentStatusTracker";
import { PaymentVerificationModal } from "../components/plan/paymentVerificationModal";
import Header from "../components/layout/header";
import Sidebar from "../components/layout/sidebar";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, RefreshCw, Zap, Star, Sparkles, Package } from "lucide-react";
import { toast } from "sonner";
import { useBusiness } from "@/context/businessContext";
import { initiatePayment } from "@/app/actions/payments";
import useSWR from "swr";
import fetcher from "@/app/actions/fetcher";
import { getPlanResponse } from "@/app/actions/types";
import {
  cancelWarningTimer,
  startWarningTimer,
  reactivateBusiness,
} from "@/app/actions/plan";
import { updateHotelServices } from "@/app/actions/business";
import { FaSpinner } from "react-icons/fa";
import { AlertTriangle } from "lucide-react";

/* ── Filter out unwanted non-module services ──────────────────────────── */
function filterServices(services: string | null | undefined): string[] {
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

/* ── Anli pricing catalogue ──────────────────────────────────────────── */
const TIERS = [
  {
    id: "flex",
    name: "Flex",
    monthly: 70_000,
    annually: 700_000,
    icon: Zap,
    color: "#6366f1",
    tagline: "Designed for shortlets, mini apartments & small flats.",
    description:
      "Comes with the Core PMS (Front Office) only. Self-paced, no onboarding required. Additional modules available as paid add-ons.",
    modules: ["Front Office"],
    onboarding: "Optional (self-paced)",
    note: null,
  },
  {
    id: "basic-hotel",
    name: "Basic (Hotel)",
    monthly: 170_000,
    annually: 1_700_000,
    icon: Star,
    color: "#0ea5e9",
    tagline: "Ideal for small hotels.",
    description:
      "Includes Front Office, Housekeeping, Stock, and Accounting. Any extra module can be added as a paid add-on.",
    modules: ["Front Office", "Housekeeping", "Stock", "Accounting"],
    onboarding: "Compulsory",
    note: null,
  },
  {
    id: "basic-restaurant",
    name: "Basic (Restaurant)",
    monthly: 170_000,
    annually: 1_700_000,
    icon: Star,
    color: "#ec4899",
    tagline: "Built for restaurants.",
    description:
      "Core modules: Restaurant, Back of House, Stock, Kitchen, and Bar/Drinks. Additional modules as paid add-ons.",
    modules: ["Restaurant", "Back of House", "Stock", "Kitchen", "Bar / Drinks"],
    onboarding: "Compulsory",
    note: null,
  },
  {
    id: "advanced",
    name: "Advanced",
    monthly: 240_000,
    annually: 2_400_000,
    icon: Sparkles,
    color: "#f47411",
    tagline: "Best for facilities managing apartments + restaurants.",
    description:
      "Includes all modules from both Basic plans — no restrictions. No add-ons needed.",
    modules: ["All Basic modules", "No restrictions"],
    onboarding: "Compulsory",
    note: null,
  },
  {
    id: "custom",
    name: "Custom",
    monthly: null,
    annually: null,
    icon: Package,
    color: "#10b981",
    tagline: "Personalized to your business.",
    description:
      "Everything in Advanced plus personalized modules, dedicated support, and exclusive VIP features tailored to your business.",
    modules: ["Everything in Advanced", "Dedicated support", "VIP features"],
    onboarding: "Compulsory",
    note: "Starting from ₦240,000/month",
  },
] as const;

const ADD_ONS = [
  "Membership",
  "QR Code Scanner",
  "Accounting",
  "People Management",
  "Banquet",
];

function deriveTierIdFromServices(services: string | null | undefined): string | null {
  const filtered = filterServices(services);
  if (filtered.length === 0) return null;

  const lowerList = filtered.map((s) => s.toLowerCase());
  // Custom / VIP tier
  if (lowerList.some((s) => s === "vip" || s === "custom" || s.includes("vip"))) return "custom";

  const hasRestaurant = lowerList.some((s) => s === "restaurant" || s.includes("restaurant"));
  const hasHotel = lowerList.some((s) => s === "front_office" || s.includes("front_office"));
  const count = filtered.length;

  if (count >= 7) return "advanced";
  if (hasRestaurant && hasHotel) return "advanced";
  if (hasRestaurant) return "basic-restaurant";
  if (hasHotel && count >= 4) return "basic-hotel";
  if (count >= 1) return "flex";
  return null;
}

function formatPrice(n: number | null) {
  if (n === null) return "Custom";
  return `₦${n.toLocaleString("en-NG")}`;
}

/* ── Main page ───────────────────────────────────────────────────────── */
export default function CurrentPlanPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [currentPayment, setCurrentPayment] = useState<{
    paymentId: string;
    amount: number;
    method: string;
    description?: string;
    hotelName?: string;
    hotelOwnerEmail?: string;
    paymentLink?: string;
  } | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<string>("");
  const { business, setBusiness } = useBusiness();
  const selectedHotelId = business?.id ? String(business.id) : "";
  const selectedHotelNumericId = business?.id ? Number(business.id) : null;
  const [paymentData, setPaymentData] = useState({
    amount: "",
    method: "",
    description: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [warningActionLoading, setWarningActionLoading] = useState(false);
  const [warningCancelLoading, setWarningCancelLoading] = useState(false);
  const [reactivating, setReactivating] = useState(false);
  const [settingPlan, setSettingPlan] = useState<string | null>(null);
  const [confirmPlanTierId, setConfirmPlanTierId] = useState<string | null>(null);

  // Derive current tier from services (filtered)
  const currentTierId = deriveTierIdFromServices(business?.services);
  const currentTier = TIERS.find((t) => t.id === currentTierId) ?? null;
  const activeModules = filterServices(business?.services);

  const {
    data: planResponse,
    isLoading: isPlanLoading,
    error: planError,
    mutate: mutatePlan,
  } = useSWR(
    selectedHotelNumericId
      ? `/super-admin/${selectedHotelNumericId}/billing/current-plan`
      : null,
    async (url: string) => {
      try {
        return await fetcher<getPlanResponse>(url);
      } catch (error: any) {
        const axiosError = error as { response?: { status?: number }; status?: number };
        const status = axiosError?.response?.status || axiosError?.status;
        if (status === 404) { console.warn("Subscription not found"); return undefined; }
        throw error;
      }
    },
    {
      onErrorRetry: (error, _key, _config, revalidate, { retryCount }) => {
        const axiosError = error as { response?: { status?: number }; status?: number };
        const status = axiosError?.response?.status || axiosError?.status;
        if (status === 404) return;
        if (retryCount >= 3) return;
        setTimeout(() => revalidate({ retryCount }), 5000);
      },
    },
  );

  useEffect(() => {
    if (!planError) return;
    const axiosError = planError as { response?: { status?: number }; status?: number };
    const status = axiosError?.response?.status || axiosError?.status;
    if (status !== 404) console.error("Plan fetch error:", planError);
  }, [planError]);

  const billingInfo = planResponse?.data.billingInfo;
  const renewalDateLabel = billingInfo?.renewal_date
    ? new Date(billingInfo.renewal_date).toLocaleString(undefined, {
      dateStyle: "long",
      timeStyle: "short",
    })
    : "Not available";

  const modulesAllowed = activeModules.length > 0 ? activeModules.length : (() => {
    if (!billingInfo?.modules) return 0;
    if (Array.isArray(billingInfo.modules)) return billingInfo.modules.length;
    return billingInfo.modules.split(",").filter(Boolean).length;
  })();

  const benefitsList = activeModules.length > 0
    ? activeModules.map(m => m.replace(/_/g, " ")).join(", ")
    : (() => {
      if (!billingInfo?.modules) return "—";
      if (Array.isArray(billingInfo.modules)) return billingInfo.modules.join(", ");
      return billingInfo.modules;
    })();

  const canStartWarning = !billingInfo?.warningInfo?.isActive;
  const canCancelWarning = Boolean(billingInfo?.warningInfo?.isActive);

  const handleInitiatePayment = async () => {
    if (!paymentData.amount || !paymentData.method) {
      toast.error("Please fill in all required fields");
      return;
    }
    setIsSubmitting(true);
    try {
      if (!selectedHotelId) { toast.error("No business selected"); return; }
      const result = await initiatePayment({
        businessId: selectedHotelId,
        amount: parseFloat(paymentData.amount),
        method: paymentData.method,
        description: paymentData.description || "Payment for subscription renewal",
      });
      if (result?.success) {
        toast.success("Payment initiated successfully! Payment link sent to hotel owner.");
        setCurrentPayment(result.data);
        setPaymentStatus("pending");
        setShowPaymentForm(false);
        setPaymentData({ amount: "", method: "", description: "" });
      } else {
        toast.error(result?.message || "Failed to initiate payment");
      }
    } catch {
      toast.error("An error occurred while initiating payment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartWarningTimer = async ({
    reason,
    warningStartedAt,
    warningExpiresAt,
  }: {
    reason?: string;
    warningStartedAt?: string;
    warningExpiresAt?: string;
  }) => {
    if (!selectedHotelNumericId) return;
    setWarningActionLoading(true);
    try {
      const payload: {
        durationHours?: number;
        reason?: string;
        warningStartedAt?: string;
        warningExpiresAt?: string;
      } = { reason, warningStartedAt, warningExpiresAt };
      if (!warningStartedAt || !warningExpiresAt) payload.durationHours = 24;
      await startWarningTimer(selectedHotelNumericId, payload);
      toast.success("Warning timer started");
      await mutatePlan();
    } catch (error: any) {
      toast.error(error instanceof Error ? error.message : "Failed to start warning timer");
    } finally {
      setWarningActionLoading(false);
    }
  };

  const handleCancelWarningTimer = async () => {
    if (!selectedHotelNumericId) return;
    setWarningCancelLoading(true);
    try {
      await cancelWarningTimer(selectedHotelNumericId);
      toast.success("Warning timer cleared");
      await mutatePlan();
    } catch (error: any) {
      toast.error(error instanceof Error ? error.message : "Failed to clear warning timer");
    } finally {
      setWarningCancelLoading(false);
    }
  };

  const handleReactivate = async () => {
    if (!selectedHotelNumericId) { toast.error("No business selected"); return; }
    setReactivating(true);
    try {
      await reactivateBusiness(selectedHotelNumericId);
      toast.success("Business reactivated successfully");
      await mutatePlan();
    } catch (error: any) {
      toast.error(error instanceof Error ? error.message : "Failed to reactivate business");
    } finally {
      setReactivating(false);
    }
  };

  /* ── Plan services map — lowercase keys matching actual backend values ── */
  const TIER_SERVICES: Record<string, string> = {
    "flex":               "front_office",
    "basic-hotel":        "front_office,housekeeping,stock,account",
    "basic-restaurant":   "restaurant,kitchen,stock,bar",
    "advanced":           "front_office,housekeeping,stock,account,restaurant,kitchen,bar",
    "custom":             "front_office,housekeeping,stock,account,restaurant,kitchen,bar,employee,banquet,membership,reservation",
  };

  const handleSetPlan = async (tierId: string) => {
    if (!selectedHotelId || !business) { toast.error("No business selected"); return; }
    const services = TIER_SERVICES[tierId];
    if (!services) { toast.error("Unknown tier"); return; }
    setSettingPlan(tierId);
    setConfirmPlanTierId(null);
    try {
      await updateHotelServices(selectedHotelId, services);
      // Update business context so current-plan badge refreshes everywhere
      setBusiness({ ...business, services });
      toast.success(`Plan updated to ${TIERS.find(t => t.id === tierId)?.name ?? tierId}`);
    } catch (error: any) {
      toast.error(error instanceof Error ? error.message : "Failed to update plan");
    } finally {
      setSettingPlan(null);
    }
  };

  // Determine actual plan name & price to show in PlanCard
  const displayPlanName = currentTier ? currentTier.name : (billingInfo?.plan_name || "Current Plan");
  const displayPrice = (currentTier && currentTier.monthly !== null) ? currentTier.monthly : (billingInfo?.price || 0);
  const displayTagline = currentTier ? currentTier.tagline : "Manage the subscription status for this hotel.";

  return (
    <div className="h-screen w-screen flex flex-col sm:flex-row overflow-hidden">
      <Sidebar isOpen={menuOpen} setIsOpen={setMenuOpen} />
      <div className="flex-1 flex flex-col overflow-hidden min-h-0">
        <Header isOpen={menuOpen} setIsOpen={setMenuOpen} title="Current Plan" />
        <main className="px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-10 space-y-8 bg-white overflow-y-auto overflow-x-hidden flex-1 min-h-0">

          {/* ── Billing card ───────────────────────────────────── */}
          {!selectedHotelNumericId ? (
            <div className="rounded-2xl border border-dashed border-gray-200 p-6 text-center text-sm text-gray-500">
              Select a business to view subscription details.
            </div>
          ) : isPlanLoading ? (
            <div className="rounded-2xl border border-gray-100 bg-[#FFF9F4] p-6 flex items-center gap-3 text-sm text-gray-600">
              <FaSpinner className="animate-spin" />
              Loading plan information...
            </div>
          ) : billingInfo ? (
            <PlanCard
              planName={displayPlanName}
              price={displayPrice}
              tagline={displayTagline}
              renewalDate={renewalDateLabel}
              modulesAllowed={modulesAllowed}
              billingCycle={billingInfo.billing_cycle || "monthly"}
              benefits={benefitsList}
              status={billingInfo.status}
              isExpired={billingInfo.isExpired}
              hotelActive={billingInfo.hotelActive}
              warningInfo={billingInfo.warningInfo || undefined}
              canStartWarning={canStartWarning}
              canCancelWarning={canCancelWarning}
              warningActionLoading={warningActionLoading}
              warningCancelLoading={warningCancelLoading}
              onStartWarning={handleStartWarningTimer}
              onCancelWarning={handleCancelWarningTimer}
              onUpgrade={() => { }}
              onMakePayment={() => setShowPaymentForm(true)}
              onReactivate={handleReactivate}
              reactivating={reactivating}
            />
          ) : (
            <div className="rounded-2xl border border-gray-100 bg-[#FFF9F4] p-6 text-sm text-gray-600">
              Unable to load plan information for this business.
            </div>
          )}

          {/* ── Anli Pricing Tiers ─────────────────────────────── */}
          <div className="px-2">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900">Anli Software Pricing</h2>
              <p className="text-sm text-gray-500 mt-1">
                All prices are in Nigerian Naira (₦). Annual billing saves ~17%.
              </p>
              {currentTier && (
                <div
                  className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-white text-xs font-semibold"
                  style={{ backgroundColor: currentTier.color }}
                >
                  <span>Current plan for {business?.name}:</span>
                  <span className="font-bold">{currentTier.name}</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {TIERS.map((tier) => {
                const Icon = tier.icon;
                const isActive = tier.id === currentTierId;
                return (
                  <div
                    key={tier.id}
                    className={`rounded-2xl border-2 overflow-hidden transition-all ${isActive
                        ? "shadow-lg scale-[1.02]"
                        : "border-gray-100 hover:border-gray-200 hover:shadow-sm"
                      }`}
                    style={isActive ? { borderColor: tier.color } : {}}
                  >
                    {/* Card header */}
                    <div
                      className="px-5 py-4 flex items-start justify-between"
                      style={{ backgroundColor: isActive ? tier.color : "#f9fafb" }}
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Icon
                            size={16}
                            style={{ color: isActive ? "#fff" : tier.color }}
                          />
                          <span
                            className={`text-sm font-bold ${isActive ? "text-white" : "text-gray-800"}`}
                          >
                            {tier.name}
                          </span>
                          {isActive && (
                            <span className="ml-1 px-2 py-0.5 bg-white/20 text-white text-[10px] font-bold rounded-full uppercase tracking-wider">
                              Current
                            </span>
                          )}
                        </div>
                        <p className={`text-xs ${isActive ? "text-white/80" : "text-gray-500"}`}>
                          {tier.tagline}
                        </p>
                      </div>
                      <div className="text-right">
                        <p
                          className={`text-xl font-bold ${isActive ? "text-white" : "text-gray-800"}`}
                        >
                          {formatPrice(tier.monthly)}
                        </p>
                        <p
                          className={`text-[10px] ${isActive ? "text-white/70" : "text-gray-400"}`}
                        >
                          /month
                        </p>
                      </div>
                    </div>

                    {/* Card body */}
                    <div className="p-5 space-y-4 bg-white">
                      <p className="text-xs text-gray-500 leading-relaxed">
                        {tier.description}
                      </p>

                      {tier.annually && (
                        <div className="flex items-center justify-between text-xs bg-green-50 rounded-lg px-3 py-2">
                          <span className="text-green-700 font-medium">Annual price</span>
                          <span className="text-green-800 font-bold">
                            {formatPrice(tier.annually)} / yr
                          </span>
                        </div>
                      )}
                      {tier.note && (
                        <div className="text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
                          {tier.note}
                        </div>
                      )}

                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-2">
                          Includes
                        </p>
                        <ul className="space-y-1">
                          {tier.modules.map((m) => (
                            <li key={m} className="flex items-center gap-2 text-xs text-gray-700">
                              <CheckCircle size={12} style={{ color: tier.color }} className="flex-shrink-0" />
                              {m}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="flex items-center justify-between text-xs pt-2 border-t border-gray-50">
                        <span className="text-gray-400">Onboarding</span>
                        <span
                          className={`font-medium ${tier.onboarding === "Optional (self-paced)"
                              ? "text-blue-500"
                              : "text-orange-500"
                            }`}
                        >
                          {tier.onboarding}
                        </span>
                      </div>

                      {/* ── Set plan button ── */}
                      {selectedHotelNumericId && (
                        <button
                          type="button"
                          disabled={isActive || settingPlan === tier.id}
                          onClick={() => setConfirmPlanTierId(tier.id)}
                          className={`w-full mt-2 py-2 rounded-xl text-xs font-bold transition-all ${
                            isActive
                              ? "bg-gray-100 text-gray-400 cursor-default"
                              : "text-white hover:opacity-90 active:scale-95"
                          }`}
                          style={isActive ? {} : { backgroundColor: tier.color }}
                        >
                          {settingPlan === tier.id ? (
                            <span className="flex items-center justify-center gap-1.5">
                              <FaSpinner className="animate-spin" /> Updating...
                            </span>
                          ) : isActive ? (
                            "✓ Current Plan"
                          ) : (
                            "Set as Plan"
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Add-ons + notes */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="rounded-2xl border border-dashed border-gray-200 p-5">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
                  Available Add-Ons — from ₦25,000 / month
                </p>
                <div className="flex flex-wrap gap-2">
                  {ADD_ONS.map((a) => (
                    <span
                      key={a}
                      className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700"
                    >
                      {a}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-3">
                  Available for Flex and Basic clients who want to expand their setup.
                </p>
              </div>

              <div className="rounded-2xl border border-dashed border-amber-200 bg-amber-50/50 p-5 space-y-2 text-xs text-amber-800">
                <p className="font-bold uppercase tracking-wider text-amber-600 mb-1">
                  Key Notes
                </p>
                <p>• One-time onboarding fee: <strong>₦300,000</strong></p>
                <p>• Flex & Basic — fixed modules; extras via add-ons</p>
                <p>• Advanced & Custom — all modules unlocked, no restrictions</p>
                <p>• Onboarding compulsory from Basic tier upwards (optional for Flex)</p>
              </div>
            </div>
          </div>

          {/* ── Payment Status Tracker ─────────────────────────── */}
          {currentPayment && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Payment Tracking</h2>
                <div className="flex items-center gap-2">
                  {paymentStatus === "pending" && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Clock className="h-3 w-3" /> Pending
                    </Badge>
                  )}
                  {paymentStatus === "successful" && (
                    <Badge variant="default" className="flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" /> Completed
                    </Badge>
                  )}
                  {paymentStatus === "failed" && (
                    <Badge variant="destructive" className="flex items-center gap-1">
                      <RefreshCw className="h-3 w-3" /> Failed
                    </Badge>
                  )}
                  <Button variant="outline" size="sm" onClick={() => setShowVerificationModal(true)}>
                    Manage Payment
                  </Button>
                </div>
              </div>
              <PaymentStatusTracker
                paymentId={currentPayment.paymentId}
                paymentLink={currentPayment.paymentLink}
                onStatusChange={setPaymentStatus}
              />
            </div>
          )}

          <div className="mt-5">
            <PlanHistoryTable />
          </div>
        </main>
      </div>

      {/* Payment Initiation Modal */}
      {showPaymentForm && (
        <div className="fixed inset-0 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Initiate Payment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="amount">Amount (₦)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="Enter amount"
                  value={paymentData.amount}
                  onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="method">Payment Method</Label>
                <Select
                  value={paymentData.method}
                  onValueChange={(value) => setPaymentData({ ...paymentData, method: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PAYSTACK">Paystack (Online)</SelectItem>
                    <SelectItem value="TRANSFER">Bank Transfer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Payment description"
                  value={paymentData.description}
                  onChange={(e) =>
                    setPaymentData({ ...paymentData, description: e.target.value })
                  }
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowPaymentForm(false);
                    setPaymentData({ amount: "", method: "", description: "" });
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleInitiatePayment}
                  disabled={isSubmitting}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {isSubmitting ? "Initiating..." : "Initiate Payment"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Payment Verification Modal */}
      {showVerificationModal && currentPayment && (
        <PaymentVerificationModal
          isOpen={showVerificationModal}
          onClose={() => setShowVerificationModal(false)}
          paymentId={currentPayment.paymentId}
          paymentData={{
            amount: currentPayment.amount,
            method: currentPayment.method || "PAYSTACK",
            description: currentPayment.description,
            hotelName: currentPayment.hotelName,
            hotelOwnerEmail: currentPayment.hotelOwnerEmail,
            paymentLink: currentPayment.paymentLink,
          }}
          onPaymentUpdate={setPaymentStatus}
        />
      )}
      {/* ── Confirm plan change modal ───────────────────────── */}
      {confirmPlanTierId && (() => {
        const tier = TIERS.find(t => t.id === confirmPlanTierId);
        if (!tier) return null;
        return (
          <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div
                  className="p-2.5 rounded-xl flex-shrink-0"
                  style={{ backgroundColor: `${tier.color}20` }}
                >
                  <AlertTriangle size={20} style={{ color: tier.color }} />
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">Change plan to {tier.name}?</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    This will update the services for <strong>{business?.name}</strong>.
                  </p>
                </div>
              </div>
              <div
                className="text-xs rounded-xl px-4 py-3 space-y-1"
                style={{ backgroundColor: `${tier.color}10`, color: tier.color }}
              >
                <p className="font-semibold">Modules included:</p>
                <p>{tier.modules.join(", ")}</p>
                <p className="font-semibold mt-1">
                  {tier.monthly !== null ? `₦${tier.monthly.toLocaleString("en-NG")} / month` : "Custom pricing"}
                </p>
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setConfirmPlanTierId(null)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleSetPlan(confirmPlanTierId)}
                  disabled={settingPlan === confirmPlanTierId}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white transition-all hover:opacity-90 active:scale-95"
                  style={{ backgroundColor: tier.color }}
                >
                  {settingPlan === confirmPlanTierId ? (
                    <span className="flex items-center justify-center gap-1.5">
                      <FaSpinner className="animate-spin" /> Updating...
                    </span>
                  ) : (
                    "Confirm"
                  )}
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
