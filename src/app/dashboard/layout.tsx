'use server';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/SideBar';
import { SubscriptionWarningBannerClient } from '@/components/common/SubscriptionWarningBannerClient';
import { headers } from 'next/headers';
import React, { ReactNode } from 'react';

const RootLayout = async ({ children }: { children: ReactNode }) => {
    const headersList = await headers();
    const userRole =
        headersList.get('user-role') || 'manager' || 'administrator';
    if (!userRole && !window === undefined) {
        return window.location.replace('/signin');
    }
    return (
        <div
            className="flex h-screen bg-gray-50"
            style={{ '--header-height': '5rem' } as React.CSSProperties}
        >
            <Sidebar role={userRole} />

            <div className="flex-1 flex flex-col overflow-x-hidden relative">
                <SubscriptionWarningBannerClient />
                <Header role={userRole} />
                <main className="bg-gray-50 flex-1 overflow-auto">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default RootLayout;
