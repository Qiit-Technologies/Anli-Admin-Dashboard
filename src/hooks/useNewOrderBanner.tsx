'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

interface OrderLike {
    id?: number | string;
    requestId?: string;
    table?: { number?: string };
    room?: { roomNumber?: string };
}

interface UseNewOrderBannerOptions {
    /** Auto-dismiss after ms. 0 = no auto-dismiss */
    autoDismissMs?: number;
}

export function useNewOrderBanner(
    data: OrderLike[] | undefined,
    options: UseNewOrderBannerOptions = {}
) {
    const { autoDismissMs = 15000 } = options;

    const prevIdsRef = useRef<Set<string | number>>(new Set());
    const isInitialLoadRef = useRef(true);
    const dismissTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const [bannerState, setBannerState] = useState<{
        show: boolean;
        newOrders: OrderLike[];
    }>({ show: false, newOrders: [] });

    const dismiss = useCallback(() => {
        if (dismissTimeoutRef.current) {
            clearTimeout(dismissTimeoutRef.current);
            dismissTimeoutRef.current = null;
        }
        setBannerState({ show: false, newOrders: [] });
    }, []);

    useEffect(() => {
        if (!data || !Array.isArray(data)) return;

        const currentIds = new Set(
            data.map((item, idx) => (item?.id ?? idx) as string | number)
        );
        const newIds = Array.from(currentIds).filter(
            (id) => !prevIdsRef.current.has(id)
        );

        const isInitial = isInitialLoadRef.current;
        if (isInitial) {
            isInitialLoadRef.current = false;
            prevIdsRef.current = currentIds;
            return;
        }

        if (newIds.length > 0) {
            const newOrders = data.filter((item) =>
                newIds.some((id) => id === item?.id || String(id) === String(item?.id))
            );

            if (dismissTimeoutRef.current) {
                clearTimeout(dismissTimeoutRef.current);
            }

            setBannerState({ show: true, newOrders });

            if (autoDismissMs > 0) {
                dismissTimeoutRef.current = setTimeout(() => {
                    dismissTimeoutRef.current = null;
                    setBannerState((s) => ({ ...s, show: false }));
                }, autoDismissMs);
            }
        }

        prevIdsRef.current = currentIds;
    }, [data, autoDismissMs]);

    useEffect(() => {
        return () => {
            if (dismissTimeoutRef.current) {
                clearTimeout(dismissTimeoutRef.current);
            }
        };
    }, []);

    return {
        showBanner: bannerState.show,
        newOrders: bannerState.newOrders,
        dismiss,
    };
}
