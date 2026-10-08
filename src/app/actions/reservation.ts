import { BASE_URL } from '@/constants/api';
import api from '@/lib/axios';
import { FormDataType } from '../dashboard/components/FrontOffice/dashboard/ReservationModal';
import { getAuthToken } from './auth/auth-token';
import { safeResponseJson, safeResponseJsonOrNull, safeErrorJson } from '@/lib/api';

export async function createReservation(formData: FormDataType) {
    const data: Record<any, any> = {};

    Object.entries(formData).forEach(([key, value]) => {
        if (
            [
                'cardNumber',
                'expirationDate',
                'cvv',
                'postalCode',
                'roomtype',
                'numberOfGuests',
                'amountPaid',
                'outstanding',
                'loyaltyPoints',
                'guestProfileId',
                'creditToApply',
            ].includes(key)
        ) {
            data[key] =
                value !== undefined && value !== '' ? Number(value) : null;
        } else if (typeof value === 'boolean' || key === 'isWalkIn') {
            data[key] = value;
        } else {
            data[key] = value === '' || value === undefined ? null : value;
        }
    });

    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { message: 'Authentication token not found.' };
        }

        const apiUrl = new URL(`/guests`, BASE_URL).toString();
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify(data),
            credentials: 'include',
        });

        if (!response.ok) {
            let errorMessage = 'Reservation creation failed. Please try again.';

            try {
                const contentType = response.headers.get('content-type') || '';
                if (contentType.includes('application/json')) {
                    const errBody = await safeErrorJson(response);

                    const msg = Array.isArray(errBody?.message)
                        ? errBody.message.join('\n')
                        : (errBody?.message ??
                          errBody?.error ??
                          errBody?.detail);

                    if (msg && typeof msg === 'string' && msg.trim()) {
                        errorMessage = msg;
                    }
                } else {
                    const text = await response.text();
                    if (text && text.trim()) {
                        errorMessage = text;
                    }
                }
            } catch {
                // If parsing fails, keep default errorMessage
            }

            return { message: errorMessage };
        }

        const guest = await safeResponseJson(response);
        const guestId =
            typeof guest?.id === 'number' ? guest.id : undefined;

        return {
            message: 'Reservation created successfully!',
            guestId,
        };
    } catch (error: any) {
        return { message: 'An unexpected error occurred. Please try again.' };
    }
}

export async function createTableReservation(data: any) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { message: 'Authentication token not found.' };
        }

        const apiUrl = new URL(`/table-reservations`, BASE_URL).toString();
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify(data),
            credentials: 'include',
        });

        if (!response.ok) {
            let errorMessage = 'Reservation creation failed. Please try again.';

            try {
                const contentType = response.headers.get('content-type') || '';
                if (contentType.includes('application/json')) {
                    const errBody = await safeErrorJson(response);
                    errorMessage = errBody.message || errorMessage;
                }
            } catch {
                // Ignore parsing errors
            }

            return { message: errorMessage, success: false };
        }

        return { message: 'Reservation created successfully!', success: true };
    } catch (error: any) {
        return {
            message: 'An unexpected error occurred. Please try again.',
            success: false,
        };
    }
}

export async function createPublicTableReservation(
    data: any,
    hotelId: string | number,
) {
    try {
        const apiUrl = new URL(
            `/table-reservations/public/${hotelId}`,
            BASE_URL,
        ).toString();
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
            credentials: 'omit',
        });

        if (!response.ok) {
            let errorMessage = 'Reservation creation failed. Please try again.';

            try {
                const contentType = response.headers.get('content-type') || '';
                if (contentType.includes('application/json')) {
                    const errBody = await safeErrorJson(response);
                    errorMessage = errBody.message || errorMessage;
                }
            } catch {
                // Ignore parsing errors
            }

            return { message: errorMessage, success: false };
        }

        return { message: 'Reservation created successfully!', success: true };
    } catch (error) {
        return {
            message: 'An unexpected error occurred. Please try again.',
            success: false,
        };
    }
}

