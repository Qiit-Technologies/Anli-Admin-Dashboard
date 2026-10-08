import { BASE_URL } from '@/constants/api';
import { getAuthToken } from './auth/auth-token';
import { safeResponseJson, safeErrorJson } from '@/lib/api';

export async function getCategoryReclassifyInfo(id: number) {
  try {
    const authToken = await getAuthToken();
    if (!authToken) {
      return { error: 'Authentication token not found.' };
    }

    const apiUrl = new URL(`/menu/${id}/category/reclassify-info`, BASE_URL).toString();
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await safeErrorJson(response);
      return {
        error: error.message || 'Failed to fetch reclassify info.',
      };
    }

    return { data: await safeResponseJson(response) };
  } catch (error: any) {
    return { error: 'An unexpected error occurred. Please try again.' };
  }
}

export async function reclassifyCategory(id: number, targetParentId: number | null) {
  try {
    const authToken = await getAuthToken();
    if (!authToken) {
      return { error: 'Authentication token not found.' };
    }

    const apiUrl = new URL(`/menu/${id}/category/reclassify`, BASE_URL).toString();
    const response = await fetch(apiUrl, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ targetParentId }),
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await safeErrorJson(response);
      return {
        error: error.message || 'Failed to reclassify category.',
      };
    }

    return {
      message: 'Category reclassified successfully!',
      data: await safeResponseJson(response),
    };
  } catch (error: any) {
    return { error: 'An unexpected error occurred. Please try again.' };
  }
}

export async function convertSubCategoryToCategory(id: number) {
  try {
    const authToken = await getAuthToken();
    if (!authToken) {
      return { error: 'Authentication token not found.' };
    }

    const apiUrl = new URL(`/menu/sub-category/${id}/convert-to-category`, BASE_URL).toString();
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await safeErrorJson(response);
      return {
        error: error.message || 'Failed to convert sub-category to category.',
      };
    }

    return {
      message: 'Sub-category converted to category successfully!',
      data: await safeResponseJson(response),
    };
  } catch (error: any) {
    return { error: 'An unexpected error occurred. Please try again.' };
  }
}

export async function convertCategoryToSubCategory(id: number, targetParentCategoryId: number) {
  try {
    const authToken = await getAuthToken();
    if (!authToken) {
      return { error: 'Authentication token not found.' };
    }

    const apiUrl = new URL(`/menu/category/${id}/convert-to-sub-category`, BASE_URL).toString();
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ targetParentCategoryId }),
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await safeErrorJson(response);
      return {
        error: error.message || 'Failed to convert category to sub-category.',
      };
    }

    return {
      message: 'Category converted to sub-category successfully!',
      data: await safeResponseJson(response),
    };
  } catch (error: any) {
    return { error: 'An unexpected error occurred. Please try again.' };
  }
}
