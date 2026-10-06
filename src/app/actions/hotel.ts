import { BASE_URL } from '@/constants/api';
import api from '@/lib/axios';
import { getAuthToken } from './auth/auth-token';
import { safeResponseJson, safeResponseJsonOrNull, safeErrorJson } from '@/lib/api';

export async function fetchHotelDetailsById() {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const response = await api.get('/hotels/me', {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        });

        if (response.status >= 500) {
            const error = await response.data;
            return {
                error: error.message || 'Failed to fetch hotel. Try again.',
            };
        }

        const data = await response.data;

        return { data };
    } catch (error: any) {
        // console.error('Error fetching rooms:', error);
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

// Fetch checkout policy and overstay configuration
export async function getCheckoutPolicy() {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const response = await api.get('/hotels/checkout-policy', {
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
                    'Failed to fetch checkout policy. Try again.',
            };
        }

        return { data: response.data };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

// Update checkout policy and overstay configuration
export async function updateCheckoutPolicy(payload: {
    defaultCheckoutTime?: string;
    overstayThresholdMinutes?: number;
    overstayEnabled?: boolean;
    overstayFeeType?: 'FIXED' | 'PERCENTAGE';
    overstayFeeAmount?: number;
    requireUnpaidOrdersSettledOnShiftEnd?: boolean;
    idleLogoutMinutes?: number;
}) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const response = await api.patch('/hotels/checkout-policy', payload, {
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
                    'Failed to update checkout policy. Try again.',
            };
        }

        return { data: response.data };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function fetchHotelById() {
    const id = localStorage.getItem('hotelId');
    try {
        const response = await api.get(`/hotels/hotel/${id}`, {
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (response.status >= 500) {
            const error = await response.data;
            return {
                error: error.message || 'Failed to fetch hotel. Try again.',
            };
        }

        const data = await response.data;
        return { data };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function uploadReservationEmailAttachment(file: File) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }
        const formData = new FormData();
        formData.append('file', file);
        const response = await api.post(
            '/hotels/reservation-email-attachment',
            formData,
            {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                    'Content-Type': 'multipart/form-data',
                },
            },
        );
        if (response.status >= 500) {
            return {
                error:
                    (await response.data)?.message ||
                    'Failed to upload attachment.',
            };
        }
        return { data: response.data };
    } catch (error: unknown) {
        const message =
            (error as { response?: { data?: { message?: string } } })?.response
                ?.data?.message || 'An unexpected error occurred.';
        return { error: message };
    }
}

/** Remove the document attached to reservation confirmation emails. */
export async function deleteReservationEmailAttachment() {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }
        const response = await api.delete(
            '/hotels/reservation-email-attachment',
            {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            },
        );
        if (response.status >= 500) {
            return {
                error:
                    (await response.data)?.message ||
                    'Failed to remove attachment.',
            };
        }
        return { data: response.data };
    } catch (error: unknown) {
        const message =
            (error as { response?: { data?: { message?: string } } })?.response
                ?.data?.message || 'An unexpected error occurred.';
        return { error: message };
    }
}

