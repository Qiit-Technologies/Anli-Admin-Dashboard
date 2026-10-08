export interface RestaurantInfo {
    id: string;
    name: string;
    description?: string;
    coverImage?: string;
    logoImage?: string;
    brandColor?: string;
    themeId?: string;
    fontId?: string;
}

export interface MenuGroup {
    id: string;
    label: string;
    menuType: 'food' | 'drinks';
}

export interface MenuCategory {
    id: string;
    name: string;
    icon: string;
    image: string;
    menuType: 'food' | 'drinks';
    menuGroupId?: string;
    displayOrder?: number;
    parentCategoryId?: string;
    subCategories?: MenuSubCategory[];
}

export interface MenuSubCategory {
    id: string;
    name: string;
    image?: string;
    displayOrder?: number;
}

export interface MenuItem {
    id: string;
    name: string;
    description: string;
    price: number;
    currency: string;
    image: string;
    categoryId: string;
    tags: string[];
    isPopular?: boolean;
    isNew?: boolean;
    isVegetarian?: boolean;
    isVegan?: boolean;
    isGlutenFree?: boolean;
    isSpicy?: boolean;
    subCategoryId?: string;
    subCategoryName?: string;
}
