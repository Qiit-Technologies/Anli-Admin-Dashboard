/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { ArrowDown, Calendar, ListFilterIcon } from "lucide-react";
import { Divider } from "../divider";
import {
  StatusBadge,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@/components/common/customTable";
import { useBusiness } from "@/context/businessContext";
import { getPaymentHistory } from "@/app/actions/payments";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FaSpinner } from "react-icons/fa";
import { toast } from "sonner";

interface Payment {
  id: string;
  amount: number;
  method: string;
  status: string;
  createdAt: string;
  completedAt?: string;
  description?: string;
}

export default function PaymentTable() {
  const { business } = useBusiness();
  const router = useRouter();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState<{
    start?: string;
    end?: string;
  }>({});
  const [statusFilter, setStatusFilter] = useState<string>("");

  const [showFilters, setShowFilters] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    if (business?.id) {
      fetchPayments();
    }
  }, [business?.id, statusFilter, dateFilter]);

  const fetchPayments = async () => {
    if (!business?.id) return;

    setIsLoading(true);
    try {
      const response = await getPaymentHistory(business.id.toString());
      if (response?.data?.paymentHistory) {
        let filteredPayments = response.data.paymentHistory;

        // Apply status filter
        if (statusFilter && statusFilter !== "all" && statusFilter !== "") {
          filteredPayments = filteredPayments.filter(
            (p: Payment) =>
              p.status.toLowerCase() === statusFilter.toLowerCase(),
          );
        }

        // Apply date filter
        if (dateFilter.start && dateFilter.end) {
          filteredPayments = filteredPayments.filter((p: Payment) => {
            const paymentDate = new Date(p.createdAt);
            const startDate = new Date(dateFilter.start!);
            const endDate = new Date(dateFilter.end!);
            // Normalize dates to start of day for accurate comparison
            paymentDate.setHours(0, 0, 0, 0);
            startDate.setHours(0, 0, 0, 0);
            endDate.setHours(23, 59, 59, 999);
            return paymentDate >= startDate && paymentDate <= endDate;
          });
        }

        // Sort by date (newest first) and limit to 5 most recent
        filteredPayments = filteredPayments
          .sort(
            (a: Payment, b: Payment) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          )
          .slice(0, 5);

        setPayments(filteredPayments);
      }
    } catch (error: any) {
      console.error("Failed to fetch payments:", error);
      toast.error("Failed to load payment history");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatAmount = (amount: number) => {
    return `₦${Number(amount).toLocaleString("en-NG", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const getStatusLabel = (status: string) => {
    const statusMap: Record<string, string> = {
      completed: "Paid",
      pending: "Pending",
      failed: "Failed",
      cancelled: "Cancelled",
    };
    return statusMap[status.toLowerCase()] || status;
  };

  const handleViewPayment = (paymentId: string) => {
    router.push(`/dashboard/payments`);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      {/* Header */}
      <div className="flex flex-col px-4 sm:px-6 py-4 sm:flex-row justify-between items-start sm:items-center gap-3">
        <h2 className="text-base sm:text-lg font-normal text-[#101828]">
          Current Payment Transaction
        </h2>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <button
            onClick={() => {
              setShowDatePicker(!showDatePicker);
              setShowFilters(false);
            }}
            className={`flex items-center justify-center gap-2 border rounded-md px-3 py-2 text-sm w-full sm:w-auto transition-colors ${
              showDatePicker
                ? "bg-blue-50 border-blue-300 text-blue-700"
                : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            <Calendar size={16} />
            Select dates
          </button>
          <button
            onClick={() => {
              setShowFilters(!showFilters);
              setShowDatePicker(false);
            }}
            className={`flex items-center justify-center gap-2 border rounded-md px-3 py-2 text-sm w-full sm:w-auto transition-colors ${
              showFilters
                ? "bg-blue-50 border-blue-300 text-blue-700"
                : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            <ListFilterIcon size={16} />
            Filters
          </button>
        </div>
      </div>

      {/* Date Picker Panel */}
      {showDatePicker && (
        <div className="px-6 py-4 bg-gray-50 border-b">
          <div className="flex flex-col sm:flex-row gap-4 items-end sm:items-center">
            <div className="flex flex-col sm:flex-row gap-4">
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">
                  Start Date
                </label>
                <input
                  type="date"
                  value={dateFilter.start || ""}
                  onChange={(e) =>
                    setDateFilter((prev) => ({
                      ...prev,
                      start: e.target.value,
                    }))
                  }
                  className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">
                  End Date
                </label>
                <input
                  type="date"
                  value={dateFilter.end || ""}
                  onChange={(e) =>
                    setDateFilter((prev) => ({
                      ...prev,
                      end: e.target.value,
                    }))
                  }
                  className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-2 mb-1">
              <button
                onClick={() => setDateFilter({})}
                className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800"
              >
                Clear
              </button>
              <button
                onClick={() => setShowDatePicker(false)}
                className="px-4 py-2 text-sm bg-white border rounded-md hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filters Panel */}
      {showFilters && (
        <div className="px-6 py-4 bg-gray-50 border-b">
          <div className="flex flex-col sm:flex-row gap-4 items-end sm:items-center">
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">
                Status
              </label>
              <select
                value={statusFilter || "all"}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border rounded-md px-3 py-2 text-sm min-w-[150px] focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="completed">Paid</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div className="flex gap-2 mb-1">
              <button
                onClick={() => setStatusFilter("all")}
                className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800"
              >
                Clear
              </button>
              <button
                onClick={() => setShowFilters(false)}
                className="px-4 py-2 text-sm bg-white border rounded-md hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <Divider className="mb-4" />
      {/* Table */}
      <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <FaSpinner className="animate-spin text-gray-400" size={24} />
          </div>
        ) : payments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No payment transactions found
          </div>
        ) : (
          <Table minWidth="500px">
            <Thead>
              <Tr>
                <Th withIcon>Date</Th>
                <Th withIcon>Amount</Th>
                <Th withIcon>Payment Method</Th>
                <Th withIcon icon={<ArrowDown size={16} color="#667085" />}>
                  Status
                </Th>
                <Th withIcon>Action</Th>
              </Tr>
            </Thead>
            <Tbody>
              {payments.map((payment) => (
                <Tr key={payment.id}>
                  <Td>{formatDate(payment.createdAt)}</Td>
                  <Td>{formatAmount(payment.amount)}</Td>
                  <Td>{payment.method || "N/A"}</Td>
                  <Td>
                    <StatusBadge
                      status={getStatusLabel(payment.status)}
                      statusColorMap={{
                        unpaid: "yellow",
                        paid: "green",
                        pending: "yellow",
                        failed: "red",
                        cancelled: "gray",
                      }}
                    />
                  </Td>
                  <Td>
                    <button
                      onClick={() => handleViewPayment(payment.id)}
                      className="text-blue-600 hover:underline cursor-pointer"
                    >
                      View
                    </button>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        )}
      </div>
    </div>
  );
}