export async function fetchHotelByExternalId(id: string) {
    try {
        const response = await api.get(`/hotels/hotel/${Number(id)}`, {
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (response.status >= 500) {
            const error = await response.data;
            return {
                error: error.message || 'Failed to fetch hotel. Try again.',
            };
        }

        const data = await response.data;

        return { data };
    } catch (error: any) {
        // console.error('Error fetching rooms:', error);
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function getActivityLogsByHotelId() {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const response = await api.get('/guests/activity-log', {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        });

        if (response.status >= 500) {
            const error = await response.data;
            return {
                error:
                    error.message || 'Failed to fetch activities. Try again.',
            };
        }

        const data = await response.data;

        return { data };
    } catch (error: any) {
        // console.error('Error fetching rooms:', error);
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function cacVerification(
    cacNumber: string,
    cacImage: string | null,
    services: string[],
) {
    try {
        const url = new URL(window.location.href);
        const pathSegments = url.pathname.split('/');
        const hotelId = pathSegments[pathSegments.length - 1];
        const apiUrl = new URL(
            `/hotels/verify-cac?id=${hotelId}`,
            BASE_URL,
        ).toString();
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                cacNumber: Number(cacNumber),
                cacImage,
                services: services.join(','),
            }),
            credentials: 'include',
        });
        // const data = safeResponseJson(response)
        if (!response.ok) {
            const error = await safeErrorJson(response);
            return {
                message:
                    error.message || 'Failed to verify cac. Please try again.',
            };
        }

        return {
            message: 'Cac Verification Successful!',
            // data
        };
    } catch (error: any) {
        return { message: 'An unexpected error occurred. Please try again.' };
    }
}

export async function resendVerificationEmail() {
    try {
        const id = localStorage.getItem('hotelId');

        const apiUrl = new URL(
            `/hotels/resend-email?id=${id}`,
            BASE_URL,
        ).toString();
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const error = await safeErrorJson(response);
            return {
                message:
                    error.message ||
                    'Failed to resend verification email. Please try again.',
            };
        }

        return {
            message: 'Verification Email Resent!',
        };
    } catch (error: any) {
        return { message: 'An unexpected error occurred. Please try again.' };
    }
}

export async function createHotelServiceType(formData: any) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }
        const apiUrl = new URL(`/hotels/other-services`, BASE_URL).toString();

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify({
                type: formData.type,
                description: formData.description,
            }),
            credentials: 'include',
        });

        if (!response.ok) {
            const error = await safeErrorJson(response);
            return {
                message:
                    error.message || 'Failed to create item. Please try again.',
            };
        }

        return { message: 'Hotel service type created successfully!' };
    } catch (error: any) {
        return {
            error: 'An unexpected error occurred while checking availability.',
        };
    }
}

export async function getHotelServicesType() {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const response = await api.get(`/hotels/other-services`, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        });

        if (response.status >= 500) {
            const error = await response.data;
            return {
                error:
                    error.message || 'Failed to fetch wake up call. Try again.',
            };
        }

        const data = await response.data;

        return { data };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function updateDisbursementType(type: string) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }
        const apiUrl = new URL(
            `/hotels/disbursement-type?type=${type}`,
            BASE_URL,
        ).toString();
        const response = await fetch(apiUrl, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        });

        if (!response.ok) {
            const error = await safeErrorJson(response);
            return {
                message:
                    error.message ||
                    'Failed to update disbursement type. Please try again.',
            };
        }

        return {
            message: 'Disbursement type updated successfully!',
        };
    } catch (error: any) {
        return { message: 'An unexpected error occurred. Please try again.' };
    }
}

export async function updateHotelVatRate(payload: {
    vatRate?: number;
    frontOfficeVatRate?: number;
    restaurantVatRate?: number;
    restaurantVatInclusive?: boolean;
    frontOfficeVatInclusive?: boolean;
    restaurantCustomChargesInclusive?: boolean;
    frontOfficeCustomChargesInclusive?: boolean;
}) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }
        const response = await api.patch('/hotels/vat', payload, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        });

        return { data: response.data };
    } catch (error: any) {
        return {
            error:
                error?.response?.data?.message ||
                'Failed to update VAT settings. Try again.',
        };
    }
}

export async function updateHotelServiceChargeRate(payload: {
    serviceChargeRate?: number;
    frontOfficeServiceChargeRate?: number;
    restaurantServiceChargeRate?: number;
    restaurantServiceChargeInclusive?: boolean;
    frontOfficeServiceChargeInclusive?: boolean;
}) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }
        const response = await api.patch('/hotels/service-charge', payload, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        });

        return { data: response.data };
    } catch (error: any) {
        return {
            error:
                error?.response?.data?.message ||
                'Failed to update service charge settings. Try again.',
        };
    }
}

