'use client';

import { getMenuItems } from '@/app/actions/menu-item';
import {
    filterItemsByModule,
    normalizeMenuItems,
} from '@/lib/global-menu-search/normalize';
import { MenuSearchIndex } from '@/lib/global-menu-search/search-index';
import type {
    MenuSearchModule,
    MenuSearchResult,
} from '@/lib/global-menu-search/types';
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from 'react';
import useSWR from 'swr';

interface GlobalMenuSearchContextValue {
    module: MenuSearchModule;
    query: string;
    setQuery: (query: string) => void;
    debouncedQuery: string;
    results: MenuSearchResult[];
    isLoading: boolean;
    isReady: boolean;
    itemCount: number;
    clearQuery: () => void;
}

const GlobalMenuSearchContext =
    createContext<GlobalMenuSearchContextValue | null>(null);

export function useGlobalMenuSearchContext() {
    const context = useContext(GlobalMenuSearchContext);
    if (!context) {
        throw new Error(
            'useGlobalMenuSearchContext must be used within GlobalMenuSearchProvider',
        );
    }
    return context;
}

interface GlobalMenuSearchProviderProps {
    readonly module: MenuSearchModule;
    readonly children: ReactNode;
}

export function GlobalMenuSearchProvider({
    module,
    children,
}: GlobalMenuSearchProviderProps) {
    const [query, setQuery] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');

    const { data, isLoading } = useSWR(
        '/menu/item/global-search',
        getMenuItems,
        {
            revalidateOnFocus: false,
            dedupingInterval: 60_000,
        },
    );

    useEffect(() => {
        // eslint-disable-next-line no-undef
        const timeoutId = globalThis.setTimeout(() => {
            setDebouncedQuery(query);
        }, 120);

        // eslint-disable-next-line no-undef
        return () => globalThis.clearTimeout(timeoutId);
    }, [query]);

    const searchIndex = useMemo(() => {
        const normalized = normalizeMenuItems(data?.data ?? []);
        const scoped = filterItemsByModule(normalized, module);
        return new MenuSearchIndex(scoped);
    }, [data?.data, module]);

    const results = useMemo(() => {
        if (!debouncedQuery.trim()) return [];
        return searchIndex.search(debouncedQuery);
    }, [debouncedQuery, searchIndex]);

    const clearQuery = useCallback(() => {
        setQuery('');
        setDebouncedQuery('');
    }, []);

    const value = useMemo(
        () => ({
            module,
            query,
            setQuery,
            debouncedQuery,
            results,
            isLoading,
            isReady: !isLoading && searchIndex.size > 0,
            itemCount: searchIndex.size,
            clearQuery,
        }),
        [
            module,
            query,
            debouncedQuery,
            results,
            isLoading,
            searchIndex,
            clearQuery,
        ],
    );

    return (
        <GlobalMenuSearchContext.Provider value={value}>
            {children}
        </GlobalMenuSearchContext.Provider>
    );
}
