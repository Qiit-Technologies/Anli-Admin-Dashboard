import AppToaster from '@/components/common/AppToaster';
import Site24x7Tracker from '@/components/common/Site24x7Tracker';
import { StateDebugger } from '@/components/common/StateDebugger';
import { MaintenanceBanner } from '@/components/system-updates/MaintenanceBanner';
import { HotelServicesProvider } from '@/context/HotelServicesContext';
import { IdleLogoutProvider } from '@/context/IdleLogoutContext';
import { ItemsProvider } from '@/context/ItemsContext';
import { UserProvider } from '@/context/useUser';
import { SWRProvider } from '@/providers/SWRProvider';
import type { Metadata, Viewport } from 'next';
import { DM_Sans } from 'next/font/google';
import Script from 'next/script';
import React from 'react';
import './globals.css';

const dmSans = DM_Sans({
    subsets: ['latin'],
    weight: ['300', '400', '500', '600', '700'],
    variable: '--font-dm-sans',
    display: 'swap',
});

export const viewport: Viewport = {
    themeColor: '#0f172a',
};

export const metadata: Metadata = {
    manifest: '/manifest.json',
    metadataBase: new URL('https://www.weareanli.com/'),
    title: {
        default: 'ANLI Solutions | Smart Hotel Management Software',
        template: '%s | ANLI Solutions',
    },
    description:
        'Transform your hotel with ANLI Solutions’ all-in-one property management system. Optimize operations, boost revenue, and delight guests with smart hospitality technology.',
    keywords:
        'hotel management software, property management system, hospitality technology, revenue optimization, guest experience',
    robots: {
        index: true,
        follow: true,
    },
    icons: {
        icon: '/favicon.ico',
        apple: '/apple-icon.png',
    },
    openGraph: {
        title: 'ANLI Solutions | Smart Hotel Management Software',
        description:
            'Revolutionize hotel operations with ANLI Solutions’ property management system for seamless operations and enhanced guest experiences.',
        url: 'https://www.weareanli.com/',
        siteName: 'ANLI Solutions',
        images: [
            {
                url: 'https://www.weareanli.com/anli-logo.jpg',
                width: 1200,
                height: 630,
                alt: 'ANLI Solutions Hotel Management System',
            },
        ],
        locale: 'en_US',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'ANLI Solutions | Smart Hotel Management Software',
        description:
            'Discover ANLI Solutions, the ultimate hotel management system for smarter operations and better guest experiences.',
        images: ['https://www.weareanli.com/anli-logo.jpg'],
    },
    alternates: {
        canonical: 'https://www.weareanli.com/',
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <Script id="schema-org" type="application/ld+json">
                {JSON.stringify({
                    '@context': 'https://schema.org',
                    '@type': 'SoftwareApplication',
                    name: 'ANLI Solutions',
                    applicationCategory: 'BusinessApplication',
                    operatingSystem: 'Cloud-based',
                    url: 'https://www.weareanli.com/',
                    description:
                        'ANLI Solutions is a smart hotel management system designed to optimize operations, enhance guest experiences, and maximize revenue for hotels.',
                    featureList: [
                        'Property Management',
                        'Revenue Optimization',
                        'Guest Experience Enhancement',
                    ],
                    // offers: {
                    //     '@type': 'Offer',
                    //     price: 'Contact for pricing',
                    //     priceCurrency: 'USD',
                    //     url: 'https://www.weareanli.com/pricing',
                    // },
                    aggregateRating: {
                        '@type': 'AggregateRating',
                        ratingValue: '4.8',
                        ratingCount: '250',
                        reviewCount: '250',
                    },
                    image: 'https://www.weareanli.com/logos/anli-logo.png',
                })}
            </Script>

            <Script
                src="https://www.googletagmanager.com/gtag/js?id=G-0WYT3HR40K"
                strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
                {`
                    window.dataLayer = window.dataLayer || [];
                    function gtag(){dataLayer.push(arguments);}
                    gtag('js', new Date());
                    gtag('config', 'G-0WYT3HR40K');
                `}
            </Script>

            <body className={`${dmSans.variable} antialiased`}>
                <Site24x7Tracker />
                <SWRProvider>
                    <UserProvider>
                        <IdleLogoutProvider>
                            <ItemsProvider>
                                <HotelServicesProvider>
                                    <StateDebugger />
                                    <AppToaster />
                                    <MaintenanceBanner />
                                    {children}
                                </HotelServicesProvider>
                            </ItemsProvider>
                        </IdleLogoutProvider>
                    </UserProvider>
                </SWRProvider>
            </body>
        </html>
    );
}
