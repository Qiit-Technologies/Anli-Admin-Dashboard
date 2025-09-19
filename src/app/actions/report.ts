"use server";

import { AxiosError } from "axios";
import { axiosGet, isRedirectError, axiosPatch, axiosPost } from "../lib/api";
import { getAuthToken } from "../lib/auth";
import { GetReportsOptions, getReportsResponse } from "./types";
import { ErrorResponseData } from "../lib/types";

export async function updateReport(
  hotelId: string,
  reportId: number,
  payload: {
    comment: string;
    status: string;
  },
) {
  try {
    const authToken = await getAuthToken();
    if (!authToken) {
      return { message: "Authentication token not found." };
    }
    const url = `/super-admin/${hotelId}/reports/update/${reportId}`;
    const response = await axiosPatch(url, payload, {
      config: {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      },
    });

    return response;
  } catch (error) {
    if (isRedirectError(error)) throw error;
    const axiosError = error as AxiosError;
    const message =
      (axiosError.response?.data as ErrorResponseData)?.message ||
      "An unexpected error occurred";
    throw new Error(message);
  }
}

export async function createIssue(
  payload: { description: string },
  businessId: string,
) {
  try {
    const authToken = await getAuthToken();

    if (!authToken) {
      return { message: "Authentication token not found." };
    }

    const url = `/super-admin/${businessId}/reports`;

    const response = await axiosPost(url, payload, {
      config: {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      },
    });
    return response;
  } catch (error) {
    if (isRedirectError(error)) throw error;
    const axiosError = error as AxiosError;
    const message =
      (axiosError.response?.data as ErrorResponseData)?.message ||
      "An unexpected error occurred";
    throw new Error(message);
  }
}
