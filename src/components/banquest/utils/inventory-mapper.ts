import { BanquetInventoryItem } from '@/app/actions/banquet-inventory';
import { Amenities } from '../types';

function parseInventoryName(type: string): string {
    return type.includes(' — ')
        ? type.split(' — ').slice(1).join(' — ')
        : type;
}

export function inventoryItemToBookingAmenity(
    item: BanquetInventoryItem,
): Amenities {
    return {
        id: item.id,
        name: parseInventoryName(item.type),
        available: String(item.remaining),
        cost: String(item.unitCost),
        quantity: '0',
    };
}

export function inventoryToBookingAmenities(
    items: BanquetInventoryItem[],
): Amenities[] {
    return items.map(inventoryItemToBookingAmenity);
}
