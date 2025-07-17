import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from "axios";
import { redirect } from "next/navigation";

const instance: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status >= 500) {
      return Promise.reject(error);
    }
    return Promise.resolve(error.response);
  }
);

function handleError(error: AxiosError, currentPath?: string) {
  const status = error.response?.status;

  if (status === 401 && currentPath !== "/login") {
    // Only works in server components (not route handlers)
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
    const response = await instance.post<T>(url, data, config);
    return response.data;
  } catch (error) {
    handleError(error as AxiosError, currentPath);
    return undefined;
  }
}
