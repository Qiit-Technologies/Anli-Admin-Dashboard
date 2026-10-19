"use server";

import { AxiosError } from "axios";
import { axiosDelete, axiosGet, axiosPost, isRedirectError } from "../lib/server-api";
import { ErrorResponseData } from "../lib/types";

export interface SubscriptionPlanSummary {
  id: number;
  name: string;
  price: number;
  /** Canonical tier id ('flex' | 'basic-hotel' | 'basic-restaurant' | 'advanced' | 'custom') or null. */
  tierId: string | null;
  modules: string[];
  description: string;
}

export type SubscriptionPlansResult =
  | { ok: true; data: SubscriptionPlanSummary[] }
  | { ok: false; error: string };

/** Subscription plans with canonical tier ids (GET /super-admin/plans). */
export async function getSubscriptionPlans(): Promise<SubscriptionPlansResult> {
  try {
    const body = await axiosGet<unknown>("/super-admin/plans", {
      currentPath: "/dashboard/plan",
    });
    // HQ endpoints wrap payloads in { success, data, message } — unwrap defensively.
    const data =
      body && typeof body === "object" && !Array.isArray(body) && "data" in body
        ? body.data
        : body;
    return { ok: true, data: (data ?? []) as SubscriptionPlanSummary[] };
  } catch (error: unknown) {
    if (isRedirectError(error)) throw error;
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Failed to load plans",
    };
  }
}

export async function selectPlan(payload: { planId: string }, hotelId: number) {
  try {
    const url = `/super-admin/${hotelId}/billing/select-plan`;
    const response = await axiosPost(url, payload, {
      currentPath: "/dashboard/plan",
    });

    return response;
  } catch (error: unknown) {
    if (isRedirectError(error)) throw error;
    const axiosError = error instanceof AxiosError ? error : undefined;
    const message =
      (axiosError?.response?.data as ErrorResponseData)?.message ||
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
  },
) {
  try {
    const url = `/super-admin/${hotelId}/billing/warning-timer`;
    const response = await axiosPost(url, payload, {
      currentPath: "/dashboard/plan",
    });

    return response;
  } catch (error: unknown) {
    if (isRedirectError(error)) throw error;
    const axiosError = error instanceof AxiosError ? error : undefined;
    const message =
      (axiosError?.response?.data as ErrorResponseData)?.message ||
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
  } catch (error: unknown) {
    if (isRedirectError(error)) throw error;
    const axiosError = error instanceof AxiosError ? error : undefined;
    const message =
      (axiosError?.response?.data as ErrorResponseData)?.message ||
      "Failed to clear warning timer";
    throw new Error(message);
  }
}

export async function switchBillingCycle(
  hotelId: number,
  billingCycle: "monthly" | "yearly",
) {
  try {
    const url = `/super-admin/${hotelId}/billing/switch-billing-cycle`;
    const response = await axiosPost(
      url,
      { billingCycle },
      {
        currentPath: "/dashboard/plan",
      },
    );

    return response;
  } catch (error: unknown) {
    if (isRedirectError(error)) throw error;
    const axiosError = error instanceof AxiosError ? error : undefined;
    const message =
      (axiosError?.response?.data as ErrorResponseData)?.message ||
      "Failed to switch billing cycle";
    throw new Error(message);
  }
}

export async function sendPaymentReminder(hotelId: number) {
  try {
    const url = `/super-admin/${hotelId}/billing/payment-reminder`;
    const response = await axiosPost(
      url,
      {},
      {
        currentPath: "/dashboard",
      },
    );

    return response;
  } catch (error: unknown) {
    if (isRedirectError(error)) throw error;
    const axiosError = error instanceof AxiosError ? error : undefined;
    const message =
      (axiosError?.response?.data as ErrorResponseData)?.message ||
      "Failed to send payment reminder";
    throw new Error(message);
  }
}

export async function reactivateBusiness(hotelId: number) {
  try {
    const url = `/super-admin/${hotelId}/billing/reactivate`;
    const response = await axiosPost(
      url,
      {},
      {
        currentPath: "/dashboard",
      },
    );

    return response;
  } catch (error: unknown) {
    if (isRedirectError(error)) throw error;
    const axiosError = error instanceof AxiosError ? error : undefined;
    const message =
      (axiosError?.response?.data as ErrorResponseData)?.message ||
      "Failed to reactivate business";
    throw new Error(message);
  }
}
