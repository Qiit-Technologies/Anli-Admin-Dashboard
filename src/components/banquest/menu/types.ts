export type MenuPackageStatus = 'active' | 'unavailable';

export type MenuCategory =
    | 'wedding'
    | 'corporate'
    | 'social'
    | 'local'
    | 'other';

export interface MenuPackageItemRow {
    id: number;
    name: string;
    description: string;
    quantity: number;
    unitPrice: number;
}

export interface MenuPackageRow {
    id: string;
    name: string;
    description: string;
    category: MenuCategory;
    categoryLabel: string;
    mealType: string;
    itemCount: number;
    priceMin: number;
    priceMax: number;
    status: MenuPackageStatus;
    lastUpdated: string;
    lastUpdatedTime: string;
    guestMin?: number | null;
    guestMax?: number | null;
    serviceChargePercent?: number;
    vatPercent?: number;
    serviceStyle?: string | null;
    eventSuitable?: string | null;
    imageUrl?: string | null;
    items?: MenuPackageItemRow[];
}

export interface MenuPackageStats {
    totalPackages: number;
    activePackages: number;
    totalMealItems: number;
    categories: number;
    lastUpdatedLabel: string;
    lastUpdatedSub: string;
}
