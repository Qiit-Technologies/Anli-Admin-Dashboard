import { Meta } from '.';

export interface InventoryReponse {
    data: Inventory[];
    meta: Meta;
}

export interface Inventory {
    id: number;
    quantity: number;
    createdAt: string;
    minStock: number;
    role: {
        department: string;
    };
}

export interface SimplifiedInventory {
    id: number;
    quantity: number;
    createdAt: string;
    minStock: number;
    department: string;
}
