"use client";

import {
  ArrowDown,
  Calendar,
  ListFilterIcon,
  RefreshCw,
  Send,
  UserPlus,
  XCircle,
} from "lucide-react";
import { Divider } from "../divider";
import SearchWithIcon from "@/components/common/searchWithIcon";
import { useState } from "react";
import {
  Thead,
  Table,
  Th,
  Tr,
  Td,
  Tbody,
  StatusBadge,
} from "@/components/common/customTable";
import Image from "next/image";
import { Pagination } from "@/components/common/pagination";
import { useDebounce } from "@/hooks/useDebounce";
import useSWR from "swr";
import getStaffByOptions, {
  cancelStaffInvite,
  deleteStaff,
  requestStaffPasswordReset,
  resendStaffInvite,
  undeleteStaff,
} from "@/app/actions/staff";
import { Spinner } from "@/components/ui/spinner";
import { ViewStaffDetailsBtn } from "./viewStaffDetailsBtn";
import { toast } from "react-toastify";
import { ConfirmationModal } from "@/components/common/ConfirmationModal";
import { AxiosError } from "axios";
import { ErrorResponseData } from "@/hooks/types";
import InviteStaffDialog from "./InviteStaffDialog";

function apiErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof AxiosError) {
    const message = (error.response?.data as ErrorResponseData)?.message;
    if (typeof message === "string" && message) return message;
  }
  return fallback;
}

