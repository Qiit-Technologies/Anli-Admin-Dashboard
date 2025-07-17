"use server";

import { AxiosError } from "axios";
import { axiosGet } from "../lib/api";
import { getAuthToken } from "../lib/auth";
import { businessListResponse, GetBusinessListOptions } from "./types";
import { ErrorResponseData } from "../lib/types";

export default async function getBusinessList(
  options: GetBusinessListOptions = {}
): Promise<businessListResponse> {
  const { page = 1, limit = 9, searchTerm } = options;

  try {
    const authToken = await getAuthToken();

    const baseUrl = searchTerm
      ? `/super-admin/hotels/search/${encodeURIComponent(searchTerm)}`
      : `/super-admin/hotels`;

    const url = `${baseUrl}?page=${page}&limit=${limit}`;

    const response = await axiosGet<businessListResponse>(url, {
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
          hotels: [],
        },
        page,
        limit,
        total: 0,
      };
    }

    return response;
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
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
