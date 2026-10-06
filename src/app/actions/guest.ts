/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { BASE_URL } from '@/constants/api';
import api from '@/lib/axios';
import { getAuthToken } from './auth/auth-token';
import {
    safeResponseJson,
    safeResponseJsonOrNull,
    safeErrorJson,
} from '@/lib/api';

export type GuestTotalDueBreakdown = {
    totalDue: number;
    reservationBalance: number;
    unpaidServices: Array<{
        id: number;
        amountPaid: number;
        hotelService: { id: number; type: string } | null;
        notes?: string;
    }>;
    unpaidOrders: Array<{
        id: number;
        totalPrice: number;
        items: unknown[];
        createdAt: string;
    }>;
};

export async function getGuestTotalDue(
    guestId: number,
): Promise<GuestTotalDueBreakdown | null> {
    try {
        const authToken = await getAuthToken();
        if (!authToken) return null;

        const response = await fetch(
            `${BASE_URL}/guests/${guestId}/total-due`,
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authToken}`,
                },
                cache: 'no-store',
            },
        );

        if (!response.ok) return null;
        return (await safeResponseJson(response)) as GuestTotalDueBreakdown;
    } catch {
        return null;
    }
}

export async function getEarlyCheckoutDetails(guestId: number) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const response = await fetch(
            `${BASE_URL}/guests/${guestId}/early-checkout-details`,
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authToken}`,
                },
                cache: 'no-store',
            },
        );

        if (!response.ok) return null;
        return await safeResponseJson(response);
    } catch {
        return null;
    }
}

export async function getGuestInfoById(id: string | string[]) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const response = await api.get(`/guests/info/${Number(id)}`, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        });

        if (response.status >= 500) {
            const error = await response.data;
            return {
                error:
                    error.message || 'Failed to fetch guest info. Try again.',
            };
        }

        const data = await response.data;

        return { data };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function getGuestListByHotelId() {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const response = await api.get(`/guests/list`, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        });

        if (response.status >= 500) {
            const error = await response.data;
            return {
                error:
                    error.message || 'Failed to fetch guest list. Try again.',
            };
        }

        const data = await response.data;

        return { data };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function searchGuestProfiles(query: string) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const response = await api.get(
            `/guests/profiles/search?q=${encodeURIComponent(query)}`,
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
                    'Failed to search guest profiles. Try again.',
            };
        }

        const data = await response.data;

        return { data };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function searchPayableGuests(query: string = '') {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const response = await api.get(
            `/guests/profiles/search?q=${encodeURIComponent(query)}&onlyWithCredit=true`,
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
                    'Failed to search payable guests. Try again.',
            };
        }

        const data = await response.data;

        return { data };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function checkRoomAvailability({
    roomNumber,
    roomType,
    guestId,
    currentEndDate,
    newEndDate,
}: {
    roomNumber: number;
    roomType: number;
    guestId: number;
    currentEndDate: string;
    newEndDate: string;
}) {
    try {
        console.log(roomNumber, roomType, guestId, currentEndDate, newEndDate);
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const response = await api.get(
            `/guests/check-room-availability?roomNumber=${roomNumber}&roomType=${roomType}&guestId=${guestId}&currentEndDate=${currentEndDate}&newEndDate=${newEndDate}`,
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
                error: error.message || 'Failed to check room availability.',
            };
        }

        return { data: response.data };
    } catch (error: any) {
        return {
            error: 'An unexpected error occurred while checking availability.',
        };
    }
}

export async function getGuestHistoryById(phoneNumber: number) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const response = await api.get(
            `/guests/history?phoneNumber=${phoneNumber}`,
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
                    'Failed to fetch guest history. Try again.',
            };
        }

        const data = await response.data;

        return { data };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function getTransactionHistory() {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const response = await api.get(`/guests/transaction-history`, {
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
                    'Failed to fetch transaction history. Try again.',
            };
        }

        const data = await response.data;

        return { data };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function createGuestWakeUpCall(guestId: number, formData: any) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }
        const apiUrl = new URL(
            `/guests/${guestId}/wake-up-call`,
            BASE_URL,
        ).toString();

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify({
                time: formData.time,
                date: formData.date,
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

        return { message: 'Wake up call created' };
    } catch (error: any) {
        return {
            error: 'An unexpected error occurred while checking availability.',
        };
    }
}

