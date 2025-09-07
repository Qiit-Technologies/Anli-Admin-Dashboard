"use server";

import { axiosGet } from "../lib/api";
import { getAuthToken } from "../lib/auth";

export default async function fetcher<T>(url: string): Promise<T | undefined> {
  const authToken = await getAuthToken();
  const response = await axiosGet<T>(url, {
    config: {
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
      },
    },
  });

  return response;
}
