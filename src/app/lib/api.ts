import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from "axios";
import { redirect } from "next/navigation";
import { getAuthToken } from "./auth";

const instance: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to inject the Authorization header
// Works for both client-side and server-side
instance.interceptors.request.use(
  async (config) => {
    let token: string | null = null;

    if (typeof window !== "undefined") {
      // Client-side: get from localStorage
      token = localStorage.getItem("access_token");
    } else {
      // Server-side: get from cookies
      try {
        token = await getAuthToken();
      } catch (error: any) {
        // If getAuthToken fails (e.g., cookies() called in wrong context), continue without token
        // This can happen if cookies() is called outside of a server component/action context
        // In that case, the request will proceed without auth and likely get a 401
        // The error handler will deal with it appropriately
        console.warn("Failed to get auth token in interceptor:", error);
      }
    }

    // Only add Authorization header if we have a token
    // If no token, let the request proceed and the server will return 401
    if (token) {
      config.headers = config.headers || {};
      config.headers["Authorization"] = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

instance.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error);
  },
);

function handleError(error: AxiosError, currentPath?: string) {
  const status = error.response?.status;

  // Don't log 404 errors - they're expected in some cases (e.g., missing subscriptions)
  if (status !== 404) {
    console.error("API Error:", status, error.message);
  }

  // Only redirect on 401 if we're not already on login page or business-list
  // And only if we're in a server context (not client-side)
  // Don't redirect from business-list - let the component handle it (cookie might not be set yet)
  if (
    status === 401 &&
    currentPath !== "/login" &&
    currentPath !== "/business-list"
  ) {
    if (typeof window === "undefined") {
      // Server-side: use redirect
      redirect("/login");
    }
    // Client-side: let the component handle it (don't redirect in error handler)
  }

  // Re-throw the error so callers can handle it
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
  } = {},
): Promise<T | undefined> {
  try {
    // Merge config - interceptor will handle Authorization header automatically
    const mergedConfig: AxiosRequestConfig = {
      ...config,
      params,
      // Headers will be merged by axios, and interceptor will add Authorization
      headers: config?.headers,
    };

    const response = await instance.get<T>(url, mergedConfig);
    return response.data;
  } catch (error: any) {
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
  } = {},
): Promise<T | undefined> {
  try {
    // Interceptor will handle Authorization header automatically
    const response = await instance.post<T>(url, data, config);
    return response.data;
  } catch (error: any) {
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
  } = {},
): Promise<T | undefined> {
  try {
    // Interceptor will handle Authorization header automatically
    const response = await instance.patch<T>(url, data, config);
    return response.data;
  } catch (error: any) {
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
  } = {},
): Promise<T | undefined> {
  try {
    // Interceptor will handle Authorization header automatically
    const response = await instance.delete<T>(url, config);
    return response.data;
  } catch (error: any) {
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