export async function updateHotelTipRate(payload: {
    tipRate?: number;
    frontOfficeTipRate?: number;
    restaurantTipRate?: number;
    enableTip?: boolean;
    restaurantTipInclusive?: boolean;
    frontOfficeTipInclusive?: boolean;
}) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }
        const response = await api.patch('/hotels/tip', payload, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        });

        return { data: response.data };
    } catch (error: any) {
        return {
            error:
                error?.response?.data?.message ||
                'Failed to update tip settings. Try again.',
        };
    }
}

export async function updateRequisitionApprovalSetting(enabled: boolean) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }
        const apiUrl = new URL(
            `/hotels/requisition-approval?enabled=${enabled}`,
            BASE_URL,
        ).toString();
        const response = await fetch(apiUrl, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        });

        if (!response.ok) {
            const error = await safeErrorJson(response);
            return {
                message:
                    error.message ||
                    'Failed to update requisition approval setting. Please try again.',
            };
        }

        return {
            message: 'Requisition approval setting updated successfully!',
        };
    } catch (error: any) {
        return { message: 'An unexpected error occurred. Please try again.' };
    }
}

export type ReservationConfirmationSettings = {
    reservationTermsHtml: string | null;
};

export async function getReservationConfirmationSettings(): Promise<
    { data: ReservationConfirmationSettings } | { error: string }
> {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }
        const response = await api.get(
            '/hotels/reservation-confirmation-settings',
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authToken}`,
                },
            },
        );
        return { data: response.data };
    } catch (error: any) {
        return {
            error:
                error?.response?.data?.message ||
                'Failed to load reservation confirmation settings.',
        };
    }
}

export async function updateReservationConfirmationSettings(payload: {
    reservationTermsHtml: string | null;
}): Promise<{ data: ReservationConfirmationSettings } | { error: string }> {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }
        const response = await api.patch(
            '/hotels/reservation-confirmation-settings',
            payload,
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authToken}`,
                },
            },
        );
        return { data: response.data };
    } catch (error: any) {
        return {
            error:
                error?.response?.data?.message ||
                'Failed to save reservation confirmation settings.',
        };
    }
}

export async function updateHotel(id: number, data: any) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const response = await api.patch(`/hotels/${id}`, data, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        });

        if (response.status >= 500) {
            const error = await response.data;
            return {
                error: error.message || 'Failed to update hotel. Try again.',
            };
        }

        return { data: response.data };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export type AdrRevenueSettingsDto = {
    adrTargetAdr: number | null;
    adrMinRateFactor: number | null;
    adrMaxDiscountPercentFrontDesk: number | null;
};

export async function getAdrRevenueSettings(): Promise<
    { data: AdrRevenueSettingsDto } | { error: string }
> {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const response = await api.get('/hotels/adr-revenue-settings', {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        });

        if (response.status >= 500) {
            const error = await response.data;
            return {
                error:
                    error?.message ||
                    'Failed to load ADR revenue settings. Try again.',
            };
        }

        return { data: response.data as AdrRevenueSettingsDto };
    } catch {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function patchAdrRevenueSettings(payload: {
    adrTargetAdr?: number | null;
    adrMinRateFactor?: number | null;
    adrMaxDiscountPercentFrontDesk?: number | null;
}): Promise<{ data: unknown } | { error: string }> {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const response = await api.patch(
            '/hotels/adr-revenue-settings',
            payload,
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
                    error?.message ||
                    'Failed to save ADR revenue settings. Try again.',
            };
        }

        return { data: response.data };
    } catch {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function updateHotelComplimentSettings(id: number, data: any) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const response = await api.patch(
            `/hotels/${id}/complimentary-settings`,
            data,
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
                    'Failed to update hotel complimentary settings. Try again.',
            };
        }

        return { data: response.data };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function getMenuSettings() {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const response = await api.get('/hotels/menu-settings', {
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
                    'Failed to fetch menu settings. Try again.',
            };
        }

        return { data: response.data };
    } catch {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function updateMenuSettings(payload: {
    restaurantName?: string | null;
    restaurantLogo?: string | null;
    brandColor?: string | null;
    font?: string | null;
    theme?: string | null;
    coverImage?: string | null;
}) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const response = await api.patch('/hotels/menu-settings', payload, {
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
                    'Failed to update menu settings. Try again.',
            };
        }

        return { data: response.data };
    } catch (error: any) {
        return {
            error:
                error?.response?.data?.message ||
                'Failed to update menu settings. Try again.',
        };
    }
}

