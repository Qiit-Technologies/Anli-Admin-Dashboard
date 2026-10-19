/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { AxiosError } from "axios";
import {
  axiosGet,
  axiosPatch,
  axiosPost,
  axiosDelete,
  isRedirectError,
} from "../lib/server-api";
import { getAuthToken } from "../lib/auth";
import { GetStaffOptions, getStaffResponse } from "./types";
import { ApiResponse, ErrorResponseData } from "../lib/types";

export default async function getStaff(
  options: GetStaffOptions,
): Promise<getStaffResponse> {
  const {
    page = 1,
    limit = 10,
    searchTerm,
    businessId,
    status,
    department,
    startDate,
    endDate,
  } = options;

  try {
    const authToken = await getAuthToken();

    const baseUrl = searchTerm
      ? `/super-admin/${businessId}/staff/search/${encodeURIComponent(
          searchTerm,
        )}`
      : `/super-admin/${businessId}/staff`;

    // Build query parameters
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (status) params.append("status", status);
    if (department) params.append("department", department);
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);

    const url = `${baseUrl}?${params.toString()}`;

    const response = await axiosGet<getStaffResponse>(url, {
      config: {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      },
    });

    if (!response) {
      return {
        message: "No data received",
        data: {
          staffs: [],
          page,
          limit,
          total: 0,
          totalPages: 0,
        },
      };
    }

    return response;
  } catch (error: unknown) {
    if (isRedirectError(error)) throw error;

    const axiosError = error as AxiosError;
    const message =
      (axiosError.response?.data as ErrorResponseData)?.message ||
      "An unexpected error occurred";

    return {
      message,
      data: {
        staffs: [],
        page,
        limit,
        total: 0,
        totalPages: 0,
      },
    };
  }
}

export async function updateStaff<T extends object>(
  businessId: number,
  staffPayload: T,
  staffId: number,
) {
  const authToken = await getAuthToken();

  await axiosPatch<ApiResponse<any>>(
    `/super-admin/${businessId}/staff/${staffId}`,
    staffPayload,
    {
      config: {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      },
    },
  );
}

export async function resetStaffPassword(
  businessId: number,
  staffId: number,
  payload: { password: string; email: string },
) {
  const authToken = await getAuthToken();

  const response = await axiosPost<ApiResponse<any>>(
    `/super-admin/${businessId}/staff/${staffId}/reset-password`,
    payload,
    {
      config: {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      },
    },
  );

  return response;
}

/**
 * Phase 1 (C2/C3) — invite-by-email for staff accounts.
 * Creates an inactive staff record and emails a single-use invite link.
 */
export async function inviteStaffByEmail(input: {
  email: string;
  fullName: string;
  businessId: number;
  roleId?: number;
  moduleIds?: number[];
  permissionIds?: number[];
}) {
  const response = await axiosPost<ApiResponse<any>>(
    `/super-admin/users/invite`,
    input
  );

  return response;
}

/** Re-sends a pending staff invite (invalidates the previous token). */
export async function resendStaffInvite(staffId: number) {
  const response = await axiosPost<ApiResponse<any>>(
    `/super-admin/users/${staffId}/resend-invite`
  );

  return response;
}

/** Cancels a pending staff invite. */
export async function cancelStaffInvite(staffId: number) {
  const response = await axiosPost<ApiResponse<any>>(
    `/super-admin/users/${staffId}/cancel-invite`
  );

  return response;
}

/**
 * Phase 1 (C3) — emailed password-reset link.
 * Replaces flows that generated/displayed plaintext passwords.
 */
export async function requestStaffPasswordReset(staffId: number) {
  const response = await axiosPost<ApiResponse<any>>(
    `/super-admin/users/${staffId}/request-password-reset`
  );

  return response;
}

/** Accepts an invite from the emailed link (public). */
export async function acceptStaffInvite(token: string, password: string) {
  const response = await axiosPost<ApiResponse<any>>(
    `/super-admin/auth/accept-invite`,
    { token, password }
  );

  return response;
}

/** Sets a new password from the emailed reset link (public). */
export async function resetStaffPasswordWithToken(
  token: string,
  newPassword: string
) {
  const response = await axiosPost<ApiResponse<any>>(
    `/super-admin/auth/reset-password`,
    { token, newPassword }
  );

  return response;
}

export async function deleteStaff(businessId: number, staffId: number) {
  const authToken = await getAuthToken();

  const response = await axiosDelete<ApiResponse<any>>(
    `/super-admin/${businessId}/staff/${staffId}`,
    {
      config: {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      },
    },
  );

  return response;
}

export async function undeleteStaff(businessId: number, staffId: number) {
  const authToken = await getAuthToken();

  if (!businessId) {
    throw new Error("businessId is required");
  }

  const url = `/super-admin/${businessId}/staff/${staffId}/undelete`;

  const response = await axiosPatch<ApiResponse<any>>(
    url,
    {
      success: true,
      data: {
        message: "Staff restored successfully",
      },
    },
    {
      config: {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      },
      currentPath: "/dashboard/staffs",
    },
  );

  return response;
}
