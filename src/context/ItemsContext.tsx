'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import useSWR from 'swr';
import { fetchStockItems } from '@/hooks/fetcher';
import { ItemOption, useItemList } from '@/lib/item-list';

interface ItemsContextType {
    itemsList: ItemOption[];
    isLoading: boolean;
}

const ItemsContext = createContext<ItemsContextType | undefined>(undefined);

export const useItemsContext = (): ItemsContextType => {
    const context = useContext(ItemsContext);
    if (context === undefined) {
        throw new Error('useItemsContext must be used within an ItemsProvider');
    }
    return context;
};

interface ItemsProviderProps {
    children: ReactNode;
}

export const ItemsProvider: React.FC<ItemsProviderProps> = ({ children }) => {
    const { data: itemsResponse, isLoading } = useSWR('/items', () =>
        fetchStockItems(1, 1000),
    );
    const itemsList = useItemList(itemsResponse ?? []);

    const value: ItemsContextType = {
        itemsList,
        isLoading,
    };

    return (
        <ItemsContext.Provider value={value}>{children}</ItemsContext.Provider>
    );
};
