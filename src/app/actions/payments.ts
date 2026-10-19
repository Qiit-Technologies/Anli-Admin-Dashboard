"use server";

import { AxiosError } from "axios";
import {
  axiosGet,
  axiosPost,
  axiosPut,
  isRedirectError,
} from "../lib/server-api";
import { getAuthToken } from "../lib/auth";

export type InitiatePaymentPayload = {
  businessId: string;
  amount: number;
  method: string;
  description?: string;
};

type InitiatePaymentData = {
  paymentId: string;
  amount: number;
  method: string;
  description?: string;
  hotelName?: string;
  hotelOwnerEmail?: string;
  paymentLink?: string;
};

export type PaymentActionResult<T> =
  | { success: true; data: T; message?: string }
  | { success: false; data?: undefined; message?: string };

export type InitiatePaymentResult = PaymentActionResult<InitiatePaymentData>;

type PaymentStatusData = {
  id: string;
  amount: number;
  status: "pending" | "successful" | "failed";
  method: string;
  description?: string;
  createdAt: string;
  expiresAt?: string;
  completedAt?: string;
  paymentLink?: string;
  hotelName?: string;
  hotelOwnerEmail?: string;
};

function failedPaymentAction<T>(
  error: unknown,
  fallback: string,
): PaymentActionResult<T> {
  if (error instanceof AxiosError) {
    const responseData = error.response?.data;
    if (
      responseData &&
      typeof responseData === "object" &&
      "message" in responseData
    ) {
      const message = responseData.message;
      return {
        success: false,
        message: Array.isArray(message)
          ? message.join("; ")
          : typeof message === "string"
            ? message
            : fallback,
      };
    }
  }

  return {
    success: false,
    message: error instanceof Error ? error.message : fallback,
  };
}

async function requestPaymentAction<T>(
  method: "get" | "post" | "put",
  path: string,
  body?: unknown,
  currentPath = "/dashboard/plan",
): Promise<PaymentActionResult<T>> {
  const token = await getAuthToken();
  if (!token) {
    return { success: false, message: "Authentication token not found." };
  }

  const options = {
    config: {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    },
    currentPath,
  };

  try {
    let result: PaymentActionResult<T> | undefined;
    if (method === "get") {
      result = await axiosGet<PaymentActionResult<T>>(path, options);
    } else if (method === "post") {
      result = await axiosPost<PaymentActionResult<T>>(path, body, options);
    } else {
      result = await axiosPut<PaymentActionResult<T>>(path, body, options);
    }

    return (
      result ?? {
        success: false,
        message: "The server returned no payment result.",
      }
    );
  } catch (error: unknown) {
    if (isRedirectError(error)) throw error;
    return failedPaymentAction(error, "The payment request failed.");
  }
}

export async function initiatePayment({
  businessId,
  amount,
  method,
  description,
}: InitiatePaymentPayload): Promise<InitiatePaymentResult> {
  const token = await getAuthToken();
  if (!token) {
    return { success: false, message: "Authentication token not found." };
  }

  try {
    const result = await axiosPost<InitiatePaymentResult>(
      `/super-admin/${businessId}/billing/initiate-payment`,
      { amount, method, description },
      {
        config: {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
        currentPath: "/dashboard/plan",
      },
    );

    return (
      result ?? {
        success: false,
        message: "The server returned no payment result.",
      }
    );
  } catch (error: unknown) {
    if (isRedirectError(error)) throw error;

    if (error instanceof AxiosError) {
      const responseData = error.response?.data;
      if (
        responseData &&
        typeof responseData === "object" &&
        "message" in responseData
      ) {
        const message = responseData.message;
        return {
          success: false,
          message: Array.isArray(message)
            ? message.join("; ")
            : typeof message === "string"
              ? message
              : "Failed to initiate payment.",
        };
      }
    }

    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "An unexpected error occurred while initiating payment.",
    };
  }
}

export async function getPaymentStatus(
  paymentId: string,
): Promise<PaymentActionResult<PaymentStatusData>> {
  return requestPaymentAction(
    "get",
    `/super-admin/billing/payment/${encodeURIComponent(paymentId)}/status`,
  );
}

export async function verifyPayment(
  paymentId: string,
): Promise<PaymentActionResult<PaymentStatusData>> {
  return requestPaymentAction(
    "post",
    `/super-admin/billing/payment/${encodeURIComponent(paymentId)}/verify`,
    {},
  );
}

export async function markPaymentCompleted(
  paymentId: string,
  transactionReference?: string,
): Promise<PaymentActionResult<PaymentStatusData>> {
  return requestPaymentAction(
    "post",
    "/super-admin/billing/mark-payment-completed",
    {
      paymentId,
      transactionReference:
        transactionReference?.trim() || `MANUAL_${Date.now()}`,
    },
  );
}

export async function cancelPayment(
  paymentId: string,
): Promise<PaymentActionResult<PaymentStatusData>> {
  return requestPaymentAction(
    "put",
    `/super-admin/billing/payment/${encodeURIComponent(paymentId)}/cancel`,
  );
}
