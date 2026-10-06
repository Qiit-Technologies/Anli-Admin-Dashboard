import { BookingForm, Food } from '../../types';
import { lineTotal } from '../../utils/banquet-pricing';
import { parseBookingEventDate } from '../../utils/booking-display';
import { format } from 'date-fns';
import {
    MenuCategory,
    MenuPackageRow,
    MenuPackageStats,
} from '../types';

const CATEGORY_LABELS: Record<MenuCategory, string> = {
    wedding: 'wedding',
    corporate: 'Corporate',
    social: 'Social',
    local: 'Local',
    other: 'Other',
};

function inferCategory(
    menuType?: string | null,
    cuisineType?: string | null,
    eventType?: string,
): MenuCategory {
    const text = `${menuType ?? ''} ${cuisineType ?? ''} ${eventType ?? ''}`.toLowerCase();
    if (text.includes('wedding')) return 'wedding';
    if (text.includes('corporate') || text.includes('conference')) {
        return 'corporate';
    }
    if (text.includes('social') || text.includes('party')) return 'social';
    if (text.includes('local') || text.includes('nigerian')) return 'local';
    return 'other';
}

function packageKey(booking: BookingForm): string {
    const name = booking.menuName?.trim() || booking.cuisineType?.trim();
    if (!name) return '';
    return `${name}::${booking.menuType ?? ''}::${inferCategory(
        booking.menuType,
        booking.cuisineType,
        booking.eventType,
    )}`;
}

/** URL-safe id for menu package detail routes */
export function toMenuPackageSlug(source: string): string {
    const slug = source
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
    return slug || 'menu-package';
}

export function getSeedMenuPackages(): MenuPackageRow[] {
    return SEED_PACKAGES.map((p, i) => ({
        ...p,
        id: toMenuPackageSlug(p.name) || `seed-${i}`,
    }));
}

const LEGACY_SEED_IDS: Record<string, number> = {
    'seed-0': 0,
    'seed-1': 1,
    'seed-2': 2,
};

function foodPrices(food: Food[]): { min: number; max: number; count: number } {
    const lines = food.filter((f) => Number(f.quantity) > 0);
    const totals = lines.map((f) => lineTotal(f.cost, f.quantity));
    if (totals.length === 0) return { min: 0, max: 0, count: 0 };
    return {
        min: Math.min(...totals),
        max: Math.max(...totals),
        count: lines.length,
    };
}

const SEED_PACKAGES: Omit<MenuPackageRow, 'id'>[] = [
    {
        name: 'Wedding Package',
        description: 'Premium multi course meal for wedding',
        category: 'wedding',
        categoryLabel: 'wedding',
        mealType: 'Buffet',
        itemCount: 12,
        priceMin: 15000,
        priceMax: 25000,
        status: 'active',
        lastUpdated: '24th-june-2028',
        lastUpdatedTime: '10:00 AM',
    },
    {
        name: 'Corporate Lunch',
        description: 'Executive plated service',
        category: 'corporate',
        categoryLabel: 'Corporate',
        mealType: 'Plated',
        itemCount: 8,
        priceMin: 12000,
        priceMax: 18000,
        status: 'active',
        lastUpdated: '24th-june-2028',
        lastUpdatedTime: '10:00 AM',
    },
    {
        name: 'Social Gathering',
        description: 'Flexible buffet for celebrations',
        category: 'social',
        categoryLabel: 'Social',
        mealType: 'Buffet',
        itemCount: 10,
        priceMin: 8000,
        priceMax: 14000,
        status: 'active',
        lastUpdated: '20th-june-2028',
        lastUpdatedTime: '2:30 PM',
    },
];

