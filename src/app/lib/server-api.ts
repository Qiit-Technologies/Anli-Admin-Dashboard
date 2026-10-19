import type { AxiosRequestConfig } from "axios";
import { cookies } from "next/headers";
import {
  axiosDelete as requestDelete,
  axiosGet as requestGet,
  axiosPatch as requestPatch,
  axiosPost as requestPost,
  axiosPut as requestPut,
  isRedirectError,
} from "./api";

type RequestOptions = {
  config?: AxiosRequestConfig;
  currentPath?: string;
};

type GetOptions = RequestOptions & {
  params?: Record<string, string | number>;
};

async function withAuth(config?: AxiosRequestConfig): Promise<AxiosRequestConfig> {
  const token = (await cookies()).get("access_token")?.value;
  if (!token) {
    throw new Error("Authentication token not found.");
  }

  const headers = {
    ...config?.headers,
    Authorization: `Bearer ${token}`,
  };

  return { ...config, headers };
}

export async function axiosGet<T = unknown>(
  url: string,
  options: GetOptions = {},
): Promise<T | undefined> {
  return requestGet<T>(url, {
    ...options,
    config: await withAuth(options.config),
  });
}

export async function axiosPost<T = unknown>(
  url: string,
  data?: unknown,
  options: RequestOptions = {},
): Promise<T | undefined> {
  return requestPost<T>(url, data, {
    ...options,
    config: await withAuth(options.config),
  });
}

export async function axiosPut<T = unknown>(
  url: string,
  data?: unknown,
  options: RequestOptions = {},
): Promise<T | undefined> {
  return requestPut<T>(url, data, {
    ...options,
    config: await withAuth(options.config),
  });
}

export async function axiosPatch<T = unknown>(
  url: string,
  data?: unknown,
  options: RequestOptions = {},
): Promise<T | undefined> {
  return requestPatch<T>(url, data, {
    ...options,
    config: await withAuth(options.config),
  });
}

export async function axiosDelete<T = unknown>(
  url: string,
  options: RequestOptions = {},
): Promise<T | undefined> {
  return requestDelete<T>(url, {
    ...options,
    config: await withAuth(options.config),
  });
}

export { isRedirectError };
