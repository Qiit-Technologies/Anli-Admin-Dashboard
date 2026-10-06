export const BUSINESS_TYPES = [
    { value: 'HOTEL', label: 'Hotel' },
    { value: 'RESORT', label: 'Resort' },
    { value: 'RESTAURANT', label: 'Restaurant' },
] as const;

export type BusinessType = (typeof BUSINESS_TYPES)[number]['value'];
