/* eslint-disable @typescript-eslint/no-explicit-any */

"use server";

import { axiosGet, axiosPost } from "../lib/api";
import { getAuthToken } from "../lib/auth";

export type InitiatePaymentPayload = {
  businessId: string;
  amount: number;
  method: string;
  description?: string;
};

export async function initiatePayment({
  businessId,
  amount,
  method,
  description,
}: InitiatePaymentPayload) {
  try {
    const token = await getAuthToken();
    const url = `/super-admin/${businessId}/billing/initiate-payment`;

    const response = await axiosPost<any>(
      url,
      { amount, method, description },
      {
        config: {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
        currentPath: "/dashboard/plan",
      }
    );
    console.log(response);
    return response;
  } catch (error) {
    console.log(error);
  }
}

export async function getPaymentHistory(businessId: string) {
  const token = await getAuthToken();
  const url = `/super-admin/${businessId}/billing/payment-history`;

  const response = await axiosGet<any>(url, {
    config: {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    },
    currentPath: "/dashboard/payments",
  });

  return response;
}

export async function markPaymentCompleted(paymentId: string) {
  const token = await getAuthToken();
  const url = `/super-admin/billing/mark-payment-completed`;

  const response = await axiosPost<any>(
    url,
    { paymentId, transactionReference: `MANUAL_${Date.now()}` },
    {
      config: {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
      currentPath: "/dashboard/payments",
    }
  );

  return response;
}

export async function cancelPayment(paymentId: string) {
  const token = await getAuthToken();
  const url = `/super-admin/billing/payment/${paymentId}/cancel`;

  // axios doesn't have a dedicated helper here for PUT; use axiosPost semantics via config override if needed later.
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000"}${url}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  ).then((r) => r.json());

  return response;
}

export async function verifyPayment(paymentId: string) {
  const token = await getAuthToken();
  const url = `/super-admin/billing/payment/${paymentId}/verify`;

  const response = await axiosPost<any>(
    url,
    {},
    {
      config: {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
      currentPath: "/dashboard/plan",
    }
  );

  return response;
}

export async function getPaymentStatus(paymentId: string) {
  const token = await getAuthToken();
  const url = `/super-admin/billing/payment/${paymentId}/status`;

  const response = await axiosGet<any>(url, {
    config: {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    },
    currentPath: "/dashboard/plan",
  });

  return response;
}