export default function UsersTable({ businessId }: { businessId: string }) {
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);
  const limit = 10;
  const [showFilters, setShowFilters] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: "",
    end: "",
  });
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");

  const [resettingPasswords, setResettingPasswords] = useState<
    Record<number, boolean>
  >({});
  const [deletingStaff, setDeletingStaff] = useState<Record<number, boolean>>(
    {},
  );
  const [undeletingStaff, setUndeleteStaff] = useState<Record<number, boolean>>(
    {},
  );
  const [showResetPasswordConfirm, setShowResetPasswordConfirm] = useState<
    Record<number, boolean>
  >({});
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [busyInvite, setBusyInvite] = useState<Record<number, boolean>>({});

  const {
    data: response,
    isLoading,
    error,
    mutate,
  } = useSWR(
    [
      `/super-admin/get-staff`,
      page,
      limit,
      debouncedQuery,
      businessId,
      statusFilter,
      departmentFilter,
      dateRange,
    ],
    () =>
      getStaffByOptions({
        page,
        limit,
        searchTerm: debouncedQuery,
        businessId: businessId,
        status: statusFilter !== "all" ? statusFilter : undefined,
        department: departmentFilter !== "all" ? departmentFilter : undefined,
        startDate: dateRange.start || undefined,
        endDate: dateRange.end || undefined,
      }),
    // Keep the previous page visible while a search/filter refetch is in
    // flight so the table never vanishes mid-typing.
    { keepPreviousData: true },
  );

  const staff: Array<Record<string, any> & { invitePending?: boolean }> =
    response?.data?.staffs ?? [];
  const totalPages = response?.data?.totalPages ?? 1;

  // C3: password resets now email a single-use link — nothing is generated
  // or displayed in plaintext anywhere in the HQ.
  const handleResetPassword = async (staffId: number, email: string) => {
    setResettingPasswords((prev) => ({ ...prev, [staffId]: true }));
    try {
      const res = await requestStaffPasswordReset(staffId);
      const delivered = res?.data?.emailDelivered !== false;
      if (delivered) {
        toast.success(`Password reset link sent to ${email}`);
      } else {
        toast(
          "Reset link created, but the email could not be delivered. Please try again.",
          { icon: "⚠️" },
        );
      }
      mutate();
    } catch (error: unknown) {
      console.error("Failed to request password reset:", error);
      toast.error(
        apiErrorMessage(error, "Failed to send reset link. Please try again."),
      );
    } finally {
      setResettingPasswords((prev) => ({ ...prev, [staffId]: false }));
    }
  };

  const handleResetPasswordClick = (staffId: number) => {
    setShowResetPasswordConfirm((prev) => ({ ...prev, [staffId]: true }));
  };

  const handleResetPasswordConfirm = async (staffId: number, email: string) => {
    setShowResetPasswordConfirm((prev) => ({ ...prev, [staffId]: false }));
    await handleResetPassword(staffId, email);
  };

  const handleResendInvite = async (staffId: number, email: string) => {
    setBusyInvite((prev) => ({ ...prev, [staffId]: true }));
    try {
      const res = await resendStaffInvite(staffId);
      const delivered = res?.data?.emailDelivered !== false;
      if (delivered) {
        toast.success(`Invite re-sent to ${email}`);
      } else {
        toast(
          "Invite renewed, but the email could not be delivered. Try resending again.",
          { icon: "⚠️" },
        );
      }
      mutate();
    } catch (error: unknown) {
      toast.error(apiErrorMessage(error, "Failed to re-send invite."));
    } finally {
      setBusyInvite((prev) => ({ ...prev, [staffId]: false }));
    }
  };

  const handleCancelInvite = async (staffId: number) => {
    setBusyInvite((prev) => ({ ...prev, [staffId]: true }));
    try {
      await cancelStaffInvite(staffId);
      toast.success("Invite cancelled");
      mutate();
    } catch (error: unknown) {
      toast.error(apiErrorMessage(error, "Failed to cancel invite."));
    } finally {
      setBusyInvite((prev) => ({ ...prev, [staffId]: false }));
    }
  };

  const handleDeleteStaff = async (staffId: number) => {
    setDeletingStaff((prev) => ({ ...prev, [staffId]: true }));
    try {
      const response = await deleteStaff(Number(businessId), staffId);
      if (response) {
        toast.success("Staff deleted successfully!");
        mutate(); // Refresh the data
        return Promise.resolve();
      } else {
        throw new Error("No response received");
      }
    } catch (error: unknown) {
      console.error("Failed to delete staff:", error);
      toast.error("Failed to delete staff. Please try again.");
      throw error; // Re-throw the error so the modal stays open
    } finally {
      setDeletingStaff((prev) => ({ ...prev, [staffId]: false }));
    }
  };

  const handleUndeleteStaff = async (staffId: number) => {
    setUndeleteStaff((prev) => ({ ...prev, [staffId]: true }));
    try {
      const response = await undeleteStaff(Number(businessId), Number(staffId));
      if (response) {
        toast.success("Staff restored successfully!");
        mutate(); // Refresh the data
        return Promise.resolve();
      } else {
        throw new Error("No response received");
      }
    } catch (error: unknown) {
      console.error("Failed to restore staff:", error);
      toast.error("Failed to restore staff. Please try again.");
      throw error; // Re-throw the error so the modal stays open
    } finally {
      setUndeleteStaff((prev) => ({ ...prev, [staffId]: false }));
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      {isLoading ? (
        <div className="p-5 flex items-center justify-center">
          <Spinner size="lg" />
        </div>
      ) : error && staff.length === 0 ? (
        <div className="flex flex-col items-center justify-center space-y-3 px-6 py-12 text-center">
          <p className="text-sm text-red-600">
            Couldn&apos;t load staff. Please try again.
          </p>
          <button
            onClick={() => mutate()}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Retry
          </button>
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="flex flex-col px-4 sm:px-6 py-4 sm:flex-row justify-between items-start sm:items-center gap-3">
            <h2 className="text-base sm:text-lg font-normal text-[#101828]">
              Users
            </h2>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <SearchWithIcon
                className="w-full sm:w-[300px] md:w-[478px]"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />

              <button
                onClick={() => setShowInviteDialog(true)}
                className="flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm w-full sm:w-auto bg-orion-blue text-white hover:opacity-90"
              >
                <UserPlus size={16} />
                Invite staff
              </button>
              <button
                onClick={() => setShowDatePicker(!showDatePicker)}
                className={`flex items-center justify-center gap-2 border rounded-md px-3 py-2 text-sm w-full sm:w-auto ${
                  showDatePicker
                    ? "bg-blue-50 border-blue-300 text-blue-700"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <Calendar size={16} />
                Select dates
              </button>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center justify-center gap-2 border rounded-md px-3 py-2 text-sm w-full sm:w-auto ${
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
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <div className="flex flex-col sm:flex-row gap-2">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={dateRange.start}
                      onChange={(e) =>
                        setDateRange((prev) => ({
                          ...prev,
                          start: e.target.value,
                        }))
                      }
                      className="border rounded-md px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={dateRange.end}
                      onChange={(e) =>
                        setDateRange((prev) => ({
                          ...prev,
                          end: e.target.value,
                        }))
                      }
                      className="border rounded-md px-3 py-2 text-sm"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setDateRange({ start: "", end: "" })}
                    className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800"
                  >
                    Clear
                  </button>
                  <button
                    onClick={() => setShowDatePicker(false)}
                    className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800"
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
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      Status
                    </label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="border rounded-md px-3 py-2 text-sm"
                    >
                      <option value="all">All Status</option>
                      <option value="online">Online</option>
                      <option value="offline">Offline</option>
                      <option value="deleted">Deleted</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      Department
                    </label>
                    <select
                      value={departmentFilter}
                      onChange={(e) => setDepartmentFilter(e.target.value)}
                      className="border rounded-md px-3 py-2 text-sm"
                    >
                      <option value="all">All Departments</option>
                      <option value="management">Management</option>
                      <option value="front-desk">Front Desk</option>
                      <option value="housekeeping">Housekeeping</option>
                      <option value="maintenance">Maintenance</option>
                      <option value="food-service">Food Service</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setStatusFilter("all");
                      setDepartmentFilter("all");
                    }}
                    className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800"
                  >
                    Clear All
                  </button>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800"
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
            <Table>
              <Thead>
                <Tr>
                  <Th withIcon>Employee Name</Th>
                  <Th withIcon>Email Address</Th>
                  <Th withIcon>Phone Number</Th>
                  <Th withIcon>Department</Th>
                  <Th withIcon icon={<ArrowDown size={16} color="#667085" />}>
                    Employee Status
                  </Th>
                  <Th>Action</Th>
                </Tr>
              </Thead>
              <Tbody>
                {staff.length === 0 ? (
                  <Tr>
                    <Td colSpan={6} className="text-center py-12">
                      <div className="flex flex-col items-center justify-center space-y-4">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                          <svg
                            className="w-8 h-8 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                            />
                          </svg>
                        </div>
                        <div className="text-center">
                          <h3 className="text-lg font-medium text-gray-900 mb-2">
                            {query ||
                            statusFilter !== "all" ||
                            departmentFilter !== "all" ||
                            dateRange.start ||
                            dateRange.end
                              ? "No staff match your search"
                              : "No staff members found"}
                          </h3>
                          <p className="text-gray-500 mb-4">
                            {query ||
                            statusFilter !== "all" ||
                            departmentFilter !== "all" ||
                            dateRange.start ||
                            dateRange.end
                              ? "Try adjusting your search criteria or filters"
                              : "No staff members have been added to this business yet"}
                          </p>
                          {(query ||
                            statusFilter !== "all" ||
                            departmentFilter !== "all" ||
                            dateRange.start ||
                            dateRange.end) && (
                            <button
                              onClick={() => {
                                setQuery("");
                                setStatusFilter("all");
                                setDepartmentFilter("all");
                                setDateRange({ start: "", end: "" });
                                setShowFilters(false);
                                setShowDatePicker(false);
                              }}
                              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                            >
                              Clear all filters
                            </button>
                          )}
                        </div>
                      </div>
                    </Td>
                  </Tr>
                ) : (
                  staff.map((row, i) => (
                    <Tr key={i} className={row.deletedAt ? "opacity-60" : ""}>
                      <Td>
                        <div className="flex items-center gap-2">
                          <Image
                            src={
                              row?.profileImage ||
                              `https://ui-avatars.com/api/?name=${row.fullName?.replaceAll(
                                " ",
                                "-",
                              )}`
                            }
                            alt={row.fullName}
                            className="w-6 h-6 rounded-full"
                            width={24}
                            height={24}
                            unoptimized
                          />
                          <span>{row.fullName}</span>
                        </div>
                      </Td>
                      <Td>{row.email}</Td>
                      <Td>{row.phoneNumber || "N/A"}</Td>
                      <Td>{row.department?.name || "N/A"}</Td>
                      <Td>
                        {row.invitePending ? (
                          <StatusBadge
                            status="Invite pending"
                            statusColorMap={{
                              "Invite pending": "yellow",
                            }}
                          />
                        ) : row.deletedAt ? (
                          <StatusBadge
                            status="deleted"
                            statusColorMap={{
                              deleted: "gray",
                            }}
                          />
                        ) : (
                          <StatusBadge
                            status={row.status}
                            statusColorMap={{
                              online: "green",
                              offline: "red",
                            }}
                          />
                        )}
                      </Td>
                      <Td>
                        <div className="flex items-center gap-2">
                          {row.invitePending ? (
                            <>
                              <button
                                onClick={() =>
                                  handleResendInvite(row.id, row.email)
                                }
                                disabled={busyInvite[row.id]}
                                className="flex items-center gap-1 px-2 py-1 text-xs border rounded-md text-blue-700 border-blue-200 hover:bg-blue-50 disabled:opacity-50"
                                title="Re-send invite email"
                              >
                                <Send size={12} />
                                Resend invite
                              </button>
                              <button
                                onClick={() => handleCancelInvite(row.id)}
                                disabled={busyInvite[row.id]}
                                className="flex items-center gap-1 px-2 py-1 text-xs border rounded-md text-red-700 border-red-200 hover:bg-red-50 disabled:opacity-50"
                                title="Cancel this invite"
                              >
                                <XCircle size={12} />
                                Cancel
                              </button>
                            </>
                          ) : (
                            <>
                              {!row.deletedAt && (
                                <button
                                  onClick={() =>
                                    handleResetPasswordClick(row.id)
                                  }
                                  disabled={resettingPasswords[row.id]}
                                  className="p-1 hover:bg-gray-100 rounded disabled:opacity-50"
                                  title="Send password reset link"
                                >
                                  {resettingPasswords[row.id] ? (
                                    <Spinner
                                      size="sm"
                                      className="text-gray-500"
                                    />
                                  ) : (
                                    <RefreshCw
                                      size={14}
                                      className="text-gray-500"
                                    />
                                  )}
                                </button>
                              )}
                              <ViewStaffDetailsBtn
                                staffInfo={row}
                                onDelete={handleDeleteStaff}
                                onUndelete={handleUndeleteStaff}
                                isDeleting={deletingStaff[row.id]}
                                isUndeleting={undeletingStaff[row.id]}
                                businessId={businessId}
                              />
                            </>
                          )}
                        </div>
                      </Td>
                    </Tr>
                  ))
                )}
              </Tbody>
            </Table>

            <Pagination
              totalPages={totalPages}
              page={page}
              onPageChange={setPage}
            />
          </div>
        </>
      )}

      {/* Reset Password Confirmation Modals — a reset now emails a
          single-use link; nothing is displayed in plaintext. */}
      {staff.map((row) => (
        <ConfirmationModal
          key={`reset-${row.id}`}
          isOpen={showResetPasswordConfirm[row.id] || false}
          onClose={() =>
            setShowResetPasswordConfirm((prev) => ({
              ...prev,
              [row.id]: false,
            }))
          }
          onConfirm={() => handleResetPasswordConfirm(row.id, row.email)}
          title="Reset Password"
          description={`Are you sure you want to reset the password for ${row.fullName}? A single-use reset link will be emailed to ${row.email}.`}
          confirmLabel="Send reset link"
          cancelLabel="Cancel"
          variant="primary"
          isLoading={resettingPasswords[row.id]}
        />
      ))}

      <InviteStaffDialog
        open={showInviteDialog}
        onOpenChange={setShowInviteDialog}
        businessId={businessId ? Number(businessId) : null}
        onInvited={() => mutate()}
      />
    </div>
  );
}