export function buildMenuPackagesFromBookings(
    bookings: BookingForm[],
): MenuPackageRow[] {
    const map = new Map<string, MenuPackageRow & { bookingDates: Date[] }>();

    for (const booking of bookings) {
        const key = packageKey(booking);
        if (!key) continue;

        const name =
            booking.menuName?.trim() ||
            booking.cuisineType?.trim() ||
            'Menu Package';
        const category = inferCategory(
            booking.menuType,
            booking.cuisineType,
            booking.eventType,
        );
        const food = booking.food ?? [];
        const prices = foodPrices(food);
        const eventDate = parseBookingEventDate(booking.eventDate);

        const existing = map.get(key);
        if (existing) {
            existing.itemCount = Math.max(
                existing.itemCount,
                prices.count,
            );
            existing.priceMin =
                prices.min > 0
                    ? Math.min(existing.priceMin || prices.min, prices.min)
                    : existing.priceMin;
            existing.priceMax = Math.max(existing.priceMax, prices.max);
            if (eventDate) existing.bookingDates.push(eventDate);
            if (booking.bookingStatus === 'cancelled') {
                existing.status = 'unavailable';
            }
        } else {
            map.set(key, {
                id: toMenuPackageSlug(key),
                name,
                description:
                    booking.menuType?.trim() ||
                    `${booking.cuisineType ?? 'Event'} menu package`,
                category,
                categoryLabel: CATEGORY_LABELS[category],
                mealType: booking.menuType?.trim() || 'Buffet',
                itemCount: prices.count || food.length,
                priceMin: prices.min || 5000,
                priceMax: prices.max || prices.min || 10000,
                status:
                    booking.bookingStatus === 'cancelled'
                        ? 'unavailable'
                        : 'active',
                lastUpdated: eventDate
                    ? format(eventDate, 'do-MMMM-yyyy').toLowerCase()
                    : '—',
                lastUpdatedTime: booking.eventTime || '—',
                bookingDates: eventDate ? [eventDate] : [],
            });
        }
    }

    const rows = Array.from(map.values()).map(({ bookingDates, ...row }) => {
        if (bookingDates.length > 0) {
            const latest = bookingDates.sort(
                (a, b) => b.getTime() - a.getTime(),
            )[0];
            return {
                ...row,
                lastUpdated: format(latest, 'do-MMMM-yyyy').toLowerCase(),
            };
        }
        return row;
    });

    if (rows.length > 0) {
        return rows.sort((a, b) => a.name.localeCompare(b.name));
    }

    return getSeedMenuPackages();
}

export function computeMenuStats(packages: MenuPackageRow[]): MenuPackageStats {
    const active = packages.filter((p) => p.status === 'active').length;
    const categories = new Set(packages.map((p) => p.category)).size;
    const totalMealItems = packages.reduce((s, p) => s + p.itemCount, 0);
    const today = format(new Date(), 'MMM dd yyyy');

    return {
        totalPackages: packages.length,
        activePackages: active,
        totalMealItems: totalMealItems || packages.length,
        categories: categories || 4,
        lastUpdatedLabel: 'Today',
        lastUpdatedSub: today,
    };
}

export function getMenuPackageById(
    packages: MenuPackageRow[],
    rawId: string,
): MenuPackageRow | undefined {
    let id = rawId;
    try {
        id = decodeURIComponent(rawId);
    } catch {
        id = rawId;
    }

    const fromList = packages.find(
        (p) => p.id === id || toMenuPackageSlug(p.id) === id,
    );
    if (fromList) return fromList;

    const seeds = getSeedMenuPackages();
    const fromSeed = seeds.find((p) => p.id === id);
    if (fromSeed) return fromSeed;

    const legacyIndex = LEGACY_SEED_IDS[id];
    if (legacyIndex !== undefined) return seeds[legacyIndex];

    return undefined;
}

export const MENU_CATEGORY_STYLES: Record<
    MenuCategory,
    { bg: string; text: string }
> = {
    wedding: { bg: 'bg-orange-50', text: 'text-orange-700' },
    corporate: { bg: 'bg-sky-50', text: 'text-sky-700' },
    social: { bg: 'bg-pink-50', text: 'text-pink-700' },
    local: { bg: 'bg-violet-50', text: 'text-violet-700' },
    other: { bg: 'bg-gray-100', text: 'text-gray-700' },
};
