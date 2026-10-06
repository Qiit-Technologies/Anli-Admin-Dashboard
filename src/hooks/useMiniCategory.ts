import { useState } from 'react';

export interface Category {
    id: number;
    name: string;
    category: string;
    description: string;
    menu?: {
        id: number;
        name: string;
    };
    menus?: Array<{
        id: number;
        name: string;
    }>;
    menuId?: number; // For backward compatibility
    menuIds?: number[]; // For backward compatibility
}

export interface MiniCategory {
    id: number;
    menuCategory: string;
    menuCategoryId: number;
    subCategory: string;
    description: string;
}

export function useMiniCategory() {
    const [categories] = useState<Category[]>([
        {
            id: 1,
            name: 'Category 1',
            category: 'Local Dish',
            description: 'Description 1',
        },
        {
            id: 2,
            name: 'Category 2',
            category: 'Category 2',
            description: 'Description 2',
        },
    ]);

    const [miniCategories, setMiniCategories] = useState<MiniCategory[]>([
        {
            id: 1,
            menuCategory: 'Local Dish',
            menuCategoryId: 1,
            subCategory: 'Mini Category 1',
            description: 'Description 1',
        },
        {
            id: 2,
            menuCategory: 'Local Dish',
            menuCategoryId: 1,
            subCategory: 'mini Category 2',
            description: 'Description 2',
        },
    ]);

    const handleAddMiniCategory = (data: MiniCategory) => {
        const newId = miniCategories.length + 1;
        data.id = newId;
        console.log(data);
        setMiniCategories([...miniCategories, data]);
    };

    const handleUpdateMiniCategory = (id: number, data: MiniCategory) => {
        const newCategories = miniCategories.map((category) => {
            if (category.id === id) {
                return data;
            }
            return category;
        });
        setMiniCategories(newCategories);
    };

    const handleDeleteMiniCategory = (id: number) => {
        const newCategories = miniCategories.filter(
            (category) => category.id !== id,
        );
        setMiniCategories(newCategories);
    };

    return {
        categories,
        miniCategories,
        handleAddMiniCategory,
        handleUpdateMiniCategory,
        handleDeleteMiniCategory,
    };
}
