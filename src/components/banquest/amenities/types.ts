export type AmenityCategory =
    | 'audio'
    | 'furniture'
    | 'visuals'
    | 'light'
    | 'other';

export type AmenityCondition = 'excellent' | 'good' | 'poor' | 'bad';

export type AmenityStatus =
    | 'active'
    | 'not-available'
    | 'unavailable';

export interface AmenityRow {
    id: string;
    name: string;
    description: string;
    subtitle: string;
    category: AmenityCategory;
    categoryLabel: string;
    totalQuantity: number;
    availability: number;
    rented: number;
    condition: AmenityCondition;
    status: AmenityStatus;
    dailyRate: number;
    environment?: string;
    specifications: Array<{ label: string; value: string }>;
    images: string[];
    dateAdded?: string;
}

export interface AmenityStats {
    totalAmenities: number;
    amenitiesAvailable: number;
    currentlyRented: number;
    returnedThisMonth: number;
    totalTrend: number;
    availableTrend: number;
    rentedTrend: number;
    returnedTrend: number;
}
