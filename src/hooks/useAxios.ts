import { useCallback } from "react";
import axios, { AxiosError, AxiosRequestConfig } from "axios";
import { toast } from "sonner";
import { ErrorResponseData } from "./types";

const baseURL = process?.env?.NEXT_PUBLIC_API_BASE_URL;

const instance = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export function useAxios() {
  const handleError = (error: AxiosError) => {
    const status = error.response?.status;
    const message =
      (error.response?.data as ErrorResponseData)?.message ||
      error.message ||
      "An error occurred";

    if (status === 400 || status === 401) {
      toast.error(message);
    } else {
      throw error;
    }
  };

  const axiosGet = useCallback(
    async <T = unknown>(url: string, config?: AxiosRequestConfig) => {
      try {
        const response = await instance.get<T>(url, config);
        return response.data;
      } catch (error) {
        handleError(error as AxiosError);
      }
    },
    []
  );

  const axiosPost = useCallback(
    async <T = unknown>(
      url: string,
      data?: unknown,
      config?: AxiosRequestConfig
    ) => {
      try {
        const response = await instance.post<T>(url, data, config);
        return response.data;
      } catch (error) {
        handleError(error as AxiosError);
      }
    },
    []
  );

  return { axiosGet, axiosPost };
}