export async function getReservationByHotelId() {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const response = await api.get('/guests', {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        });

        if (response.status >= 500) {
            const error = await response.data;
            return {
                error: error.message || 'Failed to fetch rooms. Try again.',
            };
        }

        const data = await response.data;

        return { data };
    } catch (error: any) {
        // console.error('Error fetching rooms:', error);
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

type ReservationFilterParams = {
    isCheckedIn?: boolean;
    isCheckedOut?: boolean;
    isVoid?: boolean;
    needsApproval?: boolean;
    isApproved?: boolean;
};

export async function getAllReservations(filters?: ReservationFilterParams) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }
        const params =
            filters &&
            Object.fromEntries(
                Object.entries(filters)
                    .filter(([, value]) => value !== undefined)
                    .map(([key, value]) => [key, String(value)]),
            );

        const response = await api.get('/guests/reservations', {
            params: params,
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        });
        if (response.status >= 500) {
            const error = await response.data;
            return {
                error: error.message || 'Failed to fetch rooms. Try again.',
            };
        }

        const data = await response.data;
        return { data };
    } catch (error: any) {
        console.error('Error fetching reservations:', error);
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function getCheckedInGuests() {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }
        const response = await api.get('/guests/checked-in', {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        });
        if (response.status >= 500) {
            const error = await response.data;
            return {
                error: error.message || 'Failed to fetch rooms. Try again.',
            };
        }
        const data = await response.data;
        return { data };
    } catch (error: any) {
        console.error('Error fetching rooms:', error);
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function transferRoom(guestId: number, newRoomId: number) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const response = await api.patch(
            `/guests/${guestId}/transfer-room`,
            { newRoomId },
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
                    error.message ||
                    'Failed to transfer room. Please try again.',
            };
        }

        return { data: response.data };
    } catch (error: any) {
        console.error('Error transferring room:', error);
        return {
            error: 'Failed to transfer room. Please try again.',
        };
    }
}

export async function extendStay(formData: FormData) {
    const guestId = formData.get('guestId');
    const newCheckoutDate = formData.get('newCheckoutDate');
    const newCheckoutTime = formData.get('newCheckoutTime');
    const alternativeRoom = formData.get('alternativeRoom');
    const paymentOption = formData.get('paymentOption');
    const paymentMadeForExtension = formData.get('paymentMadeForExtension');
    const creditToApply = formData.get('creditToApply');
    const guestProfileId = formData.get('guestProfileId');

    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { message: 'Authentication token not found.' };
        }

        const apiUrl = new URL(
            `/guests/${guestId}/extend-stay`,
            BASE_URL,
        ).toString();
        const response = await fetch(apiUrl, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify({
                newCheckoutDate,
                newCheckoutTime,
                alternativeRoom,
                paymentOption,
                paymentMadeForExtension,
                creditToApply,
                guestProfileId,
            }),
            credentials: 'include',
        });

        if (!response.ok) {
            const error = await safeErrorJson(response);
            return {
                message:
                    error.message || 'Failed to extend stay. Please try again.',
            };
        }

        return { message: 'Stay extended successfully!' };
    } catch (error: any) {
        return { message: 'An unexpected error occurred. Please try again.' };
    }
}

export async function createStayViewReservation(formData: FormData) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { message: 'Authentication token not found.' };
        }
        console.log(formData);
        const apiUrl = new URL(`/guests/stay-view`, BASE_URL).toString();
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
                    'Room type creation failed. Please try again.',
            };
        }

        return { message: 'Room type created successfully!' };
    } catch (error: any) {
        return { message: 'An unexpected error occurred. Please try again.' };
    }
}

export async function editReservation(id: string, formData: FormDataType) {
    const data: Record<any, any> = {};

    Object.entries(formData).forEach(([key, value]) => {
        if (
            [
                'cardNumber',
                'expirationDate',
                'cvv',
                'postalCode',
                'roomtype',
                'numberOfGuests',
                'amountPaid',
                'outstanding',
                'loyaltyPoints',
                'phoneNumber',
                'secondGuestPhoneNumber',
                'guestProfileId',
                'creditToApply',
            ].includes(key)
        ) {
            data[key] =
                value !== undefined && value !== null && value !== ''
                    ? Number(value)
                    : null;
        } else {
            data[key] = value === undefined || value === '' ? null : value;
        }
    });

    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { message: 'Authentication token not found.' };
        }

        const apiUrl = new URL(`/guests/${Number(id)}`, BASE_URL).toString();
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
                message:
                    error.message ||
                    'Reservation update failed. Please try again.',
            };
        }

        return { message: 'Reservation updated successfully!' };
    } catch (error: any) {
        return { message: 'An unexpected error occurred. Please try again.' };
    }
}

