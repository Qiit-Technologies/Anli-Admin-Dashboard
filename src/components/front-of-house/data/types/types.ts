export type ItemCategory =
    | 'local'
    | 'drinks'
    | 'breakfast'
    | 'lunch'
    | 'dinner'
    | 'desserts'
    | 'snacks'
    | 'bakery'
    | 'vegetarian'
    | 'seafood';

export interface ItemCategoryWithSub {
    label: string;
    value: ItemCategory;
}

export interface MiniCategory {
    itemCategory: ItemCategory;
    label: string;
    value: string;
}
