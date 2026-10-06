'use client';

import { HeroUIProvider } from '@heroui/react';
import { useSearchParams } from 'next/navigation';
import React, { Suspense, useEffect, useState } from 'react';
import { getMe } from '../actions/users';
import { navigationMap } from './util/navigationMap';

export default function Page() {
    const searchParams = useSearchParams();
    const [DefaultComponent, setDefaultComponent] = useState<React.ElementType>(
        () => navigationMap.default.page,
    );

    const firstEntry = Array.from(searchParams.entries())[0];
    const queryName = firstEntry ? firstEntry[0] : 'main';
    const page = firstEntry ? firstEntry[1] : null;

    useEffect(() => {
        const fetchUserAndInitialize = async () => {
            const response = await getMe();

            if ('error' in response) {
                localStorage.removeItem('user');
                setDefaultComponent(() => navigationMap.main.dashboard);
                return;
            }

            // Always update local storage with the latest data from the server
            const freshUser = response.data;
            localStorage.setItem('user', JSON.stringify(freshUser));

            const userRole = freshUser.roles.name;
            const roleDefaults: Record<string, React.ElementType> = {
                // administrator: navigationMap.staffing.dashboard,
                frontoffice: navigationMap.frontoffice.dashboard,
                //  stock: navigationMap.stock.dashboard,
                //  housekeeping: navigationMap.housekeeping.dashboard,
                profile: navigationMap.profile.settings,
                default: navigationMap.main.dashboard,
            };

            const SelectedComponent =
                roleDefaults[userRole] || roleDefaults.default;
            setDefaultComponent(() => SelectedComponent);
        };

        // Always re-validate on mount to ensure we have fresh session data
        fetchUserAndInitialize();
    }, []);

    const renderComponent = () => {
        const PageComponent =
            page && navigationMap[queryName]?.[page]
                ? navigationMap[queryName][page]
                : DefaultComponent;

        return <PageComponent />;
    };

    return (
        <HeroUIProvider>
            <Suspense fallback={<div>Loading...</div>}>
                {renderComponent()}
            </Suspense>
        </HeroUIProvider>
    );
}
