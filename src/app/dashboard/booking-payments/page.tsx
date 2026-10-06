"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Header from "../components/layout/header";
import Sidebar from "../components/layout/sidebar";
import { useBusiness } from "@/context/businessContext";
import { axiosGet, axiosPost } from "@/app/lib/api";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
    paystackTransferCode?: string;
    recipientBankName?: string;
    recipientAccountNumber?: string;
    recipientAccountName?: string;
    failureReason?: string;
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

type BankAccount = {
  id: number;
  accountName: string;
  accountNumber: string;
  bankName: string;
  isActive: boolean;
};

type PaystackBank = {
  name: string;
  code: string;
  slug: string;
  longcode: string;
  gateway: string | null;
  pay_with_bank: boolean;
  active: boolean;
  is_deleted: boolean;
  country: string;
  currency: string;
  type: string;
  id: number;
  createdAt: string;
  updatedAt: string;
};

const formatCurrency = (amount: number) =>
  `₦${Number(amount || 0).toLocaleString()}`;

export default function BookingPaymentsPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { business, loading } = useBusiness();
  const router = useRouter();
  const [isFetching, setIsFetching] = useState(false);
  const [summary, setSummary] = useState<
    BookingPaymentSummaryResponse["data"] | null
  >(null);
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [transferDetailsModalOpen, setTransferDetailsModalOpen] =
    useState(false);
  const [selectedBookingItem, setSelectedBookingItem] =
    useState<BookingPaymentItem | null>(null);
  const [selectedTransfer, setSelectedTransfer] = useState<
    BookingPaymentItem["transfer"] | null
  >(null);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [paystackBanks, setPaystackBanks] = useState<PaystackBank[]>([]);
  const [transferAmount, setTransferAmount] = useState<string>("");
  const [useManualAccount, setUseManualAccount] = useState(false);
  const [selectedBankAccountId, setSelectedBankAccountId] =
    useState<string>("");
  const [manualAccountNumber, setManualAccountNumber] = useState("");
  const [manualBankName, setManualBankName] = useState("");
  const [resolvedAccountName, setResolvedAccountName] = useState<string | null>(
    null,
  );
  const [isResolvingAccount, setIsResolvingAccount] = useState(false);
  const [isSubmittingTransfer, setIsSubmittingTransfer] = useState(false);
  const [isRetryingTransfer, setIsRetryingTransfer] = useState(false);

  const businessId = useMemo(
    () => business?.id?.toString() || "",
    [business?.id],
  );

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

  const loadBankAccounts = useCallback(async () => {
    if (!businessId) return;
    try {
      const response = await axiosGet<{
        success: boolean;
        data: { bankAccounts: BankAccount[] };
      }>(`/super-admin/${businessId}/billing/bank-accounts`, {
        currentPath: "/dashboard/booking-payments",
      });
      if (response?.success && response.data) {
        setBankAccounts(
          response.data.bankAccounts.filter((acc) => acc.isActive),
        );
      }
    } catch (error: any) {
      console.error("Failed to load bank accounts:", error);
    }
  }, [businessId]);

  const loadPaystackBanks = useCallback(async () => {
    if (!businessId) return;
    try {
      const response = await axiosGet<{
        success: boolean;
        data: { banks: PaystackBank[] };
      }>(`/super-admin/${businessId}/billing/paystack-banks`, {
        currentPath: "/dashboard/booking-payments",
      });
      if (response?.success && response.data) {
        setPaystackBanks(response.data.banks);
      }
    } catch (error: any) {
      console.error("Failed to load Paystack banks:", error);
    }
  }, [businessId]);

  const resolveAccount = useCallback(async () => {
    if (!businessId || !manualAccountNumber || !manualBankName) return;
    setIsResolvingAccount(true);
    try {
      const response = await axiosPost<{
        success: boolean;
        data: { account: { account_name: string } };
      }>(
        `/super-admin/${businessId}/billing/resolve-account`,
        { accountNumber: manualAccountNumber, bankName: manualBankName },
        { currentPath: "/dashboard/booking-payments" },
      );
      if (response?.success && response.data) {
        setResolvedAccountName(response.data.account.account_name);
        toast.success("Account resolved successfully");
      }
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Failed to resolve account",
      );
    } finally {
      setIsResolvingAccount(false);
    }
  }, [businessId, manualAccountNumber, manualBankName]);

  const openTransferModal = useCallback(
    (item: BookingPaymentItem) => {
      setSelectedBookingItem(item);
      setTransferAmount(item.totalPaidAmount.toString());
      setUseManualAccount(false);
      setSelectedBankAccountId("");
      setManualAccountNumber("");
      setManualBankName("");
      setResolvedAccountName(null);
      setTransferModalOpen(true);
      void loadBankAccounts();
      void loadPaystackBanks();
    },
    [loadBankAccounts, loadPaystackBanks],
  );

  const openTransferDetailsModal = useCallback(
    (transfer: BookingPaymentItem["transfer"]) => {
      setSelectedTransfer(transfer);
      setTransferDetailsModalOpen(true);
    },
    [],
  );

  const handleRetryTransfer = useCallback(async () => {
    if (!businessId || !selectedTransfer) return;
    setIsRetryingTransfer(true);
    try {
      const response = await axiosPost<{
        success: boolean;
        message?: string;
      }>(
        `/super-admin/${businessId}/billing/booking-payments/transfers/${selectedTransfer.id}/retry`,
        {},
        { currentPath: "/dashboard/booking-payments" },
      );
      if (response?.success) {
        toast.success("Transfer retry initiated successfully!");
        setTransferDetailsModalOpen(false);
        await loadData();
      } else {
        toast.error(response?.message || "Failed to retry transfer");
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Could not retry transfer");
    } finally {
      setIsRetryingTransfer(false);
    }
  }, [businessId, selectedTransfer, loadData]);

  const handleTransfer = useCallback(async () => {
    console.log("handleTransfer called!");
    console.log("businessId:", businessId);
    console.log("selectedBookingItem:", selectedBookingItem);
    console.log("transferAmount:", transferAmount);
    console.log("useManualAccount:", useManualAccount);
    console.log("selectedBankAccountId:", selectedBankAccountId);
    console.log("manualAccountNumber:", manualAccountNumber);
    console.log("manualBankName:", manualBankName);
    console.log("resolvedAccountName:", resolvedAccountName);

    if (!businessId || !selectedBookingItem) {
      console.log("Missing businessId or selectedBookingItem!");
      return;
    }
    const amount = Number(transferAmount);
    if (amount <= 0 || amount > selectedBookingItem.totalPaidAmount) {
      toast.error("Invalid transfer amount");
      return;
    }
    if (amount < 100) {
      toast.error("Minimum transfer amount is ₦100 (Paystack requirement)");
      return;
    }

    if (
      useManualAccount &&
      (!manualAccountNumber || !manualBankName || !resolvedAccountName)
    ) {
      toast.error("Please resolve the account first");
      return;
    }

    setIsSubmittingTransfer(true);
    try {
      const payload: any = { amount };
      if (useManualAccount) {
        payload.useManualBankAccount = true;
        payload.manualAccountNumber = manualAccountNumber;
        payload.manualBankName = manualBankName;
      } else {
        if (selectedBankAccountId) {
          payload.bankAccountId = Number(selectedBankAccountId);
        }
      }

      console.log("Sending payload:", payload);

      const response = await axiosPost<{
        success: boolean;
        message?: string;
      }>(
        `/super-admin/${businessId}/billing/booking-payments/${selectedBookingItem.bookingGroupId}/transfer`,
        payload,
        { currentPath: "/dashboard/booking-payments" },
      );
      console.log("Response:", response);
      if (response?.success) {
        toast.success(response.message || "Transfer initiated successfully");
        setTransferModalOpen(false);
        await loadData();
      } else {
        toast.error(response?.message || "Failed to initiate transfer");
      }
    } catch (error: any) {
      console.error("Error transferring:", error);
      toast.error(
        error?.response?.data?.message || "Could not transfer booking payment",
      );
    } finally {
      setIsSubmittingTransfer(false);
    }
  }, [
    businessId,
    selectedBookingItem,
    transferAmount,
    useManualAccount,
    manualAccountNumber,
    manualBankName,
    resolvedAccountName,
    selectedBankAccountId,
    loadData,
  ]);

  useEffect(() => {
    if (!loading && (!business || Object.keys(business).length < 1)) {
      router.replace("/business-list");
      return;
    }
    if (!loading && businessId) {
      void loadData();
    }
  }, [business, businessId, loadData, loading, router]);

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
              <p className="text-2xl font-semibold">
                {summary?.totalBookings ?? 0}
              </p>
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
            <div className="px-4 py-3 border-b font-medium">
              Booking payment payouts
            </div>
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
                        <td className="px-4 py-3">
                          {formatCurrency(item.totalPaidAmount)}
                        </td>
                        <td className="px-4 py-3 capitalize">
                          {status.replace("_", " ")}
                        </td>
                        <td className="px-4 py-3 flex gap-2">
                          {item.transfer && (
                            <Button
                              variant="secondary"
                              onClick={() =>
                                openTransferDetailsModal(item.transfer)
                              }
                            >
                              View Transfer
                            </Button>
                          )}
                          <Button
                            disabled={!canTransfer}
                            className="bg-[#007BFF] hover:bg-[#0056b3] text-white disabled:opacity-50"
                            onClick={() => openTransferModal(item)}
                          >
                            {item.transfer
                              ? "Retry Transfer"
                              : "Transfer to hotel"}
                          </Button>
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

      <Dialog open={transferModalOpen} onOpenChange={setTransferModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Transfer to Hotel</DialogTitle>
            <DialogDescription>
              Enter transfer details for booking group:{" "}
              {selectedBookingItem?.bookingGroupId}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Amount to Transfer</Label>
              <Input
                type="number"
                value={transferAmount}
                onChange={(e) => setTransferAmount(e.target.value)}
                max={selectedBookingItem?.totalPaidAmount}
                min={100}
              />
              <p className="text-xs text-gray-500 mt-1">
                Total paid:{" "}
                {formatCurrency(selectedBookingItem?.totalPaidAmount || 0)} •
                Minimum transfer: ₦100
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="useManualAccount"
                checked={useManualAccount}
                onChange={(e) => setUseManualAccount(e.target.checked)}
              />
              <Label htmlFor="useManualAccount">Use manual bank account</Label>
            </div>
            {!useManualAccount ? (
              <div>
                <Label>Select Bank Account</Label>
                <Select
                  value={selectedBankAccountId}
                  onValueChange={setSelectedBankAccountId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a bank account" />
                  </SelectTrigger>
                  <SelectContent>
                    {bankAccounts.map((account) => (
                      <SelectItem
                        key={account.id}
                        value={account.id.toString()}
                      >
                        {account.bankName} - {account.accountNumber} (
                        {account.accountName})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <Label>Bank Name</Label>
                  <Select
                    value={manualBankName}
                    onValueChange={setManualBankName}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a bank" />
                    </SelectTrigger>
                    <SelectContent>
                      {paystackBanks.map((bank) => (
                        <SelectItem key={bank.code} value={bank.name}>
                          {bank.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Account Number</Label>
                  <div className="flex space-x-2">
                    <Input
                      type="text"
                      value={manualAccountNumber}
                      onChange={(e) => {
                        setManualAccountNumber(e.target.value);
                        setResolvedAccountName(null);
                      }}
                      placeholder="Enter account number"
                    />
                    <Button
                      variant="secondary"
                      onClick={resolveAccount}
                      disabled={
                        isResolvingAccount ||
                        !manualAccountNumber ||
                        !manualBankName
                      }
                    >
                      {isResolvingAccount ? "Resolving..." : "Resolve"}
                    </Button>
                  </div>
                </div>
                {resolvedAccountName && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded">
                    <p className="text-sm text-green-700">
                      Account Name: {resolvedAccountName}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => setTransferModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="bg-[#007BFF] hover:bg-[#0056b3]"
              onClick={handleTransfer}
              disabled={isSubmittingTransfer}
            >
              {isSubmittingTransfer ? "Transferring..." : "Confirm Transfer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={transferDetailsModalOpen}
        onOpenChange={setTransferDetailsModalOpen}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Transfer Details</DialogTitle>
          </DialogHeader>
          {selectedTransfer && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Transfer ID</p>
                  <p className="font-medium">{selectedTransfer.id}</p>
                </div>
                <div>
                  <p className="text-gray-500">Status</p>
                  <p
                    className={`font-medium capitalize ${
                      selectedTransfer.status === "success"
                        ? "text-green-600"
                        : selectedTransfer.status === "failed"
                          ? "text-red-600"
                          : "text-yellow-600"
                    }`}
                  >
                    {selectedTransfer.status}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Amount</p>
                  <p className="font-medium">
                    {formatCurrency(selectedTransfer.transferredAmount)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Date</p>
                  <p className="font-medium">
                    {new Date(selectedTransfer.createdAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Recipient Bank</p>
                  <p className="font-medium">
                    {selectedTransfer.recipientBankName || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Recipient Account Number</p>
                  <p className="font-medium">
                    {selectedTransfer.recipientAccountNumber || "-"}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-gray-500">Recipient Account Name</p>
                  <p className="font-medium">
                    {selectedTransfer.recipientAccountName || "-"}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-gray-500">Paystack Reference</p>
                  <p className="font-medium text-xs break-all">
                    {selectedTransfer.paystackReference || "-"}
                  </p>
                </div>
                {selectedTransfer.paystackTransferCode && (
                  <div className="md:col-span-2">
                    <p className="text-gray-500">Paystack Transfer Code</p>
                    <p className="font-medium text-xs break-all">
                      {selectedTransfer.paystackTransferCode}
                    </p>
                  </div>
                )}
                {selectedTransfer.failureReason && (
                  <div className="md:col-span-2">
                    <p className="text-gray-500">Failure Reason</p>
                    <p className="font-medium text-red-600">
                      {selectedTransfer.failureReason}
                    </p>
                  </div>
                )}
              </div>
              <DialogFooter className="gap-2">
                <Button
                  variant="secondary"
                  onClick={() => setTransferDetailsModalOpen(false)}
                >
                  Close
                </Button>
                {selectedTransfer.status !== "success" && (
                  <Button
                    className="bg-[#007BFF] hover:bg-[#0056b3]"
                    onClick={handleRetryTransfer}
                    disabled={isRetryingTransfer}
                  >
                    {isRetryingTransfer ? "Retrying..." : "Retry Transfer"}
                  </Button>
                )}
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
