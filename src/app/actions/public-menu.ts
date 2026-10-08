/* eslint-disable @typescript-eslint/no-unused-vars */
import api from '@/lib/axios';
import { fetchHotelByExternalId } from './hotel';
import { getPublicMenuItems, getPublicMenus } from './menu-item';
import type {
    RestaurantInfo,
    MenuGroup,
    MenuCategory,
    MenuItem,
} from '@/components/menu/data/types';

// ─── helpers ──────────────────────────────────────────────────────────────────

const getCategoryIcon = (name: string): string => {
    const n = name.toLowerCase();
    if (n.includes('breakfast')) return '🍳';
    if (n.includes('main') || n.includes('course')) return '🍽️';
    if (n.includes('salad') || n.includes('appetizer') || n.includes('starter'))
        return '🥗';
    if (n.includes('dessert') || n.includes('sweet') || n.includes('cake'))
        return '🍰';
    if (n.includes('drink') || n.includes('beverage')) return '🍷';
    if (n.includes('cocktail')) return '🍸';
    if (n.includes('beer')) return '🍺';
    if (n.includes('coffee') || n.includes('tea')) return '☕';
    if (n.includes('pizza')) return '🍕';
    if (n.includes('burger')) return '🍔';
    if (n.includes('pasta')) return '🍝';
    if (n.includes('soup')) return '🥣';
    if (n.includes('side')) return '🍟';
    if (n.includes('grill') || n.includes('meat') || n.includes('steak'))
        return '🥩';
    if (n.includes('fish') || n.includes('sea')) return '🐟';
    return '🍴'; // default
};

const getCategoryType = (
    name: string,
    backendType?: string,
): 'food' | 'drinks' => {
    if (backendType) {
        const bt = backendType.toLowerCase();
        if (bt === 'drink' || bt === 'drinks') return 'drinks';
        if (bt === 'food') return 'food';
    }

    const n = name.toLowerCase();
    const drinkKeywords = [
        'drink',
        'beverage',
        'wine',
        'cocktail',
        'juice',
        'soda',
        'beer',
        'spirit',
        'liquid',
        'alcohol',
        'tea',
        'coffee',
        'mocktail',
        'water',
        'shake',
        'smoothie',
    ];
    return drinkKeywords.some((k) => n.includes(k)) ? 'drinks' : 'food';
};

// ─── fetchers ─────────────────────────────────────────────────────────────────

// fetch restaurant branding/info by ID.
// used on the landing page.
export async function getRestaurantInfo(
    restaurantId: string,
): Promise<{ data?: RestaurantInfo; error?: string }> {
    try {
        const result = await fetchHotelByExternalId(restaurantId);

        if (result.error) {
            console.error('getRestaurantInfo error:', result.error);
            return { error: result.error };
        }
        const hotel = result.data;
        if (!hotel) return { error: 'Restaurant not found.' };
        return {
            data: {
                id: hotel.id.toString(),
                name: hotel.restaurantName || hotel.name || 'Restaurant',
                description: hotel.description || '',
                coverImage: hotel.coverImage || '',
                logoImage: hotel.restaurantLogo || hotel.logoImage || '',
                brandColor: hotel.brandColor || '#FF6F00',
                themeId: hotel.theme || hotel.themeId || 'orange',
                fontId: hotel.font || hotel.fontId || 'dm-sans',
            },
        };
    } catch (error: any) {
        return { error: 'An error occurred while fetching restaurant info.' };
    }
}

// Update restaurant branding/info.
export async function updateRestaurantBranding(
    restaurantId: string | number,
    data: {
        restaurantName?: string;
        restaurantLogo?: string;
        brandColor?: string;
        font?: string;
        theme?: string;
        coverImage?: string;
    },
) {
    try {
        const response = await api.patch(`/hotels/${restaurantId}`, data);
        return { data: response.data };
    } catch (error: any) {
        return {
            error:
                error.response?.data?.message ||
                'Failed to update restaurant settings.',
        };
    }
}

