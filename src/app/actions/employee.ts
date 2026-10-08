import api from '@/lib/axios';
import { getAuthToken } from './auth/auth-token';
import { BASE_URL } from '@/constants/api';
import { safeResponseJson, safeResponseJsonOrNull, safeErrorJson } from '@/lib/api';

export async function CreateEmployee(formData: any) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { message: 'Authentication token not found.' };
        }

        const apiUrl = new URL('/employees', BASE_URL).toString();
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify(formData),
            credentials: 'include',
        });
        if (!response.ok) {
            const error = await safeErrorJson(response);
            return {
                message:
                    error.message ||
                    'Failed to create employee. Please try again.',
            };
        }

        return {
            message: 'Employee created Successful!',
        };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function UpdateEmployee(id: string, formData: any) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { message: 'Authentication token not found.' };
        }

        const apiUrl = new URL(`/employees/${id}`, BASE_URL).toString();
        const response = await fetch(apiUrl, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify(formData),
            credentials: 'include',
        });
        if (!response.ok) {
            const error = await safeErrorJson(response);
            return {
                message:
                    error.message ||
                    'Failed to update employee. Please try again.',
            };
        }

        return {
            message: 'Employee updated Successful!',
        };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function DeactivateEmployee(id: string | number) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { message: 'Authentication token not found.' };
        }

        const apiUrl = new URL(`/employees/${id}/status`, BASE_URL).toString();
        const response = await fetch(apiUrl, {
            method: 'PATCH',
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
                    error.message ||
                    'Failed to update employee. Please try again.',
            };
        }

        return {
            message: 'Employee status updated Successfully!',
        };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function getEmployees() {
    const authToken = await getAuthToken();
    const { data } = await api.get('/employees', {
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
        },
    });
    return data;
}

export async function getEmployeeById(id: string) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const response = await api.get(`/employees/${id}`, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        });

        if (response.status >= 500) {
            return {
                error:
                    response.data?.message ??
                    'Failed to fetch employee details. Try again.',
            };
        }

        return { data: response.data };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function getEmployeeSummary() {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const response = await api.get('/employees/dashboard/summary', {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        });

        if (response.status >= 500) {
            return {
                error:
                    response.data?.message ??
                    'Failed to fetch employee summary. Try again.',
            };
        }
        return { data: response.data };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function getShiftData() {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const response = await api.get('/employees/shift-data', {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        });

        if (response.status >= 500) {
            return {
                error:
                    response.data?.message ??
                    'Failed to fetch employee shift data. Try again.',
            };
        }
        return { data: response.data };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function CreateLeaveRequest(
    staffId: number | string,
    formData: any,
) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { message: 'Authentication token not found.' };
        }

        const apiUrl = new URL(
            `/employees/leave-request/${staffId}`,
            BASE_URL,
        ).toString();
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify(formData),
            credentials: 'include',
        });
        if (!response.ok) {
            const error = await safeErrorJson(response);
            return {
                message:
                    error.message ||
                    'Failed to create leave. Please try again.',
            };
        }

        return {
            message: 'Leave reaquest created Successful!',
        };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function ReviewLeaveRequest(
    leaveId: number | string,
    formData: any,
) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { message: 'Authentication token not found.' };
        }

        const apiUrl = new URL(
            `/employees/leave-request/${leaveId}/review`,
            BASE_URL,
        ).toString();
        const response = await fetch(apiUrl, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify(formData),
            credentials: 'include',
        });
        if (!response.ok) {
            const error = await safeErrorJson(response);
            return {
                message:
                    error.message ||
                    'Failed to create leave. Please try again.',
            };
        }

        return {
            message: 'Leave reaquest updated Successful!',
        };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function getLeaveRequests() {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const response = await api.get('/employees/leave-request', {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        });

        if (response.status >= 500) {
            return {
                error:
                    response.data?.message ??
                    'Failed to fetch employee leave request. Try again.',
            };
        }
        return { data: response.data };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function CreateShift(formData: any) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { message: 'Authentication token not found.' };
        }

        const apiUrl = new URL('/employees/shift', BASE_URL).toString();
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify(formData),
            credentials: 'include',
        });
        if (!response.ok) {
            const error = await safeErrorJson(response);
            return {
                message:
                    error.message ||
                    'Failed to create shift. Please try again.',
            };
        }

        return {
            message: 'Shift created Successful!',
        };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function getPayrollBreakdown() {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const response = await api.get('/employees/payroll-breakdown', {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        });

        if (response.status >= 500) {
            return {
                error:
                    response.data?.message ??
                    'Failed to fetch employee leave request. Try again.',
            };
        }
        return { data: response.data };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function getPunctualityStats() {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const response = await api.get('/employees/punctuality-stats', {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        });

        if (response.status >= 500) {
            return {
                error:
                    response.data?.message ??
                    'Failed to fetch employee punctuality stats. Try again.',
            };
        }
        return { data: response.data };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function getEmployeeMetrics() {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const response = await api.get('/employees/metrics', {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        });

        if (response.status >= 500) {
            return {
                error:
                    response.data?.message ??
                    'Failed to fetch employee metrics. Try again.',
            };
        }
        return { data: response.data };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function getDepartmentCostAnalysis(departmentId: number | null) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const response = await api.get(
            `/employees/${departmentId}/department-cost-analysis`,
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authToken}`,
                },
            },
        );

        if (response.status >= 500) {
            return {
                error:
                    response.data?.message ??
                    'Failed to fetch employee department cost analysis. Try again.',
            };
        }
        return { data: response.data };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}
