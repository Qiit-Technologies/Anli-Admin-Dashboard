export const SPACE_TYPES = [
    { value: 'indoor', label: 'Indoor' },
    { value: 'outdoor', label: 'Outdoor' },
    { value: 'smoking', label: 'Smoking' },
    { value: 'vip', label: 'VIP' },
    { value: 'wheelchair-accessible', label: 'Wheelchair Accessible' },
] as const;

export type SpaceTypeValue = (typeof SPACE_TYPES)[number]['value'];

export const getSpaceTypeLabel = (value: string): string => {
    const spaceType = SPACE_TYPES.find((type) => type.value === value);
    return spaceType?.label || value;
};
