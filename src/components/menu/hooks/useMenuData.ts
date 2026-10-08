'use client';

import useSWR from 'swr';
import {
    getRestaurantInfo,
    getMenuGroups,
    getMenuCategories,
    getMenuItems,
    getMenuItem,
} from '@/app/actions/public-menu';

// fetch restaurant branding and info.
// used on the landing page and layout to bootstrap the app.

export function useRestaurantInfo(restaurantId: string) {
    const { data, error, isLoading } = useSWR(
        restaurantId ? `restaurant/${restaurantId}` : null,
        () => getRestaurantInfo(restaurantId),
    );

    return {
        restaurant: data?.data,
        error: data?.error ?? error?.message,
        isLoading,
    };
}

// fetch top-level menu groups (e.g. Local / International).
// If the returned array is empty, the tabs should NOT be shown.
export function useMenuGroups(
    restaurantId: string,
    menuType: 'food' | 'drinks',
) {
    const { data, error, isLoading } = useSWR(
        restaurantId
            ? `restaurant/${restaurantId}/menu-groups/${menuType}`
            : null,
        () => getMenuGroups(restaurantId, menuType),
    );

    return {
        groups: data?.data ?? [],
        error: data?.error ?? error?.message,
        isLoading,
    };
}

// fetch categories scoped to a menu type and optional group.
// re-fetches automatically when menuGroupId changes.
export function useMenuCategories(
    restaurantId: string,
    menuType: 'food' | 'drinks',
    menuGroupId?: string,
) {
    const key = restaurantId
        ? `restaurant/${restaurantId}/categories/${menuType}${menuGroupId ? `/${menuGroupId}` : ''}`
        : null;

    const { data, error, isLoading } = useSWR(key, () =>
        getMenuCategories(restaurantId, menuType, menuGroupId),
    );

    return {
        categories: data?.data ?? [],
        error: data?.error ?? error?.message,
        isLoading,
    };
}

// fetch menu items scoped to a menu type and optional group.
// re-fetches automatically when menuGroupId changes.
export function useMenuItems(
    restaurantId: string,
    menuType: 'food' | 'drinks',
    menuGroupId?: string,
) {
    const key = restaurantId
        ? `restaurant/${restaurantId}/items/${menuType}${menuGroupId ? `/${menuGroupId}` : ''}`
        : null;

    const { data, error, isLoading } = useSWR(key, () =>
        getMenuItems(restaurantId, menuType, menuGroupId),
    );

    return {
        items: data?.data ?? [],
        error: data?.error ?? error?.message,
        isLoading,
    };
}

// fetch a single menu item by ID.
// used on the item detail page.
export function useMenuItem(restaurantId: string, itemId: string) {
    const { data, error, isLoading } = useSWR(
        restaurantId && itemId
            ? `restaurant/${restaurantId}/items/${itemId}`
            : null,
        () => getMenuItem(restaurantId, itemId),
    );

    return {
        item: data?.data,
        error: data?.error ?? error?.message,
        isLoading,
    };
}
