"use client";

import { ArrowDown, Calendar, CloudUpload, ListFilterIcon } from "lucide-react";
import { Divider } from "../divider";
import SearchWithIcon from "@/components/common/searchWithIcon";
import { useState } from "react";
import useSWR from "swr";
import fetcher from "@/app/actions/fetcher";
import { useBusiness } from "@/context/businessContext";
import { FaSpinner } from "react-icons/fa";
import {
  Thead,
  Table,
  Th,
  Tr,
  Td,
  Tbody,
  StatusBadge,
} from "@/components/common/customTable";

export interface PaymentRecord {
  id: string;
  amount: number;
  status: "successful" | "failed" | "pending" | string;
  method: string;
  paymentFor?: string;
  description?: string;
  notes?: string;
  initiatedBy?: string;
  createdAt: string;
  completedAt?: string;
}

export interface PaymentHistoryResponse {
  success: boolean;
  data: {
    payments: PaymentRecord[];
  };
  message?: string;
}

export default function PlanHistoryTable() {
  const { business } = useBusiness();
  const businessId = business?.id ? String(business.id) : null;
  const [query, setQuery] = useState("");

  const { data, isLoading } = useSWR<PaymentHistoryResponse | undefined>(
    businessId ? `/super-admin/${businessId}/billing/payment-history` : null,
    (url: string) => fetcher<PaymentHistoryResponse>(url)
  );

  const payments = data?.data?.payments || [];

  const filteredPayments = payments.filter((item) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      (item.description && item.description.toLowerCase().includes(q)) ||
      (item.paymentFor && item.paymentFor.toLowerCase().includes(q)) ||
      (item.initiatedBy && item.initiatedBy.toLowerCase().includes(q)) ||
      (item.notes && item.notes.toLowerCase().includes(q)) ||
      (item.status && item.status.toLowerCase().includes(q)) ||
      (item.method && item.method.toLowerCase().includes(q))
    );
  });

  // const getStatusColor = (status: string) => {
  //   switch (status.toLowerCase()) {
  //     case "successful":
  //     case "completed":
  //       return "green";
  //     case "pending":
  //       return "yellow";
  //     case "failed":
  //     case "cancelled":
  //       return "red";
  //     default:
  //       return "gray";
  //   }
  // };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      {/* Header */}
      <div className="flex flex-col gap-4 px-4 py-4 sm:px-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-[#101828]">Plan & Payment History</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Real billing and payment records for {business?.name || "selected business"}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row flex-wrap gap-2 w-full sm:w-auto">
          <button className="flex items-center justify-center gap-2 border rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full sm:w-auto">
            <Calendar size={16} />
            Select dates
          </button>
          <button className="flex items-center justify-center gap-2 border rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full sm:w-auto">
            <ListFilterIcon size={16} />
            Filters
          </button>
          <button className="flex items-center justify-center gap-2 border rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full sm:w-auto">
            <CloudUpload size={16} />
            Export
          </button>
        </div>
      </div>

      <Divider />

      {/* Search Input */}
      <div className="px-4 sm:px-6 py-5">
        <SearchWithIcon
          className="w-full max-w-md"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search history by description, status or user..."
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-12 text-gray-400 gap-2">
            <FaSpinner className="animate-spin" />
            <span className="text-sm">Loading billing history...</span>
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">
            No payment or plan history found for this business.
          </div>
        ) : (
          <Table>
            <Thead>
              <Tr>
                <Th withIcon>Date</Th>
                <Th withIcon>Description / Purpose</Th>
                <Th withIcon>Amount</Th>
                <Th withIcon>Initiated By</Th>
                <Th withIcon icon={<ArrowDown size={16} color="#667085" />}>
                  Method
                </Th>
                <Th withIcon>Status</Th>
                <Th withIcon>Notes</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredPayments.map((row) => (
                <Tr key={row.id}>
                  <Td className="whitespace-nowrap font-medium text-xs text-gray-700">
                    {new Date(row.createdAt).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Td>
                  <Td className="font-semibold text-sm">
                    {row.description || (row.paymentFor ? `Payment for ${row.paymentFor}` : "Subscription Renewal")}
                  </Td>
                  <Td className="font-bold text-sm text-gray-900">
                    ₦{Number(row.amount || 0).toLocaleString("en-NG")}
                  </Td>
                  <Td className="text-xs text-gray-600">
                    {row.initiatedBy || "System"}
                  </Td>
                  <Td className="text-xs uppercase font-medium">
                    {row.method || "—"}
                  </Td>
                  <Td>
                    <StatusBadge
                      status={row.status}
                      statusColorMap={{
                        successful: "green",
                        completed: "green",
                        pending: "yellow",
                        failed: "red",
                        cancelled: "red",
                      }}
                    />
                  </Td>
                  <Td className="text-xs text-gray-500 max-w-[200px] truncate">
                    {row.notes || "—"}
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
