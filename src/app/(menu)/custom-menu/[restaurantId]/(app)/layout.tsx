import type React from 'react';
import { AppHeader } from '@/components/menu/components/app-header';
import { DesktopSidebar } from '@/components/menu/components/desktop-sidebar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
    return (
        <div
            className="flex h-dvh overflow-hidden"
            style={{ backgroundColor: 'var(--menu-background)' }}
        >
            <DesktopSidebar />
            <div className="flex w-full flex-1 flex-col overflow-hidden lg:w-auto">
                <AppHeader />
                <main className="flex-1 overflow-y-auto">{children}</main>
            </div>
        </div>
    );
}
