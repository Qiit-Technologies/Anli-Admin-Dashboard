export interface MenuCatalogItem {
    id: number;
    name: string;
    description: string;
    category: string;
    type: string;
    unit: string;
    unitPrice: number;
    imageUrl?: string;
}

export const SEED_MENU_CATALOG: MenuCatalogItem[] = [
    {
        id: 1,
        name: 'Fried Rice',
        description: 'Party style rice',
        category: 'Main Course',
        type: 'Food',
        unit: 'Per person',
        unitPrice: 2500,
    },
    {
        id: 2,
        name: 'Pepper Soup',
        description: 'Spicy starter',
        category: 'Main Course',
        type: 'Food',
        unit: 'Per person',
        unitPrice: 3500,
    },
    {
        id: 3,
        name: 'Grilled Chicken',
        description: 'Herb marinated',
        category: 'Main Course',
        type: 'Food',
        unit: 'Per person',
        unitPrice: 5000,
    },
    {
        id: 4,
        name: 'Chocolate Cake',
        description: 'Layered dessert',
        category: 'Dessert',
        type: 'Dessert',
        unit: 'Per person',
        unitPrice: 1800,
    },
    {
        id: 5,
        name: 'Spring Rolls',
        description: 'Crispy small chops',
        category: 'Small Chops',
        type: 'Food',
        unit: 'Per person',
        unitPrice: 1200,
    },
    {
        id: 6,
        name: 'Coleslaw',
        description: 'Fresh salad',
        category: 'Salad',
        type: 'Food',
        unit: 'Per person',
        unitPrice: 900,
    },
    {
        id: 7,
        name: 'Water',
        description: 'Still water',
        category: 'Drinks',
        type: 'Drink',
        unit: 'Drink',
        unitPrice: 200,
    },
];
