"use server";

import { AxiosError } from "axios";
import { axiosGet, axiosPost, axiosPatch, axiosDelete } from "../lib/api";
// Aliased: this module also exports its own Permission interface (feature branch),
// used by the role-management UI. The ./types Permission keeps its shape here.
import { Permission as TypesPermission, GetPermissionsListOptions } from "./types";
import { ErrorResponseData } from "../lib/types";
import api from "@/lib/axios";
import { getAuthToken } from "./auth/auth-token";

// From feature/loyalty-admin: shapes used by role management UI (EditModal, CreateRole)
export interface Module {
    id: number;
    name: string;
    description?: string;
}

export interface Permission {
    id: number;
    name: string;
    description?: string;
    module?: Module;
}

export interface CreatePermissionDto {
  name: string;
  description?: string;
  moduleId?: number;
}

export interface UpdatePermissionDto {
  name?: string;
  description?: string;
  moduleId?: number;
}

export type permissionResponse = {
  message: string;
  data: TypesPermission;
};

// Get all permissions
export default async function getPermissionsList(
  options: GetPermissionsListOptions = {}
): Promise<{ permissions: TypesPermission[] }> {
  const { page = 1, limit = 10, searchTerm } = options;

  try {
    const baseUrl = searchTerm
      ? `/permissions/search/${encodeURIComponent(searchTerm)}`
      : `/permissions`;

    const url = `${baseUrl}?page=${page}&limit=${limit}`;

    const response = await axiosGet<{ permissions: TypesPermission[] }>(url);

    if (!response) {
      return { permissions: [] };
    }

    return response;
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    console.error("Error fetching permissions:", axiosError);
    return { permissions: [] };
  }
}

// Create a new permission
export async function createPermission(
  permissionData: CreatePermissionDto
): Promise<permissionResponse> {
  try {
    const url = `/permissions`;

    const response = await axiosPost<permissionResponse>(url, permissionData);

    if (!response) {
      throw new Error("No data received from API");
    }

    return response;
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    const message =
      (axiosError.response?.data as ErrorResponseData)?.message ||
      "An unexpected error occurred";

    throw new Error(message);
  }
}

// Update a permission
export async function updatePermission(
  id: string,
  permissionData: UpdatePermissionDto
): Promise<permissionResponse> {
  try {
    const url = `/permissions/${id}`;

    const response = await axiosPatch<permissionResponse>(url, permissionData);

    if (!response) {
      throw new Error("No data received");
    }

    return response;
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    const message =
      (axiosError.response?.data as ErrorResponseData)?.message ||
      "An unexpected error occurred";

    throw new Error(message);
  }
}

// Delete a permission
export async function deletePermission(id: string): Promise<void> {
  try {
    const url = `/permissions/${id}`;

    await axiosDelete(url);
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    const message =
      (axiosError.response?.data as ErrorResponseData)?.message ||
      "An unexpected error occurred";

    throw new Error(message);
  }
}

// From feature/loyalty-admin: { data } shape expected by role management UI
export async function getPermissions() {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }
        const response = await api.get('/permissions/public-permissions', {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        });
        return { data: response.data };
    } catch (error: any) {
        return { error: error.message || 'Failed to fetch permissions.' };
    }
}

// From main branch: interceptor-auth variant of getPermissions (no explicit
// auth header). Preserved for union — no current callers.
export async function getPublicPermissions() {
  try {
    const response = await axiosGet("/permissions/public-permissions");

    if (!response) {
      return { permissions: [] };
    }

    return response;
  } catch (error: unknown) {
    return {
      error:
        error instanceof Error ? error.message : "Failed to fetch permissions.",
    };
  }
}