export async function sendReservationConfirmationEmail(guestId: number) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }
        const response = await api.post(
            `/guests/${guestId}/send-reservation-confirmation`,
            {},
            {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            },
        );
        return { data: response.data };
    } catch (error: any) {
        const message =
            error?.response?.data?.message ||
            error?.message ||
            'Failed to send confirmation email.';
        return { error: message };
    }
}

export async function getWakeUpCall() {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const response = await api.get(`/guests/wake-up-call`, {
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

export async function markOneWakeUpCallAsComplete(callId: number) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }
        const apiUrl = new URL(
            `/guests/${callId}/complete-wake-up-call`,
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
                    error.message || 'Failed to create item. Please try again.',
            };
        }

        return { message: 'Marked wake up call as completed' };
    } catch (error: any) {
        return {
            error: 'An unexpected error occurred while checking availability.',
        };
    }
}

export async function markAllWakeUpCallComplete() {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }
        const apiUrl = new URL(
            `/guests/complete-all-wake-up-call`,
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
                    error.message || 'Failed to create item. Please try again.',
            };
        }

        return { message: 'Marked all wake up calls as completed' };
    } catch (error: any) {
        return {
            error: 'An unexpected error occurred while checking availability.',
        };
    }
}

export async function upgradeGuestRoom(
    guestId: number,
    data: {
        newRoomId: number;
        addAdditionalChargeToGuestAccount?: boolean;
        additionalChargeAmount?: number;
    },
) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const apiUrl = new URL(
            `/guests/${guestId}/upgrade-room`,
            BASE_URL,
        ).toString();

        const response = await fetch(apiUrl, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify(data),
            credentials: 'include',
        });

        const result = await safeResponseJson(response).catch(() => ({}));

        if (!response.ok) {
            return {
                error:
                    result?.message ||
                    'Failed to upgrade room. Please try again.',
            };
        }

        return {
            message: result?.message || 'Room upgraded successfully!',
            data: result,
        };
    } catch (error: any) {
        return {
            error: 'An unexpected error occurred while upgrading the room.',
        };
    }
}

export async function createGuestServices(data: any, guestId: number) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }
        const apiUrl = new URL(
            `/guests/service?guestId=${guestId}&hotelServiceId=${data.type}`,
            BASE_URL,
        ).toString();

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify({
                amountPaid: data.amountPaid,
                notes: data.notes,
                isPaid: data.isPaid,
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

        return { message: 'Guest services created successfully!' };
    } catch (error: any) {
        return {
            error: 'An unexpected error occurred while checking availability.',
        };
    }
}

