'use client';
import { itemsApi } from '@/lib/api';
import useSWR, { mutate } from 'swr';
import { fetchScopednventory } from './fetcher';

export function useDepartmentItems() {
    const { data, error, isLoading } = useSWR('/items', fetchScopednventory);

    if (error) {
        console.error('Error fetching items:', error);
    }

    if (!data) {
        return {
            requestedItems: [],
            isLoading,
            isError: error,
        };
    }

    return {
        requestedItems: data,
        isLoading,
        isError: error,

        async createRequestedItem(itemData: any) {
            await itemsApi.create(itemData);
            mutate('/items');
        },
        async updateRequestedItem(id: string, itemData: any) {
            await itemsApi.update(id, itemData);
            mutate('/items');
        },
        async deleteRequestedItem(id: string) {
            await itemsApi.delete(id);
            mutate('/items');
        },
    };
}