export async function deleteReservation(id: number) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { message: 'Authentication token not found.' };
        }

        const apiUrl = new URL(`/guests/${id}`, BASE_URL).toString();
        const response = await fetch(apiUrl, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${authToken}`,
            },
            credentials: 'include',
        });

        if (!response.ok) {
            const error = await safeErrorJson(response);
            return {
                message:
                    error.message ||
                    'Failed to delete reservation. Please try again.',
            };
        }

        return { message: 'Reservation deleted successfully' };
    } catch (error: any) {
        return { message: 'An unexpected error occurred. Please try again.' };
    }
}

export async function cancelReservation(id: number) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { message: 'Authentication token not found.' };
        }

        const apiUrl = new URL(`/guests/${id}/cancel`, BASE_URL).toString();
        const response = await fetch(apiUrl, {
            method: 'PATCH',
            headers: {
                Authorization: `Bearer ${authToken}`,
            },
            credentials: 'include',
        });
        if (!response.ok) {
            const error = await safeErrorJson(response);
            return {
                message:
                    error.message ||
                    'Failed to cancel reservation. Please try again.',
            };
        }

        return { message: 'Reservation cancelled successfully!', id: id };
    } catch (error: any) {
        return { message: 'An unexpected error occurred. Please try again.' };
    }
}

export async function voidReservationAction(voidReservationDto: {
    reservationId: number;
    voidReason: string;
}) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { message: 'Authentication token not found.' };
        }

        const apiUrl = new URL(`/guests/void-reservation`, BASE_URL).toString();
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify(voidReservationDto),
            credentials: 'include',
        });

        if (!response.ok) {
            const error = await safeErrorJson(response);
            return {
                message:
                    error.message ||
                    'Void reservation failed. Please try again.',
            };
        }

        return { message: 'Voided successfully!' };
    } catch (error: any) {
        return { message: 'An unexpected error occurred. Please try again.' };
    }
}

export async function approveSpecialReservation(approveReservationDto: {
    reservationId: number;
    action: 'approve' | 'reject';
    rejectionReason?: string;
    approvalReason?: string;
    managerPin?: string;
}) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { message: 'Authentication token not found.' };
        }

        const apiUrl = new URL(
            `/guests/approve-reservation`,
            BASE_URL,
        ).toString();
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify(approveReservationDto),
            credentials: 'include',
        });

        if (!response.ok) {
            const error = await safeErrorJson(response);
            return {
                message:
                    error.message ||
                    `Failed to ${approveReservationDto.action} reservation. Please try again.`,
            };
        }

        const data = await safeResponseJson(response);
        return {
            message:
                data.message ||
                `Reservation ${approveReservationDto.action === 'approve' ? 'approved' : 'rejected'} successfully!`,
        };
    } catch (error: any) {
        console.error('Approval error:', error);
        return {
            message: `An unexpected error occurred while ${approveReservationDto.action === 'approve' ? 'approving' : 'rejecting'} the reservation. Please try again.`,
        };
    }
}

export async function approveProofOfPaymentAction(guestId: number) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const response = await api.post(
            `/guests/${guestId}/approve-proof-of-payment`,
            {},
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authToken}`,
                },
            },
        );

        if (response.status >= 400) {
            return {
                error:
                    response.data?.message ||
                    'Failed to approve proof of payment',
            };
        }

        return { success: true, data: response.data };
    } catch (error: any) {
        console.error('Approve proof of payment error:', error);
        return {
            error:
                error.response?.data?.message ||
                'An unexpected error occurred. Please try again.',
        };
    }
}