export async function getGuestServices(guestId: string) {
    try {
        const id = Number(guestId);
        if (!Number.isFinite(id) || id <= 0) {
            return { error: 'Invalid guest id.', data: [] };
        }

        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const response = await api.get(
            `/guests/services-for-guest?guestId=${id}`,
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
                    'Failed to fetch guest services. Try again.',
            };
        }

        const data = await response.data;

        return { data };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function getGuestBillAudit(guestId: string) {
    try {
        const id = Number(guestId);
        if (!Number.isFinite(id) || id <= 0) {
            return { error: 'Invalid guest id.', data: [] };
        }

        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const response = await api.get(
            `/guests/bill-audit-for-guest?guestId=${id}`,
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
                    'Failed to fetch guest bill audit. Try again.',
            };
        }

        const data = await response.data;
        return { data };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function getGuestDueForCheckOut() {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const response = await api.get(`/guests/due-for-checkout`, {
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
                    'Failed to fetch guest due for checkout. Try again.',
            };
        }

        const data = await response.data;

        return { data };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function generatePrintableNightAudits(): Promise<
    { data: string } | { error: string }
> {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const apiUrl = new URL(
            `/guests/summary/preview/night-audits`,
            BASE_URL,
        ).toString();

        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'text/html',
                Authorization: `Bearer ${authToken}`,
            },
        });

        const contentType = response.headers.get('Content-Type') || '';
        const html = await response.text();
        if (response.ok && contentType.includes('text/html')) {
            return { data: html };
        }
        if (contentType.includes('text/html')) {
            console.warn('Server returned HTML error page.');
            return {
                error: 'Unauthorized or session expired. Please log in again.',
            };
        }

        return { error: 'Unexpected server response. Try again later.' };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function makeGuestPayment(guestId: number, data: any) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }
        const apiUrl = new URL(
            `/guests/make-payment?guestId=${guestId}`,
            BASE_URL,
        ).toString();

        const response = await fetch(apiUrl, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify({
                amountPaid: data.amountPaid,
                paymentMethod: data.paymentMethod,
                receivingAccount: data.receivingAccount,
                creditToApply: data.creditToApply,
                guestProfileId: data.guestProfileId,
            }),
            credentials: 'include',
        });

        if (!response.ok) {
            const error = await safeErrorJson(response);
            return {
                message:
                    error.message ||
                    'Failed to make payment. Please try again.',
            };
        }

        const result = await safeResponseJson(response);
        return {
            message: result.message || 'Payment made successfully!',
            amountPaid: result.amountPaid,
            outstanding: result.outstanding,
        };
    } catch (error: any) {
        return {
            error: 'An unexpected error occurred while processing payment.',
        };
    }
}

