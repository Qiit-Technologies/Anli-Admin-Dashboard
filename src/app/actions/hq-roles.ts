/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import {
  axiosDelete,
  axiosGet,
  axiosPatch,
  axiosPost,
  isRedirectError,
} from "../lib/api";

/* ── Types matching the /super-admin/* role-template contract ─────────── */

export interface RoleTemplatePermission {
  id: number;
  name: string;
  description?: string;
}

export interface RoleTemplate {
  key: string;
  name: string;
  description: string;
  permissionCount: number;
  permissions: RoleTemplatePermission[];
}

export interface HotelRole {
  id: number;
  name: string;
  description: string;
  department?: string | null;
  permissions: RoleTemplatePermission[];
}

export type HqRolesResult<T> = { ok: true; data: T } | { ok: false; error: string };

function unwrap<T>(body: any): T {
  return (
    body && typeof body === "object" && !Array.isArray(body) && "data" in body
      ? body.data
      : body
  ) as T;
}

async function safeCall<T>(fn: () => Promise<T>): Promise<HqRolesResult<T>> {
  try {
    return { ok: true, data: await fn() };
  } catch (error: unknown) {
    if (isRedirectError(error)) throw error;
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Request failed",
    };
  }
}

/** Global role templates (Admin, Support Agent, Billing Manager, Read-only). */
export async function getRoleTemplates(): Promise<
  HqRolesResult<RoleTemplate[]>
> {
  return safeCall(async () => {
    const body = await axiosGet<any>("/super-admin/role-templates", {
      currentPath: "/dashboard",
    });
    return unwrap<RoleTemplate[]>(body) ?? [];
  });
}

/** Custom roles for one business (hotel-scoped, incl. global roles). */
export async function listHotelRoles(
  hotelId: number | string,
): Promise<HqRolesResult<HotelRole[]>> {
  return safeCall(async () => {
    const body = await axiosGet<any>(`/super-admin/hotels/${hotelId}/roles`, {
      currentPath: "/dashboard",
    });
    return unwrap<HotelRole[]>(body) ?? [];
  });
}

export async function createHotelRole(
  hotelId: number | string,
  input: { name: string; description: string; permissionIds: number[] },
): Promise<HqRolesResult<HotelRole>> {
  return safeCall(async () => {
    const body = await axiosPost<any>(
      `/super-admin/hotels/${hotelId}/roles`,
      input,
      { currentPath: "/dashboard" },
    );
    return unwrap<HotelRole>(body);
  });
}

export async function updateHotelRole(
  hotelId: number | string,
  roleId: number,
  input: { name?: string; description?: string; permissionIds?: number[] },
): Promise<HqRolesResult<HotelRole>> {
  return safeCall(async () => {
    const body = await axiosPatch<any>(
      `/super-admin/hotels/${hotelId}/roles/${roleId}`,
      input,
      { currentPath: "/dashboard" },
    );
    return unwrap<HotelRole>(body);
  });
}

export async function deleteHotelRole(
  hotelId: number | string,
  roleId: number,
): Promise<HqRolesResult<unknown>> {
  return safeCall(async () => {
    const body = await axiosDelete<any>(
      `/super-admin/hotels/${hotelId}/roles/${roleId}`,
      { currentPath: "/dashboard" },
    );
    return unwrap<unknown>(body);
  });
}

/**
 * One-click template apply: replaces the staff member's granular permission
 * set with the template's permission set. Uses the same underlying
 * permission rows as the checkboxes — no new access primitives.
 */
export async function applyRoleTemplateToStaff(
  hotelId: number | string,
  staffId: number,
  templateKey: string,
): Promise<HqRolesResult<{ templateName: string; permissionCount: number }>> {
  return safeCall(async () => {
    const body = await axiosPost<any>(
      `/super-admin/hotels/${hotelId}/staff/${staffId}/apply-role-template`,
      { templateKey },
      { currentPath: "/dashboard" },
    );
    return unwrap<{ templateName: string; permissionCount: number }>(body);
  });
}