export async function getExtendStayQuote(formData: FormData) {
    const guestId = formData.get('guestId');
    const newCheckoutDate = formData.get('newCheckoutDate');
    const newCheckoutTime = formData.get('newCheckoutTime');
    const alternativeRoom = formData.get('alternativeRoom');
    const paymentOption = formData.get('paymentOption');
    const paymentMadeForExtension = formData.get('paymentMadeForExtension');
    const creditToApply = formData.get('creditToApply');
    const guestProfileId = formData.get('guestProfileId');

    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { message: 'Authentication token not found.' };
        }

        const apiUrl = new URL(
            `/guests/${guestId}/extend-stay/quote`,
            BASE_URL,
        ).toString();
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify({
                newCheckoutDate,
                newCheckoutTime,
                alternativeRoom,
                paymentOption,
                paymentMadeForExtension,
                creditToApply,
                guestProfileId,
            }),
            credentials: 'include',
        });

        if (!response.ok) {
            const error = await safeErrorJson(response);
            return { error: error.message || 'Failed to fetch quote.' };
        }

        const data = await safeResponseJson(response);
        return { data };
    } catch (err) {
        return {
            error: err instanceof Error ? err.message : 'Unexpected error',
        };
    }
}
export async function updateReservationDates(
    id: string,
    dateData: {
        startDate: string;
        endDate: string;
        startTime: string;
        endTime: string;
    },
) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        // Use the existing guests endpoint but only send date fields
        const apiUrl = new URL(`/guests/${Number(id)}`, BASE_URL).toString();
        const response = await fetch(apiUrl, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify(dateData),
            credentials: 'include',
        });

        if (!response.ok) {
            const error = await safeErrorJson(response);
            return {
                error:
                    error.message ||
                    'Failed to update reservation dates. Please try again.',
            };
        }

        const data = await safeResponseJson(response);
        return {
            success: true,
            data,
            message: 'Reservation dates updated successfully!',
        };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function getTableReservations(
    startDate?: string,
    endDate?: string,
    search?: string,
    status?: string,
) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const response = await api.get('/table-reservations', {
            params: { startDate, endDate, search, status },
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        });

        if (response.status >= 400) {
            return {
                error:
                    response.data?.message ||
                    'Failed to fetch table reservations',
            };
        }

        return { data: response.data };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function getDashboardData(date?: string) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const response = await api.get('/table-reservations/dashboard', {
            params: { date },
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        });

        if (response.status >= 400) {
            return {
                error:
                    response.data?.message || 'Failed to fetch dashboard data',
            };
        }

        return { data: response.data };
    } catch (error: any) {
        console.error('Dashboard data error:', error);
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function dismissNotification(id: string) {
    if (!id || id === 'NaN') return { error: 'Invalid notification ID' };
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const response = await api.patch(
            `/table-reservations/notifications/${id}/dismiss`,
            {},
            {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            },
        );

        if (response.status >= 400) {
            return {
                error:
                    response.data?.message || 'Failed to dismiss notification',
            };
        }

        return { success: true };
    } catch (error: any) {
        return { error: 'An unexpected error occurred.' };
    }
}
export async function updateTableReservation(id: string, data: any) {
    if (!id || id === 'NaN') return { error: 'Invalid reservation ID' };
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const response = await api.patch(`/table-reservations/${id}`, data, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        });

        if (response.status >= 400) {
            return {
                error: response.data?.message || 'Failed to update reservation',
            };
        }

        return { success: true, data: response.data };
    } catch (error: any) {
        console.error('Update reservation error:', error);
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

// Reservation Spaces and Tables Management Actions
export async function getReservationSpaces() {
    try {
        const authToken = await getAuthToken();
        if (!authToken) return { error: 'Auth token not found' };

        const response = await api.get('/restaurants/dine-in-areas', {
            headers: { Authorization: `Bearer ${authToken}` },
        });

        // Map restaurant fields to reservation frontend fields if needed
        const mappedData = (response.data || []).map((area: any) => ({
            ...area,
            tables: (area.tables || []).map((table: any) => ({
                ...table,
                tableNumber: String(table.number),
                capacity: table.numberOfSeats,
                availableSeats: table.availableSeats,
                isOccupied: table.isOccupied,
                status:
                    table.isOccupied || table.availableSeats <= 0
                        ? 'Occupied'
                        : 'Available',
                tableType: `Table for ${table.numberOfSeats}`,
            })),
        }));

        return { data: mappedData };
    } catch (error: any) {
        return { error: 'Failed to fetch spaces' };
    }
}

export async function getReservationByTableId(tableId: string | number) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) return { error: 'Auth token not found' };

        const response = await api.get(`/table-reservations/table/${tableId}`, {
            headers: { Authorization: `Bearer ${authToken}` },
        });

        if (response.data && response.status === 200) {
            const item = response.data;
            const statusMap: Record<string, string> = {
                PENDING: 'Pending',
                COMPLETED: 'Completed',
                CANCELLED: 'Cancelled',
                BOOKED: 'Booked',
                'IN PROGRESS': 'In Progress',
            };

            return {
                data: {
                    id: String(item.id),
                    rsvId: `#RSV${item.id}`,
                    customerName: `${item.firstName} ${item.lastName}`,
                    tableType: item.tableType || 'N/A',
                    tableNumber: item.tableNumber || 'N/A',
                    spaceType: item.spaceType || 'N/A',
                    rsvTime: item.time || item.rsvTime || 'N/A',
                    reservationDate: item.date || item.reservationDate || 'N/A',
                    status: (statusMap[item.status?.toUpperCase()] ||
                        item.status ||
                        'Pending') as any,
                    paymentStatus: item.paymentStatus || 'Pending Payment',
                    paymentType: item.paymentType || 'Cash',
                    amountPaid:
                        item.totalCost && item.totalCost !== 'null'
                            ? `₦${item.totalCost}`
                            : '₦0.00',
                },
            };
        }
        return { error: 'No active reservation record found for this table.' };
    } catch (error: any) {
        return { error: 'Failed to fetch reservation' };
    }
}

