"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@/components/common/customTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle, Clock, ExternalLink } from "lucide-react";
import { toast } from "sonner";

interface PaymentStatus {
  id: string;
  amount: number;
  method: string;
  status: string;
  paymentLink?: string;
  createdAt: string;
  expiresAt?: string;
  completedAt?: string;
  description?: string;
}

interface PaymentStatusTableProps {
  hotelId: number;
  hotelName: string;
}

export default function PaymentStatusTable({
  hotelId,
  hotelName,
}: PaymentStatusTableProps) {
  const [payments, setPayments] = useState<PaymentStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPayments = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/super-admin/${hotelId}/billing/payment-history`
      );
      const result = await response.json();

      if (result.success) {
        setPayments(result.data.payments);
      } else {
        toast.error("Failed to fetch payment history");
      }
    } catch {
      toast.error("Error fetching payment history");
    } finally {
      setIsLoading(false);
    }
  }, [hotelId]);

  useEffect(() => {
    fetchPayments();
  }, [hotelId, fetchPayments]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "successful":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: "default" as const, label: "Pending" },
      successful: { variant: "default" as const, label: "Successful" },
      failed: { variant: "destructive" as const, label: "Failed" },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || {
      variant: "secondary" as const,
      label: status,
    };

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        {getStatusIcon(status)}
        {config.label}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
    }).format(amount);
  };

  const handleMarkCompleted = async (paymentId: string) => {
    try {
      const response = await fetch(
        `/api/super-admin/billing/mark-payment-completed`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            paymentId,
            notes: "Marked as completed by admin",
          }),
        }
      );

      const result = await response.json();

      if (result.success) {
        toast.success("Payment marked as completed");
        fetchPayments(); // Refresh the list
      } else {
        toast.error("Failed to mark payment as completed");
      }
    } catch {
      toast.error("Error marking payment as completed");
    }
  };

  const handleCancelPayment = async (paymentId: string) => {
    try {
      const response = await fetch(
        `/api/super-admin/billing/payment/${paymentId}/cancel`,
        {
          method: "PUT",
        }
      );

      const result = await response.json();

      if (result.success) {
        toast.success("Payment cancelled");
        fetchPayments(); // Refresh the list
      } else {
        toast.error("Failed to cancel payment");
      }
    } catch {
      toast.error("Error cancelling payment");
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Payment Status for {hotelName}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Status for {hotelName}</CardTitle>
      </CardHeader>
      <CardContent>
        {payments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No payment requests found for this hotel.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <Thead>
                <Tr>
                  <Th>Amount</Th>
                  <Th>Type</Th>
                  <Th>Status</Th>
                  <Th>Created</Th>
                  <Th>Expires</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {payments.map((payment) => (
                  <Tr key={payment.id}>
                    <Td className="font-medium">
                      {formatAmount(payment.amount)}
                    </Td>
                    <Td className="capitalize">{payment.method}</Td>
                    <Td>{getStatusBadge(payment.status)}</Td>
                    <Td>{formatDate(payment.createdAt)}</Td>
                    <Td>
                      {payment.expiresAt ? formatDate(payment.expiresAt) : "-"}
                    </Td>
                    <Td>
                      <div className="flex items-center gap-2">
                        {payment.paymentLink &&
                          payment.status === "pending" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => window.open(payment.paymentLink)}
                            >
                              <ExternalLink className="h-3 w-3 mr-1" />
                              View Link
                            </Button>
                          )}
                        {payment.status === "pending" && (
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => handleMarkCompleted(payment.id)}
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Mark Paid
                          </Button>
                        )}
                        {payment.status === "pending" && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleCancelPayment(payment.id)}
                          >
                            <XCircle className="h-3 w-3 mr-1" />
                            Cancel
                          </Button>
                        )}
                      </div>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
