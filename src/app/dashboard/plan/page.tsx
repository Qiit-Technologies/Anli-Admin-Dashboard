"use client";

import { PlanCard } from "../components/plan/planCard";
import PlanHistoryTable from "../components/plan/planHistoryTable";
import { PaymentStatusTracker } from "../components/plan/paymentStatusTracker";
import { PaymentVerificationModal } from "../components/plan/paymentVerificationModal";
import Header from "../components/layout/header";
import Sidebar from "../components/layout/sidebar";
import { useState } from "react";
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
  const [paymentData, setPaymentData] = useState({
    amount: "",
    method: "",
    description: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleUpgradePlan = () => {
    // Handle upgrade plan logic here
    toast.info("Upgrade plan functionality - to be implemented");
  };

  return (
    <div className="min-h-screen flex flex-col sm:flex-row">
      <Sidebar isOpen={menuOpen} setIsOpen={setMenuOpen} />
      <div className="flex-1 flex flex-col">
        <Header
          isOpen={menuOpen}
          setIsOpen={setMenuOpen}
          title="Current Plan"
        />
        <main className="px-4 sm:px-8 md:px-12 py-10 space-y-6 bg-white">
          <PlanCard
            planName="Free plan"
            price={0}
            tagline="Our most popular plan."
            renewalDate="July 15, 2025, 3 days left"
            modulesAllowed={5}
            billingCycle="Monthly"
            benefits="Housekeeping Automation, Advanced Reports, Priority Support"
            onUpgrade={handleUpgradePlan}
            onMakePayment={() => setShowPaymentForm(true)}
          />

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
