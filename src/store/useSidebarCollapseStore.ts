import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SidebarCollapseState {
    isCollapsed: boolean;
    toggleCollapse: () => void;
    expand: () => void;
    collapse: () => void;
}

export const useSidebarCollapseStore = create<SidebarCollapseState>()(
    persist(
        (set) => ({
            isCollapsed: false,
            toggleCollapse: () =>
                set((state) => ({ isCollapsed: !state.isCollapsed })),
            expand: () => set({ isCollapsed: false }),
            collapse: () => set({ isCollapsed: true }),
        }),
        {
            name: 'sidebar-collapse-storage',
        },
    ),
);
