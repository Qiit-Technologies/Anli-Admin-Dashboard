import type {
    CreateStep,
    GroupListTab,
    GroupModal,
    GroupPaymentMethod,
    GroupType,
    GuestType,
} from './types';

export const GROUP_RESERVATION_SUBTITLE =
    'Manage all group bookings, bulk check-ins, and master folios';

export const GROUP_TYPE_OPTIONS: { value: GroupType; label: string }[] = [
    { value: 'corporate', label: 'Corporate' },
    { value: 'conference', label: 'Conference' },
    { value: 'wedding', label: 'Wedding' },
    { value: 'government', label: 'Government' },
    { value: 'ngo', label: 'NGO' },
    { value: 'sport', label: 'Sports Team' },
    { value: 'religious', label: 'Religious Organization' },
    { value: 'school', label: 'School' },
    { value: 'tour', label: 'Tour Group' },
    { value: 'individual', label: 'Individual Group' },
    { value: 'other', label: 'Others' },
];

export const NATIONALITY_OPTIONS = [
    { value: 'nigeria', label: 'Nigeria' },
    { value: 'ghana', label: 'Ghana' },
    { value: 'kenya', label: 'Kenya' },
    { value: 'south-africa', label: 'South Africa' },
    { value: 'united-kingdom', label: 'United Kingdom' },
    { value: 'united-states', label: 'United States' },
    { value: 'other', label: 'Other' },
];

export const GUEST_TYPE_OPTIONS: { value: GuestType; label: string }[] = [
    { value: 'adult', label: 'Adult' },
    { value: 'child', label: 'Child' },
];

export const LIST_TABS: { value: GroupListTab; label: string }[] = [
    { value: 'all', label: 'All reservation' },
    { value: 'pending', label: 'Pending reservation' },
    { value: 'completed', label: 'Completed reservation' },
    { value: 'active', label: 'Active reservation' },
];

export const PHONE_MAX_DIGITS = 11;

export function limitPhoneDigits(value: string, max = PHONE_MAX_DIGITS) {
    return value.replace(/\D/g, '').slice(0, max);
}

export const groupFieldClass =
    'h-11 rounded-md border-gray-200 bg-background text-sm shadow-none placeholder:text-gray-400';

export const groupLabelClass = 'mb-1.5 block text-sm text-muted-foreground';

export const groupPanelClass = 'rounded-[10px] border border-gray-100 bg-card';

export const groupPanelTitleClass = 'text-base font-semibold text-foreground';

export const groupPanelSubtitleClass = 'mt-0.5 text-xs text-muted-foreground';

export const groupEmptyShellClass =
    'flex w-full flex-col items-center rounded-3xl bg-[#F6F6F7] text-center';

export const CREATE_STEPS: { step: CreateStep; label: string }[] = [
    { step: 1, label: 'Reservation details' },
    { step: 2, label: 'Room allocation' },
    { step: 3, label: 'Payment' },
    { step: 4, label: 'Confirmation' },
];

export const GROUP_PAYMENT_METHODS: {
    value: GroupPaymentMethod;
    label: string;
}[] = [
    { value: 'credit', label: 'Credit Card' },
    { value: 'debit', label: 'Debit Card' },
    { value: 'Account Payable', label: 'Account Payable' },
    { value: 'cash', label: 'Cash' },
    { value: 'bank', label: 'Bank Transfer' },
    { value: 'internal_account', label: 'Internal Account' },
];

export const GROUP_ACTION_ITEMS: { id: GroupModal; label: string }[] = [
    { id: 'addGuest', label: 'Add Guest' },
    { id: 'addRoom', label: 'Add Rooms' },
    { id: 'addExisting', label: 'Add Existing Reservation' },
    { id: 'merge', label: 'Merge Reservations' },
    { id: 'transfer', label: 'Group Transfer' },
    { id: 'pullOut', label: 'Pull Out Guest' },
    { id: 'splitBills', label: 'Split Bills' },
    { id: 'transferCharges', label: 'Transfer Charges' },
    { id: 'statement', label: 'Generate Statement' },
    { id: 'invoices', label: 'Invoices' },
    { id: 'roomingList', label: 'Rooming List' },
    { id: 'releaseRooms', label: 'Release Rooms' },
    { id: 'bulkCheckIn', label: 'Bulk check in' },
    { id: 'bulkCheckOut', label: 'Bulk Check out' },
];

export const ACTION_TITLES: Record<GroupModal, string> = {
    addGuest: 'Add Guest',
    addRoom: 'Add Rooms',
    transfer: 'Group Transfer',
    splitBills: 'Split Bills',
    statement: 'Generate Statement',
    invoices: 'Invoices',
    releaseRooms: 'Release Rooms',
    bulkCheckIn: 'Bulk Check In',
    bulkCheckOut: 'Bulk Check Out',
    checkout: 'Check out',
    checkIn: 'Check in',
    removeGuest: 'Remove Guest',
    addExisting: 'Add Existing Reservation',
    merge: 'Merge Reservations',
    pullOut: 'Pull Out Guest',
    extendStay: 'Extend Stay',
    upgradeRoom: 'Upgrade Room',
    downgradeRoom: 'Downgrade Room',
    transferRoom: 'Transfer Room',
    roomingList: 'Rooming List',
    transferCharges: 'Transfer Charges',
    edit: 'Edit Group Reservation',
    changeMaster: 'Change Master',
    deleteGroup: 'Delete Group Reservation',
    voidGroup: 'Void Group Reservation',
};
