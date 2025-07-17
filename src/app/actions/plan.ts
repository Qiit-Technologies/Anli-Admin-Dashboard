"use server";

import { AxiosError } from "axios";
import { axiosGet } from "../lib/api";
import { getAuthToken } from "../lib/auth";
import { GetPlanOptions, getPlanResponse } from "./types";
import { ErrorResponseData } from "../lib/types";

export default async function getPlan(
  options: GetPlanOptions
): Promise<getPlanResponse> {
  const { id } = options;
  try {
    const authToken = await getAuthToken();
    const url = `/super-admin/${id}/pricing/current-plan`;

    const response = await axiosGet<getPlanResponse>(url, {
      config: {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      },
    });

    if (!response) {
      return {
        message: "No data received",
        data: {
          billingInfo: {
            plan_name: "",
            renewal_date: "",
            billing_cycle: "",
            modules: [],
          },
        },
      };
    }

    return response;
  } catch (error: unknown) {
    console.log(error, "it has happed o")
    const axiosError = error as AxiosError;
    const message =
      (axiosError.response?.data as ErrorResponseData)?.message ||
      "An unexpected error occurred";

    return {
      message,
      data: {
        billingInfo: {
          plan_name: "",
          renewal_date: "",
          billing_cycle: "",
          modules: [],
        },
      },
    };
  }
}
