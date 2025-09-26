import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from "axios";
import { redirect } from "next/navigation";

const instance: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to inject the Authorization header
instance.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("access_token");
      if (token) {
        config.headers = config.headers || {};
        config.headers["Authorization"] = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

instance.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error); // 🔥 always reject on error
  }
);

function handleError(error: AxiosError, currentPath?: string) {
  const status = error.response?.status;
  console.log(status, error);
  if (status === 401 && currentPath !== "/login") {
    redirect("/login");
  }
  console.log(error, "why not throwing");
  throw error;
}

export async function axiosGet<T = unknown>(
  url: string,
  {
    params,
    config,
    currentPath,
  }: {
    params?: Record<string, string | number>;
    config?: AxiosRequestConfig;
    currentPath?: string; //pass manually for redirect check
  } = {}
): Promise<T | undefined> {
  try {
    const response = await instance.get<T>(url, {
      ...config,
      params,
    });
    return response.data;
  } catch (error) {
    handleError(error as AxiosError, currentPath);
    throw error;
  }
}

export async function axiosPost<T = unknown>(
  url: string,
  data?: unknown,
  {
    config,
    currentPath,
  }: {
    config?: AxiosRequestConfig;
    currentPath?: string;
  } = {}
): Promise<T | undefined> {
  try {
    const response = await instance.post<T>(url, data, { ...config });
    return response.data;
  } catch (error) {
    handleError(error as AxiosError, currentPath);
    throw error;
  }
}

export async function axiosPatch<T = unknown>(
  url: string,
  data?: unknown,
  {
    config,
    currentPath,
  }: {
    config?: AxiosRequestConfig;
    currentPath?: string;
  } = {}
): Promise<T | undefined> {
  try {
    const response = await instance.patch<T>(url, data, { ...config });
    return response.data;
  } catch (error) {
    handleError(error as AxiosError, currentPath);
    throw error;
  }
}

export async function axiosDelete<T = unknown>(
  url: string,
  {
    config,
    currentPath,
  }: {
    config?: AxiosRequestConfig;
    currentPath?: string;
  } = {}
): Promise<T | undefined> {
  try {
    const response = await instance.delete<T>(url, config);
    return response.data;
  } catch (error) {
    handleError(error as AxiosError, currentPath);
    throw error;
  }
}

export function isRedirectError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "digest" in error &&
    typeof (error as { digest?: string }).digest === "string" &&
    (error as { digest: string }).digest.startsWith("NEXT_REDIRECT")
  );
}
