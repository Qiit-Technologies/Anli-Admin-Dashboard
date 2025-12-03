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

  useEffect(() => {
    if (business?.id) {
      fetchPayments();
    }
  }, [business?.id]);

  const fetchPayments = async () => {
    if (!business?.id) return;

    setIsLoading(true);
    try {
      const response = await getPaymentHistory(business.id.toString());
      if (response?.data?.paymentHistory) {
        let filteredPayments = response.data.paymentHistory;

        // Apply status filter
        if (statusFilter) {
          filteredPayments = filteredPayments.filter(
            (p: Payment) =>
              p.status.toLowerCase() === statusFilter.toLowerCase()
          );
        }

        // Apply date filter
        if (dateFilter.start && dateFilter.end) {
          filteredPayments = filteredPayments.filter((p: Payment) => {
            const paymentDate = new Date(p.createdAt);
            const startDate = new Date(dateFilter.start!);
            const endDate = new Date(dateFilter.end!);
            return paymentDate >= startDate && paymentDate <= endDate;
          });
        }

        // Sort by date (newest first) and limit to 5 most recent
        filteredPayments = filteredPayments
          .sort(
            (a: Payment, b: Payment) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
          .slice(0, 5);

        setPayments(filteredPayments);
      }
    } catch (error) {
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

  const handleDateFilter = () => {
    const startDate = prompt("Enter start date (YYYY-MM-DD):");
    const endDate = prompt("Enter end date (YYYY-MM-DD):");
    if (startDate && endDate) {
      setDateFilter({ start: startDate, end: endDate });
      fetchPayments();
    }
  };

  const handleStatusFilter = () => {
    const status = prompt("Enter status (completed, pending, failed):");
    if (status) {
      setStatusFilter(status);
      fetchPayments();
    } else if (status === "") {
      setStatusFilter("");
      fetchPayments();
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      {/* Header */}
      <div className="flex flex-col px-6 py-4 sm:flex-row justify-between items-start sm:items-center gap-3">
        <h2 className="text-lg font-normal text-[#101828]">
          Current Payment Transaction
        </h2>
        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={handleDateFilter}
            className="flex items-center justify-center gap-2 border rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full sm:w-auto transition-colors"
          >
            <Calendar size={16} />
            Select dates
          </button>
          <button
            onClick={handleStatusFilter}
            className="flex items-center justify-center gap-2 border rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full sm:w-auto transition-colors"
          >
            <ListFilterIcon size={16} />
            Filters
          </button>
        </div>
      </div>
      <Divider className="mb-4" />
      {/* Table */}
      <div className="overflow-x-auto">
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
