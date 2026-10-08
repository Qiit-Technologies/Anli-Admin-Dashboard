'use client';

import React from 'react';
import Footer from '@/components/landing-revised/Footer';
import { usePathname } from 'next/navigation';

interface LandingLayoutProps {
    children: React.ReactNode;
}

const ReservationLayout = ({ children }: LandingLayoutProps) => {
    const pathname = usePathname();
    const isBookingPage = pathname?.includes('/booking');

    return (
        <div className="relative landing-layout">
            {children}
            {!isBookingPage && <Footer />}
        </div>
    );
};

export default ReservationLayout;
