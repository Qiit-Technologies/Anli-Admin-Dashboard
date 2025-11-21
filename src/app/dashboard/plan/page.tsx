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
import { CheckCircle, Clock, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useBusiness } from "@/context/businessContext";
import { initiatePayment } from "@/app/actions/payments";
import useSWR from "swr";
import fetcher from "@/app/actions/fetcher";
import { getPlanResponse } from "@/app/actions/types";
import { cancelWarningTimer, startWarningTimer } from "@/app/actions/plan";
import { FaSpinner } from "react-icons/fa";

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
  const { business } = useBusiness();
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
      } catch (error) {
        // Handle 404 gracefully - hotel might not have a subscription yet
        const axiosError = error as {
          response?: { status?: number };
          status?: number;
        };
        const status = axiosError?.response?.status || axiosError?.status;
        if (status === 404) {
          console.warn(
            "Subscription not found for hotel:",
            selectedHotelNumericId
          );
          return undefined;
        }
        // Re-throw other errors so SWR can handle them
        throw error;
      }
    },
    {
      onErrorRetry: (error, key, config, revalidate, { retryCount }) => {
        // Don't retry on 404 errors
        const axiosError = error as {
          response?: { status?: number };
          status?: number;
        };
        const status = axiosError?.response?.status || axiosError?.status;
        if (status === 404) {
          return;
        }
        // Retry up to 3 times for other errors
        if (retryCount >= 3) return;
        setTimeout(() => revalidate({ retryCount }), 5000);
      },
      onError: (error) => {
        // Suppress 404 errors - they're expected when hotel has no subscription
        const axiosError = error as {
          response?: { status?: number };
          status?: number;
        };
        const status = axiosError?.response?.status || axiosError?.status;
        if (status === 404) {
          // Don't treat 404 as an error - it's expected
          return;
        }
        // Let other errors propagate normally
      },
    }
  );

  // Log error for debugging (only non-404 errors) - use useEffect to avoid render-time logging
  useEffect(() => {
    if (!planError) return;

    // Check for 404 status in various possible error structures
    const axiosError = planError as {
      response?: { status?: number };
      status?: number;
      code?: string;
    };
    const status = axiosError?.response?.status || axiosError?.status;

    // Don't log 404 errors - they're expected when hotel has no subscription
    if (status === 404) {
      return;
    }

    // Log other errors
    console.error("Plan fetch error:", planError);
  }, [planError]);

  const billingInfo = planResponse?.data.billingInfo;
  const renewalDateLabel = billingInfo?.renewal_date
    ? new Date(billingInfo.renewal_date).toLocaleString(undefined, {
        dateStyle: "long",
        timeStyle: "short",
      })
    : "Not available";
  const modulesAllowed = (() => {
    if (!billingInfo?.modules) return 0;
    if (Array.isArray(billingInfo.modules)) {
      return billingInfo.modules.length;
    }
    return billingInfo.modules.split(",").filter(Boolean).length;
  })();
  const benefitsList = (() => {
    if (!billingInfo?.modules) return "—";
    if (Array.isArray(billingInfo.modules)) {
      return billingInfo.modules.join(", ");
    }
    return billingInfo.modules;
  })();

  const canStartWarning =
    Boolean(billingInfo?.isExpired) && !billingInfo?.warningInfo?.isActive;
  const canCancelWarning = Boolean(billingInfo?.warningInfo?.isActive);

  const handleInitiatePayment = async () => {
    if (!paymentData.amount || !paymentData.method) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      if (!selectedHotelId) {
        toast.error("No business selected");
        return;
      }

      const result = await initiatePayment({
        businessId: selectedHotelId,
        amount: parseFloat(paymentData.amount),
        method: paymentData.method,
        description:
          paymentData.description || "Payment for subscription renewal",
      });

      if (result?.success) {
        toast.success(
          "Payment initiated successfully! Payment link sent to hotel owner."
        );
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
      } = {
        reason,
        warningStartedAt,
        warningExpiresAt,
      };
      if (!warningStartedAt || !warningExpiresAt) {
        payload.durationHours = 24;
      }
      await startWarningTimer(selectedHotelNumericId, payload);
      toast.success("Warning timer started");
      await mutatePlan();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to start warning timer"
      );
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
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to clear warning timer"
      );
    } finally {
      setWarningCancelLoading(false);
    }
  };

  const handleUpgradePlan = () => {
    // Handle upgrade plan logic here
    toast.info("Upgrade plan functionality - to be implemented");
  };

  console.log(billingInfo);
  return (
    <div className="h-screen flex flex-col sm:flex-row overflow-hidden">
      <Sidebar isOpen={menuOpen} setIsOpen={setMenuOpen} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          isOpen={menuOpen}
          setIsOpen={setMenuOpen}
          title="Current Plan"
        />
        <main className="px-4 sm:px-8 md:px-12 py-10 space-y-6 bg-white overflow-y-auto overflow-x-hidden flex-1">
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
              planName={billingInfo.plan_name || "Current Plan"}
              price={billingInfo.price || 0}
              tagline={
                billingInfo.plan_name?.toLowerCase() === "freemium"
                  ? "Our most popular plan."
                  : "Manage the subscription status for this hotel."
              }
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
              onUpgrade={handleUpgradePlan}
              onMakePayment={() => setShowPaymentForm(true)}
            />
          ) : (
            <div className="rounded-2xl border border-gray-100 bg-[#FFF9F4] p-6 text-sm text-gray-600">
              Unable to load plan information for this business.
            </div>
          )}

          {/* Payment Status Tracker */}
          {currentPayment && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Payment Tracking</h2>
                <div className="flex items-center gap-2">
                  {paymentStatus === "pending" && (
                    <Badge
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      <Clock className="h-3 w-3" />
                      Pending
                    </Badge>
                  )}
                  {paymentStatus === "successful" && (
                    <Badge
                      variant="default"
                      className="flex items-center gap-1"
                    >
                      <CheckCircle className="h-3 w-3" />
                      Completed
                    </Badge>
                  )}
                  {paymentStatus === "failed" && (
                    <Badge
                      variant="destructive"
                      className="flex items-center gap-1"
                    >
                      <RefreshCw className="h-3 w-3" />
                      Failed
                    </Badge>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowVerificationModal(true)}
                  >
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
        <div className="fixed inset-0 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Initiate Payment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="amount">Amount (₦)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="Enter amount"
                  value={paymentData.amount}
                  onChange={(e) =>
                    setPaymentData({ ...paymentData, amount: e.target.value })
                  }
                />
              </div>

              <div>
                <Label htmlFor="method">Payment Method</Label>
                <Select
                  value={paymentData.method}
                  onValueChange={(value) =>
                    setPaymentData({ ...paymentData, method: value })
                  }
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
                    setPaymentData({
                      ...paymentData,
                      description: e.target.value,
                    })
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
    </div>
  );
}
