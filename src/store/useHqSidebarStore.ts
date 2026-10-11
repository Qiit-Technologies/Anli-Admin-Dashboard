import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface HqSidebarState {
    isOpen: boolean;
    setIsOpen: (val: boolean) => void;
    toggle: () => void;
}

/**
 * M7 — the HQ command-center sidebar used to keep its open/closed state in
 * HqShell-local useState, so it reset (and got out of sync with the persisted
 * outer operations sidebar) every time the super-admin navigated away from
 * /dashboard — e.g. to the CRM — and back. Persisting it keeps the inner HQ
 * nav where the admin left it across HQ pages.
 */
export const useHqSidebarStore = create<HqSidebarState>()(
    persist(
        (set) => ({
            isOpen: false,
            setIsOpen: (isOpen: boolean) => set({ isOpen }),
            toggle: () => set((state) => ({ isOpen: !state.isOpen })),
        }),
        {
            name: 'hq-sidebar-storage',
        },
    ),
);
