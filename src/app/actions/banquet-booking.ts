import api from '@/lib/axios';
import { getAuthToken } from './auth/auth-token';
import { CreateBookingForm } from '@/components/banquest/types';

export async function createBanquetBooking(payload: CreateBookingForm) {
    try {
        const token = await getAuthToken();
        if (!token) return { error: 'Authentication token not found.' };

        const response = await api.post('/banquet/bookings', payload, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (response.status !== 201) {
            return {
                error:
                    response.data?.message ||
                    'Failed to create banquet booking.',
            };
        }

        return {
            message: 'Banquet booking created successfully.',
            booking: response.data,
        };
    } catch (error: unknown) {
        const err = error as {
            response?: { data?: { message?: string | string[] } };
        };
        const raw = err?.response?.data?.message;
        const message = Array.isArray(raw)
            ? raw.join(', ')
            : typeof raw === 'string'
              ? raw
              : 'An unexpected error occurred. Please try again.';
        return { error: message };
    }
}

export async function getAllBanquetBookings() {
    try {
        const token = await getAuthToken();
        if (!token) return { error: 'Authentication token not found.' };

        const response = await api.get('/banquet/bookings', {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (response.status !== 200) {
            return {
                error: response.data?.message || 'Failed to fetch bookings.',
            };
        }

        return response.data;
    } catch (error: unknown) {
        const err = error as {
            response?: { data?: { message?: string | string[] } };
        };
        const raw = err?.response?.data?.message;
        const message = Array.isArray(raw)
            ? raw.join(', ')
            : typeof raw === 'string'
              ? raw
              : 'An unexpected error occurred. Please try again.';
        return { error: message };
    }
}

export async function getBanquetBooking(id: number) {
    try {
        const token = await getAuthToken();
        if (!token) return { error: 'Authentication token not found.' };

        const response = await api.get(`/banquet/bookings/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (response.status !== 200) {
            return {
                error: response.data?.message || 'Failed to fetch booking.',
            };
        }

        return response.data;
    } catch (error: unknown) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function updateBanquetBooking(
    id: number,
    updateData: Partial<CreateBookingForm>,
) {
    try {
        const token = await getAuthToken();
        if (!token) return { error: 'Authentication token not found.' };

        const response = await api.put(`/banquet/bookings/${id}`, updateData, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (response.status !== 200) {
            return {
                error: response.data?.message || 'Failed to update booking.',
            };
        }

        return { message: 'Banquet booking updated successfully!' };
    } catch (error: unknown) {
        const err = error as {
            response?: { data?: { message?: string | string[] } };
        };
        const raw = err?.response?.data?.message;
        const message = Array.isArray(raw)
            ? raw.join(', ')
            : typeof raw === 'string'
              ? raw
              : 'An unexpected error occurred. Please try again.';
        return { error: message };
    }
}

export async function deleteBanquetBooking(id: number) {
    try {
        const token = await getAuthToken();
        if (!token) return { error: 'Authentication token not found.' };

        const response = await api.delete(`/banquet/bookings/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (response.status !== 200) {
            return {
                error: response.data?.message || 'Failed to delete booking.',
            };
        }

        return { message: 'Banquet booking deleted successfully!' };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}
