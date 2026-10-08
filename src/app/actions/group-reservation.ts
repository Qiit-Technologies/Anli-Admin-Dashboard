import { getApiErrorMessage } from '@/lib/api-error';
import api from '@/lib/axios';
import { getAuthToken } from './auth/auth-token';

export type GroupReservationStatus = 'PENDING' | 'ACTIVE' | 'COMPLETED';
export type GroupBillingMode = 'GROUP' | 'INDIVIDUAL';

export type CreateGroupReservationPayload = {
  groupName: string;
  groupType?: string;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  purposeOfVisit?: string;
  arrivalDate?: string;
  departureDate?: string;
  expectedArrivalTime?: string;
  status?: GroupReservationStatus;
  billingMode?: GroupBillingMode;
  paymentMethod?: string;
  numberOfGuests?: number;
  numberOfRooms?: number;
  totalAmount?: number;
  totalDeposits?: number;
  totalDiscounts?: number;
  outstandingBalance?: number;
  guestIds?: number[];
};

async function withAuthHeaders() {
  const authToken = await getAuthToken();
  if (!authToken) throw new Error('Authentication token not found.');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${authToken}`,
  };
}

export async function createGroupReservation(
  payload: CreateGroupReservationPayload,
) {
  const headers = await withAuthHeaders();
  const response = await api.post('/group-reservations', payload, { headers });
  return response.data;
}

export async function getGroupReservations(params?: {
  q?: string;
  groupType?: string;
  status?: GroupReservationStatus;
}) {
  const headers = await withAuthHeaders();
  const response = await api.get('/group-reservations', { headers, params });
  return response.data;
}

export async function getGroupReservation(id: number) {
  const headers = await withAuthHeaders();
  const response = await api.get(`/group-reservations/${id}`, { headers });
  return response.data;
}

export async function updateGroupReservation(
  id: number,
  payload: Partial<CreateGroupReservationPayload>,
) {
  const headers = await withAuthHeaders();
  const response = await api.patch(`/group-reservations/${id}`, payload, {
    headers,
  });
  return response.data;
}

export async function deleteGroupReservation(id: number) {
  const headers = await withAuthHeaders();
  const response = await api.delete(`/group-reservations/${id}`, { headers });
  return response.data;
}

export async function voidGroupReservation(id: number, voidReason: string) {
  const headers = await withAuthHeaders();
  const response = await api.post(
    `/group-reservations/${id}/void`,
    { voidReason },
    { headers },
  );
  return response.data;
}

export async function addGuestToGroup(groupId: number, guestId: number) {
  const headers = await withAuthHeaders();
  const response = await api.post(
    `/group-reservations/${groupId}/guests`,
    { guestId },
    { headers },
  );
  return response.data;
}

export type CreateGroupGuestPayload = {
  fullName: string;
  email: string;
  phoneNumber: string;
  nationality?: string;
  roomtype: number;
  roomNumber?: string;
  property: string;
  startDate: string;
  endDate?: string;
  numberOfGuests?: number;
  bookingAmount?: number;
  amountPaid?: number;
  discountType?: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue?: number;
  includeTip?: boolean;
  waivedCharges?: {
    vat?: boolean;
    serviceCharge?: boolean;
    tip?: boolean;
    customCharges?: boolean;
    waiverReason?: string;
  };
  paymentMethod?: string;
  receivingAccount?: string;
};

/** Creates the child reservation, then attaches it to the group. */
export async function createGroupGuest(
  groupId: number,
  payload: CreateGroupGuestPayload,
) {
  const headers = await withAuthHeaders();
  let guestId: number | null = null;
  try {
    const created = await api.post(
      '/guests',
      {
        ...payload,
        createdAt: new Date().toISOString(),
        numberOfGuests: payload.numberOfGuests ?? 1,
        paymentMethod: payload.paymentMethod || '',
        receivingAccount: payload.receivingAccount ?? '',
        includeTip: payload.includeTip ?? false,
      },
      { headers },
    );
    guestId = Number(created.data?.id);
    if (!Number.isFinite(guestId)) {
      throw new TypeError('Reservation was created but no id was returned.');
    }
    const group = await addGuestToGroup(groupId, guestId);
    return { guestId, group };
  } catch (error) {
    if (guestId != null) {
      await deleteGuestReservation(guestId).catch(() => undefined);
    }
    throw new Error(
      getApiErrorMessage(error, 'Could not create guest reservation'),
    );
  }
}

export async function deleteGuestReservation(guestId: number) {
  const headers = await withAuthHeaders();
  const response = await api.delete(`/guests/${guestId}`, { headers });
  return response.data;
}

export type ValidateGroupPartyPayload = {
  arrivalDate: string;
  departureDate: string;
  guests: Array<{
    fullName: string;
    phoneNumber: string;
    roomTypeId: number;
    roomNumber: string;
  }>;
};

/** Date, phone, and room-overlap checks. Writes nothing. */
export async function validateGroupParty(payload: ValidateGroupPartyPayload) {
  const headers = await withAuthHeaders();
  try {
    const response = await api.post(
      '/group-reservations/validate-party',
      payload,
      { headers },
    );
    return response.data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, 'This group cannot be created as entered.'),
    );
  }
}

export async function removeGuestFromGroup(groupId: number, guestId: number) {
  const headers = await withAuthHeaders();
  const response = await api.delete(
    `/group-reservations/${groupId}/guests/${guestId}`,
    { headers },
  );
  return response.data;
}

export async function transferGuestBetweenGroups(
  groupId: number,
  payload: { guestId: number; targetGroupId: number },
) {
  const headers = await withAuthHeaders();
  const response = await api.post(
    `/group-reservations/${groupId}/transfer-guest`,
    payload,
    { headers },
  );
  return response.data;
}

export async function mergeGroupReservation(
  targetGroupId: number,
  sourceGroupId: number,
) {
  const headers = await withAuthHeaders();
  const response = await api.post(
    `/group-reservations/${targetGroupId}/merge`,
    { sourceGroupId },
    { headers },
  );
  return response.data;
}

export async function pullOutGuestFromGroup(groupId: number, guestId: number) {
  const headers = await withAuthHeaders();
  const response = await api.post(
    `/group-reservations/${groupId}/pull-out`,
    { guestId },
    { headers },
  );
  return response.data;
}

export async function bulkCheckInGroupGuests(
  groupId: number,
  guestIds: number[],
) {
  const headers = await withAuthHeaders();
  const response = await api.post(
    `/group-reservations/${groupId}/bulk-check-in`,
    { guestIds },
    { headers },
  );
  return response.data;
}

export async function bulkCheckOutGroupGuests(
  groupId: number,
  guestIds: number[],
) {
  const headers = await withAuthHeaders();
  const response = await api.post(
    `/group-reservations/${groupId}/bulk-check-out`,
    { guestIds },
    { headers },
  );
  return response.data;
}

export async function releaseGroupRooms(groupId: number, guestIds: number[]) {
  const headers = await withAuthHeaders();
  const response = await api.post(
    `/group-reservations/${groupId}/release-rooms`,
    { guestIds },
    { headers },
  );
  return response.data;
}

export async function extendGroupGuestStay(
  groupId: number,
  payload: { guestId: number; newDepartureDate: string },
) {
  const headers = await withAuthHeaders();
  const response = await api.post(
    `/group-reservations/${groupId}/extend-stay`,
    payload,
    { headers },
  );
  return response.data;
}

export async function changeGroupGuestRoom(
  groupId: number,
  payload: { guestId: number; roomNumber?: string; roomId?: number },
) {
  const headers = await withAuthHeaders();
  const response = await api.post(
    `/group-reservations/${groupId}/change-room`,
    payload,
    { headers },
  );
  return response.data;
}

export async function splitGroupBills(
  groupId: number,
  mode: 'equal' | 'individual' | 'custom',
  shares?: Array<{ guestId: number; amount: number }>,
) {
  const headers = await withAuthHeaders();
  const response = await api.post(
    `/group-reservations/${groupId}/split-bills`,
    { mode, shares },
    { headers },
  );
  return response.data;
}

export async function transferGroupCharges(
  groupId: number,
  payload: { fromGuestId: number; toGuestId?: number; toType?: 'master' },
) {
  const headers = await withAuthHeaders();
  const response = await api.post(
    `/group-reservations/${groupId}/transfer-charges`,
    payload,
    { headers },
  );
  return response.data;
}

export async function getGroupRoomingList(groupId: number) {
  const headers = await withAuthHeaders();
  const response = await api.get(`/group-reservations/${groupId}/rooming-list`, {
    headers,
  });
  return response.data;
}

export async function getGroupStatement(groupId: number) {
  const headers = await withAuthHeaders();
  const response = await api.get(`/group-reservations/${groupId}/statement`, {
    headers,
  });
  return response.data;
}

export async function getGroupInvoices(groupId: number) {
  const headers = await withAuthHeaders();
  const response = await api.get(`/group-reservations/${groupId}/invoices`, {
    headers,
  });
  return response.data;
}