export async function getReservationsNeedingApproval() {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const response = await api.get(`/guests/pending-approvals`, {
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
                    'Failed to fetch pending approvals. Try again.',
            };
        }

        const data = await response.data;

        return { data };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export interface NightAuditReportParams {
    businessDate?: Date;
    staffOnShift?: string;
    roomTypeId?: number;
}

export async function getNightAuditReport(params?: NightAuditReportParams) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const searchParams = new URLSearchParams();
        if (params?.businessDate) {
            searchParams.append(
                'businessDate',
                params.businessDate.toISOString().split('T')[0],
            );
        }
        if (params?.staffOnShift) {
            searchParams.append('staffOnShift', params.staffOnShift);
        }
        if (params?.roomTypeId) {
            searchParams.append('roomTypeId', params.roomTypeId.toString());
        }

        const url = `/guests/night-audit/report${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;

        const response = await api.get(url, {
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
                    'Failed to fetch night audit report. Try again.',
            };
        }

        const data = await response.data;

        return { data };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export interface VoidReportParams {
    arrivalDateFrom?: string;
    arrivalDateTo?: string;
    voidDateFrom?: string;
    voidDateTo?: string;
    guestName?: string;
    room?: string;
    rateType?: string;
    source?: string;
    paxFrom?: string;
    paxType?: string;
    paxTo?: string;
    staff?: string;
    voidReason?: string;
}

export interface VoidReportOptions {
    roomOptions: { value: string; label: string }[];
    rateTypeOptions: { value: string; label: string }[];
    sourceOptions: { value: string; label: string }[];
    staffOptions: { value: string; label: string }[];
}

export async function getVoidReportOptions(): Promise<{
    data?: VoidReportOptions;
    error?: string;
}> {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const response = await api.get('/guests/void-report/options', {
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
                    'Failed to fetch void report options. Try again.',
            };
        }

        const data = await response.data;

        return { data };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export interface ComplimentaryReportParams {
    startDate?: string;
    endDate?: string;
    guestName?: string;
    status?: 'all' | 'inhouse' | 'reserved';
    room?: string;
    rateType?: string;
    user?: string;
    reservationNo?: string;
}

export async function getComplimentaryReport(
    params?: ComplimentaryReportParams,
) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const searchParams = new URLSearchParams();
        if (params) {
            const keys: (keyof ComplimentaryReportParams)[] = [
                'startDate',
                'endDate',
                'guestName',
                'status',
                'room',
                'rateType',
                'user',
                'reservationNo',
            ];
            keys.forEach((key) => {
                const value = params[key];
                if (value !== undefined && value !== '' && value !== 'all') {
                    searchParams.append(key, String(value));
                }
            });
        }

        const url = `/guests/complimentary-report${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;

        const response = await api.get(url, {
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
                    'Failed to fetch complimentary report. Try again.',
            };
        }

        const data = await response.data;

        return { data };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export interface FrontOfficeSalesReportParams {
    startDate?: string;
    endDate?: string;
    startTime?: string;
    endTime?: string;
    room?: string;
    rateType?: string;
    user?: string;
    source?: string;
    status?: string;
    inHouseOnly?: boolean;
}

export async function getFrontOfficeSalesReport(
    params?: FrontOfficeSalesReportParams,
) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const searchParams = new URLSearchParams();
        if (params) {
            const entries: [keyof FrontOfficeSalesReportParams, string][] = [
                ['startDate', params.startDate ?? ''],
                ['endDate', params.endDate ?? ''],
                ['startTime', params.startTime ?? ''],
                ['endTime', params.endTime ?? ''],
                ['room', params.room ?? ''],
                ['rateType', params.rateType ?? ''],
                ['user', params.user ?? ''],
                ['source', params.source ?? ''],
                ['status', params.status ?? ''],
            ];
            entries.forEach(([key, value]) => {
                if (value !== undefined && value !== '' && value !== 'all') {
                    searchParams.append(key, String(value));
                }
            });
            if (params.inHouseOnly === true) {
                searchParams.append('inHouseOnly', 'true');
            }
        }

        const url = `/guests/sales-report${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;

        const response = await api.get(url, {
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
                    'Failed to fetch sales report. Try again.',
            };
        }

        const data = await response.data;

        return { data };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export interface ArrivalReportParams {
    dateFrom?: string;
    dateTo?: string;
    roomTypeId?: number;
    staffId?: number;
}

export async function getArrivalReport(params?: ArrivalReportParams) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const searchParams = new URLSearchParams();
        if (params?.dateFrom) {
            searchParams.append('dateFrom', params.dateFrom);
        }
        if (params?.dateTo) {
            searchParams.append('dateTo', params.dateTo);
        }
        if (params?.roomTypeId != null) {
            searchParams.append('roomTypeId', String(params.roomTypeId));
        }
        if (params?.staffId != null) {
            searchParams.append('staffId', String(params.staffId));
        }

        const url = `/guests/arrival-report${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;

        const response = await api.get(url, {
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
                    'Failed to fetch arrival report. Try again.',
            };
        }

        const data = await response.data;

        return { data };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export interface NoShowReportParams {
    startDate?: string;
    startTime?: string;
    endDate?: string;
    endTime?: string;
    reservationNo?: string;
    guestName?: string;
    roomNumber?: string;
    roomType?: string;
}

export async function getNoShowReport(params?: NoShowReportParams) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const searchParams = new URLSearchParams();
        if (params) {
            const keys: (keyof NoShowReportParams)[] = [
                'startDate',
                'startTime',
                'endDate',
                'endTime',
                'reservationNo',
                'guestName',
                'roomNumber',
                'roomType',
            ];
            keys.forEach((key) => {
                const value = params[key];
                if (value !== undefined && value !== '' && value !== 'all') {
                    searchParams.append(key, String(value));
                }
            });
        }

        const url = `/guests/no-show-report${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;

        const response = await api.get(url, {
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
                    'Failed to fetch no-show report. Try again.',
            };
        }

        const data = await response.data;
        return { data };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export interface GuestInHouseReportParams {
    startDate?: string;
    startTime?: string;
    endDate?: string;
    endTime?: string;
    roomNumber?: string;
    roomType?: string;
    staffId?: string;
}

export async function getGuestInHouseReport(params?: GuestInHouseReportParams) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const searchParams = new URLSearchParams();
        if (params) {
            const keys: (keyof GuestInHouseReportParams)[] = [
                'startDate',
                'startTime',
                'endDate',
                'endTime',
                'roomNumber',
                'roomType',
                'staffId',
            ];
            keys.forEach((key) => {
                const value = params[key];
                if (value !== undefined && value !== '' && value !== 'all') {
                    searchParams.append(key, String(value));
                }
            });
        }

        const url = `/guests/guest-in-house-report${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;

        const response = await api.get(url, {
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
                    'Failed to fetch guest in-house report. Try again.',
            };
        }

        const data = await response.data;
        return { data };
    } catch (error) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function getVoidReport(params?: VoidReportParams) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const searchParams = new URLSearchParams();
        if (params) {
            const keys: (keyof VoidReportParams)[] = [
                'arrivalDateFrom',
                'arrivalDateTo',
                'voidDateFrom',
                'voidDateTo',
                'guestName',
                'room',
                'rateType',
                'source',
                'paxFrom',
                'paxType',
                'paxTo',
                'staff',
                'voidReason',
            ];
            keys.forEach((key) => {
                const value = params[key];
                if (value !== undefined && value !== '' && value !== 'all') {
                    searchParams.append(key, String(value));
                }
            });
        }

        const url = `/guests/void-report${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;

        const response = await api.get(url, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        });

        if (response.status >= 500) {
            const error = await response.data;
            return {
                error:
                    error?.message || 'Failed to fetch void report. Try again.',
            };
        }

        const data = await response.data;

        return { data };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export interface RefundReportParams {
    startDate?: string;
    startTime?: string;
    endDate?: string;
    endTime?: string;
    user?: string;
    paymentMethod?: string;
    refundAccount?: string;
    guestSearch?: string;
    guestProfileId?: string;
}

export async function getRefundReport(params?: RefundReportParams) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const searchParams = new URLSearchParams();
        if (params) {
            const keys: (keyof RefundReportParams)[] = [
                'startDate',
                'startTime',
                'endDate',
                'endTime',
                'user',
                'paymentMethod',
                'refundAccount',
                'guestSearch',
                'guestProfileId',
            ];
            keys.forEach((key) => {
                const value = params[key];
                if (value !== undefined && value !== '' && value !== 'all') {
                    searchParams.append(key, String(value));
                }
            });
        }

        const url = `/guests/reports/refund${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;

        const response = await api.get(url, {
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
                    'Failed to fetch refund report. Try again.',
            };
        }

        const data = await response.data;

        return { data };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export interface TaxAndChargesReportParams {
    startDate?: string;
    startTime?: string;
    endDate?: string;
    endTime?: string;
    user?: string;
    chargeType?: string;
}

export async function getTaxAndChargesReport(
    params?: TaxAndChargesReportParams,
) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const searchParams = new URLSearchParams();
        if (params) {
            const keys: (keyof TaxAndChargesReportParams)[] = [
                'startDate',
                'startTime',
                'endDate',
                'endTime',
                'user',
                'chargeType',
            ];
            keys.forEach((key) => {
                const value = params[key];
                if (value !== undefined && value !== '' && value !== 'all') {
                    searchParams.append(key, String(value));
                }
            });
        }

        const url = `/guests/tax-charges-report${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;

        const response = await api.get(url, {
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
                    'Failed to fetch tax and charges report. Try again.',
            };
        }

        const data = await response.data;
        return { data };
    } catch {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function finalizeNightAudit(
    businessDate: Date,
    notes?: string,
): Promise<{ data?: any; error?: string }> {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const response = await api.post(
            '/guests/night-audit/finalize',
            {
                businessDate: businessDate.toISOString().split('T')[0],
                notes,
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authToken}`,
                },
            },
        );

        return { data: response.data };
    } catch (error: any) {
        const message =
            error?.response?.data?.error ||
            error?.response?.data?.message ||
            'Failed to finalize night audit.';
        return { error: message };
    }
}

