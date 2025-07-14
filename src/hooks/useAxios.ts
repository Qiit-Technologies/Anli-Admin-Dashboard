import { useCallback } from "react";
import axios, { AxiosError, AxiosRequestConfig } from "axios";
import { usePathname, useRouter } from "next/navigation";

axios.defaults.withCredentials = true;

const baseURL = process?.env?.NEXT_PUBLIC_API_BASE_URL;

const instance = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export function useAxios() {
  const pathname = usePathname();
  const router = useRouter();

  const handleError = useCallback(
    (error: AxiosError) => {
      const status = error.response?.status;
      if (status === 401 && pathname !== "/login") {
        router.push("/login");
      } else {
        throw error;
      }
    },
    [pathname, router]
  );

  const axiosGet = useCallback(
    async <T = unknown>(
      url: string,
      params?: Record<string, string | number>,
      config?: AxiosRequestConfig
    ) => {
      try {
        const response = await instance.get<T>(url, {
          ...config,
          params,
        });
        return response.data;
      } catch (error) {
        handleError(error as AxiosError);
      }
    },
    [handleError]
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
    [handleError]
  );

  return { axiosGet, axiosPost };
}
