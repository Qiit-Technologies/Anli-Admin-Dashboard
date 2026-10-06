import api from '@/lib/axios';
// Remove only this line:
// import { getAuthToken } from './auth/auth-token';

export async function submitCareerApplication(formData: FormData) {
    try {
        const response = await api.post('/career-applications', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        if (response.status >= 500) {
            const error = await response.data;
            return {
                error:
                    error.message ||
                    'Failed to submit career application. Try again.',
            };
        }

        const data = await response.data;
        return { data };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function getCareerApplications() {
    try {
        // Remove only these lines:
        // const authToken = await getAuthToken();
        // if (!authToken) {
        //     return { error: 'Authentication token not found.' };
        // }

        const response = await api.get('/career-applications', {
            headers: {
                'Content-Type': 'application/json',
                // Remove only this line:
                // Authorization: `Bearer ${authToken}`,
            },
        });

        if (response.status >= 500) {
            const error = await response.data;
            return {
                error:
                    error.message ||
                    'Failed to fetch career applications. Try again.',
            };
        }

        const data = await response.data;
        return { data };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function getCareerApplicationById(id: string) {
    try {
        const response = await api.get(`/career-applications/${id}`, {
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (response.status >= 500) {
            const error = await response.data;
            return {
                error:
                    error.message ||
                    'Failed to fetch career application. Try again.',
            };
        }

        const data = await response.data;
        return { data };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function updateCareerApplicationStatus(
    id: string,
    status: 'pending' | 'reviewing' | 'interview' | 'hired' | 'rejected',
) {
    try {
        // Remove only these lines:
        // const authToken = await getAuthToken();
        // if (!authToken) {
        //     return { error: 'Authentication token not found.' };
        // }

        const response = await api.patch(
            `/career-applications/${id}/status`,
            { status },
            {
                headers: {
                    'Content-Type': 'application/json',
                    // Remove only this line:
                    // Authorization: `Bearer ${authToken}`,
                },
            },
        );

        if (response.status >= 500) {
            const error = await response.data;
            return {
                error:
                    error.message ||
                    'Failed to update application status. Try again.',
            };
        }

        const data = await response.data;
        return { data };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function deleteCareerApplication(id: string) {
    try {
        const response = await api.delete(`/career-applications/${id}`, {
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (response.status >= 500) {
            const error = await response.data;
            return {
                error:
                    error.message ||
                    'Failed to delete career application. Try again.',
            };
        }

        return { success: true };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function getCareerApplicationStats() {
    try {
        const response = await api.get('/career-applications/stats', {
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (response.status >= 500) {
            const error = await response.data;
            return {
                error:
                    error.message ||
                    'Failed to fetch application statistics. Try again.',
            };
        }

        const data = await response.data;
        return { data };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function downloadCareerApplicationCV(
    id: string,
    fileName?: string,
) {
    try {
        const response = await api.get(`/career-applications/${id}/cv`, {
            responseType: 'blob',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (response.status >= 400) {
            return {
                error: 'Failed to download CV. Please try again.',
            };
        }

        // Create blob and download
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName || `cv-${id}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        return { success: true };
    } catch (error: any) {
        return { error: 'An unexpected error occurred while downloading CV.' };
    }
}
