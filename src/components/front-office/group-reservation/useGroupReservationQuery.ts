'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';
import type { GroupListTab, GroupModal, GroupType } from './types';

const TABS: GroupListTab[] = ['all', 'pending', 'completed', 'active'];

export type ReservationKind = 'individual' | 'group';

export function useGroupReservationQuery() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const setParams = useCallback(
        (updates: Record<string, string | null>) => {
            const params = new URLSearchParams(searchParams.toString());
            Object.entries(updates).forEach(([key, value]) => {
                if (!value) params.delete(key);
                else params.set(key, value);
            });
            const query = params.toString();
            router.replace(query ? `${pathname}?${query}` : pathname, {
                scroll: false,
            });
        },
        [pathname, router, searchParams],
    );

    const tabParam = searchParams.get('tab');
    const tab: GroupListTab = TABS.includes(tabParam as GroupListTab)
        ? (tabParam as GroupListTab)
        : 'all';

    return {
        kind:
            searchParams.get('kind') === 'group'
                ? ('group' as ReservationKind)
                : ('individual' as ReservationKind),
        create: searchParams.get('create') === '1',
        q: searchParams.get('q') || '',
        tab,
        groupType: (searchParams.get('groupType') as GroupType | null) || null,
        recordId: searchParams.get('recordId'),
        // The manage sheet is only open when explicitly requested, so opening
        // an action straight from a list card shows just that action dialog.
        manage: searchParams.get('manage') === '1',
        detailQ: searchParams.get('detailQ') || '',
        modal: (searchParams.get('modal') as GroupModal | null) || null,
        guestId: searchParams.get('guestId'),
        setParams,
    };
}
