"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  CheckCircle,
  XCircle,
  RefreshCw,
  ExternalLink,
  AlertCircle,
} from "lucide-react";
import {
  verifyPayment,
  markPaymentCompleted,
  cancelPayment,
} from "@/app/actions/payments";
import { toast } from "sonner";

interface PaymentVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  paymentId: string;
  paymentData: {
    amount: number;
    method: string;
    description?: string;
    hotelName?: string;
    hotelOwnerEmail?: string;
    paymentLink?: string;
  };
  onPaymentUpdate?: (status: string) => void;
}

export function PaymentVerificationModal({
  isOpen,
  onClose,
  paymentId,
  paymentData,
  onPaymentUpdate,
}: PaymentVerificationModalProps) {
  const [isVerifying, setIsVerifying] = useState(false);
  const [isMarkingCompleted, setIsMarkingCompleted] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [manualTransactionRef, setManualTransactionRef] = useState("");
  const [notes, setNotes] = useState("");
  const [verificationStep, setVerificationStep] = useState<
    "verify" | "manual" | "cancel"
  >("verify");

  const handleVerifyPayment = async () => {
    setIsVerifying(true);
    try {
      const response = await verifyPayment(paymentId);
      if (response?.success) {
        toast.success("Payment verified successfully!");
        onPaymentUpdate?.("successful");
        onClose();
      } else {
        toast.error(response?.message || "Payment verification failed");
      }
    } catch (error) {
      console.error("Failed to verify payment:", error);
      toast.error("Failed to verify payment");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleMarkAsCompleted = async () => {
    if (!manualTransactionRef.trim()) {
      toast.error("Please enter a transaction reference");
      return;
    }

    setIsMarkingCompleted(true);
    try {
      const response = await markPaymentCompleted(paymentId);
      if (response?.success) {
        toast.success("Payment marked as completed!");
        onPaymentUpdate?.("successful");
        onClose();
      } else {
        toast.error(response?.message || "Failed to mark payment as completed");
      }
    } catch (error) {
      console.error("Failed to mark payment as completed:", error);
      toast.error("Failed to mark payment as completed");
    } finally {
      setIsMarkingCompleted(false);
    }
  };

  const handleCancelPayment = async () => {
    setIsCancelling(true);
    try {
      const response = await cancelPayment(paymentId);
      if (response?.success) {
        toast.success("Payment cancelled successfully!");
        onPaymentUpdate?.("failed");
        onClose();
      } else {
        toast.error(response?.message || "Failed to cancel payment");
      }
    } catch (error) {
      console.error("Failed to cancel payment:", error);
      toast.error("Failed to cancel payment");
    } finally {
      setIsCancelling(false);
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
    }).format(amount);
  };

  const resetModal = () => {
    setVerificationStep("verify");
    setManualTransactionRef("");
    setNotes("");
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-blue-600" />
            Payment Verification
          </DialogTitle>
          <DialogDescription>
            Verify or manage the payment status for this transaction
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Payment Details */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Payment Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Amount:</span>
                  <p className="font-semibold">
                    {formatAmount(paymentData.amount)}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Method:</span>
                  <p className="font-semibold">
                    {paymentData.method.toUpperCase()}
                  </p>
                </div>
                {paymentData.hotelName && (
                  <div className="col-span-2">
                    <span className="text-gray-500">Hotel:</span>
                    <p className="font-semibold">{paymentData.hotelName}</p>
                    {paymentData.hotelOwnerEmail && (
                      <p className="text-xs text-gray-500">
                        {paymentData.hotelOwnerEmail}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {paymentData.description && (
                <div>
                  <span className="text-gray-500 text-sm">Description:</span>
                  <p className="text-sm">{paymentData.description}</p>
                </div>
              )}

              {paymentData.paymentLink && (
                <div className="pt-2 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      window.open(paymentData.paymentLink, "_blank")
                    }
                    className="flex items-center gap-1"
                  >
                    <ExternalLink className="h-4 w-4" />
                    View Payment Link
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Verification Options */}
          <div className="space-y-4">
            <div className="flex gap-2">
              <Button
                variant={verificationStep === "verify" ? "default" : "outline"}
                onClick={() => setVerificationStep("verify")}
                className="flex items-center gap-1"
              >
                <RefreshCw className="h-4 w-4" />
                Auto Verify
              </Button>
              <Button
                variant={verificationStep === "manual" ? "default" : "outline"}
                onClick={() => setVerificationStep("manual")}
                className="flex items-center gap-1"
              >
                <CheckCircle className="h-4 w-4" />
                Manual Complete
              </Button>
              <Button
                variant={
                  verificationStep === "cancel" ? "destructive" : "outline"
                }
                onClick={() => setVerificationStep("cancel")}
                className="flex items-center gap-1"
              >
                <XCircle className="h-4 w-4" />
                Cancel Payment
              </Button>
            </div>

            {/* Auto Verify */}
            {verificationStep === "verify" && (
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <RefreshCw className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div className="space-y-2">
                      <h4 className="font-semibold text-blue-900">
                        Automatic Verification
                      </h4>
                      <p className="text-sm text-blue-800">
                        This will check with Paystack to verify if the payment
                        has been completed.
                      </p>
                      <Button
                        onClick={handleVerifyPayment}
                        disabled={isVerifying}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        {isVerifying ? (
                          <>
                            <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                            Verifying...
                          </>
                        ) : (
                          "Verify Payment"
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Manual Complete */}
            {verificationStep === "manual" && (
              <Card className="bg-green-50 border-green-200">
                <CardContent className="p-4 space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-green-900">
                        Manual Completion
                      </h4>
                      <p className="text-sm text-green-800">
                        Mark this payment as completed manually (e.g., bank
                        transfer received).
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="transactionRef">
                        Transaction Reference *
                      </Label>
                      <Input
                        id="transactionRef"
                        placeholder="Enter transaction reference"
                        value={manualTransactionRef}
                        onChange={(e) =>
                          setManualTransactionRef(e.target.value)
                        }
                      />
                    </div>

                    <div>
                      <Label htmlFor="notes">Notes (Optional)</Label>
                      <Textarea
                        id="notes"
                        placeholder="Add any additional notes..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={3}
                      />
                    </div>

                    <Button
                      onClick={handleMarkAsCompleted}
                      disabled={
                        isMarkingCompleted || !manualTransactionRef.trim()
                      }
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {isMarkingCompleted ? (
                        <>
                          <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                          Marking Complete...
                        </>
                      ) : (
                        "Mark as Completed"
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Cancel Payment */}
            {verificationStep === "cancel" && (
              <Card className="bg-red-50 border-red-200">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                    <div className="space-y-2">
                      <h4 className="font-semibold text-red-900">
                        Cancel Payment
                      </h4>
                      <p className="text-sm text-red-800">
                        This will mark the payment as failed/cancelled. This
                        action cannot be undone.
                      </p>
                      <Button
                        variant="destructive"
                        onClick={handleCancelPayment}
                        disabled={isCancelling}
                      >
                        {isCancelling ? (
                          <>
                            <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                            Cancelling...
                          </>
                        ) : (
                          "Cancel Payment"
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={handleClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
