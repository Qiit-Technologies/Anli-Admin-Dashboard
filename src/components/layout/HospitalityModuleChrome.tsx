'use client';

import { GlobalMenuSearch } from '@/components/global-menu-search/GlobalMenuSearch';
import { GlobalMenuSearchProvider } from '@/context/GlobalMenuSearchContext';
import type { MenuSearchModule } from '@/lib/global-menu-search/types';
import { type ReactNode } from 'react';

interface HospitalityModuleChromeProps {
    module: MenuSearchModule;
    children: ReactNode;
}

export function HospitalityModuleChrome({
    module,
    children,
}: HospitalityModuleChromeProps) {
    return (
        <GlobalMenuSearchProvider module={module}>
            <div className="flex min-h-0 flex-1 flex-col">{children}</div>
        </GlobalMenuSearchProvider>
    );
}

export function GlobalMenuSearchSlot() {
    return (
        <div className="w-full shrink-0 md:w-80">
            <GlobalMenuSearch />
        </div>
    );
}
