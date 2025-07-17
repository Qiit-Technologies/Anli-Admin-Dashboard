"use server";

import { AxiosError } from "axios";
import { axiosGet, isRedirectError } from "../lib/api";
import { getAuthToken } from "../lib/auth";
import { GetStaffOptions, getStaffResponse } from "./types";
import { ErrorResponseData } from "../lib/types";

export default async function getStaff(
  options: GetStaffOptions
): Promise<getStaffResponse> {
  const { page = 1, limit = 10, searchTerm, businessId } = options;

  try {
    const authToken = await getAuthToken();

    const baseUrl = searchTerm
      ? `/super-admin/${businessId}/staff/search/${encodeURIComponent(
          searchTerm
        )}`
      : `/super-admin/${businessId}/staff`;

    const url = `${baseUrl}?page=${page}&limit=${limit}`;

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
        },
        page,
        limit,
        total: 0,
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
      },
      page,
      limit,
      total: 0,
    };
  }
}
