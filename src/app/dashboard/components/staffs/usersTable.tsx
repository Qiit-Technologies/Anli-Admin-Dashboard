"use client";

import { ArrowDown, Calendar, ListFilterIcon } from "lucide-react";
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
import getStaff, { deleteStaff, undeleteStaff } from "@/app/actions/staff";
import { Spinner } from "@/components/ui/spinner";
import { ViewStaffDetailsBtn } from "./viewStaffDetailsBtn";
import { toast } from "react-toastify";

export default function UsersTable({ businessId }: { businessId: string }) {
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query);
  const limit = 10;

  // const [plainTextPasswords, setPlainTextPasswords] = useState<
  //   Record<number, string>
  // >({});
  const [deletingStaff, setDeletingStaff] = useState<Record<number, boolean>>(
    {}
  );
  const [undeletingStaff, setUndeleteStaff] = useState<Record<number, boolean>>(
    {}
  );
  // const [showResetPasswordConfirm, setShowResetPasswordConfirm] = useState<
  //   Record<number, boolean>
  // >({});

  const {
    data: response,
    isLoading,
    mutate,
  } = useSWR(
    [`/super-admin/get-staff`, page, limit, debouncedQuery, businessId],
    () =>
      getStaff({
        page,
        limit,
        searchTerm: debouncedQuery,
        businessId: businessId,
      })
  );

  const staff = response?.data?.staffs ?? [];
  const totalPages = response?.totalPages ?? 1;

  // Debug: Log the first staff member to see the structure
  if (staff.length > 0) {
    console.log("First staff member data:", staff[0]);
  }

  // const handleResetPassword = async (staffId: number) => {
  //   setResettingPasswords((prev) => ({ ...prev, [staffId]: true }));
  //   try {
  //     const newPassword = generateRandomPassword();
  //     const response = await resetStaffPassword(Number(businessId), staffId, {
  //       password: newPassword,
  //     });

  //     // Store the plain text password from the response
  //     if (response?.data?.plainTextPassword) {
  //       setPlainTextPasswords((prev) => ({
  //         ...prev,
  //         [staffId]: response.data.plainTextPassword,
  //       }));
  //     }

  //     // Show the new password temporarily
  //     setShowPasswords((prev) => ({ ...prev, [staffId]: true }));

  //     // Hide the password after 10 seconds
  //     setTimeout(() => {
  //       setShowPasswords((prev) => ({ ...prev, [staffId]: false }));
  //       setPlainTextPasswords((prev) => {
  //         const newState = { ...prev };
  //         delete newState[staffId];
  //         return newState;
  //       });
  //     }, 10000);

  //     toast.success(
  //       `Password reset successfully! New password: ${newPassword}`
  //     );
  //   } catch (error) {
  //     console.error("Failed to reset password:", error);
  //     toast.error("Failed to reset password. Please try again.");
  //   } finally {
  //     setResettingPasswords((prev) => ({ ...prev, [staffId]: false }));
  //   }
  // };

  // const handleResetPasswordClick = (staffId: number) => {
  //   setShowResetPasswordConfirm((prev) => ({ ...prev, [staffId]: true }));
  // };

  // const handleResetPasswordConfirm = async (staffId: number) => {
  //   setShowResetPasswordConfirm((prev) => ({ ...prev, [staffId]: false }));
  //   await handleResetPassword(staffId);
  // };

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
    } catch (error) {
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
    } catch (error) {
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
      ) : (
        <>
          {/* Header */}
          <div className="flex flex-col px-6 py-4 sm:flex-row justify-between items-start sm:items-center gap-3">
            <h2 className="text-lg font-normal text-[#101828]">Users</h2>
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              <SearchWithIcon
                className="w-[478px]"
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
            </div>
          </div>
          <Divider className="mb-4" />
          {/* Table */}
          <div className="overflow-x-auto">
            <Table>
              <Thead>
                <Tr>
                  <Th withIcon>Employee Name</Th>
                  <Th withIcon>Email Address</Th>
                  <Th withIcon>Phone Number</Th>
                  <Th withIcon>Department</Th>
                  {/* <Th withIcon>Password</Th> */}
                  <Th withIcon icon={<ArrowDown size={16} color="#667085" />}>
                    Employee Status
                  </Th>
                  <Th>Action</Th>
                </Tr>
              </Thead>
              <Tbody>
                {staff.map((row, i) => (
                  <Tr key={i} className={row.deletedAt ? "opacity-60" : ""}>
                    <Td>
                      <div className="flex items-center gap-2">
                        <Image
                          src={
                            row?.profileImage ||
                            `https://ui-avatars.com/api/?name=${row.fullName?.replaceAll(
                              " ",
                              "-"
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
                    {/* <Td>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <Key size={14} className="text-gray-500" />
                          <span className="text-xs text-gray-600">
                            {showPasswords[row.id] ? (
                              <span className="font-mono text-red-600">
                                {plainTextPasswords[row.id]
                                  ? plainTextPasswords[row.id]
                                  : row.password
                                  ? row.password.substring(0, 20) + "..."
                                  : "No password"}
                              </span>
                            ) : (
                              <span className="font-mono">
                                ••••••••••••••••••••
                              </span>
                            )}
                          </span>
                        </div>
                        {!row.deletedAt && (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() =>
                                setShowPasswords((prev) => ({
                                  ...prev,
                                  [row.id]: !prev[row.id],
                                }))
                              }
                              className="p-1 hover:bg-gray-100 rounded"
                              title={
                                showPasswords[row.id]
                                  ? "Hide password"
                                  : "Show password"
                              }
                            >
                              {showPasswords[row.id] ? (
                                <EyeOff size={12} className="text-gray-500" />
                              ) : (
                                <Eye size={12} className="text-gray-500" />
                              )}
                            </button>
                            <button
                              onClick={() => handleResetPasswordClick(row.id)}
                              disabled={resettingPasswords[row.id]}
                              className="p-1 hover:bg-gray-100 rounded disabled:opacity-50"
                              title="Reset password"
                            >
                              {resettingPasswords[row.id] ? (
                                <Spinner size="sm" className="text-gray-500" />
                              ) : (
                                <RefreshCw
                                  size={12}
                                  className="text-gray-500"
                                />
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    </Td> */}
                    <Td>
                      {row.deletedAt ? (
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
                    <ViewStaffDetailsBtn
                      staffInfo={row}
                      onDelete={handleDeleteStaff}
                      onUndelete={handleUndeleteStaff}
                      isDeleting={deletingStaff[row.id]}
                      isUndeleting={undeletingStaff[row.id]}
                    />
                  </Tr>
                ))}
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

      {/* Reset Password Confirmation Modals */}
      {/* {staff.map((row) => (
        <ConfirmationModal
          key={`reset-${row.id}`}
          isOpen={showResetPasswordConfirm[row.id] || false}
          onClose={() =>
            setShowResetPasswordConfirm((prev) => ({
              ...prev,
              [row.id]: false,
            }))
          }
          onConfirm={() => handleResetPasswordConfirm(row.id)}
          title="Reset Password"
          description={`Are you sure you want to reset the password for ${row.fullName}? A new password will be generated and shown to you.`}
          confirmText="Reset Password"
          cancelText="Cancel"
          confirmVariant="default"
          isLoading={resettingPasswords[row.id]}
        />
      ))} */}
    </div>
  );
}
