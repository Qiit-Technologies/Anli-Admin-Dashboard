export type MenuSearchModule = 'restaurant' | 'bar' | 'kitchen';

export type MenuItemCategoryType = 'food' | 'drink' | 'other';

export interface SearchableMenuItem {
    id: number;
    name: string;
    description: string;
    price: number;
    imageUrl?: string;
    categoryName: string;
    categoryType: MenuItemCategoryType;
    subCategoryName?: string;
    isAvailable: boolean;
    searchText: string;
}

export interface MenuSearchResult extends SearchableMenuItem {
    score: number;
}