export async function getNightAuditStatus(
    businessDate: Date,
): Promise<{ data?: { finalized: boolean; auditLog?: any }; error?: string }> {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const dateStr = businessDate.toISOString().split('T')[0];
        const response = await api.get(
            `/guests/night-audit/status?businessDate=${dateStr}`,
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authToken}`,
                },
            },
        );

        return { data: response.data };
    } catch (error: any) {
        return { error: 'Failed to check night audit status.' };
    }
}

export async function getNightAuditHistory(
    limit?: number,
): Promise<{ data?: any[]; error?: string }> {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const url = `/guests/night-audit/history${limit ? `?limit=${limit}` : ''}`;
        const response = await api.get(url, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        });

        return { data: response.data };
    } catch (error: any) {
        return { error: 'Failed to fetch night audit history.' };
    }
}

export async function emailNightAuditReport(
    businessDate: Date,
    recipients?: string[],
): Promise<{ data?: any; error?: string }> {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const response = await api.post(
            '/guests/night-audit/email',
            {
                businessDate: businessDate.toISOString().split('T')[0],
                recipients,
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authToken}`,
                },
            },
        );

        return { data: response.data };
    } catch (error: any) {
        const message =
            error?.response?.data?.error ||
            error?.response?.data?.message ||
            'Failed to send email.';
        return { error: message };
    }
}