// fetch the top-level menu groups for a restaurant (e.g. Local / International).
// returns an empty array if the restaurant has no menu groups — in that case
// the tabs should not be shown and all categories are shown flat.
export async function getMenuGroups(
    restaurantId: string,
    menuType: 'food' | 'drinks',
): Promise<{ data?: MenuGroup[]; error?: string }> {
    try {
        const { data: menus, error } = await getPublicMenus(restaurantId);
        if (error) return { error };
        if (!menus) return { data: [] };

        // Map backend Menu objects to frontend MenuGroup objects
        // In the backend, a Menu doesn't explicitly have a type (food/drinks),
        // but we can filter based on some criteria if needed, or show all.
        // For now, let's assume we show all menus that have at least one category of the right type.
        const mapped: MenuGroup[] = menus
            .filter((menu: any) => {
                if (!menu.categories) return false;
                return menu.categories.some((cat: any) => {
                    const type = getCategoryType(cat.name, cat.category);
                    return type === menuType;
                });
            })
            .map((menu: any) => ({
                id: menu.id.toString(),
                label: menu.name,
                menuType: menuType,
            }));

        return { data: mapped };
    } catch (error: any) {
        return { error: 'An error occurred while fetching menu groups.' };
    }
}

// fetch categories for a restaurant, optionally scoped to a menu type and group.
export async function getMenuCategories(
    restaurantId: string,
    menuType: 'food' | 'drinks',
    menuGroupId?: string,
): Promise<{ data?: MenuCategory[]; error?: string }> {
    try {
        const { data: menus, error } = await getPublicMenus(restaurantId);
        if (error) return { error };
        if (!menus) return { data: [] };

        const categoryMap = new Map<string, MenuCategory>();
        const scopedMenus = menuGroupId
            ? menus.filter((menu: any) => menu.id.toString() === menuGroupId)
            : menus;

        scopedMenus.forEach((menu: any) => {
            (menu.categories ?? []).forEach((category: any) => {
                const name = category.name || 'Miscellaneous';
                const type = getCategoryType(name, category.category);
                if (type !== menuType) return;

                const categoryId = category.id.toString();
                if (categoryMap.has(categoryId)) return;

                const subCategories = (category.subCategories ?? [])
                    .map((subCategory: any) => ({
                        id: subCategory.id.toString(),
                        name: subCategory.name,
                        image: subCategory.imageUrl,
                        displayOrder: Number(subCategory.displayOrder ?? 0),
                    }))
                    .sort(
                        (first: any, second: any) =>
                            first.displayOrder - second.displayOrder ||
                            first.name.localeCompare(second.name),
                    );

                categoryMap.set(categoryId, {
                    id: categoryId,
                    name,
                    icon: getCategoryIcon(name),
                    image: category.imageUrl || '',
                    menuType: type,
                    menuGroupId: menu.id.toString(),
                    displayOrder: Number(category.displayOrder ?? 0),
                    parentCategoryId: category.parentCategory?.id?.toString(),
                    subCategories,
                });
            });
        });

        return {
            data: Array.from(categoryMap.values()).sort(
                (first, second) =>
                    (first.displayOrder ?? 0) - (second.displayOrder ?? 0) ||
                    first.name.localeCompare(second.name),
            ),
        };
    } catch (error: any) {
        return { error: 'An error occurred while fetching categories.' };
    }
}

