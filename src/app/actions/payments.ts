/* eslint-disable @typescript-eslint/no-explicit-any */

"use server";

import { axiosGet, axiosPost, axiosPatch } from "../lib/api";

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
    const url = `/super-admin/${businessId}/billing/initiate-payment`;

    const response = await axiosPost<any>(
      url,
      { amount, method, description },
      {
        currentPath: "/dashboard/plan",
      },
    );

    return response;
  } catch (error: any) {
    console.error("Failed to initiate payment:", error);
    throw error;
  }
}

export async function getPaymentHistory(businessId: string) {
  const url = `/super-admin/${businessId}/billing/payment-history`;

  const response = await axiosGet<any>(url, {
    currentPath: "/dashboard/payments",
  });

  return response;
}

export async function markPaymentCompleted(paymentId: string) {
  const url = `/super-admin/billing/mark-payment-completed`;

  const response = await axiosPost<any>(
    url,
    { paymentId, transactionReference: `MANUAL_${Date.now()}` },
    {
      currentPath: "/dashboard/payments",
    },
  );

  return response;
}

export async function cancelPayment(paymentId: string) {
  const url = `/super-admin/billing/payment/${paymentId}/cancel`;

  // Use axiosPatch for PUT requests (axios doesn't have a separate PUT method)
  const response = await axiosPatch<any>(
    url,
    {},
    {
      currentPath: "/dashboard/payments",
    },
  );

  return response;
}

export async function verifyPayment(paymentId: string) {
  const url = `/super-admin/billing/payment/${paymentId}/verify`;

  const response = await axiosPost<any>(
    url,
    {},
    {
      currentPath: "/dashboard/plan",
    },
  );

  return response;
}

export async function getPaymentStatus(paymentId: string) {
  const url = `/super-admin/billing/payment/${paymentId}/status`;

  const response = await axiosGet<any>(url, {
    currentPath: "/dashboard/plan",
  });

  return response;
}

export async function logInvoice(
  hotelId: string,
  invoiceData: {
    invoiceNumber: string;
    amount: number;
    description?: string;
    remarks?: string;
    billingMonth?: string;
    date: string;
    file?: File | null;
  },
) {
  const url = `/super-admin/${hotelId}/billing/log-invoice`;
  const formData = new FormData();

  formData.append("invoiceNumber", invoiceData.invoiceNumber);
  formData.append("amount", invoiceData.amount.toString());
  formData.append("date", invoiceData.date);

  if (invoiceData.description) {
    formData.append("description", invoiceData.description);
  }

  if (invoiceData.remarks) {
    formData.append("remarks", invoiceData.remarks);
  }

  if (invoiceData.billingMonth) {
    formData.append("billingMonth", invoiceData.billingMonth);
  }

  if (invoiceData.file) {
    formData.append("file", invoiceData.file);
  }

  const response = await axiosPost<any>(url, formData, {
    config: {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
    currentPath: "/dashboard/payments",
  });

  return response;
}