export type AdrDayBreakdown = {
    date: string;
    totalRoomRevenue: number;
    roomsSoldNights: number;
    adr: number;
};

export type AdrSnapshotContext = {
    sellableRoomCount: number;
    dayGuestNights: number;
    occupancyPercent: number | null;
    suggestedMinRate: number;
    priorDayAdr: number | null;
    vsPriorDayPercent: number | null;
    /** When the hotel sets a target ADR, banding may reference this instead of prior day only. */
    targetAdr?: number | null;
    vsTargetPercent?: number | null;
    minRateFactorApplied?: number | null;
    maxDiscountPercentFrontDesk?: number | null;
    band: 'up' | 'flat' | 'down' | 'unknown';
};

export type AdrSnapshot = {
    hotelId: number;
    from: string;
    to: string;
    totalRoomRevenue: number;
    roomsSoldNights: number;
    adr: number;
    sellableRoomCount?: number;
    byDay: AdrDayBreakdown[];
    definition: string;
    context?: AdrSnapshotContext;
};

export type GetAdrSnapshotParams = {
    date?: string;
    from?: string;
    to?: string;
    includePending?: boolean;
    roomTypeId?: number;
    includeNoShows?: boolean;
    bookingSource?: string;
    enrichContext?: boolean;
};

export type AdrContributorRow = {
    guestId: number;
    bookingCode: string | null;
    guestName: string | null;
    roomNumber: string | null;
    roomTypeName: string | null;
    bookingStatus: string;
    guestNights: number;
    roomRevenue: number;
};

export type AdrContributorsResult = {
    hotelId: number;
    from: string;
    to: string;
    total: number;
    page: number;
    limit: number;
    items: AdrContributorRow[];
};

function buildAdrSearchParams(params?: GetAdrSnapshotParams): string {
    const searchParams = new URLSearchParams();
    if (params?.date) searchParams.set('date', params.date);
    if (params?.from) searchParams.set('from', params.from);
    if (params?.to) searchParams.set('to', params.to);
    if (params?.includePending === true) {
        searchParams.set('includePending', 'true');
    }
    if (params?.includeNoShows === true) {
        searchParams.set('includeNoShows', 'true');
    }
    const bs = params?.bookingSource?.trim();
    if (bs) {
        searchParams.set('bookingSource', bs);
    }
    if (params?.enrichContext === false) {
        searchParams.set('enrichContext', 'false');
    }
    if (
        params?.roomTypeId != null &&
        Number.isFinite(params.roomTypeId) &&
        params.roomTypeId > 0
    ) {
        searchParams.set('roomTypeId', String(params.roomTypeId));
    }
    return searchParams.toString();
}

export async function getAdrSnapshot(
    params?: GetAdrSnapshotParams,
): Promise<{ data: AdrSnapshot } | { error: string }> {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const qs = buildAdrSearchParams(params);
        const url = `/guests/adr${qs ? `?${qs}` : ''}`;

        const response = await api.get(url, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        });

        if (response.status >= 500) {
            const error = await response.data;
            return {
                error:
                    error?.message || 'Failed to load ADR snapshot. Try again.',
            };
        }

        return { data: response.data as AdrSnapshot };
    } catch (error: unknown) {
        const message =
            (error as { response?: { data?: { message?: string } } })?.response
                ?.data?.message ||
            'An unexpected error occurred. Please try again.';
        return { error: message };
    }
}

