import NewAboutUsClient from '@/components/landing-revised/NewAboutUsClient';
import type { Metadata } from 'next';
import Script from 'next/script';

export const metadata: Metadata = {
    metadataBase: new URL('https://www.weareanli.com/'),
    title: 'ANLI Solutions Resources: Hotel Industry Articles & Guides',
    description:
        'Explore expert articles, guides, and case studies to optimize hotel operations and boost revenue with ANLI Solutions.',
    keywords:
        'hotel industry resources, hospitality guides, hotel management articles, hotel case studies',
    robots: {
        index: true,
        follow: true,
    },
    openGraph: {
        title: 'ANLI Solutions Resources: Hotel Industry Articles & Guides',
        description:
            'Expert articles, guides, and case studies to help hoteliers streamline operations and grow revenue.',
        url: 'https://www.weareanli.com/resources',
        siteName: 'ANLI Solutions',
        images: [
            {
                url: 'https://www.weareanli.com/og-resources.jpg',
                width: 1200,
                height: 630,
                alt: 'ANLI Solutions Hotel Industry Resources',
            },
        ],
        locale: 'en_US',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'ANLI Solutions Resources: Hotel Industry Articles & Guides',
        description:
            'Expert articles, guides, and case studies for hoteliers to optimize operations and revenue.',
        images: ['https://www.weareanli.com/og-resources.jpg'],
    },
    alternates: {
        canonical: 'https://www.weareanli.com/resources',
    },
};

export default async function Layout() {
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
            <NewAboutUsClient />
        </>
    );
}
