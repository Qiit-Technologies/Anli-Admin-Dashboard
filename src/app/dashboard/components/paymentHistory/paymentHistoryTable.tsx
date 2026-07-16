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
import SearchWithIcon from "@/components/common/searchWithIcon";
import { useMemo, useState } from "react";
import useSWR from "swr";
import { useBusiness } from "@/context/businessContext";
import fetcher from "@/app/actions/fetcher";
import { LogInvoiceBtn } from "@/app/dashboard/components/plan/LogInvoiceBtn";

type SubscriptionPayment = {
  id: string;
  amount: number;
  status: "pending" | "successful" | "failed";
  method: "online" | "transfer" | "cash";
  createdAt: string;
  completedAt?: string | null;
  transactionRef?: string | null;
  paystackReference?: string | null;
  description?: string | null;
  invoiceRemarks?: string | null;
  invoiceDocumentUrl?: string | null;
  invoiceDocumentName?: string | null;
  invoiceUploadedBy?: string | null;
  invoiceBillingMonth?: string | null;
};

export default function PaymentHistoryTable() {
  const [query, setQuery] = useState("");
  const { business } = useBusiness();
  const businessId = useMemo(() => business?.id?.toString() || "", [business]);

  const {
    data: paymentResponse,
    isLoading,
    error,
  } = useSWR(
    businessId ? `/super-admin/${businessId}/billing/payment-history` : null,
    (url: string) =>
      fetcher<{
        success: boolean;
        data: { payments: SubscriptionPayment[] };
        message?: string;
      }>(url),
  );

  const payments = paymentResponse?.data?.payments ?? [];
  const errorMessage = error?.message || paymentResponse?.message || null;

  const filteredPayments = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return payments;
    return payments.filter((p) => {
      const haystack = [
        p.id,
        p.status,
        p.method,
        p.transactionRef,
        p.paystackReference,
        p.description,
        p.invoiceRemarks,
        p.invoiceDocumentName,
        p.invoiceUploadedBy,
        p.invoiceBillingMonth,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [payments, query]);

  const formatCurrency = (amount: number) =>
    `₦${Number(amount || 0).toLocaleString()}`;
  const formatDate = (value?: string | null) => {
    if (!value) return "—";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString();
  };
  const normalizeStatus = (status: SubscriptionPayment["status"]) => {
    if (status === "successful") return "paid";
    if (status === "pending") return "pending";
    return "failed";
  };
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      {/* Header */}
      <div className="flex flex-col px-4 sm:px-6 py-4 sm:flex-row justify-between items-start sm:items-center gap-3">
        <h2 className="text-base sm:text-lg font-normal text-[#101828]">
          Current Payment Transaction
        </h2>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <SearchWithIcon
            className="w-full sm:w-[300px] md:w-[478px]"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />

          <button className="flex items-center justify-center gap-2 border rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full sm:w-auto">
            <Calendar size={16} />
            Select dates
          </button>
          <button className="flex items-center justify-center gap-2 border rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full sm:w-auto">
            <ListFilterIcon size={16} />
            Filters
          </button>
          <div className="w-full sm:w-auto">
            <LogInvoiceBtn />
          </div>
        </div>
      </div>
      <Divider className="mb-4" />
      {/* Table */}
      <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
        <Table>
          <Thead>
            <Tr>
              <Th withIcon>Date</Th>
              <Th withIcon>Amount</Th>
              <Th withIcon>Method</Th>
              <Th withIcon icon={<ArrowDown size={16} color="#667085" />}>
                Status
              </Th>
              <Th withIcon>Reference</Th>
              <Th withIcon>Invoice</Th>
              <Th withIcon>Uploaded by</Th>
            </Tr>
          </Thead>
          <Tbody>
            {errorMessage && (
              <Tr>
                <Td colSpan={7}>
                  <div className="text-sm text-red-600">{errorMessage}</div>
                </Td>
              </Tr>
            )}

            {!errorMessage && !isLoading && filteredPayments.length === 0 && (
              <Tr>
                <Td colSpan={7}>
                  <div className="text-sm text-gray-500">
                    No subscription payments found.
                  </div>
                </Td>
              </Tr>
            )}

            {filteredPayments.map((p) => (
              <Tr key={p.id}>
                <Td>{formatDate(p.completedAt || p.createdAt)}</Td>
                <Td>{formatCurrency(p.amount)}</Td>
                <Td className="capitalize">{p.method}</Td>
                <Td>
                  <StatusBadge
                    status={normalizeStatus(p.status)}
                    statusColorMap={{
                      pending: "yellow",
                      paid: "green",
                      failed: "red",
                    }}
                  />
                </Td>
                <Td className="text-xs text-gray-600">
                  {p.paystackReference || p.transactionRef || "—"}
                </Td>
                <Td className="text-xs text-gray-600">
                  {p.invoiceDocumentUrl ? (
                    <a
                      href={p.invoiceDocumentUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 underline"
                    >
                      {p.invoiceDocumentName || "View invoice"}
                    </a>
                  ) : (
                    "—"
                  )}
                </Td>
                <Td className="text-xs text-gray-600">
                  {p.invoiceUploadedBy || "—"}
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </div>
    </div>
  );
}
