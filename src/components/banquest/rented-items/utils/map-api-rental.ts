import { BanquetRentalLineItem } from '@/app/actions/banquet-rental';
import { RentalStats, RentedItemCondition, RentedItemRow } from '../types';

const CATEGORY_LABELS: Record<string, string> = {
    audio: 'Audio',
    furniture: 'Furniture',
    visuals: 'Visuals',
    light: 'Light',
    other: 'Other',
};

const DEFAULT_IMAGE =
    'https://images.unsplash.com/photo-1598488035139-bdcb1f65bdea?w=120&h=120&fit=crop';

function normalizeCondition(value?: string | null): RentedItemCondition {
    return value === 'excellent' ? 'excellent' : 'good';
}

export function mapApiRentalToRow(item: BanquetRentalLineItem): RentedItemRow {
    const categoryKey = (item.category ?? 'other').toLowerCase();

    return {
        id: String(item.id),
        amenityId: String(item.inventoryItemId),
        amenityName: item.amenityName,
        amenitySubtitle: item.amenitySubtitle,
        imageUrl: item.imageUrl ?? DEFAULT_IMAGE,
        category: CATEGORY_LABELS[categoryKey] ?? item.category,
        description: item.description,
        renterPhone: item.renterPhone,
        renterName: item.renterName,
        rentedDate: item.rentedDate,
        rentedTime: item.rentedTime,
        eventType: item.eventType,
        dueDate: item.dueDate,
        dueTime: item.dueTime,
        rentedQuantity: item.quantity,
        condition: normalizeCondition(item.condition),
        status: item.status,
        amountPaid: Number(item.amountPaid) || 0,
        returnedDate: item.returnedDate,
        returnedTime: item.returnedTime,
        createdBy: item.createdBy,
        dateCreated: item.dateCreated,
        contact: item.contact,
    };
}

export function mapApiRentalStats(stats: {
    totalRented: number;
    currentlyRented: number;
    returnedThisMonth: number;
    overdue: number;
}): RentalStats {
    return {
        totalRented: stats.totalRented,
        currentlyRented: stats.currentlyRented,
        returnedThisMonth: stats.returnedThisMonth,
        overdue: stats.overdue,
        totalTrend: 0,
        rentedTrend: 0,
        returnedTrend: 0,
        overdueTrend: 0,
    };
}

export function mapApiRentalStatsFromRows(items: RentedItemRow[]): RentalStats {
    const currentlyRented = items.filter(
        (i) => i.status === 'rented' || i.status === 'over-due',
    ).length;
    const returned = items.filter((i) => i.status === 'returned').length;
    const overdue = items.filter((i) => i.status === 'over-due').length;

    return {
        totalRented: items.length,
        currentlyRented,
        returnedThisMonth: returned,
        overdue,
        totalTrend: 0,
        rentedTrend: 0,
        returnedTrend: 0,
        overdueTrend: 0,
    };
}
