export interface DineInAreaType {
    id?: number;
    name?: string;
    description?: string;
}

export interface KitchenType {
    id: number;
    name?: string;
    description?: string;
    menus?: any[];
    dineInAreas?: any[];
    staff?: any[];
}

export interface TableProps {
    id?: number;
    number: number;
    isOccupied?: boolean;
    numberOfSeats: number;
    areaId: number;
    createdAt?: string;
    updatedAt?: string;
}

export interface DineInArea {
    id: number;
    name: string;
}

export interface TableForDine {
    id: number;
    number: number;
}