// fetch menu items for a restaurant, scoped to a menu type and optional group.
export async function getMenuItems(
    restaurantId: string,
    menuType: 'food' | 'drinks',
    menuGroupId?: string,
): Promise<{ data?: MenuItem[]; error?: string }> {
    try {
        const { data: rawItems, error } =
            await getPublicMenuItems(restaurantId);
        if (error) return { error };
        if (!rawItems) return { data: [] };

        const mapped = rawItems
            .map((item: any): MenuItem | null => {
                const categoryName = item.category?.name || 'Miscellaneous';
                const type = getCategoryType(
                    categoryName,
                    item.category?.category,
                );

                if (type !== menuType) return null;

                // Filter by group if provided
                if (menuGroupId) {
                    const belongsToGroup = item.category?.menus?.some(
                        (m: any) => m.id.toString() === menuGroupId,
                    );
                    if (!belongsToGroup) return null;
                }

                const tags: string[] = [];
                const desc = (item.description || '').toLowerCase();
                const name = (item.name || '').toLowerCase();

                if (desc.includes('vegan') || name.includes('vegan'))
                    tags.push('vegan');
                if (
                    (desc.includes('vegetarian') ||
                        name.includes('vegetarian')) &&
                    !tags.includes('vegan')
                )
                    tags.push('vegetarian');
                if (
                    desc.includes('spicy') ||
                    name.includes('spicy') ||
                    desc.includes('hot')
                )
                    tags.push('spicy');
                if (desc.includes('gluten free') || desc.includes('gf'))
                    tags.push('gluten-free');
                if (item.isPopular) tags.push('popular');
                if (item.isNew) tags.push('new');

                return {
                    id: item.id.toString(),
                    name: item.name,
                    description: item.description || '',
                    price: Number(item.price),
                    currency: item.currency || '₦',
                    image:
                        item.imageUrl ||
                        'https://placehold.co/600x400?text=No+Image',
                    categoryId: item.category?.id?.toString() || 'misc',
                    tags: tags,
                    isPopular: !!item.isPopular || tags.includes('popular'),
                    isNew: !!item.isNew || tags.includes('new'),
                    isVegetarian:
                        tags.includes('vegetarian') || tags.includes('vegan'),
                    isVegan: tags.includes('vegan'),
                    isSpicy: tags.includes('spicy'),
                    isGlutenFree: tags.includes('gluten-free'),
                    subCategoryId:
                        item.subCategory?.id?.toString() || undefined,
                    subCategoryName: item.subCategory?.name || undefined,
                };
            })
            .filter((i: MenuItem | null): i is MenuItem => i !== null);

        return { data: mapped };
    } catch (error: any) {
        return { error: 'An error occurred while fetching menu items.' };
    }
}

// fetch a single menu item by ID.
// used on the item detail page.
export async function getMenuItem(
    restaurantId: string,
    itemId: string,
): Promise<{ data?: MenuItem; error?: string }> {
    try {
        const { data: items, error } = await getPublicMenuItems(restaurantId);
        if (error) return { error };

        const rawItem = items?.find((i: any) => i.id.toString() === itemId);
        if (!rawItem) return { error: 'Item not found.' };

        const tags: string[] = [];
        const desc = (rawItem.description || '').toLowerCase();
        const name = (rawItem.name || '').toLowerCase();

        if (desc.includes('vegan') || name.includes('vegan'))
            tags.push('vegan');
        if (
            (desc.includes('vegetarian') || name.includes('vegetarian')) &&
            !tags.includes('vegan')
        )
            tags.push('vegetarian');
        if (
            desc.includes('spicy') ||
            name.includes('spicy') ||
            desc.includes('hot')
        )
            tags.push('spicy');
        if (desc.includes('gluten free') || desc.includes('gf'))
            tags.push('gluten-free');
        if (rawItem.isPopular) tags.push('popular');
        if (rawItem.isNew) tags.push('new');

        return {
            data: {
                id: rawItem.id.toString(),
                name: rawItem.name,
                description: rawItem.description || '',
                price: Number(rawItem.price),
                currency: rawItem.currency || '₦',
                image:
                    rawItem.imageUrl ||
                    'https://placehold.co/600x400?text=No+Image',
                categoryId: rawItem.category?.id?.toString() || 'misc',
                tags: tags,
                isPopular: !!rawItem.isPopular || tags.includes('popular'),
                isNew: !!rawItem.isNew || tags.includes('new'),
                isVegetarian:
                    tags.includes('vegetarian') || tags.includes('vegan'),
                isVegan: tags.includes('vegan'),
                isSpicy: tags.includes('spicy'),
                isGlutenFree: tags.includes('gluten-free'),
                subCategoryId: rawItem.subCategory?.id?.toString() || undefined,
                subCategoryName: rawItem.subCategory?.name || undefined,
            },
        };
    } catch (error: any) {
        return { error: 'An error occurred while fetching the menu item.' };
    }
}
