"use server";

import { AxiosError } from "axios";
import { isRedirectError, axiosPatch, axiosPost } from "../lib/api";
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
    const url = `/super-admin/${hotelId}/reports/update/${reportId}`;
    const response = await axiosPatch(url, payload);

    return response;
  } catch (error: any) {
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
    const url = `/super-admin/${businessId}/reports`;

    const response = await axiosPost(url, payload);
    return response;
  } catch (error: any) {
    if (isRedirectError(error)) throw error;
    const axiosError = error as AxiosError;
    const message =
      (axiosError.response?.data as ErrorResponseData)?.message ||
      "An unexpected error occurred";
    throw new Error(message);
  }
}
