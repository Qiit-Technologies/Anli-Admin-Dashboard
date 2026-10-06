import { BanquetMenuPackage } from '@/app/actions/banquet-menu-package';
import { format } from 'date-fns';
import {
    MenuCategory,
    MenuPackageItemRow,
    MenuPackageRow,
    MenuPackageStats,
} from '../types';
import { MENU_CATEGORY_STYLES } from './menu-packages';

const CATEGORY_LABELS: Record<MenuCategory, string> = {
    wedding: 'wedding',
    corporate: 'Corporate',
    social: 'Social',
    local: 'Local',
    other: 'Other',
};

function normalizeCategory(value?: string | null): MenuCategory {
    const key = (value ?? 'other').toLowerCase() as MenuCategory;
    return key in MENU_CATEGORY_STYLES ? key : 'other';
}

export function mapApiMenuPackageToRow(pkg: BanquetMenuPackage): MenuPackageRow {
    const category = normalizeCategory(pkg.category);
    const updated = pkg.updatedAt ? new Date(pkg.updatedAt) : new Date();

    return {
        id: String(pkg.id),
        name: pkg.name,
        description: pkg.description ?? '',
        category,
        categoryLabel: CATEGORY_LABELS[category],
        mealType: pkg.mealType,
        itemCount: pkg.items?.length ?? 0,
        priceMin: Number(pkg.priceMin) || 0,
        priceMax: Number(pkg.priceMax) || 0,
        status: pkg.status,
        lastUpdated: format(updated, 'do-MMMM-yyyy').toLowerCase(),
        lastUpdatedTime: format(updated, 'h:mm a'),
        guestMin: pkg.guestMin,
        guestMax: pkg.guestMax,
        serviceChargePercent: Number(pkg.serviceChargePercent) || 10,
        vatPercent: Number(pkg.vatPercent) || 7.5,
        serviceStyle: pkg.serviceStyle,
        eventSuitable: pkg.eventSuitable,
        imageUrl: pkg.imageUrl,
        items: mapApiMenuPackageItems(pkg),
    };
}

export function mapApiMenuPackageItems(
    pkg: BanquetMenuPackage,
): MenuPackageItemRow[] {
    return (pkg.items ?? []).map((item) => ({
        id: item.menuItemId,
        name: item.menuItemName,
        description: item.menuItemDescription ?? '',
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice) || 0,
    }));
}

export function mapApiMenuPackageStats(
    stats: {
        totalPackages: number;
        activePackages: number;
        totalMealItems: number;
        categories: number;
    },
): MenuPackageStats {
    const today = format(new Date(), 'MMM dd yyyy');
    return {
        totalPackages: stats.totalPackages,
        activePackages: stats.activePackages,
        totalMealItems: stats.totalMealItems,
        categories: stats.categories,
        lastUpdatedLabel: 'Today',
        lastUpdatedSub: today,
    };
}

export function getMenuPackageByIdFromList(
    packages: MenuPackageRow[],
    rawId: string,
): MenuPackageRow | undefined {
    const id = decodeURIComponent(rawId);
    return packages.find((p) => p.id === id);
}
