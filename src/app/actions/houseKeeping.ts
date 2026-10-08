import { BASE_URL } from '@/constants/api';
import { ILostItem } from '@/types';
import { getAuthToken } from './auth/auth-token';
import { safeResponseJson, safeResponseJsonOrNull, safeErrorJson } from '@/lib/api';

export async function createCleaningRequest(
    roomId: string,
    urgency: string,
    roomCondition: string,
) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { message: 'Authentication token not found.' };
        }

        const apiUrl = new URL(
            `/housekeeping/cleaning-request`,
            BASE_URL,
        ).toString();
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify({
                roomId: Number(roomId),
                urgency: urgency.toUpperCase(),
                roomCondition,
            }),
            credentials: 'include',
        });

        if (!response.ok) {
            const error = await safeErrorJson(response);
            return {
                message:
                    error.message ||
                    'Cleaning request creation failed. Please try again.',
            };
        }

        return { message: 'Cleaning request created successfully!' };
    } catch (error: any) {
        return { message: 'An unexpected error occurred. Please try again.' };
    }
}

export async function getCleaningRequests() {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { message: 'Authentication token not found.' };
        }

        const apiUrl = new URL(
            `/housekeeping/cleaning-request`,
            BASE_URL,
        ).toString();

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
                message: error.message || 'Failed to fetch cleaning requests.',
            };
        }

        const data = await safeResponseJson(response);
        return data;
    } catch (error: any) {
        return { message: 'An unexpected error occurred. Please try again.' };
    }
}

export async function getDailyTaskList() {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { message: 'Authentication token not found.' };
        }

        const apiUrl = new URL(`/housekeeping/daily-task`, BASE_URL).toString();

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
                message: error.message || 'Failed to fetch daily tasks.',
            };
        }

        const data = await safeResponseJson(response);
        return data;
    } catch (error: any) {
        return { message: 'An unexpected error occurred. Please try again.' };
    }
}

export async function getLostItem() {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { message: 'Authentication token not found.' };
        }

        const apiUrl = new URL(`/housekeeping/lost-item`, BASE_URL).toString();

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
                message: error.message || 'Failed to fetch lost items',
            };
        }

        const data = await safeResponseJson(response);
        return data;
    } catch (error: any) {
        return { message: 'An unexpected error occurred. Please try again.' };
    }
}

export const createLostItem = async (item: ILostItem) => {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { message: 'Authentication token not found.' };
        }
        const apiUrl = new URL(`/housekeeping/lost-item`, BASE_URL).toString();
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify(item),
            credentials: 'include',
        });
        if (!response.ok) {
            const error = await safeErrorJson(response);
            return {
                message: error.message || 'Failed to fetch lost items',
            };
        }

        const data = await safeResponseJson(response);
        return data;
    } catch (error: any) {
        return { message: 'An unexpected error occurred. Please try again.' };
    }
};

export interface IMaintenanceRequest {
    roomId: number;
    urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    issueType:
        | 'PLUMBING'
        | 'ELECTRICAL'
        | 'HVAC'
        | 'FURNITURE'
        | 'HOUSEKEEPING'
        | 'APPLIANCE'
        | 'STRUCTURAL'
        | 'OTHER';
    description: string;
    reportedBy?: number;
    maintenanceDurationValue?: number;
    maintenanceDurationUnit?: 'MINUTES' | 'HOURS' | 'DAYS';
}

export const createMaintenance = async (payload: IMaintenanceRequest) => {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { message: 'Authentication token not found.' };
        }
        const apiUrl = new URL(
            `/housekeeping/maintenance`,
            BASE_URL,
        ).toString();
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify(payload),
            credentials: 'include',
        });
        if (!response.ok) {
            const error = await safeErrorJson(response);
            return {
                message: error.message || 'Failed to fetch lost items',
            };
        }

        const data = await safeResponseJson(response);
        return data;
    } catch (error: any) {
        return { message: 'An unexpected error occurred. Please try again.' };
    }
};

export async function getRoomsUnderMaintainance() {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { message: 'Authentication token not found.' };
        }

        const apiUrl = new URL(
            `/housekeeping/maintenance`,
            BASE_URL,
        ).toString();

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
                message:
                    error.message ||
                    'Failed to fetch rooms under maintainance.',
            };
        }

        const data = await safeResponseJson(response);
        return data;
    } catch (error: any) {
        return { message: 'An unexpected error occurred. Please try again.' };
    }
}

