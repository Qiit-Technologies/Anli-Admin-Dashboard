import { BASE_URL } from '@/constants/api';
import api from '@/lib/axios';
import { MiniStaff, StaffResponse } from '@/types/staff.types';
import { getAuthToken } from './auth/auth-token';
import { safeErrorJson } from '@/lib/api';

export async function getStaff(
    page: number = 1,
    pageSize: number = 100,
): Promise<StaffResponse> {
    const authToken = await getAuthToken();
    const safePage = Number.isFinite(Number(page)) ? Math.max(1, Number(page)) : 1;
    const safeLimit = Number.isFinite(Number(pageSize))
        ? Math.max(1, Number(pageSize))
        : 100;
    const { data } = await api.get('/staff', {
        // Backend expects numeric-string query params.
        params: { page: String(safePage), limit: String(safeLimit) },
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
        },
    });
    return data as StaffResponse;
}

export async function getStaffList(
    page: number = 1,
    pageSize: number = 100,
): Promise<StaffResponse> {
    const authToken = await getAuthToken();
    const safePage = Number.isFinite(Number(page)) ? Math.max(1, Number(page)) : 1;
    const safeLimit = Number.isFinite(Number(pageSize))
        ? Math.max(1, Number(pageSize))
        : 100;
    const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
    };

    const toStaffResponse = (payload: any): StaffResponse =>
        ({
            data: Array.isArray(payload?.data) ? payload.data : [],
            meta: payload?.meta,
        }) as StaffResponse;

    try {
        const { data } = await api.get('/staff', {
            params: { page: String(safePage), limit: String(safeLimit) },
            headers,
        });
        const parsed = toStaffResponse(data);
        if (parsed.data.length > 0) return parsed;

        // Fallback for roles that return a narrow staff subset on /staff.
        const hotelId =
            typeof window !== 'undefined'
                ? localStorage.getItem('hotelId')
                : null;
        const numericHotelId = Number(hotelId);
        if (!Number.isFinite(numericHotelId) || numericHotelId <= 0) return parsed;

        const publicResponse = await api.get('/staff/public', {
            params: { hotelId: String(numericHotelId) },
            headers,
        });
        return toStaffResponse(publicResponse.data);
    } catch {
        // Keep UI resilient for select fields that depend on this list.
        // Try a guarded public fallback when /staff fails for query validation.
        try {
            const hotelId =
                typeof window !== 'undefined'
                    ? localStorage.getItem('hotelId')
                    : null;
            const numericHotelId = Number(hotelId);
            if (!Number.isFinite(numericHotelId) || numericHotelId <= 0) {
                return { data: [], meta: undefined } as StaffResponse;
            }
            const publicResponse = await api.get('/staff/public', {
                params: { hotelId: String(numericHotelId) },
                headers,
            });
            return toStaffResponse(publicResponse.data);
        } catch {
            // Keep UI resilient for select fields that depend on this list.
        }
        return { data: [], meta: undefined } as StaffResponse;
    }
}

export async function fetchRoles() {
    const authToken = await getAuthToken();
    const response = await api.get('/roles', {
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
        },
    });

    const data = await response.data;
    console.log(data);
    return { data };
}

export async function inviteStaff(teamMember: MiniStaff) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const apiUrl = new URL('/staff', BASE_URL).toString();

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify(teamMember),
            credentials: 'include',
        });

        if (!response.ok) {
            const error = await safeErrorJson(response);
            return {
                message:
                    error.message ||
                    'Failed to invite staff. Please try again.',
            };
        }

        return { message: 'Staff invited successfully' };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function inviteOnboardingStaff(teamMember: MiniStaff) {
    try {
        const id = localStorage.getItem('hotelId');

        const apiUrl = new URL(`/staff/onboarding/${id}`, BASE_URL).toString();

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(teamMember),
            credentials: 'include',
        });

        if (!response.ok) {
            const error = await safeErrorJson(response);
            return {
                message:
                    error.message ||
                    'Failed to invite staff. Please try again.',
            };
        }

        return { message: 'Staff invited successfully' };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function removeStaff(id: number) {
    const authToken = await getAuthToken();
    const response = await api.delete(`/staff/${id}`, {
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
        },
    });
    return response;
}

export async function updateStaff(staff: MiniStaff, staffId: number) {
    const authToken = await getAuthToken();
    const { data } = await api.patch(`/staff/${staffId}`, staff, {
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
        },
    });
    return data;
}

export async function getLoginLogoutStats() {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }
        const response = await api.get('/staff/login-logout-stats', {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        });
        if (response.status >= 500) {
            const error = await response.data;
            return {
                error:
                    error.message ||
                    'Failed to get staff login and logout stats. Try again.',
            };
        }
        const data = await response.data;
        return { data };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function getLoginLogoutHistory() {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }
        const response = await api.get('/staff/staff-status-history', {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        });
        if (response.status >= 500) {
            const error = await response.data;
            return {
                error:
                    error.message ||
                    'Failed to get staff login and logout history. Try again.',
            };
        }
        const data = await response.data;
        return { data };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function updateStaffLogoutTime(id: number) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }
        const response = await api.patch(
            `/staff/${id}`,
            {
                lastLogoutTime: Date.now(),
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authToken}`,
                },
            },
        );
        if (response.status >= 500) {
            const error = await response.data;
            return {
                error:
                    error.message ||
                    'Failed to update staff logout time. Try again.',
            };
        }
        const data = await response.data;
        return { data };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function getStaffByDepartment(department: string) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }
        const response = await api.get(
            `/staff/department?department=${department}`,
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authToken}`,
                },
            },
        );
        if (response.status >= 500) {
            const error = await response.data;
            return {
                error: error.message || 'Failed to get staffs. Try again.',
            };
        }
        const data = await response.data;
        return { data };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function updateStaffPin(id: number, dataToSubmit: any) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }
        const response = await api.patch(`/staff/${id}/pin`, dataToSubmit, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        });
        if (response.status >= 500) {
            const error = await response.data;
            return {
                error:
                    error.message ||
                    'Failed to update staff logout time. Try again.',
            };
        }
        const data = await response.data;
        return { data };
    } catch (error: any) {
        return (
            error?.response?.data || {
                message: 'An unexpected error occurred. Please try again.',
                error,
            }
        );
    }
}

export async function updateMyComplimentaryPin(newPin: string) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const response = await api.patch(
            '/staff/me/complimentary-pin',
            { newPin },
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authToken}`,
                },
            },
        );

        if (response.status >= 400) {
            const error = await response.data;
            return {
                error:
                    error?.message ||
                    'Failed to update complimentary PIN. Try again.',
            };
        }

        const data = await response.data;
        return { data };
    } catch (error: any) {
        return {
            error:
                error?.response?.data?.message ||
                'An unexpected error occurred. Please try again.',
        };
    }
}
