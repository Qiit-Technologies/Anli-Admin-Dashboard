import { BanquetInventoryItem } from '@/app/actions/banquet-inventory';
import { format } from 'date-fns';
import {
    AmenityCategory,
    AmenityCondition,
    AmenityRow,
    AmenityStats,
} from '../types';

const DEFAULT_IMAGE =
    'https://images.unsplash.com/photo-1598488035139-bdcb1f65bdea?w=120&h=120&fit=crop';

const CATEGORY_LABELS: Record<AmenityCategory, string> = {
    audio: 'Audio',
    furniture: 'Furniture',
    visuals: 'Visuals',
    light: 'Light',
    other: 'Other',
};

function normalizeCategory(value?: string | null): AmenityCategory {
    const key = (value ?? 'other').toLowerCase() as AmenityCategory;
    return key in CATEGORY_LABELS ? key : 'other';
}

function normalizeCondition(value?: string | null): AmenityCondition {
    const key = (value ?? 'good').toLowerCase() as AmenityCondition;
    if (key === 'excellent' || key === 'good' || key === 'poor' || key === 'bad') {
        return key;
    }
    return 'good';
}

function parseName(type: string): string {
    return type.includes(' — ')
        ? type.split(' — ').slice(1).join(' — ')
        : type;
}

export function mapApiInventoryToRow(item: BanquetInventoryItem): AmenityRow {
    const name = parseName(item.type);
    const category = normalizeCategory(item.category);
    const rented = Math.max(0, item.quantity - item.remaining);
    const created = item.createdAt ? new Date(item.createdAt) : new Date();
    const images =
        item.images && item.images.length > 0 ? item.images : [DEFAULT_IMAGE];

    return {
        id: String(item.id),
        name,
        description: item.description ?? `Inventory item — ${name}`,
        subtitle: item.subtitle ?? name.toLowerCase(),
        category,
        categoryLabel: CATEGORY_LABELS[category],
        totalQuantity: item.quantity,
        availability: item.remaining,
        rented,
        condition: normalizeCondition(item.condition),
        status:
            item.status === 'available' && item.remaining > 0
                ? 'active'
                : 'not-available',
        dailyRate: Number(item.unitCost) || 0,
        environment: item.environment ?? undefined,
        specifications: item.specifications ?? [],
        images,
        dateAdded: format(created, 'dd-MM-yyyy'),
    };
}

export function mapApiInventoryStats(
    stats: {
        totalAmenities: number;
        totalRented: number;
        totalReturned: number;
        totalStock: number;
    },
): AmenityStats {
    return {
        totalAmenities: stats.totalAmenities,
        amenitiesAvailable: stats.totalReturned,
        currentlyRented: stats.totalRented,
        returnedThisMonth: 0,
        totalTrend: 0,
        availableTrend: 0,
        rentedTrend: 0,
        returnedTrend: 0,
    };
}

export function mapApiInventoryStatsFromRows(
    amenities: AmenityRow[],
): AmenityStats {
    const available = amenities.reduce((s, a) => s + a.availability, 0);
    const rented = amenities.reduce((s, a) => s + a.rented, 0);
    return {
        totalAmenities: amenities.length,
        amenitiesAvailable: available,
        currentlyRented: rented,
        returnedThisMonth: 0,
        totalTrend: 0,
        availableTrend: 0,
        rentedTrend: 0,
        returnedTrend: 0,
    };
}
