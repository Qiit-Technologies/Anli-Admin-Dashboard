'use client';
import React from 'react';
import NewFooter from '../NewFooter';
import { ScrollToTop } from '../ScrollToTop';
import LandingNavbar from '@/components/landing-revised/layout/Navbar';
import ClientWrapper from '../ClientWrapper';

interface LandingLayoutProps {
    children: React.ReactNode;
}
const LandingLayout = ({ children }: LandingLayoutProps) => {
    return (
        <div className="relative bg-[#FFF] landing-layout">
            <ClientWrapper>
                <LandingNavbar />
                {children}
                <ScrollToTop />
                <NewFooter />
            </ClientWrapper>
        </div>
    );
};

export default LandingLayout;
