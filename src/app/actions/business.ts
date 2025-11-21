"use server";

import { AxiosError } from "axios";
import { axiosGet, isRedirectError } from "../lib/api";
import { getBusinessListResponse, GetBusinessListOptions } from "./types";
import { ErrorResponseData } from "../lib/types";

export default async function getBusinessList(
  options: GetBusinessListOptions = {}
): Promise<getBusinessListResponse> {
  const { page = 1, limit = 10, searchTerm } = options;

  try {
    const baseUrl = searchTerm
      ? `/super-admin/hotels/search/${encodeURIComponent(searchTerm)}`
      : `/super-admin/hotels`;

    const url = `${baseUrl}?page=${page}&limit=${limit}`;

    const response = await axiosGet<getBusinessListResponse>(url, {
      currentPath: "/business-list",
    });

    if (!response) {
      return {
        message: "No data received",
        data: {
          hotels: [],
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

    // Don't return empty data on 401 - let the error propagate so the UI can handle it
    // This prevents the redirect from happening in the error handler
    if (axiosError.response?.status === 401) {
      throw error; // Re-throw 401 so it can be handled by the component
    }

    const message =
      (axiosError.response?.data as ErrorResponseData)?.message ||
      "An unexpected error occurred";

    return {
      message,
      data: {
        hotels: [],
      },
      page,
      limit,
      total: 0,
    };
  }
}
