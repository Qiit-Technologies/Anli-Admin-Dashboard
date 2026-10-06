import { getItemsStats } from '@/app/actions/items';
import { ItemsStats } from '@/types';
import { useEffect, useState } from 'react';

const useStats = (refreshTable: number) => {
    const [stats, setStats] = useState<ItemsStats>();
    const [loading, setLoading] = useState<boolean>(false);
    useEffect(() => {
        const loadItems = async () => {
            setLoading(true);
            const stats = await getItemsStats();
            setStats(stats);
            setLoading(false);
        };
        loadItems();
    }, [refreshTable]);
    return { stats, isLoading: loading };
};

export default useStats;
