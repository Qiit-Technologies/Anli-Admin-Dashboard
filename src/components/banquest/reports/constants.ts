import { BanquetFilterOption } from './types';

export const ALL_OPTION: BanquetFilterOption = { value: 'all', label: 'All' };

export const EVENT_TYPE_OPTIONS: BanquetFilterOption[] = [
    ALL_OPTION,
    { value: 'wedding', label: 'Wedding' },
    { value: 'corporate', label: 'Corporate / Conference' },
    { value: 'church', label: 'Church Program' },
    { value: 'birthday', label: 'Birthday' },
];

export const VENUE_OPTIONS: BanquetFilterOption[] = [
    ALL_OPTION,
    { value: 'grand-hall', label: 'Grand Hall' },
    { value: 'emerald-hall', label: 'Emerald Hall' },
    { value: 'royal-hall', label: 'Royal Hall' },
];

export const COORDINATOR_OPTIONS: BanquetFilterOption[] = [
    ALL_OPTION,
    { value: 'anita-george', label: 'Anita George' },
    { value: 'daniel-peters', label: 'Daniel Peters' },
    { value: 'faith-johnson', label: 'Faith Johnson' },
];

export const BOOKING_STATUS_OPTIONS: BanquetFilterOption[] = [
    ALL_OPTION,
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'completed', label: 'Completed' },
    { value: 'pending', label: 'Pending' },
];

export const PAYMENT_STATUS_OPTIONS: BanquetFilterOption[] = [
    ALL_OPTION,
    { value: 'paid', label: 'Paid' },
    { value: 'partial', label: 'Partially Paid' },
    { value: 'awaiting', label: 'Awaiting Payment' },
    { value: 'outstanding', label: 'Outstanding' },
];

export const PAYMENT_METHOD_OPTIONS: BanquetFilterOption[] = [
    ALL_OPTION,
    { value: 'bank-transfer', label: 'Bank Transfer' },
    { value: 'pos', label: 'POS' },
    { value: 'cash', label: 'Cash' },
];

export const INVOICE_STATUS_OPTIONS: BanquetFilterOption[] = [
    ALL_OPTION,
    { value: 'paid', label: 'Paid' },
    { value: 'partial', label: 'Partial' },
    { value: 'outstanding', label: 'Outstanding' },
];

export const EVENT_STATUS_OPTIONS: BanquetFilterOption[] = [
    ALL_OPTION,
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'completed', label: 'Completed' },
    { value: 'pending', label: 'Pending' },
];

export const PACKAGE_CATEGORY_OPTIONS: BanquetFilterOption[] = [
    ALL_OPTION,
    { value: 'buffet', label: 'Buffet' },
    { value: 'plated', label: 'Plated' },
    { value: 'add-on', label: 'Add-on' },
];

export const AMENITY_CATEGORY_OPTIONS: BanquetFilterOption[] = [
    ALL_OPTION,
    { value: 'audio', label: 'Audio' },
    { value: 'furniture', label: 'Furniture' },
    { value: 'visual', label: 'Visual Equipment' },
];

export const AVAILABILITY_STATUS_OPTIONS: BanquetFilterOption[] = [
    ALL_OPTION,
    { value: 'active', label: 'Active' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'unavailable', label: 'Unavailable' },
];

export const RETURN_STATUS_OPTIONS: BanquetFilterOption[] = [
    ALL_OPTION,
    { value: 'returned', label: 'Returned' },
    { value: 'active', label: 'Active' },
    { value: 'overdue', label: 'Overdue' },
];

export const CUSTOMER_STATUS_OPTIONS: BanquetFilterOption[] = [
    ALL_OPTION,
    { value: 'vip', label: 'VIP' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
];

export const SERVICE_TYPE_OPTIONS: BanquetFilterOption[] = [
    ALL_OPTION,
    { value: 'banquet', label: 'Banquet' },
    { value: 'rental', label: 'Rental' },
    { value: 'catering', label: 'Catering' },
];

export const FOLLOW_UP_STATUS_OPTIONS: BanquetFilterOption[] = [
    ALL_OPTION,
    { value: 'reminder-sent', label: 'Reminder Sent' },
    { value: 'pending', label: 'Pending Follow-up' },
    { value: 'escalated', label: 'Escalated' },
];
