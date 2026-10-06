import { AmenityCategory } from '../types';

export const AMENITY_CATEGORY_STYLES: Record<
    AmenityCategory,
    { bg: string; text: string; label: string }
> = {
    audio: { bg: 'bg-orange-50', text: 'text-orange-700', label: 'Audio' },
    furniture: { bg: 'bg-sky-50', text: 'text-sky-700', label: 'Furniture' },
    visuals: { bg: 'bg-pink-50', text: 'text-pink-700', label: 'Visuals' },
    light: { bg: 'bg-violet-50', text: 'text-violet-700', label: 'Light' },
    other: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Other' },
};

export const AMENITY_CONDITION_STYLES: Record<
    string,
    { bg: string; text: string; label: string }
> = {
    excellent: {
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        label: 'Excellent',
    },
    good: { bg: 'bg-orange-50', text: 'text-orange-700', label: 'Good' },
    poor: { bg: 'bg-yellow-50', text: 'text-yellow-800', label: 'Poor' },
    bad: { bg: 'bg-red-50', text: 'text-red-700', label: 'Bad' },
};

export const AMENITY_STATUS_STYLES: Record<
    string,
    { bg: string; text: string; label: string }
> = {
    active: { bg: 'bg-emerald-50', text: 'text-emerald-700', label: 'Active' },
    'not-available': {
        bg: 'bg-red-50',
        text: 'text-red-700',
        label: 'Not available',
    },
    unavailable: {
        bg: 'bg-yellow-50',
        text: 'text-yellow-800',
        label: 'Unavailable',
    },
};

export function toAmenitySlug(name: string): string {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}
