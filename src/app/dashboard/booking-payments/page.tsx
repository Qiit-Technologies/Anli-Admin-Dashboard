"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Header from "../components/layout/header";
import Sidebar from "../components/layout/sidebar";
import { useBusiness } from "@/context/businessContext";
import { axiosGet, axiosPost } from "@/app/lib/api";

type BookingPaymentItem = {
  bookingGroupId: string;
  roomCount: number;
  totalBookingAmount: number;
  totalPaidAmount: number;
  bookingCreatedAt: string;
  transfer: {
    id: string;
    status: "pending" | "success" | "failed";
    transferredAmount: number;
    paystackReference?: string;
    createdAt: string;
  } | null;
};

type BookingPaymentSummaryResponse = {
  success: boolean;
  data: {
    totalBookings: number;
    totalPaid: number;
    totalTransferred: number;
    items: BookingPaymentItem[];
  };
  message?: string;
};

const formatCurrency = (amount: number) => `₦${Number(amount || 0).toLocaleString()}`;

export default function BookingPaymentsPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { business, loading } = useBusiness();
  const router = useRouter();
  const [isFetching, setIsFetching] = useState(false);
  const [summary, setSummary] = useState<BookingPaymentSummaryResponse["data"] | null>(null);
  const [transferringGroupId, setTransferringGroupId] = useState<string | null>(null);

  const businessId = useMemo(() => business?.id?.toString() || "", [business?.id]);

  const loadData = useCallback(async () => {
    if (!businessId) return;
    setIsFetching(true);
    try {
      const response = await axiosGet<BookingPaymentSummaryResponse>(
        `/super-admin/${businessId}/billing/booking-payments`,
        { currentPath: "/dashboard/booking-payments" },
      );
      if (response?.success && response.data) {
        setSummary(response.data);
      } else {
        setSummary(null);
      }
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Failed to load booking payments",
      );
    } finally {
      setIsFetching(false);
    }
  }, [businessId]);

  useEffect(() => {
    if (!loading && (!business || Object.keys(business).length < 1)) {
      router.replace("/business-list");
      return;
    }
    if (!loading && businessId) {
      void loadData();
    }
  }, [business, businessId, loadData, loading, router]);

  const handleTransfer = async (bookingGroupId: string) => {
    if (!businessId) return;
    setTransferringGroupId(bookingGroupId);
    try {
      const response = await axiosPost<{
        success: boolean;
        message?: string;
      }>(
        `/super-admin/${businessId}/billing/booking-payments/${bookingGroupId}/transfer`,
        {},
        { currentPath: "/dashboard/booking-payments" },
      );
      if (response?.success) {
        toast.success(response.message || "Transfer initiated successfully");
        await loadData();
      } else {
        toast.error("Failed to initiate transfer");
      }
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Could not transfer booking payment",
      );
    } finally {
      setTransferringGroupId(null);
    }
  };

  if (loading || !business) return null;

  return (
    <div className="h-screen w-screen flex flex-col sm:flex-row overflow-hidden">
      <Sidebar isOpen={menuOpen} setIsOpen={setMenuOpen} />
      <div className="flex-1 flex flex-col overflow-hidden min-h-0">
        <Header
          isOpen={menuOpen}
          setIsOpen={setMenuOpen}
          title="Booking Payment"
        />
        <main className="px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-10 space-y-4 sm:space-y-6 bg-white overflow-y-auto overflow-x-hidden flex-1 min-h-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="border rounded-lg p-4">
              <p className="text-xs text-gray-500">Booking groups</p>
              <p className="text-2xl font-semibold">{summary?.totalBookings ?? 0}</p>
            </div>
            <div className="border rounded-lg p-4">
              <p className="text-xs text-gray-500">Total paid</p>
              <p className="text-2xl font-semibold">
                {formatCurrency(summary?.totalPaid ?? 0)}
              </p>
            </div>
            <div className="border rounded-lg p-4">
              <p className="text-xs text-gray-500">Total transferred</p>
              <p className="text-2xl font-semibold">
                {formatCurrency(summary?.totalTransferred ?? 0)}
              </p>
            </div>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b font-medium">Booking payment payouts</div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="text-left px-4 py-3">Booking Group</th>
                    <th className="text-left px-4 py-3">Rooms</th>
                    <th className="text-left px-4 py-3">Paid Amount</th>
                    <th className="text-left px-4 py-3">Transfer Status</th>
                    <th className="text-left px-4 py-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {!isFetching && (summary?.items?.length ?? 0) === 0 && (
                    <tr>
                      <td className="px-4 py-4 text-gray-500" colSpan={5}>
                        No public booking payments found yet.
                      </td>
                    </tr>
                  )}
                  {(summary?.items ?? []).map((item) => {
                    const status = item.transfer?.status || "not_transferred";
                    const canTransfer =
                      item.totalPaidAmount > 0 &&
                      item.transfer?.status !== "success";
                    return (
                      <tr key={item.bookingGroupId} className="border-t">
                        <td className="px-4 py-3">{item.bookingGroupId}</td>
                        <td className="px-4 py-3">{item.roomCount}</td>
                        <td className="px-4 py-3">{formatCurrency(item.totalPaidAmount)}</td>
                        <td className="px-4 py-3 capitalize">
                          {status.replace("_", " ")}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            type="button"
                            disabled={!canTransfer || transferringGroupId === item.bookingGroupId}
                            className="px-3 py-1.5 rounded bg-[#007BFF] text-white disabled:opacity-50"
                            onClick={() => handleTransfer(item.bookingGroupId)}
                          >
                            {transferringGroupId === item.bookingGroupId
                              ? "Transferring..."
                              : "Transfer to hotel"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
