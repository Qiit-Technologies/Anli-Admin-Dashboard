/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { AxiosError } from "axios";
import { axiosPatch, axiosPost, isRedirectError } from "../lib/api";
import { ErrorResponseData } from "../lib/types";

export async function createSubscriptionPlan(payload: {
  name: string;
  price: string;
  description: string;
  features: any;
}) {
  try {
    const url = `/super-admin/subscription-plan/create`;
    const response = await axiosPost(url, payload);

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

export async function updateSubscriptionPlan(
  planId: number,
  payload: {
    name: string;
    price: string;
    description: string;
    features: any;
  }
) {
  try {
    const url = `/super-admin/subscription-plan/${planId}/edit`;
    const response = await axiosPatch(url, payload);

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
