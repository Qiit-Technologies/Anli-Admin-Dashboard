import CustomLayout from '@/components/layout';
import { Metadata } from 'next';
import { ReactNode } from 'react';
import { reservationNavItems } from '@/components/NavigationItems/Reservation';

export const metadata: Metadata = {
    title: 'Anli - Reservation',
    description: 'Anli Reservation Module',
};

import { ReservationSearchProvider } from '@/context/ReservationSearchContext';

const Layout = async ({ children }: { children: ReactNode }) => {
    return (
        <ReservationSearchProvider>
            <CustomLayout
                baseRoute="/reservations"
                scopedNavItems={reservationNavItems}
            >
                {children}
            </CustomLayout>
        </ReservationSearchProvider>
    );
};

export default Layout;
