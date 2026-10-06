import { searchGuestProfiles } from '@/app/actions/guest';
import { useEffect, useState } from 'react';

function normalizeGuestResults(data: unknown): any[] {
    if (Array.isArray(data)) return data;
    if (data && typeof data === 'object') {
        const nested = (data as { data?: unknown }).data;
        if (Array.isArray(nested)) return nested;
    }
    return [];
}

export const useGuestSearch = () => {
    const [guestHistory, setGuestHistory] = useState<any[]>([]);
    const [searchingGuest, setSearchingGuest] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showResults, setShowResults] = useState(false);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (searchQuery) {
                searchGuest(searchQuery);
            } else {
                setGuestHistory([]);
            }
        }, 100);

        return () => clearTimeout(timeoutId);
    }, [searchQuery]);

    useEffect(() => {
        if (!searchQuery) {
            setShowResults(false);
            return;
        }
        if (!searchingGuest) {
            setShowResults(true);
        }
    }, [guestHistory, searchQuery, searchingGuest]);

    const searchGuest = async (query: string) => {
        if (!query || query.length === 0) {
            setGuestHistory([]);
            return;
        }

        try {
            setSearchingGuest(true);
            const result = await searchGuestProfiles(query);
            setGuestHistory(normalizeGuestResults(result?.data));
        } catch (error: any) {
            console.error('Error searching guest:', error);
            setGuestHistory([]);
        } finally {
            setSearchingGuest(false);
        }
    };

    return {
        guestHistory,
        setGuestHistory,
        searchingGuest,
        searchQuery,
        setSearchQuery,
        showResults,
        setShowResults,
        searchGuest,
    };
};