export type GetAdrContributorsParams = GetAdrSnapshotParams & {
    page?: number;
    limit?: number;
};

export async function getAdrContributors(
    params?: GetAdrContributorsParams,
): Promise<{ data: AdrContributorsResult } | { error: string }> {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const searchParams = new URLSearchParams(buildAdrSearchParams(params));
        if (params?.page != null && params.page > 0) {
            searchParams.set('page', String(params.page));
        }
        if (params?.limit != null && params.limit > 0) {
            searchParams.set('limit', String(params.limit));
        }

        const qs = searchParams.toString();
        const url = `/guests/adr/contributors${qs ? `?${qs}` : ''}`;

        const response = await api.get(url, {
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
                    'Failed to load ADR contributors. Try again.',
            };
        }

        return { data: response.data as AdrContributorsResult };
    } catch (error: unknown) {
        const message =
            (error as { response?: { data?: { message?: string } } })?.response
                ?.data?.message ||
            'An unexpected error occurred. Please try again.';
        return { error: message };
    }
}

export type AdrDiscountPreviewParams = {
    date: string;
    additionalNights: number;
    ratePerNight: number;
    includePending?: boolean;
    roomTypeId?: number;
    bookingSource?: string;
    includeNoShows?: boolean;
};

export type AdrDiscountPreviewResult = {
    date: string;
    currentAdr: number;
    projectedAdr: number;
    deltaPercent: number | null;
    dayRoomRevenue: number;
    dayGuestNights: number;
    additionalNights: number;
    ratePerNight: number;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    suggestedMinRate: number | null;
    occupancyPercent: number | null;
    currentOccupancyPercent?: number | null;
    projectedOccupancyPercent?: number | null;
    insight: string;
};

export async function postAdrDiscountPreview(
    body: AdrDiscountPreviewParams,
): Promise<{ data: AdrDiscountPreviewResult } | { error: string }> {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const response = await api.post(
            '/guests/adr/discount-preview',
            {
                date: body.date,
                additionalNights: body.additionalNights,
                ratePerNight: body.ratePerNight,
                includePending: body.includePending,
                roomTypeId: body.roomTypeId,
                bookingSource: body.bookingSource?.trim() || undefined,
                includeNoShows: body.includeNoShows,
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
                    error?.message ||
                    'Failed to compute ADR preview. Try again.',
            };
        }

        return { data: response.data as AdrDiscountPreviewResult };
    } catch (error: unknown) {
        const message =
            (error as { response?: { data?: { message?: string } } })?.response
                ?.data?.message ||
            'An unexpected error occurred. Please try again.';
        return { error: message };
    }
}

export async function applyWaiver(
    guestId: number,
    data: {
        vat?: boolean;
        serviceCharge?: boolean;
        tip?: boolean;
        customCharges?: boolean;
        waiverReason?: string;
    },
) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const apiUrl = new URL(`/guests/${guestId}/waive`, BASE_URL).toString();

        const response = await fetch(apiUrl, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify(data),
            credentials: 'include',
        });

        if (!response.ok) {
            const error = await safeErrorJson(response);
            return {
                error:
                    error.message ||
                    'Failed to apply waiver. Please try again.',
            };
        }

        const result = await safeResponseJson(response);
        return { data: result };
    } catch (error: any) {
        return {
            error: 'An unexpected error occurred while applying waiver.',
        };
    }
}

export async function revertAutobilling(guestId: string | number) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const apiUrl = new URL(
            `/guests/${guestId}/revert-autobilling`,
            BASE_URL,
        ).toString();

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
                error:
                    error.message ||
                    'Failed to revert auto-billing. Please try again.',
            };
        }

        const result = await safeResponseJson(response);
        return { data: result, success: true };
    } catch (error: any) {
        return {
            error: 'An unexpected error occurred while reverting auto-billing.',
        };
    }
}
