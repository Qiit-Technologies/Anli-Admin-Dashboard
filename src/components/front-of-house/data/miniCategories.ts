import { ItemCategory } from './types/types';

export interface MiniCategory {
    itemCategory?: ItemCategory;
    label: string;
    value: string;
}

export const miniCategories: MiniCategory[] = [
    { itemCategory: 'local', label: 'Swallow', value: 'swallow' },
    { itemCategory: 'local', label: 'Soups & Stews', value: 'soups_stews' },
    {
        itemCategory: 'drinks',
        label: 'Traditional',
        value: 'traditional_drinks',
    },
    { itemCategory: 'drinks', label: 'Soft Drinks', value: 'soft_drinks' },

    { itemCategory: 'breakfast', label: 'Porridge', value: 'porridge' },
    {
        itemCategory: 'breakfast',
        label: 'Bread & Sides',
        value: 'bread_sides',
    },
    { itemCategory: 'lunch', label: 'Rice Dishes', value: 'rice_dishes' },
    {
        itemCategory: 'lunch',
        label: 'Beans & Plantains',
        value: 'beans_plantains',
    },
    {
        itemCategory: 'dinner',
        label: 'Swallow & Soup',
        value: 'swallow_soup',
    },
    { itemCategory: 'dinner', label: 'Pepper Soup', value: 'pepper_soup' },

    { itemCategory: 'desserts', label: 'Puddings', value: 'puddings' },
    // {
    //     itemCategory: 'desserts',
    //     label: 'Fruit Mixes',
    //     value: 'fruit_mixes',
    // },
    // {
    //     itemCategory: 'snacks',
    //     label: 'Fried Snacks',
    //     value: 'fried_snacks',
    // },
    // {
    //     itemCategory: 'snacks',
    //     label: 'Grilled Snacks',
    //     value: 'grilled_snacks',
    // },
    // { itemCategory: 'bakery', label: 'Breads', value: 'breads' },
    // { itemCategory: 'bakery', label: 'Pastries', value: 'pastries' },

    // {
    //     itemCategory: 'vegetarian',
    //     label: 'Vegan Soups',
    //     value: 'vegan_soups',
    // },
    // {
    //     itemCategory: 'vegetarian',
    //     label: 'Plant-Based Proteins',
    //     value: 'plant_proteins',
    // },

    // { itemCategory: 'seafood', label: 'Fish Dishes', value: 'fish_dishes' },
    // { itemCategory: 'seafood', label: 'Shellfish', value: 'shellfish' },
];
