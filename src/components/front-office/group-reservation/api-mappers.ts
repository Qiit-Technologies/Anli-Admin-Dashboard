import type { GroupBooking, GroupGuest, GroupType } from './types';

const KNOWN_GROUP_TYPES: GroupType[] = [
  'corporate',
  'conference',
  'wedding',
  'government',
  'ngo',
  'sport',
  'religious',
  'school',
  'tour',
  'individual',
  'other',
];

function parseGroupType(input?: string): GroupType {
  const normalized = (input || 'other').toLowerCase().trim();
  return KNOWN_GROUP_TYPES.includes(normalized as GroupType)
    ? (normalized as GroupType)
    : 'other';
}

function parseStatus(input?: string): GroupBooking['status'] {
  const normalized = (input || '').toLowerCase();
  if (normalized === 'active') return 'active';
  if (normalized === 'completed') return 'completed';
  return 'pending';
}

function parseStayStatus(guest: any): GroupGuest['stayStatus'] {
  if (guest?.isCheckedOut) return 'checked-out';
  if (guest?.isCheckedIn) return 'checked-in';
  return 'expected';
}

export function mapGroupFromApi(group: any): GroupBooking {
  const guests: GroupGuest[] = (group?.guests || []).map((guest: any) => ({
    id: String(guest?.id),
    backendId: Number(guest?.id),
    reservationId: String(guest?.reservationId || `RES-${guest?.id ?? ''}`),
    name: guest?.fullName || 'Guest',
    phoneNumber: guest?.phoneNumber || '',
    email: guest?.email || '',
    nationality: guest?.nationality || 'Nigerian',
    guestType: 'adult',
    roomName: guest?.roomType || 'Unassigned',
    roomNumber: guest?.roomNumber || '—',
    stayStatus: parseStayStatus(guest),
    startDate: guest?.startDate
      ? new Date(guest.startDate).toISOString()
      : undefined,
    billAmount: Number(guest?.bookingAmount || 0),
    amountPaid: Number(guest?.amountPaid || 0),
    outstanding: Number(guest?.outstanding || 0),
    isVoid: Boolean(guest?.isVoid),
    voidReason: guest?.voidReason || undefined,
  }));

  const totals = group?.totals || {};
  return {
    id: String(group?.groupCode || group?.id),
    backendId: Number(group?.id),
    name: group?.groupName || 'Group Reservation',
    groupType: parseGroupType(group?.groupType),
    status: parseStatus(group?.status),
    amount: Number(totals?.totalAmount || 0),
    deposit: Number(totals?.totalDeposits || 0),
    discount: Number(totals?.totalDiscounts || 0),
    outstanding: Number(totals?.outstandingBalance || 0),
    isVoid: Boolean(group?.isVoid),
    startDate: group?.arrivalDate
      ? new Date(group.arrivalDate).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        })
      : '—',
    endDate: group?.departureDate
      ? new Date(group.departureDate).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        })
      : '—',
    arrivalIso: group?.arrivalDate
      ? new Date(group.arrivalDate).toISOString()
      : undefined,
    departureIso: group?.departureDate
      ? new Date(group.departureDate).toISOString()
      : undefined,
    contactName: group?.contactName || '',
    contactPhone: group?.contactPhone || '',
    contactEmail: group?.contactEmail || '',
    purposeOfVisit: group?.purposeOfVisit || '',
    paymentMethod: (group?.paymentMethod || '').toLowerCase() as any,
    billingMode: (group?.billingMode || '').toLowerCase() as any,
    guests,
    roomCount: Number(totals?.rooms || 0),
  };
}
