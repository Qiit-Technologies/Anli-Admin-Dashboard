export type GroupType =
    | 'corporate'
    | 'conference'
    | 'wedding'
    | 'government'
    | 'ngo'
    | 'sport'
    | 'religious'
    | 'school'
    | 'tour'
    | 'individual'
    | 'other';

export type GuestType = 'adult' | 'child';

export type GroupBookingStatus = 'active' | 'pending' | 'completed';

export type GroupStayStatus = 'checked-in' | 'checked-out' | 'expected';

export type GroupListTab = 'all' | 'pending' | 'completed' | 'active';

export type GroupPaymentMethod =
    | 'credit'
    | 'debit'
    | 'Account Payable'
    | 'cash'
    | 'bank'
    | 'internal_account';

export type GroupBillingMode = 'group' | 'individual';

export type CreateStep = 1 | 2 | 3 | 4;

export type GroupModal =
    | 'addGuest'
    | 'addRoom'
    | 'transfer'
    | 'splitBills'
    | 'statement'
    | 'invoices'
    | 'releaseRooms'
    | 'bulkCheckIn'
    | 'bulkCheckOut'
    | 'checkout'
    | 'checkIn'
    | 'removeGuest'
    | 'addExisting'
    | 'merge'
    | 'pullOut'
    | 'extendStay'
    | 'upgradeRoom'
    | 'downgradeRoom'
    | 'transferRoom'
    | 'roomingList'
    | 'transferCharges'
    | 'edit'
    | 'changeMaster'
    | 'deleteGroup'
    | 'voidGroup';

export type SplitBillMode = 'equal' | 'individual' | 'custom';

export type GroupGuestDraft = {
    id: string;
    name: string;
    phoneNumber: string;
    email: string;
    roomTypeId: string;
    nationality: string;
    roomNumber: string;
    guestType: GuestType;
    isMaster?: boolean;
};

export type RoomTypeOption = {
    id: string;
    name: string;
    pricePerNight: number;
};

export type AllocatedRoom = {
    id: string;
    roomNumber: string;
    roomTypeId: string;
    guestIds: string[];
};

export type GroupBookingDraft = {
    groupName: string;
    groupType: GroupType;
    contactName: string;
    phoneNumber: string;
    email: string;
    numberOfGuests: string;
    arrivalDate: Date | undefined;
    expectedArrivalTime: string;
    departureDate: Date | undefined;
    purposeOfVisit: string;
    idNumber: string;
};

export type GroupGuest = {
    id: string;
    backendId?: number;
    reservationId: string;
    name: string;
    phoneNumber: string;
    email: string;
    nationality: string;
    guestType: GuestType;
    roomName: string;
    roomNumber: string;
    stayStatus: GroupStayStatus;
    startDate?: string;
    billAmount?: number;
    amountPaid?: number;
    outstanding?: number;
    isVoid?: boolean;
    voidReason?: string;
};

export type StandaloneReservation = {
    id: string;
    backendId?: number;
    name: string;
    phoneNumber?: string;
    roomName: string;
    roomNumber: string;
};

export type GroupBooking = {
    id: string;
    backendId?: number;
    name: string;
    groupType: GroupType;
    status: GroupBookingStatus;
    amount: number;
    deposit: number;
    discount: number;
    outstanding: number;
    isVoid?: boolean;
    startDate: string;
    endDate: string;
    arrivalIso?: string;
    departureIso?: string;
    contactName: string;
    contactPhone: string;
    contactEmail?: string;
    purposeOfVisit?: string;
    paymentMethod?: GroupPaymentMethod;
    billingMode?: GroupBillingMode;
    guests: GroupGuest[];
    roomCount: number;
};
