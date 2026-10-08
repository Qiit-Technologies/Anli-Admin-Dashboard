import { BASE_URL } from '@/constants/api';
import { getAuthToken } from './auth/auth-token';
import { safeResponseJson, safeResponseJsonOrNull, safeErrorJson } from '@/lib/api';

export async function createRole({ name, description, permissionIds }: any) {
  try {
    const authToken = await getAuthToken();
    if (!authToken) {
      return { message: 'Authentication token not found.' };
    }

    const apiUrl = new URL(`/roles`, BASE_URL).toString();
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        name: name,
        description: description,
        permissionIds: permissionIds,
      }),
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await safeErrorJson(response);
      return {
        message:
          error.message || 'Role creation failed. Please try again.',
      };
    }

    return { message: 'Role created successfully!' };
  } catch (error: any) {
    return { message: 'An unexpected error occurred. Please try again.' };
  }
}

export async function updateRole({ id, name, description, department, permissionIds }: any) {
  try {
    const authToken = await getAuthToken();
    if (!authToken) {
      return { message: 'Authentication token not found.' };
    }

    const apiUrl = new URL(`/roles/${id}`, BASE_URL).toString();
    const response = await fetch(apiUrl, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        name: name,
        description: description,
        department: department,
        permissionIds: permissionIds,
      }),
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await safeErrorJson(response);
      return {
        message:
          error.message || 'Role update failed. Please try again.',
      };
    }

    return { message: 'Role updated successfully!' };
  } catch (error: any) {
    return { message: 'An unexpected error occurred. Please try again.' };
  }
}

export async function deleteRole(id: string) {
  try {
    const authToken = await getAuthToken();
    if (!authToken) {
      return { message: 'Authentication token not found.' };
    }

    const apiUrl = new URL(`/roles/${id}`, BASE_URL).toString();
    const response = await fetch(apiUrl, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await safeErrorJson(response);
      return {
        message:
          error.message || 'Role deletion failed. Please try again.',
      };
    }

    return { message: 'Role deleted successfully!' };
  } catch (error: any) {
    return { message: 'An unexpected error occurred. Please try again.' };
  }
}
