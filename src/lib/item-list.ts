/**
 * Item option for inventory dropdowns / multi-item forms.
 * Keeps conversion and costing fields needed by Purchase Log and Bad Stock.
 */
export interface ItemOption {
    id: string;
    label: string;
    value: string;
    category?: string;
    unitOfMeasurement?: string;
    outerUnit?: string;
    baseUnit?: string;
    portionRate?: number;
    price?: number;
    costPrice?: number;
    costPriceOuter?: number;
    itemLocation?: string;
    status?: string;
    quantity?: number;
    isActive?: boolean;
}

function categoryLabel(category: unknown): string | undefined {
    if (category == null) return undefined;
    if (typeof category === 'string') return category;
    if (typeof category === 'object' && 'name' in category) {
        return String((category as { name?: string }).name || '');
    }
    return undefined;
}

/**
 * Formats item list for dropdowns with consistent structure
 * @param items - Array of items from API
 * @returns Array of formatted items with label and value properties
 */
export function formatItemList(items: any[]): ItemOption[] {
    if (!items || !Array.isArray(items)) {
        return [];
    }

    return items
        .filter((item: any) => item?.id)
        .map((item: any) => {
            const id = String(item.id);
            const portionRate = Number(item.portionRate);
            const name = item.name || item.itemName || `Item ${item.id}`;
            const itemNumber = item.itemNumber
                ? String(item.itemNumber).trim()
                : '';
            return {
                id,
                label: itemNumber ? `${itemNumber} — ${name}` : name,
                value: id,
                category: categoryLabel(item.category),
                unitOfMeasurement:
                    item.unitOfMeasurement || item.baseUnit || undefined,
                outerUnit: item.outerUnit || undefined,
                baseUnit: item.baseUnit || item.unitOfMeasurement || undefined,
                portionRate:
                    Number.isFinite(portionRate) && portionRate > 0
                        ? portionRate
                        : 1,
                price: Number(item.price) || 0,
                costPrice: Number(item.costPrice) || 0,
                costPriceOuter: Number(item.costPriceOuter) || 0,
                itemLocation: item.itemLocation || undefined,
                status: item.status || undefined,
                quantity: Number(item.quantity) || 0,
                isActive: item.isActive !== false,
            };
        });
}

const INACTIVE_STATUSES = new Set([
    'inactive',
    'disabled',
    'archived',
    'deleted',
]);

/** Active items available for purchasing (ANLI-INV-001). */
export function getPurchasableItems(
    items: ItemOption[] | undefined | null,
): ItemOption[] {
    if (!items?.length) return [];
    return items.filter((item) => {
        if (!item.value) return false;
        if (item.isActive === false) return false;
        const status = String(item.status || '').toLowerCase();
        return !INACTIVE_STATUSES.has(status);
    });
}

/**
 * Hook to get formatted item list from items response
 * @param itemsResponse - Response object from items API
 * @returns Array of formatted items
 */
export function useItemList(itemsResponse: any): ItemOption[] {
    const itemsData = itemsResponse || [];
    return formatItemList(itemsData);
}

/** Resolve an option by draft selection id (supports legacy shapes). */
export function findItemOption(
    items: ItemOption[] | undefined | null,
    itemId: string,
): ItemOption | null {
    if (!itemId || !items?.length) return null;
    return (
        items.find(
            (item) =>
                String(item.id ?? item.value) === String(itemId),
        ) ?? null
    );
}
