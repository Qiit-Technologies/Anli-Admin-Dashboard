export interface Item {
    id: number;
    name: string;
    description: string;
    price: string;
    categoryId: number;
    subCategoryId: number;
    category: string;
    subCategory: string;
    isAvailable?: boolean;
    isVisibleOnDigitalMenu?: boolean;
    imageUrl?: string;
}
