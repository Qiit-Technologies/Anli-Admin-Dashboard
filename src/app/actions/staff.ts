/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { AxiosError } from "axios";
import {
  axiosGet,
  axiosPatch,
  axiosPost,
  axiosDelete,
  isRedirectError,
} from "../lib/api";
import { GetStaffOptions, getStaffResponse } from "./types";
import { ApiResponse, ErrorResponseData } from "../lib/types";

export default async function getStaff(
  options: GetStaffOptions
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
    const baseUrl = searchTerm
      ? `/super-admin/${businessId}/staff/search/${encodeURIComponent(
          searchTerm
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

    const response = await axiosGet<getStaffResponse>(url);

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

export async function updateStaff(
  businessId: number,
  staffPayload: any,
  staffId: number
) {
  const response = await axiosPatch<ApiResponse<any>>(
    `/super-admin/${businessId}/staff/${staffId}`,
    staffPayload
  );

  return response;
}

export async function resetStaffPassword(
  businessId: number,
  staffId: number,
  payload: { password: string; email: string }
) {
  const response = await axiosPost<ApiResponse<any>>(
    `/super-admin/${businessId}/staff/${staffId}/reset-password`,
    payload
  );

  return response;
}

export async function deleteStaff(businessId: number, staffId: number) {
  const response = await axiosDelete<ApiResponse<any>>(
    `/super-admin/${businessId}/staff/${staffId}`
  );

  return response;
}

export async function undeleteStaff(businessId: number, staffId: number) {
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
      currentPath: "/dashboard/staffs",
    }
  );

  return response;
}
