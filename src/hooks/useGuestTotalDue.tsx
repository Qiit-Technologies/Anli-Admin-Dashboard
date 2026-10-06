'use client';
import { getGuestServices, GuestServiceItem } from '@/app/actions/guest';
import useSWR from 'swr';

interface ServiceBreakdown {
    unpaidServices: GuestServiceItem[];
    unpaidOrders: GuestServiceItem[];
    paidServices: GuestServiceItem[];
    paidOrders: GuestServiceItem[];
    wakeUpCalls: GuestServiceItem[];
}

interface UseGuestTotalDueOptions {
    guestIds: number[];
    enabled?: boolean;
}

export function useGuestTotalDue({ guestIds, enabled = true }: UseGuestTotalDueOptions) {
    const key = enabled && guestIds.length > 0
        ? ['guestTotalDue', guestIds.sort((a, b) => a - b).join(',')]
        : null;

    const fetcher = async () => {
        if (!guestIds.length) return {};

        const results = await Promise.all(
            guestIds.map(async (guestId) => {
                const response = await getGuestServices(String(guestId));
                const allItems = response.data || [];
                
                const unpaidServices = allItems.filter(
                    (s) => s.type !== 'restaurant' && s.type !== 'wake up call' && s.paymentStatus === 'PENDING'
                );
                const paidServices = allItems.filter(
                    (s) => s.type !== 'restaurant' && s.type !== 'wake up call' && s.paymentStatus === 'PAID'
                );
                const unpaidOrders = allItems.filter(
                    (s) => s.type === 'restaurant' && s.paymentStatus === 'PENDING'
                );
                const paidOrders = allItems.filter(
                    (s) => s.type === 'restaurant' && s.paymentStatus === 'PAID'
                );
                const wakeUpCalls = allItems.filter(
                    (s) => s.type === 'wake up call'
                );

                return { 
                    guestId, 
                    breakdown: {
                        unpaidServices,
                        unpaidOrders,
                        paidServices,
                        paidOrders,
                        wakeUpCalls,
                    }
                };
            })
        );

        const map = new Map<number, ServiceBreakdown>();
        for (const { guestId, breakdown } of results) {
            map.set(guestId, breakdown);
        }
        return map;
    };

    const { data, error, isLoading, mutate } = useSWR(key, fetcher, {
        revalidateOnFocus: false,
        dedupingInterval: 30000,
        fallbackData: new Map(),
    });

    const getBreakdown = (guestId: number) => data?.get(guestId) || null;

    const hasUnpaidServices = (guestId: number) => {
        const breakdown = getBreakdown(guestId);
        return breakdown && breakdown.unpaidServices.length > 0;
    };

    const hasUnpaidOrders = (guestId: number) => {
        const breakdown = getBreakdown(guestId);
        return breakdown && breakdown.unpaidOrders.length > 0;
    };

    const hasPaidServices = (guestId: number) => {
        const breakdown = getBreakdown(guestId);
        return breakdown && breakdown.paidServices.length > 0;
    };

    const hasPaidOrders = (guestId: number) => {
        const breakdown = getBreakdown(guestId);
        return breakdown && breakdown.paidOrders.length > 0;
    };

    const getUnpaidServicesCount = (guestId: number) => {
        const breakdown = getBreakdown(guestId);
        return breakdown?.unpaidServices.length || 0;
    };

    const getUnpaidOrdersCount = (guestId: number) => {
        const breakdown = getBreakdown(guestId);
        return breakdown?.unpaidOrders.length || 0;
    };

    const getUnpaidServicesTotal = (guestId: number) => {
        const breakdown = getBreakdown(guestId);
        return breakdown?.unpaidServices.reduce((sum, s) => sum + s.amount, 0) || 0;
    };

    const getUnpaidOrdersTotal = (guestId: number) => {
        const breakdown = getBreakdown(guestId);
        return breakdown?.unpaidOrders.reduce((sum, o) => sum + o.amount, 0) || 0;
    };

    const getPaidServicesTotal = (guestId: number) => {
        const breakdown = getBreakdown(guestId);
        return breakdown?.paidServices.reduce((sum, s) => sum + s.amount, 0) || 0;
    };

    const getPaidOrdersTotal = (guestId: number) => {
        const breakdown = getBreakdown(guestId);
        return breakdown?.paidOrders.reduce((sum, o) => sum + o.amount, 0) || 0;
    };

    return {
        breakdowns: data || new Map(),
        isLoading,
        error,
        refetch: mutate,
        getBreakdown,
        hasUnpaidServices,
        hasUnpaidOrders,
        hasPaidServices,
        hasPaidOrders,
        getUnpaidServicesCount,
        getUnpaidOrdersCount,
        getUnpaidServicesTotal,
        getUnpaidOrdersTotal,
        getPaidServicesTotal,
        getPaidOrdersTotal,
    };
}