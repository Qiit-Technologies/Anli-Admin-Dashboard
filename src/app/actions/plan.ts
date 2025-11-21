"use server";

import { AxiosError } from "axios";
import { axiosDelete, axiosPost, isRedirectError } from "../lib/api";
import { ErrorResponseData } from "../lib/types";

export async function selectPlan(payload: { planId: string }, hotelId: number) {
  try {
    const url = `/super-admin/${hotelId}/billing/select-plan`;
    const response = await axiosPost(url, payload, {
      currentPath: "/dashboard/plan",
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

export async function startWarningTimer(
  hotelId: number,
  payload: {
    durationHours?: number;
    reason?: string;
    warningStartedAt?: string;
    warningExpiresAt?: string;
  }
) {
  try {
    const url = `/super-admin/${hotelId}/billing/warning-timer`;
    const response = await axiosPost(url, payload, {
      currentPath: "/dashboard/plan",
    });

    return response;
  } catch (error) {
    if (isRedirectError(error)) throw error;
    const axiosError = error as AxiosError;
    const message =
      (axiosError.response?.data as ErrorResponseData)?.message ||
      "Failed to start warning timer";
    throw new Error(message);
  }
}

export async function cancelWarningTimer(hotelId: number) {
  try {
    const url = `/super-admin/${hotelId}/billing/warning-timer`;
    const response = await axiosDelete(url, {
      currentPath: "/dashboard/plan",
    });

    return response;
  } catch (error) {
    if (isRedirectError(error)) throw error;
    const axiosError = error as AxiosError;
    const message =
      (axiosError.response?.data as ErrorResponseData)?.message ||
      "Failed to clear warning timer";
    throw new Error(message);
  }
}
