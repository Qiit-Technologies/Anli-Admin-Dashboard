import { BanquetInventoryItem } from '@/app/actions/banquet-inventory';
import { RentAmenitySelection } from '../rent-wizard/types';

const DEFAULT_IMAGE =
    'https://images.unsplash.com/photo-1598488035139-bdcb1f65bdea?w=120&h=120&fit=crop';

function parseName(type: string): string {
    return type.includes(' — ')
        ? type.split(' — ').slice(1).join(' — ')
        : type;
}

export function inventoryToRentSelection(
    item: BanquetInventoryItem,
): RentAmenitySelection {
    const name = parseName(item.type);
    const condition =
        item.condition === 'excellent' ? 'excellent' : 'good';

    return {
        id: String(item.id),
        name,
        subtitle: item.subtitle ?? name.toLowerCase(),
        imageUrl: item.images?.[0] ?? DEFAULT_IMAGE,
        condition,
        unitAvailable: item.remaining,
        unitPrice: Number(item.unitCost) || 0,
        quantity: 0,
    };
}