export async function createReservationSpace(data: {
    name: string;
    description: string;
}) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) return { error: 'Auth token not found' };

        const response = await api.post('/restaurants/dine-in-areas', data, {
            headers: { Authorization: `Bearer ${authToken}` },
        });

        return { data: response.data, success: true };
    } catch (error: any) {
        return { error: 'Failed to create space', success: false };
    }
}

export async function deleteReservationSpace(id: number | string) {
    if (!id || id === 'NaN') return { error: 'Invalid space ID' };
    try {
        const authToken = await getAuthToken();
        if (!authToken) return { error: 'Auth token not found' };

        await api.delete(`/restaurants/dine-in-areas/${id}`, {
            headers: { Authorization: `Bearer ${authToken}` },
        });

        return { success: true };
    } catch (error: any) {
        return { error: 'Failed to delete space', success: false };
    }
}

export async function createReservationTable(data: {
    tableNumber: string;
    tableType: string;
    capacity: number;
    spaceId: number;
}) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) return { error: 'Auth token not found' };

        const mappedData = {
            number: parseInt(data.tableNumber, 10),
            numberOfSeats: data.capacity,
            areaId: data.spaceId,
        };

        const response = await api.post('/restaurants/table', mappedData, {
            headers: { Authorization: `Bearer ${authToken}` },
        });

        return { data: response.data, success: true };
    } catch (error: any) {
        return { error: 'Failed to create table', success: false };
    }
}

export async function updateReservationTableData(
    id: number | string,
    data: any,
) {
    if (!id || id === 'NaN') return { error: 'Invalid table ID' };
    try {
        const authToken = await getAuthToken();
        if (!authToken) return { error: 'Auth token not found' };

        const mappedData = {
            number: data.tableNumber
                ? parseInt(data.tableNumber, 10)
                : undefined,
            numberOfSeats: data.capacity,
            areaId: data.spaceId,
        };

        const response = await api.patch(
            `/restaurants/${id}/table`,
            mappedData,
            {
                headers: { Authorization: `Bearer ${authToken}` },
            },
        );

        return { data: response.data, success: true };
    } catch (error: any) {
        return { error: 'Failed to update table', success: false };
    }
}

