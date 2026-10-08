import { getDineInAreas } from '@/app/actions/back-of-house';

export const fetchDineInAreas = async () => {
    const result = await getDineInAreas();
    if ('error' in result) {
        throw new Error(result.error || 'Failed to fetch dine in areas.');
    }

    return result ?? [];
};
