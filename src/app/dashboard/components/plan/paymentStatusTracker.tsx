"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import { getPaymentStatus, verifyPayment } from "@/app/actions/payments";
import { toast } from "sonner";

interface PaymentStatusTrackerProps {
  paymentId: string;
  paymentLink?: string;
  onStatusChange?: (status: string) => void;
}

type PaymentStatus = "pending" | "successful" | "failed";

interface PaymentData {
  id: string;
  amount: number;
  status: PaymentStatus;
  method: string;
  description?: string;
  createdAt: string;
  expiresAt?: string;
  completedAt?: string;
  paymentLink?: string;
  hotelName?: string;
  hotelOwnerEmail?: string;
}

export function PaymentStatusTracker({
  paymentId,
  paymentLink,
  onStatusChange,
}: PaymentStatusTrackerProps) {
  const [payment, setPayment] = useState<PaymentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchPaymentStatus = async () => {
    try {
      const response = await getPaymentStatus(paymentId);
      if (response?.success) {
        setPayment(response.data);
        onStatusChange?.(response.data.status);
      }
    } catch (error: any) {
      console.error("Failed to fetch payment status:", error);
      toast.error("Failed to fetch payment status");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleVerifyPayment = async () => {
    setIsVerifying(true);
    try {
      const response = await verifyPayment(paymentId);
      if (response?.success) {
        toast.success("Payment verified successfully!");
        await fetchPaymentStatus(); // Refresh status
      } else {
        toast.error(response?.message || "Failed to verify payment");
      }
    } catch (error: any) {
      console.error("Failed to verify payment:", error);
      toast.error("Failed to verify payment");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchPaymentStatus();
  };

  useEffect(() => {
    fetchPaymentStatus();

    // Set up polling for pending payments
    const interval = setInterval(() => {
      if (payment?.status === "pending") {
        fetchPaymentStatus();
      }
    }, 10000); // Poll every 10 seconds for pending payments

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentId, payment?.status]);

  const getStatusIcon = (status: PaymentStatus) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "successful":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: PaymentStatus) => {
    const variants = {
      pending: "secondary",
      successful: "default",
      failed: "destructive",
    } as const;

    return (
      <Badge variant={variants[status]} className="flex items-center gap-1">
        {getStatusIcon(status)}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
    }).format(amount);
  };

  const isExpired =
    payment?.expiresAt && new Date(payment.expiresAt) < new Date();
  const isPending = payment?.status === "pending";

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin text-gray-500" />
            <span className="ml-2 text-gray-500">
              Loading payment status...
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!payment) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            <XCircle className="h-8 w-8 mx-auto mb-2 text-red-500" />
            <p>Payment not found</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Payment Status</CardTitle>
          <div className="flex items-center gap-2">
            {getStatusBadge(payment.status)}
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw
                className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
              />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Payment Details */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Amount:</span>
            <p className="font-semibold">{formatAmount(payment.amount)}</p>
          </div>
          <div>
            <span className="text-gray-500">Method:</span>
            <p className="font-semibold">{payment.method.toUpperCase()}</p>
          </div>
          <div>
            <span className="text-gray-500">Created:</span>
            <p className="font-semibold">{formatDate(payment.createdAt)}</p>
          </div>
          {payment.expiresAt && (
            <div>
              <span className="text-gray-500">Expires:</span>
              <p className={`font-semibold ${isExpired ? "text-red-500" : ""}`}>
                {formatDate(payment.expiresAt)}
              </p>
            </div>
          )}
          {payment.completedAt && (
            <div className="col-span-2">
              <span className="text-gray-500">Completed:</span>
              <p className="font-semibold">{formatDate(payment.completedAt)}</p>
            </div>
          )}
        </div>

        {/* Description */}
        {payment.description && (
          <div>
            <span className="text-gray-500 text-sm">Description:</span>
            <p className="text-sm">{payment.description}</p>
          </div>
        )}

        {/* Hotel Info */}
        {payment.hotelName && (
          <div>
            <span className="text-gray-500 text-sm">Hotel:</span>
            <p className="text-sm font-semibold">{payment.hotelName}</p>
            {payment.hotelOwnerEmail && (
              <p className="text-xs text-gray-500">{payment.hotelOwnerEmail}</p>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-4 border-t">
          {paymentLink && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(paymentLink, "_blank")}
              className="flex items-center gap-1"
            >
              <ExternalLink className="h-4 w-4" />
              View Payment Link
            </Button>
          )}

          {isPending && !isExpired && (
            <Button
              onClick={handleVerifyPayment}
              disabled={isVerifying}
              size="sm"
              className="flex items-center gap-1"
            >
              {isVerifying ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle className="h-4 w-4" />
              )}
              {isVerifying ? "Verifying..." : "Verify Payment"}
            </Button>
          )}

          {isExpired && isPending && (
            <div className="text-sm text-red-500">Payment link has expired</div>
          )}
        </div>

        {/* Status Messages */}
        {isPending && !isExpired && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-yellow-600" />
              <span className="text-sm text-yellow-800">
                Payment is pending. The hotel owner has been notified via email.
              </span>
            </div>
          </div>
        )}

        {payment.status === "successful" && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-800">
                Payment completed successfully! Subscription has been renewed.
              </span>
            </div>
          </div>
        )}

        {payment.status === "failed" && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-600" />
              <span className="text-sm text-red-800">
                Payment failed or was cancelled.
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
