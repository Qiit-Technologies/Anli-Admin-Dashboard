'use client';
import React from 'react';
import Footer from '../Footer';
import { ScrollToTop } from '../ScrollToTop';
import LandingNavbar from './Navbar';

interface LandingLayoutProps {
    children: React.ReactNode;
}
const LandingLayout = ({ children }: LandingLayoutProps) => {
    return (
        <div className="relative landing-layout">
            <LandingNavbar />
            {children}
            <ScrollToTop />
            <Footer />
        </div>
    );
};

export default LandingLayout;
