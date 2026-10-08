import type {
    MenuItemCategoryType,
    MenuSearchModule,
    SearchableMenuItem,
} from './types';

const DRINK_KEYWORDS = [
    'drink',
    'beverage',
    'wine',
    'cocktail',
    'juice',
    'soda',
    'beer',
    'spirit',
    'alcohol',
    'tea',
    'coffee',
    'mocktail',
    'water',
    'shake',
    'smoothie',
];

function resolveCategoryType(
    categoryName?: string,
    backendType?: string,
): MenuItemCategoryType {
    if (backendType) {
        const normalized = backendType.toLowerCase();
        if (normalized === 'drink' || normalized === 'drinks') return 'drink';
        if (normalized === 'food') return 'food';
    }

    const name = (categoryName || '').toLowerCase();
    if (DRINK_KEYWORDS.some((keyword) => name.includes(keyword))) {
        return 'drink';
    }
    if (name) return 'food';
    return 'other';
}

function toNumber(value: unknown): number {
    if (typeof value === 'string') {
        const parsed = Number(value.replace(/,/g, ''));
        return Number.isFinite(parsed) ? parsed : 0;
    }
    const parsed = Number(value ?? 0);
    return Number.isFinite(parsed) ? parsed : 0;
}

export function normalizeMenuItem(raw: any): SearchableMenuItem | null {
    const id = Number(raw?.id);
    const name = String(raw?.name || '').trim();
    if (!Number.isFinite(id) || !name) return null;

    const categoryName = String(
        raw?.category?.name || raw?.categoryName || 'Uncategorized',
    ).trim();
    const categoryType = resolveCategoryType(
        categoryName,
        raw?.category?.category,
    );
    const subCategoryName = String(
        raw?.subCategory?.name || raw?.subCategory || '',
    ).trim();
    const description = String(raw?.description || '').trim();
    const price = toNumber(raw?.price ?? raw?.basePrice);
    const isAvailable = raw?.isAvailable !== false;
    const imageUrl = String(raw?.imageUrl || '').trim() || undefined;

    const searchText = [name, description, categoryName, subCategoryName]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

    return {
        id,
        name,
        description,
        price,
        imageUrl,
        categoryName,
        categoryType,
        subCategoryName: subCategoryName || undefined,
        isAvailable,
        searchText,
    };
}

export function normalizeMenuItems(items: any[]): SearchableMenuItem[] {
    const seen = new Set<number>();
    const normalized: SearchableMenuItem[] = [];

    for (const item of items) {
        const next = normalizeMenuItem(item);
        if (!next || seen.has(next.id)) continue;
        seen.add(next.id);
        normalized.push(next);
    }

    return normalized;
}

export function filterItemsByModule(
    items: SearchableMenuItem[],
    module: MenuSearchModule,
): SearchableMenuItem[] {
    if (module === 'restaurant') return items;
    if (module === 'bar') {
        return items.filter((item) => item.categoryType === 'drink');
    }
    return items.filter((item) => item.categoryType === 'food');
}
