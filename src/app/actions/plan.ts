"use server";

import { AxiosError } from "axios";
import { axiosPost, isRedirectError } from "../lib/api";
import { ErrorResponseData } from "../lib/types";
import { getAuthToken } from "../lib/auth";

export async function selectPlan(payload: { planId: string }, hotelId: number) {
  try {
    const authToken = await getAuthToken();
    if (!authToken) {
      return { message: "Authentication token not found." };
    }
    const url = `/super-admin/${hotelId}/billing/select-plan`;
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
    console.log(error);
    if (isRedirectError(error)) throw error;
    const axiosError = error as AxiosError;
    const message =
      (axiosError.response?.data as ErrorResponseData)?.message ||
      "An unexpected error occurred";
    throw new Error(message);
  }
}
