import { BanquetInventoryItem } from '@/app/actions/banquet-inventory';
import { AmenityRow, AmenityStats } from './types';
import { toAmenitySlug } from './utils/amenity-category';

const SPEAKER_IMG =
    'https://images.unsplash.com/photo-1598488035139-bdcb1f65bdea?w=120&h=120&fit=crop';
const MIC_IMG =
    'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=120&h=120&fit=crop';
const TABLE_IMG =
    'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=120&h=120&fit=crop';
const PROJECTOR_IMG =
    'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=120&h=120&fit=crop';
const LIGHT_IMG =
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=120&h=120&fit=crop';

export const SEED_AMENITIES: AmenityRow[] = [
    {
        id: 'sound-system',
        name: 'Sound System',
        description: 'Premium professional sound system',
        subtitle: '500w system',
        category: 'audio',
        categoryLabel: 'Audio',
        totalQuantity: 10,
        availability: 7,
        rented: 3,
        condition: 'excellent',
        status: 'active',
        dailyRate: 25000,
        environment: 'indoor - outdoor',
        dateAdded: '24-09-2026',
        specifications: [
            { label: 'Power Out', value: '500W' },
            { label: 'Speaker Type', value: 'Full Range' },
            { label: 'Subwoofer', value: 'Dual 18' },
            { label: 'Date Added', value: '24-09-2026' },
            { label: 'Mixer', value: '16 Channel Digital Mixer' },
            { label: 'Microphone', value: '4 Wireless +2 wired' },
        ],
        images: [SPEAKER_IMG, MIC_IMG, SPEAKER_IMG, MIC_IMG, SPEAKER_IMG, MIC_IMG, SPEAKER_IMG],
    },
    {
        id: 'round-table',
        name: 'Round Table',
        description: 'Elegant round banquet table',
        subtitle: 'Seats 8 guests',
        category: 'furniture',
        categoryLabel: 'Furniture',
        totalQuantity: 50,
        availability: 30,
        rented: 20,
        condition: 'good',
        status: 'active',
        dailyRate: 15000,
        environment: 'indoor',
        specifications: [
            { label: 'Diameter', value: '6ft' },
            { label: 'Material', value: 'Wood' },
        ],
        images: [TABLE_IMG],
    },
    {
        id: 'projector',
        name: 'Projector',
        description: 'HD conference projector',
        subtitle: '4K ready',
        category: 'visuals',
        categoryLabel: 'Visuals',
        totalQuantity: 8,
        availability: 0,
        rented: 8,
        condition: 'good',
        status: 'not-available',
        dailyRate: 35000,
        environment: 'indoor',
        specifications: [
            { label: 'Resolution', value: '4K UHD' },
            { label: 'Brightness', value: '5000 lumens' },
        ],
        images: [PROJECTOR_IMG],
    },
    {
        id: 'led-light',
        name: 'LED Light',
        description: 'Professional stage lighting',
        subtitle: 'RGB programmable',
        category: 'light',
        categoryLabel: 'Light',
        totalQuantity: 30,
        availability: 15,
        rented: 15,
        condition: 'excellent',
        status: 'active',
        dailyRate: 18000,
        environment: 'indoor - outdoor',
        specifications: [
            { label: 'Wattage', value: '200W' },
            { label: 'Type', value: 'RGB LED Par' },
        ],
        images: [LIGHT_IMG],
    },
];

export const SEED_AMENITY_STATS: AmenityStats = {
    totalAmenities: 240,
    amenitiesAvailable: 110,
    currentlyRented: 24,
    returnedThisMonth: 24,
    totalTrend: 12,
    availableTrend: 10,
    rentedTrend: 10,
    returnedTrend: 10,
};

function mapInventoryItem(item: BanquetInventoryItem): AmenityRow {
    const name = item.type.includes(' — ')
        ? item.type.split(' — ').slice(1).join(' — ')
        : item.type;
    const slug = toAmenitySlug(name);
    const rented = Math.max(0, item.quantity - item.remaining);

    return {
        id: slug || String(item.id),
        name,
        description: `Inventory item — ${name}`,
        subtitle: name.toLowerCase(),
        category: 'other',
        categoryLabel: 'Other',
        totalQuantity: item.quantity,
        availability: item.remaining,
        rented,
        condition: 'good',
        status:
            item.status === 'available' ? 'active' : 'not-available',
        dailyRate: item.unitCost ?? 0,
        specifications: [],
        images: [SPEAKER_IMG],
    };
}

export function resolveAmenities(
    apiItems: BanquetInventoryItem[],
): AmenityRow[] {
    const map = new Map<string, AmenityRow>();
    for (const seed of SEED_AMENITIES) {
        map.set(seed.id, seed);
    }
    for (const item of apiItems) {
        const row = mapInventoryItem(item);
        map.set(row.id, { ...map.get(row.id), ...row, id: row.id });
    }
    return Array.from(map.values());
}

export function getAmenityById(
    amenities: AmenityRow[],
    id: string,
): AmenityRow | undefined {
    return (
        amenities.find((a) => a.id === id) ??
        SEED_AMENITIES.find((a) => a.id === id)
    );
}

export function computeAmenityStats(
    amenities: AmenityRow[],
): AmenityStats {
    const available = amenities.reduce((s, a) => s + a.availability, 0);
    const rented = amenities.reduce((s, a) => s + a.rented, 0);
    return {
        ...SEED_AMENITY_STATS,
        totalAmenities: amenities.length > 0 ? SEED_AMENITY_STATS.totalAmenities : 0,
        amenitiesAvailable: available || SEED_AMENITY_STATS.amenitiesAvailable,
        currentlyRented: rented || SEED_AMENITY_STATS.currentlyRented,
    };
}
