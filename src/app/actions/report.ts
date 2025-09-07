"use server";

import { AxiosError } from "axios";
import { axiosGet, isRedirectError, axiosPatch } from "../lib/api";
import { getAuthToken } from "../lib/auth";
import { GetReportsOptions, getReportsResponse } from "./types";
import { ErrorResponseData } from "../lib/types";

export default async function getReports(
  options: GetReportsOptions
): Promise<getReportsResponse> {
  try {
    const { page = 1, limit = 10, businessId } = options;

    const authToken = await getAuthToken();

    const url = `/super-admin/${Number(
      businessId
    )}/reports?page=${page}&limit=${limit}`;

    const response = await axiosGet<getReportsResponse>(url, {
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
          reports: [],
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
        reports: [],
      },
    };
  }
}

export async function updateReportStatus({
  hotelId,
  reportId,
  status,
  currentPath,
}: {
  hotelId: number;
  reportId: number;
  status: string;
  currentPath?: string;
}) {
  try {
    const authToken = await getAuthToken();
    if (!authToken) {
      return { message: "Authentication token not found." };
    }
    const url = `/super-admin/${hotelId}/reports/${reportId}/status`;
    const response = await axiosPatch(
      url,
      { status },
      {
        config: {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        },
        currentPath,
      }
    );
    return response;
  } catch (error) {
    if (isRedirectError(error)) throw error;
    const axiosError = error as AxiosError;
    const message =
      (axiosError.response?.data as ErrorResponseData)?.message ||
      "An unexpected error occurred";
    return { message };
  }
}