export async function uploadMenuLogo(file: File) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const formData = new FormData();
        formData.append('file', file);

        const response = await api.post('/hotels/menu-logo', formData, {
            headers: {
                Authorization: `Bearer ${authToken}`,
                'Content-Type': 'multipart/form-data',
            },
        });

        if (response.status >= 500) {
            return {
                error:
                    (await response.data)?.message ||
                    'Failed to upload logo image. Try again.',
            };
        }

        return { data: response.data as { url: string } };
    } catch (error: any) {
        return {
            error:
                error?.response?.data?.message ||
                'Failed to upload logo image. Try again.',
        };
    }
}

export async function uploadMenuCover(file: File) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const formData = new FormData();
        formData.append('file', file);

        const response = await api.post('/hotels/menu-cover', formData, {
            headers: {
                Authorization: `Bearer ${authToken}`,
                'Content-Type': 'multipart/form-data',
            },
        });

        if (response.status >= 500) {
            return {
                error:
                    (await response.data)?.message ||
                    'Failed to upload cover image. Try again.',
            };
        }

        return { data: response.data as { url: string } };
    } catch (error: any) {
        return {
            error:
                error?.response?.data?.message ||
                'Failed to upload cover image. Try again.',
        };
    }
}

export async function getCustomCharges() {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const response = await api.get('/hotels/custom-charges', {
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
                    'Failed to fetch custom charges. Try again.',
            };
        }

        return { data: response.data };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function createCustomCharge(data: { name: string; rate: number }) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const response = await api.post('/hotels/custom-charges', data, {
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
                    'Failed to create custom charge. Try again.',
            };
        }

        return { data: response.data };
    } catch (error: any) {
        return {
            error:
                error?.response?.data?.message ||
                'An unexpected error occurred. Please try again.',
        };
    }
}

export async function updateCustomCharge(
    id: number,
    data: {
        name?: string;
        rate?: number;
        isActive?: boolean;
    },
) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const response = await api.patch(`/hotels/custom-charges/${id}`, data, {
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
                    'Failed to update custom charge. Try again.',
            };
        }

        return { data: response.data };
    } catch (error: any) {
        return {
            error:
                error?.response?.data?.message ||
                'An unexpected error occurred. Please try again.',
        };
    }
}

export async function deleteCustomCharge(id: number) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const response = await api.delete(`/hotels/custom-charges/${id}`, {
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
                    'Failed to delete custom charge. Try again.',
            };
        }

        return { data: response.data };
    } catch (error: any) {
        return {
            error:
                error?.response?.data?.message ||
                'An unexpected error occurred. Please try again.',
        };
    }
}

export async function uploadGalleryImage(file: File) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const formData = new FormData();
        formData.append('file', file);

        const response = await api.post('/hotels/gallery', formData, {
            headers: {
                Authorization: `Bearer ${authToken}`,
                'Content-Type': 'multipart/form-data',
            },
        });

        if (response.status >= 500) {
            return {
                error:
                    (await response.data)?.message ||
                    'Failed to upload gallery image. Try again.',
            };
        }

        return { data: response.data as { url: string; images: string[] } };
    } catch (error: any) {
        return {
            error:
                error?.response?.data?.message ||
                'Failed to upload gallery image. Try again.',
        };
    }
}
