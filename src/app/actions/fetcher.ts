"use server";

import { axiosGet } from "../lib/api";
import { AxiosError } from "axios";

export default async function fetcher<T>(url: string): Promise<T | undefined> {
  try {
    // Token is automatically injected by the interceptor
    const response = await axiosGet<T>(url);

    return response;
  } catch (error) {
    // Handle 404 errors gracefully - hotel might not have a subscription
    const axiosError = error as AxiosError;
    if (axiosError?.response?.status === 404) {
      // Return undefined for 404s instead of throwing
      return undefined;
    }
    // Re-throw other errors
    throw error;
  }
}