export async function deleteReservationTable(id: number | string) {
    if (!id || id === 'NaN') return { error: 'Invalid table ID' };
    try {
        const authToken = await getAuthToken();
        if (!authToken) return { error: 'Auth token not found' };

        await api.delete(`/restaurants/${id}/table`, {
            headers: { Authorization: `Bearer ${authToken}` },
        });

        return { success: true };
    } catch (error: any) {
        return { error: 'Failed to delete table', success: false };
    }
}

export async function getPaymentReservations(
    startDate?: string,
    endDate?: string,
    search?: string,
    status?: string,
    page: number = 1,
    limit: number = 10,
) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const response = await api.get('/table-reservations/payments', {
            params: { startDate, endDate, search, status, page, limit },
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        });

        if (response.status >= 400) {
            return {
                error:
                    response.data?.message || 'Failed to fetch payment records',
            };
        }

        return { data: response.data };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function getReports(startDate?: string, endDate?: string) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const response = await api.get('/table-reservations/reports', {
            params: { startDate, endDate },
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        });

        if (response.status >= 400) {
            return {
                error: response.data?.message || 'Failed to fetch report data',
            };
        }

        return { data: response.data };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}
export async function blockReservationDates(data: any) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) return { error: 'Auth token not found' };

        const response = await api.post(
            '/table-reservations/blocked-dates',
            data,
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authToken}`,
                },
            },
        );

        if (response.status >= 400) {
            return {
                error: response.data?.message || 'Failed to block dates',
            };
        }

        return { success: true, data: response.data };
    } catch (error: any) {
        return { error: 'An unexpected error occurred.' };
    }
}

export async function getBlockedDates() {
    try {
        const authToken = await getAuthToken();
        if (!authToken) return { error: 'Auth token not found' };

        const response = await api.get('/table-reservations/blocked-dates', {
            headers: { Authorization: `Bearer ${authToken}` },
        });

        return { data: response.data };
    } catch (error: any) {
        return { error: 'Failed to fetch blocked dates' };
    }
}

export async function getPublicBlockedDates(hotelId: string | number) {
    try {
        const response = await api.get(
            `/table-reservations/public/blocked-dates/${hotelId}`,
        );
        return { data: response.data };
    } catch (error) {
        return { error: 'Failed to fetch blocked dates' };
    }
}

export async function unblockReservationDate(id: string | number) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) return { error: 'Auth token not found' };

        await api.delete(`/table-reservations/blocked-dates/${id}`, {
            headers: { Authorization: `Bearer ${authToken}` },
        });

        return { success: true };
    } catch (error: any) {
        return { error: 'Failed to unblock date' };
    }
}

export async function deleteTableReservation(id: string | number) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) return { error: 'Auth token not found' };

        await api.delete(`/table-reservations/${id}`, {
            headers: { Authorization: `Bearer ${authToken}` },
        });

        return { success: true };
    } catch (error: any) {
        return { error: 'Failed to cancel reservation' };
    }
}

export async function sendTableReservationReminder(id: string | number) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) return { error: 'Auth token not found' };

        const response = await api.post(
            `/table-reservations/${id}/send-reminder`,
            {},
            {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            },
        );

        if (response.status >= 400) {
            return {
                error:
                    response.data?.message || 'Failed to send reminder email',
            };
        }

        return { success: true, message: 'Reminder email sent successfully' };
    } catch (error: any) {
        return {
            error:
                error.response?.data?.message ||
                'An unexpected error occurred while sending reminder',
        };
    }
}

export async function getTableReservationById(id: string | number) {
    if (!id || id === 'NaN') return { error: 'Invalid reservation ID' };
    try {
        const authToken = await getAuthToken();
        if (!authToken) return { error: 'Auth token not found' };

        const response = await api.get(`/table-reservations/${id}`, {
            headers: { Authorization: `Bearer ${authToken}` },
        });

        if (response.status >= 400) {
            return {
                error: response.data?.message || 'Failed to fetch reservation',
            };
        }

        return { data: response.data };
    } catch (error: any) {
        return { error: 'An unexpected error occurred.' };
    }
}
