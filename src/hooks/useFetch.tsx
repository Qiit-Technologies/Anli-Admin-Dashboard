'use client';

import { fetcher } from '@/lib/api';
import useSWR, { KeyedMutator } from 'swr';

interface UseDataFetchReturn<T> {
    data: T | undefined;
    isLoading: boolean;
    isError: boolean;
    error: Error | undefined;
    mutate: KeyedMutator<T>;
}

export function useDataFetch<T>(endpoint: string): UseDataFetchReturn<T> {
    const { data, error, isLoading, mutate } = useSWR<T, Error>(
        `/api/${endpoint}`,
        fetcher<T>,
    );

    return {
        data,
        isLoading,
        isError: !!error,
        error,
        mutate,
    };
}
