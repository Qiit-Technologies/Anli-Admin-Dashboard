'use client';
import { useMemo, useState } from 'react';
import useSWR from 'swr';

interface UseListDataProps<T> {
    fetchFunction: () => Promise<any>;
    searchFields: (keyof T)[];
    initialLoading?: boolean;
}

export function useListData<T extends { id: number }>({
    fetchFunction,
    searchFields,
}: UseListDataProps<T>) {
    const [searchQuery, setSearchQuery] = useState('');

    const fetcher = async () => {
        const result = await fetchFunction();
        if (result?.error) {
            throw new Error(result.error);
        }
        if (!Array.isArray(result?.data)) {
            throw new Error('Invalid data format received');
        }
        return result.data;
    };

    const {
        data,
        error,
        mutate,
        isValidating: isLoading,
    } = useSWR<T[]>('list-data', fetcher, {
        revalidateOnFocus: false,
    });

    const filteredData = useMemo(() => {
        if (!searchQuery.trim() || !data) return data || [];

        return data.filter((item) =>
            searchFields.some((field) => {
                const value = item[field];
                return value
                    ?.toString()
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase());
            }),
        );
    }, [searchQuery, data, searchFields]);

    const refresh = () => mutate();
    const refetch = async () => await mutate(fetcher, { revalidate: true });

    const handleDeleteSuccess = (deletedId: number) => {
        mutate((prev) => prev?.filter((item) => item.id !== deletedId), false);
    };

    return {
        data: data || [],
        filteredData,
        error: error?.message || null,
        isLoading: !data && isLoading,
        searchQuery,
        setSearchQuery,
        refresh,
        refetch,
        handleDeleteSuccess,
        mutate,
    };
}