export async function getHouseKeepersByHotelId() {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { message: 'Authentication token not found.' };
        }

        const apiUrl = new URL(
            `/housekeeping/housekeepers`,
            BASE_URL,
        ).toString();

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
                message: error.message || 'Failed to fetch house keepers.',
            };
        }

        const data = await safeResponseJson(response);
        return data;
    } catch (error: any) {
        return { message: 'An unexpected error occurred. Please try again.' };
    }
}

export async function updateCleaningRequestHousekeeper(
    id: number,
    assignedToId: number,
) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { message: 'Authentication token not found.' };
        }

        const apiUrl = new URL(
            `/housekeeping/${id}/cleaning-request/housekeeper`,
            BASE_URL,
        ).toString();
        const response = await fetch(apiUrl, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify({
                assignedToId,
            }),
            credentials: 'include',
        });

        if (!response.ok) {
            const error = await safeErrorJson(response);
            return {
                message:
                    error.message ||
                    'Cleaning request update failed. Please try again.',
            };
        }

        return {
            message: 'Cleaning request housekeeper reassigned successfully!',
        };
    } catch (error: any) {
        return { message: 'An unexpected error occurred. Please try again.' };
    }
}

export async function updateMaintenance(id: number, status: string) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { message: 'Authentication token not found.' };
        }

        const apiUrl = new URL(
            `/housekeeping/${id}/maintenance`,
            BASE_URL,
        ).toString();
        const response = await fetch(apiUrl, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify({ status }),
            credentials: 'include',
        });

        if (!response.ok) {
            const error = await safeErrorJson(response);
            return {
                message:
                    error.message ||
                    'Cleaning request update failed. Please try again.',
            };
        }

        return {
            message: 'Cleaning request housekeeper reassigned successfully!',
        };
    } catch (error: any) {
        return { message: 'An unexpected error occurred. Please try again.' };
    }
}

export async function updateLostIemStatus(id: number, status: string) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { message: 'Authentication token not found.' };
        }

        const apiUrl = new URL(
            `/housekeeping/${id}/lost-item`,
            BASE_URL,
        ).toString();
        const response = await fetch(apiUrl, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify({ status }),
            credentials: 'include',
        });

        if (!response.ok) {
            const error = await safeErrorJson(response);
            return {
                message:
                    error.message ||
                    'Cleaning request update failed. Please try again.',
            };
        }

        return {
            message: 'Cleaning request housekeeper reassigned successfully!',
        };
    } catch (error: any) {
        return { message: 'An unexpected error occurred. Please try again.' };
    }
}

export async function getHouseKeepingReportsByHotelId() {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { message: 'Authentication token not found.' };
        }

        const apiUrl = new URL(`/housekeeping/reports`, BASE_URL).toString();

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
                message: error.message || 'Failed to fetch reports.',
            };
        }

        const data = await safeResponseJson(response);
        return data;
    } catch (error: any) {
        return { message: 'An unexpected error occurred. Please try again.' };
    }
}

export async function getCleaningTrendsByHotelId(range: string) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { message: 'Authentication token not found.' };
        }

        const apiUrl = new URL(
            `/housekeeping/cleaning-trends?range=${range}`,
            BASE_URL,
        ).toString();

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
                message: error.message || 'Failed to fetch cleaning trends.',
            };
        }

        const data = await safeResponseJson(response);
        return data;
    } catch (error: any) {
        return { message: 'An unexpected error occurred. Please try again.' };
    }
}

export async function getCleaningTaskByStaffAndByHotelId() {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { message: 'Authentication token not found.' };
        }

        const apiUrl = new URL(
            `/housekeeping/cleaning-task-staff`,
            BASE_URL,
        ).toString();

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
                message:
                    error.message || 'Failed to fetch cleaning task by staff.',
            };
        }

        const data = await safeResponseJson(response);
        return data;
    } catch (error: any) {
        return { message: 'An unexpected error occurred. Please try again.' };
    }
}

export async function getMaintenanceOverdueForInspection() {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { message: 'Authentication token not found.' };
        }

        const apiUrl = new URL(
            `/housekeeping/maintenance/overdue-inspection`,
            BASE_URL,
        ).toString();

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
                message:
                    error.message ||
                    'Failed to fetch overdue maintenance alerts.',
            };
        }

        return await safeResponseJson(response);
    } catch (error) {
        return { message: 'An unexpected error occurred. Please try again.' };
    }
}
