"use client";

import { useState, useEffect, useCallback } from "react";
import Header from "../components/layout/header";
import Sidebar from "../components/layout/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { toast } from "sonner";
import { useBusiness } from "@/context/businessContext";

interface Payment {
  id: string;
  amount: number;
  status: string;
  method: string;
  description: string;
  paymentLink?: string;
  createdAt: string;
  completedAt?: string;
  initiatedBy: string;
}

export default function PaymentHistoryPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const { business } = useBusiness();
  const selectedHotelId = business?.id ? String(business.id) : "";
  const [paymentData, setPaymentData] = useState({
    amount: "",
    method: "",
    description: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchPayments = useCallback(async () => {
    if (!selectedHotelId) return;

    setLoading(true);
    try {
      const authToken = localStorage.getItem("authToken");
      if (!process.env.NEXT_PUBLIC_API_URL) {
        toast.error("API base URL is not set");
        return;
      }
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/super-admin/${selectedHotelId}/billing/payment-history`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      const result = await response.json();
      if (result.success) {
        setPayments(result.data.payments || []);
      } else {
        toast.error("Failed to fetch payment history");
      }
    } catch {
      toast.error("An error occurred while fetching payments");
    } finally {
      setLoading(false);
    }
  }, [selectedHotelId]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const handleInitiatePayment = async () => {
    if (!paymentData.amount || !paymentData.method) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const authToken = localStorage.getItem("authToken");
      if (!process.env.NEXT_PUBLIC_API_URL) {
        toast.error("API base URL is not set");
        return;
      }
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/super-admin/${selectedHotelId}/billing/initiate-payment`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            amount: parseFloat(paymentData.amount),
            method: paymentData.method,
            description:
              paymentData.description || "Payment for subscription renewal",
          }),
        }
      );

      const result = await response.json();

      if (result.success) {
        toast.success(
          "Payment initiated successfully! Payment link sent to hotel owner."
        );
        setShowPaymentForm(false);
        setPaymentData({ amount: "", method: "", description: "" });
        fetchPayments(); // Refresh the payments list
      } else {
        toast.error(result.message || "Failed to initiate payment");
      }
    } catch {
      toast.error("An error occurred while initiating payment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMarkAsPaid = async (paymentId: string) => {
    try {
      const authToken = localStorage.getItem("authToken");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/super-admin/billing/mark-payment-completed`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            paymentId,
            transactionReference: `MANUAL_${Date.now()}`,
          }),
        }
      );

      const result = await response.json();
      if (result.success) {
        toast.success("Payment marked as completed");
        fetchPayments(); // Refresh the list
      } else {
        toast.error(result.message || "Failed to mark payment as completed");
      }
    } catch {
      toast.error("An error occurred while updating payment");
    }
  };

  const handleCancelPayment = async (paymentId: string) => {
    try {
      const authToken = localStorage.getItem("authToken");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/super-admin/billing/payment/${paymentId}/cancel`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      const result = await response.json();
      if (result.success) {
        toast.success("Payment cancelled successfully");
        fetchPayments(); // Refresh the list
      } else {
        toast.error(result.message || "Failed to cancel payment");
      }
    } catch {
      toast.error("An error occurred while cancelling payment");
    }
  };

  return (
    <div className="min-h-screen flex flex-col sm:flex-row">
      <Sidebar isOpen={menuOpen} setIsOpen={setMenuOpen} />
      <div className="flex-1 flex flex-col">
        <Header
          isOpen={menuOpen}
          setIsOpen={setMenuOpen}
          title="Payment Management"
        />
        <main className="px-4 sm:px-8 md:px-12 py-10 space-y-6 bg-white">
          {/* Payment Management Section */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-6">
                <Button
                  onClick={() => setShowPaymentForm(true)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Initiate Payment
                </Button>
                <Button variant="outline" onClick={fetchPayments}>
                  Refresh Payments
                </Button>
              </div>

              {/* Payment Status Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold">{payments.length}</div>
                  <div className="text-sm text-gray-600">Total Payments</div>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">
                    {payments.filter((p) => p.status === "PENDING").length}
                  </div>
                  <div className="text-sm text-gray-600">Pending</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {payments.filter((p) => p.status === "SUCCESSFUL").length}
                  </div>
                  <div className="text-sm text-gray-600">Completed</div>
                </div>
              </div>

              {/* Payment History Table */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Payment History</h3>
                {loading ? (
                  <div className="text-center py-8">Loading payments...</div>
                ) : payments.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No payments found
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4">Date</th>
                          <th className="text-left py-3 px-4">Amount</th>
                          <th className="text-left py-3 px-4">Method</th>
                          <th className="text-left py-3 px-4">Status</th>
                          <th className="text-left py-3 px-4">Description</th>
                          <th className="text-left py-3 px-4">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {payments.map((payment) => (
                          <tr key={payment.id} className="border-b">
                            <td className="py-3 px-4">
                              {new Date(payment.createdAt).toLocaleDateString()}
                            </td>
                            <td className="py-3 px-4">
                              ₦{payment.amount.toLocaleString()}
                            </td>
                            <td className="py-3 px-4">{payment.method}</td>
                            <td className="py-3 px-4">
                              <Badge
                                variant={
                                  payment.status === "SUCCESSFUL"
                                    ? "default"
                                    : payment.status === "PENDING"
                                    ? "secondary"
                                    : "destructive"
                                }
                              >
                                {payment.status}
                              </Badge>
                            </td>
                            <td className="py-3 px-4">{payment.description}</td>
                            <td className="py-3 px-4">
                              <div className="flex gap-2">
                                {payment.paymentLink && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                      window.open(payment.paymentLink, "_blank")
                                    }
                                  >
                                    View Link
                                  </Button>
                                )}
                                {payment.status === "PENDING" && (
                                  <>
                                    <Button
                                      size="sm"
                                      onClick={() =>
                                        handleMarkAsPaid(payment.id)
                                      }
                                    >
                                      Mark Paid
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      onClick={() =>
                                        handleCancelPayment(payment.id)
                                      }
                                    >
                                      Cancel
                                    </Button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>

      {/* Payment Initiation Modal */}
      {showPaymentForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
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
    </div>
  );
}
