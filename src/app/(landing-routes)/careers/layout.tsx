import type { Metadata } from 'next';
import Script from 'next/script';
import { ReactNode } from 'react';

export const metadata: Metadata = {
    metadataBase: new URL('https://www.weareanli.com/'),
    title: 'ANLI Solutions Careers: Hotel Industry Career Openings & Articles',
    description:
        'Explore different articles and guides on careers at ANLI SOlutions.',
    keywords:
        'Explore different articles and guides on careers at ANLI SOlutions.',
    robots: {
        index: true,
        follow: true,
    },
    openGraph: {
        title: 'ANLI Solutions Careers: Hotel Industry Career Openings & Articles',
        description:
            'Explore different articles and guides on careers at ANLI SOlutions.',
        url: 'https://www.weareanli.com/careers',
        siteName: 'ANLI Solutions',
        images: [
            {
                url: 'https://www.weareanli.com/og-resources.jpg',
                width: 1200,
                height: 630,
                alt: 'ANLI Solutions Hotel Industry Careers',
            },
        ],
        locale: 'en_US',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'ANLI Solutions Careers: Hotel Industry Career Openings & Articles',
        description:
            'Explore different articles and guides on careers at ANLI SOlutions.',
        images: ['https://www.weareanli.com/og-resources.jpg'],
    },
    alternates: {
        canonical: 'https://www.weareanli.com/resources',
    },
};

export default async function Layout({ children }: { children: ReactNode }) {
    return (
        <>
            <Script id="schema-org" type="application/ld+json">
                {JSON.stringify({
                    '@context': 'https://schema.org',
                    '@type': 'CollectionPage',
                    name: 'ANLI Solutions Resources',
                    url: 'https://www.weareanli.com/resources',
                    description:
                        'A collection of articles, guides, and case studies for hoteliers to optimize operations and revenue.',
                    publisher: {
                        '@type': 'Organization',
                        name: 'ANLI Solutions',
                        logo: {
                            '@type': 'ImageObject',
                            url: 'https://www.weareanli.com/logos/anli-logo.png',
                        },
                    },
                })}
            </Script>
            {children}
        </>
    );
}
